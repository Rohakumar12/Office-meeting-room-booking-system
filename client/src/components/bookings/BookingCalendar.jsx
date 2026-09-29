import TimeSlot from './TimeSlot';

const BookingCalendar = ({ bookings = [], onSelectSlot, loading = false }) => {
  // Determine for each time slot if it's booked
  const getSlotBooking = (time) =>
    bookings.find((b) => {
      if (b.status === 'cancelled') return false;
      return b.startTime <= time && b.endTime > time;
    });

  // We show 1-hour slots from 08:00 to 19:00 for clean calendar visualization
  const displayHours = [
    '08:00',
    '09:00',
    '10:00',
    '11:00',
    '12:00',
    '13:00',
    '14:00',
    '15:00',
    '16:00',
    '17:00',
    '18:00',
    '19:00',
  ];

  if (loading) {
    return (
      <div className="space-y-2.5 animate-pulse">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-12 bg-slate-100 dark:bg-slate-800 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between px-1 pb-2 text-xs font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-700">
        <span>Time</span>
        <span>Status</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {displayHours.map((hour) => {
          const booking = getSlotBooking(hour);

          return (
            <TimeSlot
              key={hour}
              time={hour}
              isBooked={Boolean(booking)}
              bookingInfo={booking}
              onClick={() => onSelectSlot && onSelectSlot(hour)}
            />
          );
        })}
      </div>
    </div>
  );
};

export default BookingCalendar;
