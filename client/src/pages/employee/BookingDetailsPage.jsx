import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { bookingService } from '../../services/bookingService';
import { formatDate, formatTime12h } from '../../utils/formatters';
import { STATUS_COLORS } from '../../utils/constants';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorState from '../../components/common/ErrorState';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import {
  ArrowLeftIcon,
  CalendarIcon,
  ClockIcon,
  BuildingOfficeIcon,
  UsersIcon,
  UserIcon,
  MapPinIcon,
  XCircleIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const BookingDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        setLoading(true);
        const res = await bookingService.getBookingById(id);
        if (res.success) {
          setBooking(res.data.booking);
        }
      } catch (err) {
        setError(err.customMessage || 'Failed to fetch booking details');
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [id]);

  const handleCancel = async () => {
    try {
      setCancelling(true);
      await bookingService.cancelBooking(id);
      toast.success('Booking cancelled successfully');
      setShowCancelModal(false);
      navigate('/bookings');
    } catch (err) {
      toast.error(err.customMessage || 'Failed to cancel booking');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <LoadingSpinner size="lg" text="Loading booking details..." />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <ErrorState
        title="Booking not found"
        message={error || 'Unable to locate this booking.'}
        onRetry={() => navigate('/bookings')}
      />
    );
  }

  const statusConfig = STATUS_COLORS[booking.status] || STATUS_COLORS.confirmed;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back button */}
      <div>
        <Link
          to="/bookings"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back to Bookings
        </Link>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        {/* Top Header Strip */}
        <div className="p-6 sm:p-8 bg-slate-50/70 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${statusConfig.badge}`}
            >
              <span className={`w-2 h-2 rounded-full ${statusConfig.dot}`} />
              {statusConfig.label}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
              {booking.title}
            </h1>
          </div>

          {booking.status === 'confirmed' && (
            <div className="flex items-center gap-2">
              <Button
                variant="danger"
                size="md"
                onClick={() => setShowCancelModal(true)}
              >
                Cancel Booking
              </Button>
            </div>
          )}
        </div>

        {/* Details Grid */}
        <div className="p-6 sm:p-8 space-y-8">
          {/* Key Meeting Info Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100">
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-800 uppercase tracking-wider mb-1">
                <CalendarIcon className="w-4 h-4" />
                Date
              </div>
              <p className="text-base font-bold text-slate-900">
                {formatDate(booking.date, 'EEEE, MMMM d, yyyy')}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100">
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-800 uppercase tracking-wider mb-1">
                <ClockIcon className="w-4 h-4" />
                Time Slot
              </div>
              <p className="text-base font-mono font-bold text-slate-900">
                {formatTime12h(booking.startTime)} - {formatTime12h(booking.endTime)}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100">
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-800 uppercase tracking-wider mb-1">
                <UsersIcon className="w-4 h-4" />
                Attendees
              </div>
              <p className="text-base font-bold text-slate-900">
                {booking.attendees || 1} people
              </p>
            </div>
          </div>

          {/* Description / Agenda */}
          {booking.description && (
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Description & Agenda
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
                {booking.description}
              </p>
            </div>
          )}

          {/* Room Specs */}
          <div className="pt-6 border-t border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
              Reserved Room Information
            </h3>
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-lg font-bold text-slate-900">
                  {booking.roomId?.name}
                </h4>
                <div className="mt-1 flex flex-wrap gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <MapPinIcon className="w-4 h-4 text-slate-400" />
                    {booking.roomId?.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <BuildingOfficeIcon className="w-4 h-4 text-slate-400" />
                    {booking.roomId?.floor}
                  </span>
                  <span className="flex items-center gap-1">
                    <UsersIcon className="w-4 h-4 text-slate-400" />
                    Capacity: {booking.roomId?.capacity}
                  </span>
                </div>
              </div>

              <Link to={`/rooms/${booking.roomId?._id}`}>
                <Button variant="secondary" size="sm">
                  View Room Specs
                </Button>
              </Link>
            </div>
          </div>

          {/* User / Organiser Info */}
          <div className="pt-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-600">
            <div>
              <span className="text-slate-400 font-semibold block uppercase tracking-wider mb-1">
                Booked By
              </span>
              <p className="text-sm font-bold text-slate-900">
                {booking.userId?.name}
              </p>
              <p className="text-slate-500">{booking.userId?.email}</p>
              <p className="text-slate-500 capitalize">
                Dept: {booking.userId?.department || 'General'}
              </p>
            </div>

            <div>
              <span className="text-slate-400 font-semibold block uppercase tracking-wider mb-1">
                Reservation Created At
              </span>
              <p className="text-sm font-bold text-slate-900">
                {formatDate(booking.createdAt, 'MMM d, yyyy h:mm a')}
              </p>
              {booking.cancelledAt && (
                <p className="text-xs text-red-600 mt-1">
                  Cancelled on: {formatDate(booking.cancelledAt, 'MMM d, yyyy h:mm a')}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      <ConfirmationModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancel}
        loading={cancelling}
        title="Cancel Booking"
        message="Are you sure you want to cancel this booking? Other employees will immediately be able to book this slot."
        confirmText="Yes, Cancel"
      />
    </div>
  );
};

export default BookingDetailsPage;
