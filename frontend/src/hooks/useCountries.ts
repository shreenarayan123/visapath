import { useState, useEffect } from 'react';
import { Country } from '@/types';
import { api } from '@/utils/api';

export const useCountries = () => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setLoading(true);
        const response = await api.getCountries();
        setCountries(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load countries');
      } finally {
        setLoading(false);
      }
    };

    fetchCountries();
  }, []);

  return { countries, loading, error };
};
