import { createContext, useContext, useState, ReactNode } from 'react';
import { EvaluationState, PersonalInfo, UploadedFile } from '@/types';

interface EvaluationContextType {
  state: EvaluationState;
  updatePersonalInfo: (data: PersonalInfo) => void;
  selectCountryAndVisa: (country: string, visaType: string) => void;
  addDocument: (documentId: string, file: File) => void;
  removeDocument: (id: string) => void;
  setCurrentStep: (step: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | undefined) => void;
  setEvaluationId: (id: string) => void;
  resetForm: () => void;
}

const initialState: EvaluationState = {
  personalInfo: {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    currentLocation: '',
    professionalSummary: '',
  },
  targetCountry: '',
  visaType: '',
  uploadedDocuments: [],
  currentStep: 1,
  loading: false,
};

const EvaluationContext = createContext<EvaluationContextType | undefined>(undefined);

export const EvaluationProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<EvaluationState>(initialState);

  const updatePersonalInfo = (data: PersonalInfo) => {
    setState(prev => ({ ...prev, personalInfo: data }));
  };

  const selectCountryAndVisa = (country: string, visaType: string) => {
    setState(prev => ({ ...prev, targetCountry: country, visaType }));
  };

  const addDocument = (documentId: string, file: File) => {
    const newDoc: UploadedFile = {
      id: Math.random().toString(36).substr(2, 9),
      documentId,
      file,
      uploadProgress: 100,
      uploaded: true,
    };
    setState(prev => ({
      ...prev,
      uploadedDocuments: [...prev.uploadedDocuments, newDoc],
    }));
  };

  const removeDocument = (id: string) => {
    setState(prev => ({
      ...prev,
      uploadedDocuments: prev.uploadedDocuments.filter(doc => doc.id !== id),
    }));
  };

  const setCurrentStep = (step: number) => {
    setState(prev => ({ ...prev, currentStep: step }));
  };

  const setLoading = (loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  };

  const setError = (error: string | undefined) => {
    setState(prev => ({ ...prev, error }));
  };

  const setEvaluationId = (id: string) => {
    setState(prev => ({ ...prev, evaluationId: id }));
  };

  const resetForm = () => {
    setState(initialState);
  };

  return (
    <EvaluationContext.Provider
      value={{
        state,
        updatePersonalInfo,
        selectCountryAndVisa,
        addDocument,
        removeDocument,
        setCurrentStep,
        setLoading,
        setError,
        setEvaluationId,
        resetForm,
      }}
    >
      {children}
    </EvaluationContext.Provider>
  );
};

export const useEvaluationContext = () => {
  const context = useContext(EvaluationContext);
  if (!context) {
    throw new Error('useEvaluationContext must be used within EvaluationProvider');
  }
  return context;
};
