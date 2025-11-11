import { useEffect, useState } from 'react';

interface ScoreDisplayProps {
  score: number;
  category: 'strong' | 'moderate' | 'consider';
}

export const ScoreDisplay = ({ score, category }: ScoreDisplayProps) => {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    const duration = 1000;
    const steps = 60;
    const increment = score / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= score) {
        setDisplayScore(score);
        clearInterval(timer);
      } else {
        setDisplayScore(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [score]);

  const getColor = () => {
    if (score >= 75) return 'text-green-500';
    if (score >= 50) return 'text-orange-500';
    return 'text-red-500';
  };

  const getLabel = () => {
    switch (category) {
      case 'strong':
        return 'Strong Candidate ✓';
      case 'moderate':
        return 'Moderate Fit';
      case 'consider':
        return 'Consider Alternatives';
    }
  };

  const circumference = 2 * Math.PI * 120;
  const offset = circumference - (displayScore / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-64 h-64 mb-6">
        <svg className="transform -rotate-90 w-full h-full">
          <circle
            cx="128"
            cy="128"
            r="120"
            stroke="currentColor"
            strokeWidth="16"
            fill="none"
            className="text-muted"
          />
          <circle
            cx="128"
            cy="128"
            r="120"
            stroke="currentColor"
            strokeWidth="16"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={`${getColor()} transition-all duration-1000 ease-out`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className={`text-6xl font-bold ${getColor()}`}>{displayScore}</div>
          <div className="text-2xl text-muted-foreground">/100</div>
        </div>
      </div>
      <div className="text-2xl font-bold text-center mb-2">{getLabel()}</div>
    </div>
  );
};
