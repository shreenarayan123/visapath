import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const countries = [
  {
    flag: "🇺🇸",
    name: "United States",
    visaTypes: ["O-1A", "O-1B", "H-1B"],
    description: "Extraordinary ability and specialty occupation visas",
    color: "from-blue-500 to-blue-600",
  },
  {
    flag: "🇬🇧",
    name: "United Kingdom",
    visaTypes: ["Tier 2", "Global Talent"],
    description: "Skilled worker and exceptional talent visas",
    color: "from-red-500 to-red-600",
  },
  {
    flag: "🇨🇦",
    name: "Canada",
    visaTypes: ["Express Entry", "Global Mobility"],
    description: "Permanent residency and work permit programs",
    color: "from-red-600 to-rose-500",
  },
  {
    flag: "🇦🇺",
    name: "Australia",
    visaTypes: ["Skilled Migration", "TSS Visa"],
    description: "Points-based and employer-sponsored visas",
    color: "from-emerald-500 to-teal-600",
  },
  {
    flag: "🇩🇪",
    name: "Germany",
    visaTypes: ["EU Blue Card", "ICT Permit"],
    description: "Highly qualified employment opportunities",
    color: "from-slate-600 to-slate-700",
  },
  {
    flag: "🇫🇷",
    name: "France",
    visaTypes: ["Talent Passport", "Salarié"],
    description: "Skilled professionals and researchers",
    color: "from-blue-600 to-indigo-600",
  },
];

export const CountryShowcase = () => {
  return (
    <section id="countries" className="py-20 bg-muted/30">
      <div className="container">
        <div className="text-center space-y-4 mb-12 animate-slide-up">
          <h2 className="text-3xl md:text-4xl font-bold">
            Choose Your{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Destination
            </span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Explore visa opportunities across the world's most sought-after countries
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {countries.map((country, index) => (
            <Card
              key={country.name}
              className="p-6 hover-lift group cursor-pointer animate-scale-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-5xl">{country.flag}</span>
                    <div>
                      <h3 className="font-bold text-lg group-hover:text-primary transition-colors">
                        {country.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {country.description}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {country.visaTypes.map((visa) => (
                    <Badge key={visa} variant="secondary" className="text-xs">
                      {visa}
                    </Badge>
                  ))}
                </div>

                <Button
                  variant="ghost"
                  className="w-full justify-between group/btn"
                >
                  <span>Explore Visas</span>
                  <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button variant="outline" size="lg">
            View All Countries & Visa Types
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
};
