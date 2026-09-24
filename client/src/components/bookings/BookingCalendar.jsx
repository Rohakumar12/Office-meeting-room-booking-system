import React from 'react';
import TimeSlot from './TimeSlot';
import { TIME_SLOTS } from '../../utils/constants';

const BookingCalendar = ({
  bookings = [],
  selectedStartTime = '',
  selectedEndTime = '',
  onSelectSlot,
  loading = false,
}) => {
  // Determine for each time slot if it's booked
  const isSlotBooked = (time) => {
    return bookings.some((b) => {
      if (b.status === 'cancelled') return false;
      return b.startTime <= time && b.endTime > time;
    });
  };

  const getSlotBooking = (time) => {
    return bookings.find((b) => {
      if (b.status === 'cancelled') return false;
      return b.startTime <= time && b.endTime > time;
    });
  };

  const isSlotSelected = (time) => {
    if (!selectedStartTime) return false;
    if (!selectedEndTime) return time === selectedStartTime;
    return time >= selectedStartTime && time < selectedEndTime;
  };

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
          <div key={i} className="h-12 bg-slate-100 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between px-1 pb-2 text-xs font-semibold text-slate-500 border-b border-slate-100">
        <span>Time</span>
        <span>Status</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {displayHours.map((hour) => {
          const booked = isSlotBooked(hour);
          const booking = getSlotBooking(hour);
          const selected = isSlotSelected(hour);

          return (
            <TimeSlot
              key={hour}
              time={hour}
              isBooked={booked}
              isSelected={selected}
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
