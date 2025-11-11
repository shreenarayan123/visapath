import { WizardContainer } from '@/components/EvaluationWizard/WizardContainer';
import { EvaluationProvider } from '@/context/EvaluationContext';
import { Header } from '@/components/Header';

const Evaluate = () => {
  return (
    <EvaluationProvider>
      <Header />
      <WizardContainer />
    </EvaluationProvider>
  );
};

export default Evaluate;
