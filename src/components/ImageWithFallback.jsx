"use client";

import { useEffect, useState } from "react";
import PropTypes from "prop-types";

function ImageWithFallback({ src, alt, className, wrapperClassName, fallbackContent }) {
  const [isValid, setIsValid] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    let isCurrent = true;
    async function validate() {
      setHasChecked(false);
      setIsValid(false);
      if (!src || typeof src !== "string") {
        setHasChecked(true);
        return;
      }

      try {
        const response = await fetch(src, { method: "HEAD" });
        if (!isCurrent) return;
        if (response.ok) {
          setIsValid(true);
        } else {
          setIsValid(false);
        }
      } catch (_err) {
        // CORS or network failure: treat as invalid
        if (!isCurrent) return;
        setIsValid(false);
      } finally {
        if (isCurrent) setHasChecked(true);
      }
    }
    validate();
    return () => {
      isCurrent = false;
    };
  }, [src]);

  // Optimistic onError guard in case HEAD passes but GET fails
  const [failedToLoad, setFailedToLoad] = useState(false);

  if (!isValid && !failedToLoad) {
    return (
      <div className={wrapperClassName}>
        {fallbackContent || (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <div className="w-16 h-16 bg-gold/20 rounded-full mx-auto mb-3 flex items-center justify-center">
                <span className="text-2xl">💎</span>
              </div>
              <p className="text-xs font-medium">Jewelry Image Coming Soon...</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (!isValid || failedToLoad) {
    return (
      <div className={wrapperClassName}>
        {fallbackContent || (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <div className="w-16 h-16 bg-gold/20 rounded-full mx-auto mb-3 flex items-center justify-center">
                <span className="text-2xl">💎</span>
              </div>
              <p className="text-xs font-medium">Jewelry Image</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={wrapperClassName}>
      <img
        src={src}
        alt={alt}
        className={className}
        onError={() => setFailedToLoad(true)}
      />
    </div>
  );
}

ImageWithFallback.propTypes = {
  src: PropTypes.string,
  alt: PropTypes.string,
  className: PropTypes.string,
  wrapperClassName: PropTypes.string,
  fallbackContent: PropTypes.node,
};

export { ImageWithFallback };


