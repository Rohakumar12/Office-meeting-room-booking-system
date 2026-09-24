import React from 'react';
import { formatTime12h } from '../../utils/formatters';

const TimeSlot = ({
  time,
  isBooked = false,
  isSelected = false,
  bookingInfo = null,
  onClick,
}) => {
  return (
    <button
      type="button"
      disabled={isBooked}
      onClick={onClick}
      className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between ${
        isBooked
          ? 'bg-red-50/70 border-red-200 text-red-700 cursor-not-allowed opacity-80'
          : isSelected
          ? 'bg-blue-600 border-blue-600 text-white shadow-sm ring-2 ring-blue-500/30'
          : 'bg-emerald-50/50 border-emerald-200 text-emerald-800 hover:bg-emerald-100/70 hover:border-emerald-300 cursor-pointer'
      }`}
    >
      <div className="flex items-center gap-2.5">
        <span
          className={`w-2.5 h-2.5 rounded-full shrink-0 ${
            isBooked
              ? 'bg-red-500'
              : isSelected
              ? 'bg-white'
              : 'bg-emerald-500'
          }`}
        />
        <span className="text-sm font-semibold tracking-wide">
          {formatTime12h(time)}
        </span>
      </div>

      <div className="text-xs font-semibold">
        {isBooked ? (
          <span className="uppercase tracking-wider text-[11px] font-bold text-red-700">
            Booked {bookingInfo ? `(${bookingInfo.title})` : ''}
          </span>
        ) : isSelected ? (
          <span className="uppercase tracking-wider text-[11px] font-bold text-white">
            Selected
          </span>
        ) : (
          <span className="uppercase tracking-wider text-[11px] font-bold text-emerald-700">
            Available
          </span>
        )}
      </div>
    </button>
  );
};

export default TimeSlot;
