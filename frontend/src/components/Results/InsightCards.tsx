import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

interface InsightCardsProps {
  summary: string;
  strengths: string[];
  improvements: string[];
  nextSteps: string[];
}

export const InsightCards = ({ summary, strengths, improvements, nextSteps }: InsightCardsProps) => {
  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{summary}</p>
        </CardContent>
      </Card>

      {/* Strengths */}
      <Card className="border-green-500/20 bg-green-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            Your Strengths
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {strengths.map((strength, index) => (
              <li key={index} className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span>{strength}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Improvements */}
      <Card className="border-orange-500/20 bg-orange-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-500" />
            Areas to Improve
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {improvements.map((improvement, index) => (
              <li key={index} className="flex items-start gap-2">
                <ArrowRight className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                <span>{improvement}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRight className="h-5 w-5 text-primary" />
            Next Steps
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-2">
            {nextSteps.map((step, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center font-semibold">
                  {index + 1}
                </span>
                <span className="pt-0.5">{step}</span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </div>
  );
};
