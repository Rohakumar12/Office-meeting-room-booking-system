import { formatTime12h } from '../../utils/formatters';

const TimeSlot = ({ time, isBooked = false, bookingInfo = null, onClick }) => {
  return (
    <button
      type="button"
      disabled={isBooked}
      onClick={onClick}
      className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between ${
        isBooked
          ? 'bg-red-50/70 dark:bg-red-950/70 border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 cursor-not-allowed opacity-80'
          : 'bg-emerald-50/50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 hover:bg-emerald-100/70 dark:hover:bg-emerald-900/70 hover:border-emerald-300 dark:hover:border-emerald-600 cursor-pointer'
      }`}
    >
      <div className="flex items-center gap-2.5">
        <span
          className={`w-2.5 h-2.5 rounded-full shrink-0 ${
            isBooked ? 'bg-red-500 dark:bg-red-600' : 'bg-emerald-500 dark:bg-emerald-600'
          }`}
        />
        <span className="text-sm font-semibold tracking-wide">
          {formatTime12h(time)}
        </span>
      </div>

      <div className="text-xs font-semibold">
        {isBooked ? (
          <span className="uppercase tracking-wider text-[11px] font-bold text-red-700 dark:text-red-300">
            Booked {bookingInfo ? `(${bookingInfo.title})` : ''}
          </span>
        ) : (
          <span className="uppercase tracking-wider text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
            Available
          </span>
        )}
      </div>
    </button>
  );
};

export default TimeSlot;
