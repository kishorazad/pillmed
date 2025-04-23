import { useState, useEffect } from 'react';
import { getSafeImageUrl } from '@/utils/imageUtils';
import { Loader2 } from 'lucide-react';

interface OptimizedImageProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
  size?: 'THUMBNAIL' | 'SMALL' | 'MEDIUM' | 'LARGE';
  fallbackText?: string;
}

/**
 * Optimized image component for admin dashboards
 * - Uses image optimization utilities
 * - Handles loading states and errors
 * - Provides visual feedback during loading
 * - Fallback to placeholder when image fails to load
 */
const OptimizedImage = ({ 
  src, 
  alt, 
  className = "", 
  size = 'THUMBNAIL',
  fallbackText
}: OptimizedImageProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [imageSrc, setImageSrc] = useState<string>('');
  
  useEffect(() => {
    // Reset states when src changes
    setIsLoading(true);
    setHasError(false);
    
    // Process the image URL through our utility
    const safeUrl = getSafeImageUrl(src, size);
    setImageSrc(safeUrl);
  }, [src, size]);

  // Image load handlers
  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
        <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
      </div>
    );
  }

  // Show error state with fallback
  if (hasError) {
    if (fallbackText) {
      return (
        <div className={`flex items-center justify-center bg-gray-100 text-gray-500 text-xs ${className}`}>
          {fallbackText}
        </div>
      );
    }
    // Default fallback is a pill shape for medicine
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
        <div className="w-3/4 h-1/2 rounded-full bg-primary/20"></div>
      </div>
    );
  }

  // Show the image
  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      onLoad={handleLoad}
      onError={handleError}
      loading="lazy"
    />
  );
};

export default OptimizedImage;