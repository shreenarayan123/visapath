import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { ScoreDisplay } from './ScoreDisplay';
import { InsightCards } from './InsightCards';
import { ActionButtons } from './ActionButtons';
import { api } from '@/utils/api';
import { EvaluationResult } from '@/types';
import { Loader2 } from 'lucide-react';
import { useCountries } from '@/hooks/useCountries';

export const ResultsPage = () => {
  const { evaluationId } = useParams<{ evaluationId: string }>();
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const { countries } = useCountries();

  useEffect(() => {
    const fetchResults = async () => {
      if (!evaluationId) return;
      
      try {
        setLoading(true);
        const response: any = await api.getEvaluationResult(evaluationId);
        setResult(response.data);
      } catch (error) {
        console.error('Failed to fetch results:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [evaluationId]);

  if (loading) {
    return (
      <div className="min-h-screen gradient-page flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-xl font-semibold">Processing your evaluation...</p>
          <p className="text-muted-foreground mt-2">This will only take a moment</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen gradient-page flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl font-semibold">Evaluation not found</p>
          <p className="text-muted-foreground mt-2">Please check the URL and try again</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-page py-12 px-4">
      <div className="container max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Your Evaluation Results</h1>
          <p className="text-muted-foreground">
            Evaluated on {new Date(result.evaluatedAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>

        {/* Score Display */}
        <Card className="mb-8 shadow-elegant">
          <CardContent className="pt-8 pb-8">
            <ScoreDisplay score={result.score} category={result.category} />
          </CardContent>
        </Card>

        {/* Insights */}
        <InsightCards
          summary={result.summary}
          strengths={result.strengths}
          improvements={result.improvements}
          nextSteps={result.nextSteps}
        />

        {/* Optional Breakdown */}
        {result.breakdown && (
          <Card className="mt-6">
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-4">Detailed Breakdown</h3>
              <div className="space-y-3">
                {Object.entries(result.breakdown).map(([key, value]) => (
                  <div key={key}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                      <span className="text-sm font-semibold">{value}/100</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-500"
                        style={{ width: `${value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="mt-8">
          <ActionButtons evaluationId={evaluationId!} />
        </div>
      </div>
    </div>
  );
};
