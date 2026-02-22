import React, { forwardRef } from 'react';
import { useImage } from '@/hooks/useImage';

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc: string;
  onLoad?: () => void;
  onError?: () => void;
}

export const Image = forwardRef<HTMLImageElement, ImageProps>(
  ({ src, fallbackSrc, alt, onLoad, onError, ...props }, ref) => {
    const { src: imageSrc, error, loading, retry } = useImage(src || '', {
      fallbackSrc,
      onLoad,
      onError,
    });

    return (
      <img
        ref={ref}
        src={imageSrc}
        alt={alt}
        {...props}
        onError={retry}
      />
    );
  }
);

Image.displayName = 'Image';