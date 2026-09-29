import React, { useState, useEffect, useCallback } from 'react';
import { bookingService } from '../../services/bookingService';
import BookingTable from '../../components/bookings/BookingTable';
import BookingCard from '../../components/bookings/BookingCard';
import EditBookingModal from '../../components/bookings/EditBookingModal';
import Pagination from '../../components/common/Pagination';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import {
  CalendarDaysIcon,
  TableCellsIcon,
  Squares2X2Icon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1, limit: 10 });
  const [statusTab, setStatusTab] = useState('confirmed');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'cards'

  // Cancel state
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  // Edit state
  const [editTarget, setEditTarget] = useState(null);

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 10,
        status: statusTab !== 'all' ? statusTab : undefined,
      };

      const res = await bookingService.getBookings(params);
      if (res.success) {
        setBookings(res.data.bookings || []);
        setPagination(res.data.pagination || { total: 0, totalPages: 1, limit: 10 });
      }
    } catch (err) {
      toast.error('Failed to load your bookings');
    } finally {
      setLoading(false);
    }
  }, [page, statusTab]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Handle Cancel
  const handleConfirmCancel = async () => {
    if (!cancelTarget) return;
    try {
      setCancelling(true);
      await bookingService.cancelBooking(cancelTarget._id);
      toast.success('Booking cancelled successfully');
      setCancelTarget(null);
      fetchBookings();
    } catch (err) {
      toast.error(err.customMessage || 'Failed to cancel booking');
    } finally {
      setCancelling(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (booking) => {
    setEditTarget(booking);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Bookings
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            View history, modify meeting times, or cancel upcoming reservations.
          </p>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs self-start sm:self-auto">
          <button
            onClick={() => setViewMode('table')}
            className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              viewMode === 'table'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TableCellsIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Table</span>
          </button>
          <button
            onClick={() => setViewMode('cards')}
            className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              viewMode === 'cards'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Squares2X2Icon className="w-4 h-4" />
            <span className="hidden sm:inline">Cards</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-8">
          {[
            { id: 'confirmed', label: 'Confirmed' },
            { id: 'completed', label: 'Completed' },
            { id: 'cancelled', label: 'Cancelled' },
            { id: 'all', label: 'All Bookings' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setStatusTab(tab.id);
                setPage(1);
              }}
              className={`pb-4 px-1 text-sm font-semibold border-b-2 transition-colors ${
                statusTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Listing View */}
      {viewMode === 'table' ? (
        <BookingTable
          bookings={bookings}
          loading={loading}
          isAdmin={false}
          onCancel={(item) => setCancelTarget(item)}
          onEdit={(item) => openEditModal(item)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookings.map((item) => (
            <BookingCard
              key={item._id}
              booking={item}
              onCancel={(b) => setCancelTarget(b)}
              onEdit={(b) => openEditModal(b)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      <Pagination
        currentPage={page}
        totalPages={pagination.totalPages}
        totalItems={pagination.total}
        pageSize={pagination.limit}
        onPageChange={(newPage) => setPage(newPage)}
      />

      {/* Cancellation Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleConfirmCancel}
        loading={cancelling}
        title="Cancel Meeting Reservation"
        message={`Are you sure you want to cancel '${cancelTarget?.title}'? The room will immediately become available for other employees.`}
        confirmText="Confirm Cancellation"
      />

      {/* Edit Booking Modal */}
      <EditBookingModal
        booking={editTarget}
        onClose={() => setEditTarget(null)}
        onSaved={() => {
          setEditTarget(null);
          fetchBookings();
        }}
      />
    </div>
  );
};

export default MyBookings;
