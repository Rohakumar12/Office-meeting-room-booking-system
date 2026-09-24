import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { bookingService } from '../../services/bookingService';
import { roomService } from '../../services/roomService';
import { getGreeting, formatDate, formatTime12h, getTodayDateInputString } from '../../utils/formatters';
import Button from '../../components/common/Button';
import BookingCard from '../../components/bookings/BookingCard';
import RoomCard from '../../components/rooms/RoomCard';
import { RoomCardSkeleton } from '../../components/common/Skeleton';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import {
  CalendarDaysIcon,
  BuildingOfficeIcon,
  PlusCircleIcon,
  ClockIcon,
  SparklesIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const [upcomingBooking, setUpcomingBooking] = useState(null);
  const [todayBookings, setTodayBookings] = useState([]);
  const [featuredRooms, setFeaturedRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const todayStr = getTodayDateInputString();

      // Fetch user's bookings and rooms concurrently
      const [bookingsRes, roomsRes] = await Promise.all([
        bookingService.getBookings({ limit: 10 }),
        roomService.getRooms({ isActive: true, limit: 3 }),
      ]);

      if (bookingsRes.success) {
        const bookings = bookingsRes.data.bookings || [];
        // Filter confirmed upcoming bookings
        const confirmed = bookings.filter((b) => b.status === 'confirmed');
        if (confirmed.length > 0) {
          setUpcomingBooking(confirmed[0]);
        } else {
          setUpcomingBooking(null);
        }

        // Filter today's bookings
        const todayItems = bookings.filter((b) => {
          const bDate = new Date(b.date).toISOString().split('T')[0];
          return bDate === todayStr;
        });
        setTodayBookings(todayItems);
      }

      if (roomsRes.success) {
        setFeaturedRooms(roomsRes.data.rooms || []);
      }
    } catch (err) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleConfirmCancel = async () => {
    if (!cancelTarget) return;
    try {
      setCancelling(true);
      await bookingService.cancelBooking(cancelTarget._id);
      toast.success('Booking cancelled successfully');
      setCancelTarget(null);
      fetchDashboardData();
    } catch (err) {
      toast.error(err.customMessage || 'Failed to cancel booking');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Greeting Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold backdrop-blur-md mb-3">
            <SparklesIcon className="w-3.5 h-3.5" />
            {formatDate(new Date(), 'EEEE, MMMM dd, yyyy')}
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            {getGreeting()}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="mt-2 text-blue-100 text-sm sm:text-base leading-relaxed">
            Ready to collaborate? Check room schedules, reserve your workspace,
            and manage all your team bookings in one place.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/book-room">
              <Button
                variant="secondary"
                size="md"
                className="font-bold text-blue-700 hover:bg-blue-50 border-transparent shadow-sm"
                icon={PlusCircleIcon}
              >
                Book a Room Now
              </Button>
            </Link>
            <Link to="/bookings">
              <Button
                variant="ghost"
                size="md"
                className="text-white hover:bg-white/15 hover:text-white"
                icon={CalendarDaysIcon}
              >
                View My Bookings
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content Grid: Upcoming Booking & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Upcoming Meeting Highlight */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <ClockIcon className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold text-slate-900">
                  Next Upcoming Meeting
                </h2>
              </div>
              {upcomingBooking && (
                <Link
                  to={`/bookings/${upcomingBooking._id}`}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                >
                  Details →
                </Link>
              )}
            </div>

            {loading ? (
              <div className="h-36 bg-slate-100 rounded-xl animate-pulse" />
            ) : upcomingBooking ? (
              <div className="bg-gradient-to-br from-blue-50/50 to-indigo-50/30 rounded-2xl p-5 border border-blue-100/80">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 mb-2">
                      Confirmed
                    </span>
                    <h3 className="text-xl font-extrabold text-slate-900">
                      {upcomingBooking.title}
                    </h3>
                    <p className="text-sm font-semibold text-blue-700 mt-1 flex items-center gap-1.5">
                      <BuildingOfficeIcon className="w-4 h-4" />
                      {upcomingBooking.roomId?.name} ({upcomingBooking.roomId?.floor})
                    </p>
                  </div>
                  <div className="sm:text-right bg-white sm:bg-transparent p-3 sm:p-0 rounded-xl border sm:border-0 border-slate-200">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      {formatDate(upcomingBooking.date)}
                    </p>
                    <p className="text-lg font-mono font-bold text-slate-900 mt-0.5">
                      {formatTime12h(upcomingBooking.startTime)} -{' '}
                      {formatTime12h(upcomingBooking.endTime)}
                    </p>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-blue-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    {upcomingBooking.attendees
                      ? `${upcomingBooking.attendees} team members attending`
                      : 'Meeting scheduled'}
                  </span>
                  <div className="flex gap-2">
                    <Link to={`/bookings/${upcomingBooking._id}`}>
                      <Button size="sm" variant="primary">
                        View Booking
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 px-4 rounded-xl bg-slate-50 border border-dashed border-slate-200">
                <CalendarDaysIcon className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700">
                  No upcoming meetings scheduled
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Ready to book a room for your next discussion?
                </p>
                <Link to="/book-room" className="inline-block mt-4">
                  <Button size="sm" variant="primary">
                    Book a Room
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Today's Schedule List */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">
                Today's Schedule
              </h2>
              <Link
                to="/bookings"
                className="text-xs font-semibold text-blue-600 hover:text-blue-800"
              >
                View all ({todayBookings.length}) →
              </Link>
            </div>

            {loading ? (
              <div className="space-y-3">
                <div className="h-16 bg-slate-100 rounded-xl animate-pulse" />
                <div className="h-16 bg-slate-100 rounded-xl animate-pulse" />
              </div>
            ) : todayBookings.length > 0 ? (
              <div className="space-y-3">
                {todayBookings.map((b) => (
                  <BookingCard
                    key={b._id}
                    booking={b}
                    onCancel={(item) => setCancelTarget(item)}
                    showActions={true}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 text-center py-6">
                You have no meetings scheduled for today.
              </p>
            )}
          </div>
        </div>

        {/* Right 1 Col: Quick Actions & Office Stats */}
        <div className="space-y-6">
          {/* Quick Actions Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
              Quick Actions
            </h3>
            <div className="space-y-2.5">
              <Link
                to="/book-room"
                className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <PlusCircleIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">Book a Room</p>
                    <p className="text-xs text-slate-500">Find & reserve rooms</p>
                  </div>
                </div>
                <ArrowRightIcon className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
              </Link>

              <Link
                to="/rooms"
                className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <BuildingOfficeIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">Browse Rooms</p>
                    <p className="text-xs text-slate-500">View room specs & photos</p>
                  </div>
                </div>
                <ArrowRightIcon className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
              </Link>

              <Link
                to="/bookings"
                className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <CalendarDaysIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">My Bookings</p>
                    <p className="text-xs text-slate-500">Edit or cancel meetings</p>
                  </div>
                </div>
                <ArrowRightIcon className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
              </Link>
            </div>
          </div>

          {/* Department Info */}
          <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xs">
            <h4 className="text-xs uppercase font-bold text-blue-400 tracking-wider">
              Employee Profile
            </h4>
            <div className="mt-3 space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Department</span>
                <span className="font-semibold text-slate-200">
                  {user?.department || 'General'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Employee ID</span>
                <span className="font-mono text-slate-200">
                  {user?.employeeId || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Portal Role</span>
                <span className="capitalize font-semibold text-emerald-400">
                  {user?.role}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Available Meeting Rooms Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">
              Popular Meeting Rooms
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Explore available conference spaces across all office wings
            </p>
          </div>
          <Link
            to="/rooms"
            className="text-xs font-bold text-blue-600 hover:text-blue-800"
          >
            Explore All Rooms →
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <RoomCardSkeleton />
            <RoomCardSkeleton />
            <RoomCardSkeleton />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredRooms.map((room) => (
              <RoomCard key={room._id} room={room} showBookButton={true} />
            ))}
          </div>
        )}
      </div>

      {/* Cancellation Modal */}
      <ConfirmationModal
        isOpen={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleConfirmCancel}
        loading={cancelling}
        title="Cancel Meeting Booking"
        message={`Are you sure you want to cancel '${cancelTarget?.title}' in ${cancelTarget?.roomId?.name}? This will free the slot for other employees.`}
        confirmText="Yes, Cancel Booking"
      />
    </div>
  );
};

export default Dashboard;
