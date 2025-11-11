import { useNavigate } from "react-router-dom";
import { ArrowRight, Globe2, MapPin, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const Hero = () => {
  const navigate = useNavigate();
  
  return (
    <section className="relative overflow-hidden py-20 md:py-32">
      {/* Background gradient */}
      <div className="absolute inset-0 gradient-hero opacity-5" />
      
      {/* Floating elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />

      <div className="container relative z-10">
        <div className="mx-auto max-w-4xl text-center space-y-8 animate-fade-in">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary border border-primary/20">
            <Shield className="h-4 w-4" />
            Trusted by 10,000+ visa applicants
          </div>

          {/* Heading */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
            Find Your Perfect{" "}
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Visa Path
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Navigate the complex world of international visas with confidence. 
            Get personalized evaluations for the U.S., U.K., Canada, Europe, Australia, and more.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button size="lg" variant="hero" className="text-base group" onClick={() => navigate('/evaluate')}>
              Start Your Evaluation
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button size="lg" variant="outline" className="text-base" onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}>
              Learn More
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 max-w-3xl mx-auto">
            <Card className="p-6 hover-lift bg-card/50 backdrop-blur border-border/50">
              <Globe2 className="h-8 w-8 text-primary mb-3 mx-auto" />
              <h3 className="font-semibold text-lg mb-1">10+ Countries</h3>
              <p className="text-sm text-muted-foreground">
                Comprehensive visa assessments across major destinations
              </p>
            </Card>

            <Card className="p-6 hover-lift bg-card/50 backdrop-blur border-border/50">
              <MapPin className="h-8 w-8 text-secondary mb-3 mx-auto" />
              <h3 className="font-semibold text-lg mb-1">30+ Visa Types</h3>
              <p className="text-sm text-muted-foreground">
                From work permits to skilled migration programs
              </p>
            </Card>

            <Card className="p-6 hover-lift bg-card/50 backdrop-blur border-border/50">
              <Shield className="h-8 w-8 text-accent mb-3 mx-auto" />
              <h3 className="font-semibold text-lg mb-1">Expert Guidance</h3>
              <p className="text-sm text-muted-foreground">
                Partnered with leading immigration law firms
              </p>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};
