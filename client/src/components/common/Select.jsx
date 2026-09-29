import { forwardRef } from 'react';

const Select = forwardRef(
  (
    {
      label,
      error,
      id,
      name,
      options = [],
      placeholder = 'Select an option',
      className = '',
      required = false,
      ...props
    },
    ref
  ) => {
    const selectId = id || name;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1"
          >
            {label} {required && <span className="text-red-500 dark:text-red-300">*</span>}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          name={name}
          className={`block w-full rounded-lg border py-2.5 px-3.5 text-sm bg-white dark:bg-slate-900 transition-colors duration-150 ${
            error
              ? 'border-red-300 dark:border-red-600 text-red-900 dark:text-red-100 focus:ring-red-500 dark:focus:ring-red-500 focus:border-red-500 dark:focus:border-red-500 bg-red-50/20 dark:bg-red-950/20'
              : 'border-slate-300 dark:border-slate-500 text-slate-900 dark:text-slate-100 focus:ring-blue-500 dark:focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-500'
          } ${className}`}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option
              key={typeof opt === 'object' ? opt.value : opt}
              value={typeof opt === 'object' ? opt.value : opt}
            >
              {typeof opt === 'object' ? opt.label : opt}
            </option>
          ))}
        </select>
        {error && <p className="mt-1 text-xs text-red-600 dark:text-red-300 font-medium">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
export default Select;
