import { Card } from "@/components/ui/card";
import { FileText, Upload, Brain, CheckCircle } from "lucide-react";

const steps = [
  {
    icon: FileText,
    title: "Share Your Profile",
    description: "Tell us about your background, education, work experience, and career goals in a simple form.",
    color: "text-primary",
  },
  {
    icon: Upload,
    title: "Upload Documents",
    description: "Securely upload your required documents like CV, diplomas, and professional certificates.",
    color: "text-secondary",
  },
  {
    icon: Brain,
    title: "AI-Powered Analysis",
    description: "Our intelligent system evaluates your profile against visa requirements across multiple countries.",
    color: "text-accent",
  },
  {
    icon: CheckCircle,
    title: "Get Your Results",
    description: "Receive a detailed assessment with personalized recommendations and next steps.",
    color: "text-primary",
  },
];

export const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-20">
      <div className="container">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl font-bold">
            Simple, Fast,{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Reliable
            </span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Get your visa evaluation in just 4 easy steps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.title} className="relative">
                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-[calc(50%+2rem)] w-[calc(100%-4rem)] h-0.5 bg-gradient-to-r from-border to-transparent" />
                )}

                <Card className="p-6 text-center relative z-10 hover-lift bg-card border-border/50">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                    <Icon className={`h-8 w-8 ${step.color}`} />
                  </div>
                  
                  <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold mb-3">
                    {index + 1}
                  </div>

                  <h3 className="font-bold text-lg mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </Card>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
