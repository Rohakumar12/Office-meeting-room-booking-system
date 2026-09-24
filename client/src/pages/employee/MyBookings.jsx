import React, { useState, useEffect, useCallback } from 'react';
import { bookingService } from '../../services/bookingService';
import BookingTable from '../../components/bookings/BookingTable';
import BookingCard from '../../components/bookings/BookingCard';
import Pagination from '../../components/common/Pagination';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import { TIME_SLOTS } from '../../utils/constants';
import { getTodayDateInputString } from '../../utils/formatters';
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
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    date: '',
    startTime: '',
    endTime: '',
    attendees: 1,
  });
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState('');

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
    setEditError('');
    setEditForm({
      title: booking.title,
      description: booking.description || '',
      date: new Date(booking.date).toISOString().split('T')[0],
      startTime: booking.startTime,
      endTime: booking.endTime,
      attendees: booking.attendees || 1,
    });
  };

  // Submit Edit
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editTarget) return;

    if (editForm.endTime <= editForm.startTime) {
      setEditError('End time must be after start time');
      return;
    }

    try {
      setSavingEdit(true);
      setEditError('');

      await bookingService.updateBooking(editTarget._id, editForm);
      toast.success('Booking updated successfully!');
      setEditTarget(null);
      fetchBookings();
    } catch (err) {
      setEditError(err.customMessage || 'Failed to update booking');
      toast.error(err.customMessage || 'Update conflict');
    } finally {
      setSavingEdit(false);
    }
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
      <Modal
        isOpen={!!editTarget}
        onClose={() => setEditTarget(null)}
        title="Edit Meeting Reservation"
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          {editError && (
            <div className="p-3 rounded-lg bg-red-50 text-xs text-red-700 font-medium">
              {editError}
            </div>
          )}

          <Input
            label="Meeting Title"
            value={editForm.title}
            onChange={(e) =>
              setEditForm({ ...editForm, title: e.target.value })
            }
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Date"
              type="date"
              min={getTodayDateInputString()}
              value={editForm.date}
              onChange={(e) =>
                setEditForm({ ...editForm, date: e.target.value })
              }
              required
            />
            <Input
              label="Attendees"
              type="number"
              min="1"
              value={editForm.attendees}
              onChange={(e) =>
                setEditForm({ ...editForm, attendees: Number(e.target.value) })
              }
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Start Time"
              options={TIME_SLOTS.slice(0, -1)}
              value={editForm.startTime}
              onChange={(e) =>
                setEditForm({ ...editForm, startTime: e.target.value })
              }
              required
            />
            <Select
              label="End Time"
              options={TIME_SLOTS.slice(1)}
              value={editForm.endTime}
              onChange={(e) =>
                setEditForm({ ...editForm, endTime: e.target.value })
              }
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Description
            </label>
            <textarea
              rows={2}
              value={editForm.description}
              onChange={(e) =>
                setEditForm({ ...editForm, description: e.target.value })
              }
              className="block w-full rounded-lg border border-slate-300 py-2 px-3 text-sm"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              variant="secondary"
              onClick={() => setEditTarget(null)}
              disabled={savingEdit}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={savingEdit}>
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MyBookings;
