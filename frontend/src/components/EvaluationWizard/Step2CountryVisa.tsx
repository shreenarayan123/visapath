import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useEvaluationContext } from '@/context/EvaluationContext';
import { useCountries } from '@/hooks/useCountries';
import { Check, Clock, FileText, Search } from 'lucide-react';
import { VisaType } from '@/types';

interface Step2CountryVisaProps {
  onNext: () => void;
  onBack: () => void;
}

export const Step2CountryVisa = ({ onNext, onBack }: Step2CountryVisaProps) => {
  const { state, selectCountryAndVisa } = useEvaluationContext();
  const { countries, loading } = useCountries();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountryCode, setSelectedCountryCode] = useState(state.targetCountry);
  const [selectedVisaId, setSelectedVisaId] = useState(state.visaType);

  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedCountry = countries.find(c => c.code === selectedCountryCode);
  const selectedVisa = selectedCountry?.visaTypes.find((v: VisaType) => v.id === selectedVisaId);

  const handleNext = () => {
    if (selectedCountryCode && selectedVisaId) {
      selectCountryAndVisa(selectedCountryCode, selectedVisaId);
      onNext();
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading countries...</div>;
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold mb-2">Where do you want to go?</h2>
        <p className="text-muted-foreground">Select your target country and visa type</p>
      </div>

      {/* Search */}
      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Search countries..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Country Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
        {filteredCountries.map((country) => (
          <Card
            key={country.code}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedCountryCode === country.code ? 'ring-2 ring-primary shadow-md' : ''
            }`}
            onClick={() => {
              setSelectedCountryCode(country.code);
              setSelectedVisaId('');
            }}
          >
            <CardContent className="p-4 text-center">
              <div className="text-4xl mb-2">{country.flag}</div>
              <div className="font-medium text-sm">{country.name}</div>
              {selectedCountryCode === country.code && (
                <Check className="h-5 w-5 text-primary mx-auto mt-2" />
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Visa Types */}
      {selectedCountry && (
        <div className="space-y-4 animate-fade-in">
          <h3 className="text-xl font-semibold">Available Visa Types</h3>
          <div className="grid gap-4">
            {selectedCountry.visaTypes.map((visa: VisaType) => (
              <Card
                key={visa.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedVisaId === visa.id ? 'ring-2 ring-primary shadow-md' : ''
                }`}
                onClick={() => setSelectedVisaId(visa.id)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        {visa.name}
                        {selectedVisaId === visa.id && (
                          <Check className="h-5 w-5 text-primary" />
                        )}
                      </CardTitle>
                      <CardDescription className="mt-2">{visa.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">
                      <FileText className="h-3 w-3 mr-1" />
                      {visa.requiredDocuments.length} documents
                    </Badge>
                    <Badge variant="secondary">
                      <Clock className="h-3 w-3 mr-1" />
                      {visa.processingTime}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Required Documents Preview */}
      {selectedVisa && (
        <div className="mt-6 p-6 bg-muted/50 rounded-lg animate-fade-in">
          <h4 className="font-semibold mb-3">Required Documents</h4>
          <ul className="space-y-2">
            {selectedVisa.requiredDocuments.map((doc) => (
              <li key={doc.id} className="flex items-start gap-2">
                <div className="mt-1">
                  {doc.required ? (
                    <div className="w-4 h-4 rounded border-2 border-primary" />
                  ) : (
                    <div className="w-4 h-4 rounded border-2 border-muted-foreground" />
                  )}
                </div>
                <div>
                  <div className="font-medium">
                    {doc.name} {doc.required && <span className="text-destructive">*</span>}
                  </div>
                  <div className="text-sm text-muted-foreground">{doc.description}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-8">
        <Button variant="outline" onClick={onBack} size="lg">
          ← Back
        </Button>
        <Button
          onClick={handleNext}
          size="lg"
          disabled={!selectedCountryCode || !selectedVisaId}
        >
          Next →
        </Button>
      </div>
    </div>
  );
};
