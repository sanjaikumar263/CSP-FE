import { useState, useEffect } from 'react';
import placeholderSvg from '../assets/placeholder.svg';

export default function SafeImage({ src, alt, className, style, ...props }) {
  const [imgSrc, setImgSrc] = useState(src || placeholderSvg);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    setImgSrc(src || placeholderSvg);
    setError(false);
    setLoaded(false);
  }, [src]);

  const handleError = () => {
    if (!error) {
      setError(true);
      setImgSrc(placeholderSvg);
    }
  };

  const handleLoad = () => {
    setLoaded(true);
  };

  return (
    <img
      src={imgSrc || placeholderSvg}
      alt={alt || 'Product Image'}
      className={`${className || ''} ${!loaded ? 'img-loading' : 'img-loaded'}`}
      style={{
        opacity: loaded ? 1 : 0.6,
        transition: 'opacity 0.3s ease',
        ...style
      }}
      onError={handleError}
      onLoad={handleLoad}
      {...props}
    />
  );
}
