import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEvaluationContext } from '@/context/EvaluationContext';
import { useCountries } from '@/hooks/useCountries';
import { api } from '@/utils/api';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Step4ReviewProps {
  onBack: () => void;
  onEdit: (step: number) => void;
}

export const Step4Review = ({ onBack, onEdit }: Step4ReviewProps) => {
  const navigate = useNavigate();
  const { state, setLoading, setEvaluationId } = useEvaluationContext();
  const { countries } = useCountries();
  const [submitting, setSubmitting] = useState(false);

  const selectedCountry = countries.find(c => c.code === state.targetCountry);
  const selectedVisa = selectedCountry?.visaTypes.find(v => v.id === state.visaType);

  const handleSubmit = async () => {
    setSubmitting(true);
    setLoading(true);

    try {
      const formData = new FormData();

      // Add personal info fields individually (backend expects separate fields)
      formData.append('firstName', state.personalInfo.firstName);
      formData.append('lastName', state.personalInfo.lastName);
      formData.append('email', state.personalInfo.email);
      formData.append('phone', state.personalInfo.phone || '');
      formData.append('currentLocation', state.personalInfo.currentLocation);
      formData.append('professionalSummary', state.personalInfo.professionalSummary);

      // Add visa selection
      formData.append('targetCountry', selectedCountry?.name || state.targetCountry);
      formData.append('visaType', selectedVisa?.name || state.visaType);
      formData.append('visaTypeId', state.visaType); // visa ID (e.g., 'o1a')

      // Add document files with their document types as field names
      state.uploadedDocuments.forEach((doc) => {
        formData.append(doc.documentId, doc.file);
      });

      const response: any = await api.submitEvaluation(formData);
      const evaluationId = response.data.evaluationId;

      setEvaluationId(evaluationId);
      toast.success('Evaluation submitted successfully!');

      // Navigate to results
      navigate(`/results/${evaluationId}`);
    } catch (error) {
      toast.error('Failed to submit evaluation. Please try again.');
      console.error(error);
    } finally {
      setSubmitting(false);
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold mb-2">Review Your Information</h2>
        <p className="text-muted-foreground">
          Please review your information before submitting
        </p>
      </div>

      <div className="space-y-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Personal Information</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => onEdit(1)}>
                Edit
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">
                  {state.personalInfo.firstName} {state.personalInfo.lastName}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{state.personalInfo.email}</p>
              </div>
              {state.personalInfo.phone && (
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{state.personalInfo.phone}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Location</p>
                <p className="font-medium">{state.personalInfo.currentLocation}</p>
              </div>
            </div>
            <div className="pt-2">
              <p className="text-sm text-muted-foreground">Professional Summary</p>
              <p className="font-medium text-sm mt-1">{state.personalInfo.professionalSummary}</p>
            </div>
          </CardContent>
        </Card>

        {/* Visa Selection */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Visa Selection</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => onEdit(2)}>
                Edit
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-sm text-muted-foreground">Target Country</p>
              <p className="font-medium flex items-center gap-2">
                <span className="text-2xl">{selectedCountry?.flag}</span>
                {selectedCountry?.name}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Visa Type</p>
              <p className="font-medium">{selectedVisa?.name}</p>
              <p className="text-sm text-muted-foreground mt-1">{selectedVisa?.description}</p>
            </div>
          </CardContent>
        </Card>

        {/* Documents */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Uploaded Documents</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => onEdit(3)}>
                Edit
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {state.uploadedDocuments.map((doc) => {
                const docInfo = selectedVisa?.requiredDocuments.find(d => d.id === doc.documentId);
                return (
                  <div key={doc.id} className="flex items-center gap-2 p-2 rounded bg-muted/50">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{docInfo?.name}</p>
                      <p className="text-xs text-muted-foreground">{doc.file.name}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Estimated Time */}
      <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg text-center">
        <p className="text-sm text-muted-foreground mb-1">Estimated Evaluation Time</p>
        <p className="font-semibold">~10 seconds</p>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-8">
        <Button variant="outline" onClick={onBack} size="lg" disabled={submitting}>
          ← Back
        </Button>
        <Button onClick={handleSubmit} size="lg" disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            'Submit Evaluation'
          )}
        </Button>
      </div>
    </div>
  );
};
