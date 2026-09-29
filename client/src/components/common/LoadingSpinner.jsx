
const LoadingSpinner = ({ size = 'md', text = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div
        className={`${sizeClasses[size] || sizeClasses.md} rounded-full border-blue-600 dark:border-blue-400 border-t-transparent animate-spin`}
      />
      {text && <p className="mt-3 text-sm text-slate-500 dark:text-slate-400 font-medium">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
