
const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  className = '',
  icon: Icon = null,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary:
      'bg-blue-600 dark:bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-600 text-white shadow-sm hover:shadow focus:ring-blue-500 dark:focus:ring-blue-500 active:bg-blue-800 dark:active:bg-blue-500',
    secondary:
      'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-950 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-500 shadow-sm focus:ring-blue-500 dark:focus:ring-blue-500',
    danger:
      'bg-red-600 dark:bg-red-600 hover:bg-red-700 dark:hover:bg-red-600 text-white shadow-sm hover:shadow focus:ring-red-500 dark:focus:ring-red-500 active:bg-red-800 dark:active:bg-red-500',
    success:
      'bg-emerald-600 dark:bg-emerald-600 hover:bg-emerald-700 dark:hover:bg-emerald-600 text-white shadow-sm focus:ring-emerald-500 dark:focus:ring-emerald-500 active:bg-emerald-800 dark:active:bg-emerald-500',
    ghost:
      'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 focus:ring-slate-400 dark:focus:ring-slate-400',
    outline:
      'border-2 border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950 focus:ring-blue-500 dark:focus:ring-blue-500',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-5 py-2.5 text-base gap-2.5',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseClasses} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        Icon && <Icon className="w-4 h-4 shrink-0" />
      )}
      {children}
    </button>
  );
};

export default Button;
