import React from 'react';

export const Skeleton = ({ className = '', count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`animate-pulse bg-slate-200 rounded-md ${className}`}
        />
      ))}
    </>
  );
};

export const RoomCardSkeleton = () => (
  <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
    <div className="h-44 bg-slate-200 animate-pulse" />
    <div className="p-5 space-y-3">
      <div className="h-5 bg-slate-200 rounded animate-pulse w-3/4" />
      <div className="h-4 bg-slate-200 rounded animate-pulse w-1/2" />
      <div className="flex gap-2 pt-2">
        <div className="h-6 bg-slate-200 rounded-full animate-pulse w-16" />
        <div className="h-6 bg-slate-200 rounded-full animate-pulse w-16" />
      </div>
      <div className="pt-4 flex justify-between items-center border-t border-slate-100">
        <div className="h-4 bg-slate-200 rounded animate-pulse w-20" />
        <div className="h-9 bg-slate-200 rounded-lg animate-pulse w-24" />
      </div>
    </div>
  </div>
);

export const TableRowSkeleton = ({ columns = 5, count = 5 }) => (
  <>
    {Array.from({ length: count }).map((_, rowIdx) => (
      <tr key={rowIdx} className="border-b border-slate-100">
        {Array.from({ length: columns }).map((_, colIdx) => (
          <td key={colIdx} className="px-6 py-4">
            <div className="h-4 bg-slate-200 rounded animate-pulse w-full max-w-[120px]" />
          </td>
        ))}
      </tr>
    ))}
  </>
);

export default Skeleton;
