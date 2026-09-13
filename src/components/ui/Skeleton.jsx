import React from 'react';

export function Skeleton({ className = '', style = {} }) {
  return (
    <div
      className={`skeleton-loader ${className}`}
      style={style}
    >
      <style>{`
        .skeleton-loader {
          background: linear-gradient(
            90deg,
            rgba(30, 58, 95, 0.06) 25%,
            rgba(30, 58, 95, 0.14) 50%,
            rgba(30, 58, 95, 0.06) 75%
          );
          background-size: 200% 100%;
          animation: skeleton-shimmer 1.5s infinite ease-in-out;
          border-radius: 8px;
        }
        @keyframes skeleton-shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}

export function SkeletonCard({ count = 1 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="glass-card p-4 space-y-3 mb-3">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-full shrink-0" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
          <Skeleton className="h-16 w-full rounded-xl" />
        </div>
      ))}
    </>
  );
}

export default Skeleton;
