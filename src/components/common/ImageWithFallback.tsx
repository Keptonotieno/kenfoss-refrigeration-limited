import React, { useState, useEffect } from 'react';
import { resolveImageUrl, getCategoryDefaultImage } from '../../utils/imageRegistry';
import { Snowflake, Wrench, ShieldCheck, ImageOff } from 'lucide-react';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string | null;
  alt: string;
  category?: string;
  fallbackSrc?: string;
  containerClassName?: string;
  priority?: boolean;
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  category,
  fallbackSrc,
  className = '',
  containerClassName = '',
  loading,
  decoding,
  priority = false,
  onError,
  onLoad,
  ...restProps
}) => {
  const resolvedInitial = resolveImageUrl(src, category);
  const [currentSrc, setCurrentSrc] = useState<string>(resolvedInitial);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);
  const [retryCount, setRetryCount] = useState<number>(0);

  useEffect(() => {
    const newResolved = resolveImageUrl(src, category);
    setCurrentSrc(newResolved);
    setIsLoaded(false);
    setHasError(false);
    setRetryCount(0);
  }, [src, category]);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (onError) onError(e);

    if (retryCount === 0) {
      setRetryCount(1);
      const categoryFallback = fallbackSrc || getCategoryDefaultImage(category);
      if (categoryFallback && categoryFallback !== currentSrc) {
        setCurrentSrc(categoryFallback);
        return;
      }
    }

    setHasError(true);
    setIsLoaded(true);
  };

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setIsLoaded(true);
    if (onLoad) onLoad(e);
  };

  if (hasError) {
    return (
      <div
        className={`relative flex flex-col items-center justify-center p-4 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 select-none overflow-hidden ${containerClassName} ${className}`}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 opacity-90" />
        <div className="relative z-10 flex flex-col items-center text-center space-y-2">
          <div className="w-10 h-10 rounded-full bg-slate-800/80 border border-slate-700/80 flex items-center justify-center text-sky-400 shadow">
            {category?.toLowerCase().includes('hvac') ? (
              <Wrench className="w-5 h-5 text-amber-400" />
            ) : (
              <Snowflake className="w-5 h-5 text-sky-400 animate-pulse" />
            )}
          </div>
          <span className="text-xs font-bold text-slate-300 line-clamp-1 max-w-[200px]">
            {alt || 'Kenfoss Commercial Asset'}
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] text-slate-500 font-mono uppercase tracking-wider">
            <ShieldCheck className="w-3 h-3 text-emerald-500" />
            <span>Kenfoss Certified</span>
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${containerClassName}`}>
      {/* Loading Skeleton */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-slate-800/80 animate-pulse z-10 flex items-center justify-center">
          <Snowflake className="w-6 h-6 text-slate-600 animate-spin opacity-40" />
        </div>
      )}

      <img
        {...restProps}
        src={currentSrc}
        alt={alt}
        loading={priority ? 'eager' : (loading || 'lazy')}
        decoding={priority ? 'sync' : (decoding || 'async')}
        {...({ fetchPriority: priority ? 'high' : 'low' } as any)}
        onLoad={handleImageLoad}
        onError={handleImageError}
        className={`${className} ${!isLoaded ? 'opacity-0 scale-95 blur-xs' : 'opacity-100 scale-100 blur-0 transition-all duration-300 ease-out'}`}
      />
    </div>
  );
};
