import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { roomService } from '../../services/roomService';
import { getTodayDateInputString, formatDate } from '../../utils/formatters';
import BookingCalendar from '../../components/bookings/BookingCalendar';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorState from '../../components/common/ErrorState';
import {
  UsersIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  SparklesIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const RoomDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [selectedDate, setSelectedDate] = useState(getTodayDateInputString());
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        setLoading(true);
        const res = await roomService.getRoomById(id);
        if (res.success) {
          setRoom(res.data.room);
        }
      } catch (err) {
        setError(err.customMessage || 'Failed to load room details');
      } finally {
        setLoading(false);
      }
    };

    fetchRoom();
  }, [id]);

  useEffect(() => {
    const fetchSchedule = async () => {
      if (!id || !selectedDate) return;
      try {
        setLoadingSchedule(true);
        const res = await roomService.getRoomSchedule(id, selectedDate);
        if (res.success) {
          setSchedule(res.data.bookings || []);
        }
      } catch (err) {
        toast.error('Failed to update room schedule');
      } finally {
        setLoadingSchedule(false);
      }
    };

    fetchSchedule();
  }, [id, selectedDate]);

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <LoadingSpinner size="lg" text="Loading room details..." />
      </div>
    );
  }

  if (error || !room) {
    return (
      <ErrorState
        title="Room not found"
        message={error || 'The requested room does not exist or has been removed.'}
        onRetry={() => navigate('/rooms')}
      />
    );
  }

  const defaultImage =
    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800';

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Link
          to="/rooms"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back to all rooms
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left 2 Cols: Details & Photos */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-600 overflow-hidden shadow-xs">
            <div className="relative h-64 sm:h-80 w-full bg-slate-100 dark:bg-slate-800">
              <img
                src={room.image || defaultImage}
                alt={room.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = defaultImage;
                }}
              />
              <div className="absolute top-4 right-4">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md shadow-xs ${
                    room.isActive
                      ? 'bg-emerald-500/90 dark:bg-emerald-600/90 text-white'
                      : 'bg-rose-500/90 dark:bg-rose-600/90 text-white'
                  }`}
                >
                  {room.isActive ? (
                    <>
                      <CheckCircleIcon className="w-4 h-4" /> Active
                    </>
                  ) : (
                    <>
                      <XCircleIcon className="w-4 h-4" /> Inactive
                    </>
                  )}
                </span>
              </div>
            </div>

            <div className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
                    {room.name}
                  </h1>
                  <div className="mt-2 flex flex-wrap gap-4 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1.5 font-medium">
                      <MapPinIcon className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                      {room.location}
                    </span>
                    <span className="flex items-center gap-1.5 font-medium">
                      <BuildingOfficeIcon className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                      {room.floor}
                    </span>
                    <span className="flex items-center gap-1.5 font-medium">
                      <UsersIcon className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                      Max {room.capacity} People
                    </span>
                  </div>
                </div>

                {room.isActive && (
                  <Link to={`/book-room?roomId=${room._id}&date=${selectedDate}`}>
                    <Button size="lg" variant="primary">
                      Book This Room
                    </Button>
                  </Link>
                )}
              </div>

              {room.description && (
                <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-700">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-2">
                    About this Space
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {room.description}
                  </p>
                </div>
              )}

              {/* Amenities */}
              <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-700">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-3">
                  Equipped Amenities
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {room.amenities?.map((amenity, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200"
                    >
                      <SparklesIcon className="w-4 h-4 text-blue-600 dark:text-blue-300 shrink-0" />
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Day Schedule / Availability Calendar */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-600 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                Availability Schedule
              </h3>
            </div>

            {/* Date Picker */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                Select Date
              </label>
              <input
                type="date"
                value={selectedDate}
                min={getTodayDateInputString()}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full text-sm rounded-xl border border-slate-300 dark:border-slate-500 py-2 px-3 focus:ring-blue-500 dark:focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-500 bg-white dark:bg-slate-900"
              />
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Showing schedule for{' '}
              <span className="font-semibold text-slate-800 dark:text-slate-100">
                {formatDate(selectedDate, 'MMMM d, yyyy')}
              </span>
            </p>

            <BookingCalendar
              bookings={schedule}
              loading={loadingSchedule}
              onSelectSlot={(slot) => {
                navigate(
                  `/book-room?roomId=${room._id}&date=${selectedDate}&startTime=${slot}`
                );
              }}
            />

            {room.isActive && (
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700">
                <Link
                  to={`/book-room?roomId=${room._id}&date=${selectedDate}`}
                  className="block w-full"
                >
                  <Button variant="primary" className="w-full">
                    Proceed to Booking
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomDetailsPage;
