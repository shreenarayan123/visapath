// Backend API utilities
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: {
    statusCode: number;
    message: string;
    details?: any;
  };
}

/**
 * Helper function to handle API responses
 */
async function handleResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type');

  if (contentType && contentType.includes('application/json')) {
    const data: ApiResponse<T> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error?.message || `API error: ${response.status}`);
    }

    return data.data;
  }

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response as any;
}

/**
 * Map backend country data to frontend format
 */
function mapBackendCountries(backendData: any[]): any[] {
  const countryFlags: Record<string, string> = {
    'US': '🇺🇸',
    'UK': '🇬🇧',
    'CA': '🇨🇦',
    'DE': '🇩🇪',
    'AU': '🇦🇺',
    'IE': '🇮🇪',
    'FR': '🇫🇷',
    'NL': '🇳🇱',
    'PL': '🇵🇱',
    'ES': '🇪🇸',
    'SG': '🇸🇬',
  };

  return backendData.map(country => ({
    code: country.countryCode.toLowerCase(),
    name: country.countryName,
    flag: countryFlags[country.countryCode] || '🌍',
    visaTypes: country.visaTypes.map((visa: any) => ({
      id: visa.visaTypeId,
      name: visa.visaName,
      description: visa.description,
      processingTime: `${visa.processingTimeWeeks} weeks`,
      requiredDocuments: visa.requiredDocuments.map((doc: any) => ({
        id: doc.documentType,
        name: doc.documentType.split('_').map((w: string) =>
          w.charAt(0).toUpperCase() + w.slice(1)
        ).join(' '),
        description: doc.description,
        required: doc.isRequired,
      })),
    })),
  }));
}

export const api = {
  /**
   * Get all countries with visa types
   */
  async getCountries() {
    try {
      const response = await fetch(`${API_BASE_URL}/countries`);
      const data = await handleResponse<any[]>(response);
      const mapped = mapBackendCountries(data);

      return { data: mapped };
    } catch (error) {
      console.error('Failed to fetch countries:', error);
      throw error;
    }
  },

  /**
   * Get specific visa type details
   */
  async getVisaTypeDetails(countryCode: string, visaTypeId: string) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/countries/${countryCode.toUpperCase()}/visa-types/${visaTypeId}`
      );
      return await handleResponse<any>(response);
    } catch (error) {
      console.error('Failed to fetch visa type details:', error);
      throw error;
    }
  },

  /**
   * Submit evaluation form
   */
  async submitEvaluation(formData: FormData) {
    try {
      const response = await fetch(`${API_BASE_URL}/evaluations`, {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header - browser will set it automatically with boundary
      });

      const data = await handleResponse<{ evaluationId: string; email: string; status: string; score: number; scoreCategory: string }>(response);

      return { data };
    } catch (error) {
      console.error('Failed to submit evaluation:', error);
      throw error;
    }
  },

  /**
   * Get evaluation result
   */
  async getEvaluationResult(evaluationId: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/evaluations/${evaluationId}`);
      const backendData = await handleResponse<any>(response);

      // Map backend response to frontend format
      const mapped = {
        id: backendData.evaluationId,
        score: backendData.score,
        category: mapScoreCategory(backendData.scoreCategory),
        summary: backendData.summary,
        strengths: backendData.strengths || [],
        improvements: backendData.improvements || [],
        nextSteps: backendData.nextSteps || [],
        breakdown: backendData.scoreBreakdown ? {
          experience: backendData.scoreBreakdown.experience,
          education: backendData.scoreBreakdown.education,
          specialization: backendData.scoreBreakdown.specialization,
          language: backendData.scoreBreakdown.language,
          documents: backendData.scoreBreakdown.documentQuality,
        } : undefined,
        evaluatedAt: backendData.evaluatedAt || backendData.createdAt,
      };

      return { data: mapped };
    } catch (error) {
      console.error('Failed to fetch evaluation result:', error);
      throw error;
    }
  },

  /**
   * Email evaluation results
   */
  async emailResults(evaluationId: string, email: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/evaluations/${evaluationId}/email-results`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      return await handleResponse<{ message: string }>(response);
    } catch (error) {
      console.error('Failed to email results:', error);
      throw error;
    }
  },

  /**
   * Download PDF report
   */
  downloadPDF(evaluationId: string) {
    const url = `${API_BASE_URL}/evaluations/${evaluationId}/download-pdf`;
    window.open(url, '_blank');
  },
};

/**
 * Map backend score categories to frontend format
 */
function mapScoreCategory(category: string): 'strong' | 'moderate' | 'consider' {
  const mapping: Record<string, 'strong' | 'moderate' | 'consider'> = {
    'strong_candidate': 'strong',
    'moderate_fit': 'moderate',
    'consider_alternatives': 'consider',
    'not_recommended': 'consider',
  };

  return mapping[category] || 'moderate';
}
