import { useState, useEffect, useRef } from 'react';
import placeholderSvg from '../assets/placeholder.svg';

export default function SafeImage({ src, alt, className, style, ...props }) {
  const [imgSrc, setImgSrc] = useState(src || placeholderSvg);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    setImgSrc(src || placeholderSvg);
    setError(false);
    if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0) {
      setLoaded(true);
    } else {
      setLoaded(false);
    }
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
      ref={imgRef}
      src={imgSrc || placeholderSvg}
      alt={alt || 'Product Image'}
      className={`${className || ''} ${!loaded ? 'img-loading' : 'img-loaded'}`}
      style={{
        opacity: 1,
        ...style
      }}
      onError={handleError}
      onLoad={handleLoad}
      {...props}
    />
  );
}
