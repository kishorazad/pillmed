import { useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook for advanced preloading of assets based on user behavior
 * 
 * Usage:
 * ```tsx
 * const preload = usePreload();
 * 
 * // Later in your component:
 * preload.image('/path/to/image.jpg');
 * preload.json('/api/data');
 * preload.page('/products/category/1');
 * ```
 */
export function usePreload() {
  // Track what's already been preloaded to avoid duplicates
  const preloadedRef = useRef<Set<string>>(new Set());
  
  /**
   * Preload an image in the background
   */
  const preloadImage = useCallback((url: string, priority: 'high' | 'low' = 'low') => {
    if (!url || preloadedRef.current.has(`image:${url}`)) return;
    
    // Mark as preloaded
    preloadedRef.current.add(`image:${url}`);
    
    // Create image element to trigger preload
    const img = new Image();
    img.src = url;
    
    // Add priority hint
    if (priority === 'high') {
      img.fetchPriority = 'high';
    }
    
    // Optional: add resource hint to head
    try {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = url;
      if (priority === 'high') {
        link.setAttribute('fetchpriority', 'high');
      }
      document.head.appendChild(link);
    } catch (err) {
      // Silent fail - this is just an optimization
    }
  }, []);
  
  /**
   * Preload a JSON API endpoint in the background
   */
  const preloadJson = useCallback((url: string) => {
    if (!url || preloadedRef.current.has(`json:${url}`)) return;
    
    // Mark as preloaded
    preloadedRef.current.add(`json:${url}`);
    
    // Use fetch with HEAD method to avoid loading the full response
    try {
      fetch(url, { method: 'HEAD' }).catch(() => {
        // Silent fail - this is just an optimization
      });
      
      // Add resource hint to head
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'fetch';
      link.href = url;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    } catch (err) {
      // Silent fail - this is just an optimization
    }
  }, []);
  
  /**
   * Preload a page the user is likely to visit next
   */
  const preloadPage = useCallback((path: string) => {
    if (!path || preloadedRef.current.has(`page:${path}`)) return;
    
    // Mark as preloaded
    preloadedRef.current.add(`page:${path}`);
    
    // Add prefetch hint to head for page routes
    try {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = path; 
      document.head.appendChild(link);
    } catch (err) {
      // Silent fail - this is just an optimization
    }
  }, []);
  
  // Clean up preloaded resources on component unmount
  useEffect(() => {
    return () => {
      // Remove any link elements we might have added
      document.querySelectorAll('link[rel="prefetch"], link[rel="preload"]').forEach(el => {
        if ((el as HTMLElement).dataset.preloader === 'true') {
          el.remove();
        }
      });
    };
  }, []);
  
  return {
    image: preloadImage,
    json: preloadJson,
    page: preloadPage,
    // Allow checking if a resource is preloaded
    isPreloaded: (type: 'image' | 'json' | 'page', url: string) => 
      preloadedRef.current.has(`${type}:${url}`)
  };
}

export default usePreload;