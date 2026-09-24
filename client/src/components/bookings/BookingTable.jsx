import React from 'react';
import { Link } from 'react-router-dom';
import { formatDate, formatTime12h } from '../../utils/formatters';
import { STATUS_COLORS } from '../../utils/constants';
import Button from '../common/Button';
import { TableRowSkeleton } from '../common/Skeleton';
import EmptyState from '../common/EmptyState';
import { CalendarDaysIcon } from '@heroicons/react/24/outline';

const BookingTable = ({
  bookings = [],
  loading = false,
  isAdmin = false,
  onCancel,
  onEdit,
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Title & Room
                </th>
                {isAdmin && (
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Employee
                  </th>
                )}
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Time Slot
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              <TableRowSkeleton columns={isAdmin ? 6 : 5} count={5} />
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <EmptyState
        icon={CalendarDaysIcon}
        title="No Bookings Found"
        description="There are currently no bookings that match your criteria."
      />
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50/80">
            <tr>
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Meeting & Room
              </th>
              {isAdmin && (
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Employee
                </th>
              )}
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Time Slot
              </th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {bookings.map((booking) => {
              const statusCfg =
                STATUS_COLORS[booking.status] || STATUS_COLORS.confirmed;
              const isConfirmed = booking.status === 'confirmed';

              return (
                <tr
                  key={booking._id}
                  className="hover:bg-slate-50/60 transition-colors"
                >
                  {/* Title & Room */}
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-900">
                      {booking.title}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {booking.roomId?.name || 'Unknown Room'} •{' '}
                      {booking.roomId?.floor}
                    </div>
                  </td>

                  {/* Employee (admin only) */}
                  {isAdmin && (
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">
                        {booking.userId?.name || 'N/A'}
                      </div>
                      <div className="text-xs text-slate-500">
                        {booking.userId?.email}
                      </div>
                    </td>
                  )}

                  {/* Date */}
                  <td className="px-6 py-4 text-slate-700 whitespace-nowrap">
                    {formatDate(booking.date)}
                  </td>

                  {/* Time Slot */}
                  <td className="px-6 py-4 text-slate-700 whitespace-nowrap">
                    <span className="font-mono text-xs font-medium">
                      {formatTime12h(booking.startTime)} -{' '}
                      {formatTime12h(booking.endTime)}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusCfg.badge}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                      {statusCfg.label}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        to={`/bookings/${booking._id}`}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                      >
                        View
                      </Link>

                      {isConfirmed && onEdit && (
                        <button
                          type="button"
                          onClick={() => onEdit(booking)}
                          className="text-xs font-semibold text-slate-600 hover:text-slate-900"
                        >
                          Edit
                        </button>
                      )}

                      {isConfirmed && onCancel && (
                        <button
                          type="button"
                          onClick={() => onCancel(booking)}
                          className="text-xs font-semibold text-red-600 hover:text-red-800"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BookingTable;
