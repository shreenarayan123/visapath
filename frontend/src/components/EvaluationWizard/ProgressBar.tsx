interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export const ProgressBar = ({ currentStep, totalSteps }: ProgressBarProps) => {
  const steps = [
    { number: 1, label: 'Personal Info' },
    { number: 2, label: 'Country & Visa' },
    { number: 3, label: 'Documents' },
    { number: 4, label: 'Review' },
  ];

  return (
    <div className="w-full max-w-3xl mx-auto mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center flex-1">
            <div className="flex flex-col items-center relative">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                  currentStep >= step.number
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {step.number}
              </div>
              <span
                className={`text-xs mt-2 hidden sm:block ${
                  currentStep >= step.number ? 'text-foreground font-medium' : 'text-muted-foreground'
                }`}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className="flex-1 h-1 mx-2 relative">
                <div className="absolute inset-0 bg-muted rounded-full" />
                <div
                  className={`absolute inset-0 bg-primary rounded-full transition-all duration-300 ${
                    currentStep > step.number ? 'w-full' : 'w-0'
                  }`}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
