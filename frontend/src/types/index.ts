export interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  currentLocation: string;
  professionalSummary: string;
}

export interface Country {
  code: string;
  name: string;
  flag: string;
  visaTypes: VisaType[];
}

export interface VisaType {
  id: string;
  name: string;
  description: string;
  processingTime: string;
  requiredDocuments: RequiredDocument[];
}

export interface RequiredDocument {
  id: string;
  name: string;
  description: string;
  required: boolean;
}

export interface UploadedFile {
  id: string;
  documentId: string;
  file: File;
  uploadProgress: number;
  uploaded: boolean;
  error?: string;
}

export interface EvaluationResult {
  id: string;
  score: number;
  category: 'strong' | 'moderate' | 'consider';
  summary: string;
  strengths: string[];
  improvements: string[];
  nextSteps: string[];
  breakdown?: {
    experience: number;
    education: number;
    specialization: number;
    language: number;
    documents: number;
  };
  evaluatedAt: string;
}

export interface EvaluationState {
  personalInfo: PersonalInfo;
  targetCountry: string;
  visaType: string;
  uploadedDocuments: UploadedFile[];
  currentStep: number;
  evaluationId?: string;
  result?: EvaluationResult;
  loading: boolean;
  error?: string;
}
