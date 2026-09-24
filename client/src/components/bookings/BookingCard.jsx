import React from 'react';
import { Link } from 'react-router-dom';
import { formatDate, formatTime12h } from '../../utils/formatters';
import { STATUS_COLORS } from '../../utils/constants';
import {
  CalendarIcon,
  ClockIcon,
  BuildingOfficeIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import Button from '../common/Button';

const BookingCard = ({
  booking,
  onCancel,
  onEdit,
  showActions = true,
  canCancel = true,
}) => {
  const statusConfig = STATUS_COLORS[booking.status] || STATUS_COLORS.confirmed;
  const isCancellable = booking.status === 'confirmed' && canCancel;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusConfig.badge}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
            {statusConfig.label}
          </span>
          <h4 className="mt-2 text-base font-bold text-slate-900 leading-snug">
            {booking.title}
          </h4>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-600 bg-slate-50/70 p-3 rounded-xl">
        <div className="flex items-center gap-2">
          <BuildingOfficeIcon className="w-4 h-4 text-blue-600 shrink-0" />
          <span className="font-semibold text-slate-800">
            {booking.roomId?.name || 'Meeting Room'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-blue-600 shrink-0" />
          <span>{formatDate(booking.date)}</span>
        </div>
        <div className="flex items-center gap-2">
          <ClockIcon className="w-4 h-4 text-blue-600 shrink-0" />
          <span>
            {formatTime12h(booking.startTime)} - {formatTime12h(booking.endTime)}
          </span>
        </div>
        {booking.attendees && (
          <div className="flex items-center gap-2">
            <UsersIcon className="w-4 h-4 text-blue-600 shrink-0" />
            <span>{booking.attendees} attendees</span>
          </div>
        )}
      </div>

      {booking.description && (
        <p className="mt-3 text-xs text-slate-500 line-clamp-2">
          {booking.description}
        </p>
      )}

      {showActions && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <Link
            to={`/bookings/${booking._id}`}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800"
          >
            View Details →
          </Link>

          <div className="flex items-center gap-2">
            {isCancellable && onCancel && (
              <Button
                size="sm"
                variant="danger"
                onClick={() => onCancel(booking)}
              >
                Cancel
              </Button>
            )}
            {isCancellable && onEdit && (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => onEdit(booking)}
              >
                Edit
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingCard;
