import { useState, useEffect, useCallback } from 'react';
import { adminService } from '../../services/adminService';
import { bookingService } from '../../services/bookingService';
import { roomService } from '../../services/roomService';
import BookingTable from '../../components/bookings/BookingTable';
import EditBookingModal from '../../components/bookings/EditBookingModal';
import Pagination from '../../components/common/Pagination';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import { FunnelIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1, limit: 10 });

  // Filters
  const [roomId, setRoomId] = useState('');
  const [status, setStatus] = useState('');
  const [date, setDate] = useState('');

  // Cancel modal
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  // Edit modal
  const [editTarget, setEditTarget] = useState(null);

  // Load all rooms for dropdown
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await roomService.getRooms({ limit: 100 });
        if (res.success) setRooms(res.data.rooms || []);
      } catch {
        // silent
      }
    };
    fetchRooms();
  }, []);

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 10,
        roomId: roomId || undefined,
        status: status || undefined,
        date: date || undefined,
      };

      const res = await adminService.getAllBookings(params);
      if (res.success) {
        setBookings(res.data.bookings || []);
        setPagination(res.data.pagination || { total: 0, totalPages: 1, limit: 10 });
      }
    } catch (err) {
      toast.error('Failed to load company bookings');
    } finally {
      setLoading(false);
    }
  }, [page, roomId, status, date]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleCancelBooking = async () => {
    if (!cancelTarget) return;
    try {
      setCancelling(true);
      await bookingService.cancelBooking(cancelTarget._id);
      toast.success('Booking cancelled by Admin');
      setCancelTarget(null);
      fetchBookings();
    } catch (err) {
      toast.error(err.customMessage || 'Failed to cancel booking');
    } finally {
      setCancelling(false);
    }
  };

  const handleResetFilters = () => {
    setRoomId('');
    setStatus('');
    setDate('');
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          Enterprise Bookings Management
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Monitor all employee reservations, filter by room or date, and manage cancellations.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-600 shadow-2xs">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
            <FunnelIcon className="w-4 h-4 text-blue-600 dark:text-blue-300" />
            Filter Company Bookings
          </div>
          <button
            type="button"
            onClick={handleResetFilters}
            className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-200 font-medium"
          >
            <ArrowPathIcon className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
              Meeting Room
            </label>
            <select
              value={roomId}
              onChange={(e) => {
                setRoomId(e.target.value);
                setPage(1);
              }}
              className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-500 py-2 px-3 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200"
            >
              <option value="">All Rooms</option>
              {rooms.map((r) => (
                <option key={r._id} value={r._id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-500 py-2 px-3 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200"
            >
              <option value="">All Statuses</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                setPage(1);
              }}
              className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-500 py-2 px-3 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200"
            />
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <BookingTable
        bookings={bookings}
        loading={loading}
        isAdmin={true}
        onCancel={(b) => setCancelTarget(b)}
        onEdit={(b) => setEditTarget(b)}
      />

      {/* Pagination */}
      <Pagination
        currentPage={page}
        totalPages={pagination.totalPages}
        totalItems={pagination.total}
        pageSize={pagination.limit}
        onPageChange={(newPage) => setPage(newPage)}
      />

      {/* Admin Cancellation Modal */}
      <ConfirmationModal
        isOpen={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleCancelBooking}
        loading={cancelling}
        title="Admin Cancellation"
        message={`Are you sure you want to cancel '${cancelTarget?.title}' booked by ${cancelTarget?.userId?.name}?`}
        confirmText="Confirm Cancellation"
      />

      <EditBookingModal
        booking={editTarget}
        onClose={() => setEditTarget(null)}
        onSaved={() => {
          setEditTarget(null);
          fetchBookings();
        }}
        title="Edit Booking"
      />
    </div>
  );
};

export default AdminBookings;
