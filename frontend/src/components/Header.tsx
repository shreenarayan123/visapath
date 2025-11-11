import { Globe, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

export const Header = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [isDark]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg gradient-hero">
            <Globe className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            VisaPath
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <a href="#about" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
            About
          </a>
          <a href="#countries" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
            Countries
          </a>
          <a href="#faq" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
            FAQ
          </a>
          <a href="#contact" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
            Contact
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsDark(!isDark)}
            className="rounded-full"
          >
            {isDark ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
          <Button variant="hero" size="sm" className="hidden sm:inline-flex">
            Start Evaluation
          </Button>
        </div>
      </div>
    </header>
  );
};
