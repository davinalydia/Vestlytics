// Shimmer Skeleton Loader Component

export const SkeletonLoader = ({ type = 'text', rows = 3 }) => {
  if (type === 'chart') {
    return (
      <div className="w-full h-full flex flex-col justify-between p-4 animate-pulse">
        <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-6"></div>
        <div className="flex-1 flex items-end gap-3 h-[200px]">
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-t h-[40%]"></div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-t h-[75%]"></div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-t h-[60%]"></div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-t h-[90%]"></div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-t h-[45%]"></div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-t h-[70%]"></div>
        </div>
      </div>
    );
  }

  if (type === 'pie') {
    return (
      <div className="w-full h-full flex items-center justify-center p-6 animate-pulse gap-6">
        <div className="w-36 h-36 rounded-full border-[14px] border-slate-200 dark:border-slate-700 flex items-center justify-center">
          <div className="w-16 h-6 bg-slate-200 dark:bg-slate-700 rounded"></div>
        </div>
        <div className="flex-1 space-y-3">
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className="w-full space-y-4 p-4 animate-pulse">
        <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/4 mb-4"></div>
        {[...Array(rows)].map((_, i) => (
          <div key={i} className="flex gap-4 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/5"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/6"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/6"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="w-full space-y-3 p-4 animate-pulse">
      {[...Array(rows)].map((_, i) => (
        <div 
          key={i} 
          className="h-4 bg-slate-200 dark:bg-slate-700 rounded" 
          style={{ width: i === rows - 1 ? '60%' : '100%' }}
        ></div>
      ))}
    </div>
  );
};

export default SkeletonLoader;
