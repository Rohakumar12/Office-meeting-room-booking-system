import { AMENITIES_LIST } from '../../utils/constants';
import { FunnelIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

const FilterPanel = ({
  filters,
  onChange,
  onReset,
  className = '',
}) => {
  const handleCapacityChange = (val) => {
    onChange({ ...filters, capacity: val });
  };

  const handleAmenityToggle = (amenity) => {
    const current = filters.amenities || [];
    const exists = current.includes(amenity);
    const updated = exists
      ? current.filter((a) => a !== amenity)
      : [...current, amenity];
    onChange({ ...filters, amenities: updated });
  };

  const handleFloorChange = (floor) => {
    onChange({ ...filters, floor });
  };

  return (
    <div className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-600 p-5 shadow-xs ${className}`}>
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700">
        <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100 font-bold text-sm">
          <FunnelIcon className="w-4 h-4 text-blue-600 dark:text-blue-300" />
          Filter Rooms
        </div>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-200 font-medium"
        >
          <ArrowPathIcon className="w-3.5 h-3.5" />
          Reset
        </button>
      </div>

      <div className="space-y-5 pt-4">
        {/* Capacity */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-2">
            Min Capacity
          </label>
          <div className="grid grid-cols-5 gap-1.5">
            {['', '4', '6', '10', '20'].map((cap) => (
              <button
                key={cap || 'any'}
                type="button"
                onClick={() => handleCapacityChange(cap)}
                className={`py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                  (filters.capacity || '') === cap
                    ? 'bg-blue-600 dark:bg-blue-600 border-blue-600 dark:border-blue-400 text-white shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {cap ? `${cap}+` : 'Any'}
              </button>
            ))}
          </div>
        </div>

        {/* Floor */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-2">
            Floor
          </label>
          <select
            value={filters.floor || ''}
            onChange={(e) => handleFloorChange(e.target.value)}
            className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-500 py-2 px-3 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-200 focus:ring-blue-500 dark:focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-500"
          >
            <option value="">All Floors</option>
            <option value="Ground Floor">Ground Floor</option>
            <option value="1st Floor">1st Floor</option>
            <option value="2nd Floor">2nd Floor</option>
            <option value="3rd Floor">3rd Floor</option>
            <option value="4th Floor">4th Floor</option>
            <option value="5th Floor">5th Floor</option>
          </select>
        </div>

        {/* Required Amenities */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-2">
            Amenities
          </label>
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {AMENITIES_LIST.map((amenity) => {
              const isChecked = (filters.amenities || []).includes(amenity);
              return (
                <label
                  key={amenity}
                  className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 cursor-pointer select-none"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleAmenityToggle(amenity)}
                    className="w-3.5 h-3.5 text-blue-600 dark:text-blue-300 rounded border-slate-300 dark:border-slate-500 focus:ring-blue-500 dark:focus:ring-blue-500"
                  />
                  <span>{amenity}</span>
                </label>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;
