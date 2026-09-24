import React from 'react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

const SearchBar = ({
  value = '',
  onChange,
  placeholder = 'Search by room name, location, or floor...',
  className = '',
}) => {
  return (
    <div className={`relative flex-1 ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
        <MagnifyingGlassIcon className="h-5 w-5" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="block w-full rounded-xl border border-slate-300 pl-10 pr-10 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all shadow-2xs"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
