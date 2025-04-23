import React from 'react';

export interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  size?: string;
  fallbackText?: string;
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
  className,
  size,
  fallbackText
}) => {
  const [imgError, setImgError] = React.useState(false);

  // Parse size string if provided (format: "100x100" or similar)
  let imgWidth = width;
  let imgHeight = height;
  
  if (size && !width && !height) {
    const sizeParts = size.split('x');
    if (sizeParts.length === 2) {
      imgWidth = parseInt(sizeParts[0], 10) || undefined;
      imgHeight = parseInt(sizeParts[1], 10) || undefined;
    }
  }

  const handleError = () => {
    setImgError(true);
  };

  // Show fallback text if image fails to load or src is missing
  if (imgError || !src) {
    return (
      <div 
        className={`flex items-center justify-center bg-muted text-muted-foreground ${className}`}
        style={{ width: imgWidth, height: imgHeight }}
      >
        {fallbackText || alt || 'Image not available'}
      </div>
    );
  }

  return (
    <img 
      src={src} 
      alt={alt} 
      width={imgWidth} 
      height={imgHeight} 
      className={className}
      loading="lazy"
      onError={handleError}
    />
  );
};

export default OptimizedImage;