import { Button } from '@/components/ui/button';
import { Download, Printer, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { api } from '@/utils/api';

interface ActionButtonsProps {
  evaluationId: string;
}

export const ActionButtons = ({ evaluationId }: ActionButtonsProps) => {
  const navigate = useNavigate();

  const handleDownloadPDF = () => {
    try {
      api.downloadPDF(evaluationId);
      toast.success('PDF download started');
    } catch (error) {
      toast.error('Failed to download PDF');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleNewEvaluation = () => {
    navigate('/');
  };

  return (
    <div className="flex flex-wrap gap-4 justify-center">
      <Button onClick={handleDownloadPDF} variant="outline" size="lg">
        <Download className="h-5 w-5 mr-2" />
        Download PDF
      </Button>

      <Button onClick={handlePrint} variant="outline" size="lg">
        <Printer className="h-5 w-5 mr-2" />
        Print
      </Button>
      
      <Button onClick={handleNewEvaluation} size="lg" className="gradient-hero">
        <RotateCcw className="h-5 w-5 mr-2" />
        New Evaluation
      </Button>
    </div>
  );
};
