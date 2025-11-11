import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { CountryShowcase } from "@/components/CountryShowcase";
import { HowItWorks } from "@/components/HowItWorks";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen gradient-page">
      <Header />
      <Hero />
      <CountryShowcase />
      <HowItWorks />
      <Footer />
    </div>
  );
};

export default Index;
