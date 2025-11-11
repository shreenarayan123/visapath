import { useEvaluationContext } from '@/context/EvaluationContext';
import { ProgressBar } from './ProgressBar';
import { Step1Personal } from './Step1Personal';
import { Step2CountryVisa } from './Step2CountryVisa';
import { Step3Documents } from './Step3Documents';
import { Step4Review } from './Step4Review';

export const WizardContainer = () => {
  const { state, setCurrentStep } = useEvaluationContext();

  const handleNext = () => {
    setCurrentStep(state.currentStep + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    setCurrentStep(state.currentStep - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEdit = (step: number) => {
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen gradient-page py-12 px-4">
      <div className="container max-w-6xl mx-auto">
        <ProgressBar currentStep={state.currentStep} totalSteps={4} />
        
        <div className="bg-card rounded-xl shadow-elegant p-6 md:p-8">
          {state.currentStep === 1 && <Step1Personal onNext={handleNext} />}
          {state.currentStep === 2 && <Step2CountryVisa onNext={handleNext} onBack={handleBack} />}
          {state.currentStep === 3 && <Step3Documents onNext={handleNext} onBack={handleBack} />}
          {state.currentStep === 4 && <Step4Review onBack={handleBack} onEdit={handleEdit} />}
        </div>
      </div>
    </div>
  );
};
