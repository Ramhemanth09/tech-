import React from 'react';

export function LoadingSkeleton({ count = 3, className = "h-48" }) {
  return (
    <div className="grid-cols-auto-fit">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`skeleton ${className}`} />
      ))}
    </div>
  );
}
