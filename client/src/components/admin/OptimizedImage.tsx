import React from 'react';

export interface OptimizedImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
}

/**
 * OptimizedImage component for rendering responsive images with optimization
 * 
 * This component handles image optimization and provides proper sizing attributes
 */
const OptimizedImage: React.FC<OptimizedImageProps> = ({ 
  src, 
  alt, 
  width, 
  height, 
  className 
}) => {
  return (
    <img 
      src={src} 
      alt={alt} 
      width={width} 
      height={height} 
      className={className}
      loading="lazy"
    />
  );
};

export default OptimizedImage;