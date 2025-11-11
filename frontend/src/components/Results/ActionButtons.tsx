import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Mail, Printer, RotateCcw, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { api } from '@/utils/api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ActionButtonsProps {
  evaluationId: string;
}

export const ActionButtons = ({ evaluationId }: ActionButtonsProps) => {
  const navigate = useNavigate();
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [emailSending, setEmailSending] = useState(false);

  const handleDownloadPDF = () => {
    try {
      api.downloadPDF(evaluationId);
      toast.success('PDF download started');
    } catch (error) {
      toast.error('Failed to download PDF');
    }
  };

  const handleSendEmail = async () => {
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setEmailSending(true);
    try {
      await api.emailResults(evaluationId, email);
      toast.success('Results sent to your email!');
      setEmailDialogOpen(false);
      setEmail('');
    } catch (error) {
      toast.error('Failed to send email. Please try again.');
    } finally {
      setEmailSending(false);
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

      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="lg">
            <Mail className="h-5 w-5 mr-2" />
            Email Results
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Email Your Results</DialogTitle>
            <DialogDescription>
              Enter your email address to receive a copy of your evaluation results
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendEmail()}
              />
            </div>
            <Button
              onClick={handleSendEmail}
              disabled={emailSending}
              className="w-full"
            >
              {emailSending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Send Email
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
