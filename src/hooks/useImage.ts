import { useState, useEffect, useRef } from 'react';
import { IMAGE_CONFIG } from '@/lib/constants';

interface UseImageOptions {
  fallbackSrc: string;
  timeout?: number;
  retryAttempts?: number;
  onLoad?: () => void;
  onError?: () => void;
}

export function useImage(src: string, options: UseImageOptions) {
  const [imgSrc, setImgSrc] = useState(src);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const retryCount = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const loadImage = () => {
      const img = new Image();
      
      const timeoutDuration = options.timeout || IMAGE_CONFIG.LOAD_TIMEOUT;
      const maxRetries = options.retryAttempts || IMAGE_CONFIG.RETRY_ATTEMPTS;

      // Nettoyer le timeout précédent si existant
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Configurer un nouveau timeout
      timeoutRef.current = setTimeout(() => {
        img.src = '';  // Annuler le chargement
        handleError();
      }, timeoutDuration);

      img.onload = () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        setImgSrc(src);
        setLoading(false);
        setError(false);
        retryCount.current = 0;
        options.onLoad?.();
      };

      img.onerror = handleError;

      function handleError() {
        if (retryCount.current < maxRetries) {
          retryCount.current++;
          // Réessayer avec un délai exponentiel
          setTimeout(() => {
            img.src = src;
          }, Math.pow(2, retryCount.current) * 1000);
        } else {
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }
          setImgSrc(options.fallbackSrc);
          setError(true);
          setLoading(false);
          retryCount.current = 0;
          options.onError?.();
        }
      }

      img.src = src;
    };

    loadImage();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [src, options.fallbackSrc]);

  return {
    src: imgSrc,
    error,
    loading,
    retry: () => {
      setLoading(true);
      setError(false);
      retryCount.current = 0;
      setImgSrc(src);
    }
  };
}