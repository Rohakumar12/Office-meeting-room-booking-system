
export const RoomCardSkeleton = () => (
  <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-600 overflow-hidden shadow-xs">
    <div className="h-44 bg-slate-200 dark:bg-slate-700 animate-pulse" />
    <div className="p-5 space-y-3">
      <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-3/4" />
      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-1/2" />
      <div className="flex gap-2 pt-2">
        <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse w-16" />
        <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse w-16" />
      </div>
      <div className="pt-4 flex justify-between items-center border-t border-slate-100 dark:border-slate-700">
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-20" />
        <div className="h-9 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse w-24" />
      </div>
    </div>
  </div>
);

export const TableRowSkeleton = ({ columns = 5, count = 5 }) => (
  <>
    {Array.from({ length: count }).map((_, rowIdx) => (
      <tr key={rowIdx} className="border-b border-slate-100 dark:border-slate-700">
        {Array.from({ length: columns }).map((_, colIdx) => (
          <td key={colIdx} className="px-6 py-4">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-full max-w-[120px]" />
          </td>
        ))}
      </tr>
    ))}
  </>
);
