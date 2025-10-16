import { useState, useEffect } from 'react';
import { api } from '../lib/api';

/**
 * Hook for searching company logos
 */
export function useLogoSearch() {
  const [logos, setLogos] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchLogo = async (companyName) => {
    if (!companyName) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get(`/integrations/logos/${encodeURIComponent(companyName)}`);
      const logoUrl = response.data.logo;
      
      if (logoUrl) {
        setLogos(prev => ({
          ...prev,
          [companyName.toLowerCase()]: logoUrl
        }));
      }
      
      return logoUrl;
    } catch (err) {
      console.error('Logo search error:', err);
      setError(err.response?.data?.error || 'Failed to fetch logo');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const searchMultipleLogos = async (companyNames) => {
    if (!companyNames || companyNames.length === 0) return {};
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post('/integrations/logos/batch', {
        companies: companyNames
      });
      
      const newLogos = response.data.logos;
      setLogos(prev => ({
        ...prev,
        ...Object.fromEntries(
          Object.entries(newLogos).map(([name, logo]) => [name.toLowerCase(), logo])
        )
      }));
      
      return newLogos;
    } catch (err) {
      console.error('Batch logo search error:', err);
      setError(err.response?.data?.error || 'Failed to fetch logos');
      return {};
    } finally {
      setLoading(false);
    }
  };

  const getLogo = (companyName) => {
    if (!companyName) return null;
    return logos[companyName.toLowerCase()] || null;
  };

  return {
    logos,
    loading,
    error,
    searchLogo,
    searchMultipleLogos,
    getLogo
  };
}

/**
 * Hook for getting a single company logo
 */
export function useCompanyLogo(companyName) {
  const [logo, setLogo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!companyName) return;

    const fetchLogo = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await api.get(`/integrations/logos/${encodeURIComponent(companyName)}`);
        setLogo(response.data.logo);
      } catch (err) {
        console.error('Logo fetch error:', err);
        setError(err.response?.data?.error || 'Failed to fetch logo');
        setLogo(null);
      } finally {
        setLoading(false);
      }
    };

    fetchLogo();
  }, [companyName]);

  return { logo, loading, error };
}
