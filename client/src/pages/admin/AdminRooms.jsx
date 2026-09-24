import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { roomService } from '../../services/roomService';
import SearchBar from '../../components/rooms/SearchBar';
import Button from '../../components/common/Button';
import Pagination from '../../components/common/Pagination';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import { TableRowSkeleton } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import {
  PlusCircleIcon,
  BuildingOfficeIcon,
  PencilSquareIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const AdminRooms = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1, limit: 10 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Toggle active state
  const [togglingId, setTogglingId] = useState(null);

  const fetchRooms = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 10,
        search: search || undefined,
        isActive:
          statusFilter === 'true'
            ? true
            : statusFilter === 'false'
            ? false
            : undefined,
      };

      const res = await roomService.getRooms(params);
      if (res.success) {
        setRooms(res.data.rooms || []);
        setPagination(res.data.pagination || { total: 0, totalPages: 1, limit: 10 });
      }
    } catch (err) {
      toast.error('Failed to load rooms');
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  // Handle active status toggle
  const handleToggleActive = async (room) => {
    try {
      setTogglingId(room._id);
      await roomService.updateRoom(room._id, { isActive: !room.isActive });
      toast.success(
        `Room ${room.isActive ? 'deactivated' : 'activated'} successfully`
      );
      fetchRooms();
    } catch (err) {
      toast.error(err.customMessage || 'Failed to update status');
    } finally {
      setTogglingId(null);
    }
  };

  // Handle Delete / Deactivate
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      const res = await roomService.deleteRoom(deleteTarget._id);
      if (res.data?.deactivated) {
        toast('Room deactivated to preserve historical bookings', {
          icon: 'ℹ️',
        });
      } else {
        toast.success('Room permanently deleted');
      }
      setDeleteTarget(null);
      fetchRooms();
    } catch (err) {
      toast.error(err.customMessage || 'Failed to delete room');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Manage Meeting Rooms
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Create, update, deactivate, or delete meeting spaces across the campus.
          </p>
        </div>

        <Link to="/admin/rooms/add">
          <Button variant="primary" icon={PlusCircleIcon}>
            Add New Room
          </Button>
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <SearchBar
          value={search}
          onChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
          placeholder="Search rooms by name or location..."
        />

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="w-full sm:w-48 text-sm rounded-xl border border-slate-300 py-2.5 px-3 bg-white text-slate-700"
        >
          <option value="">All Statuses</option>
          <option value="true">Active Only</option>
          <option value="false">Inactive Only</option>
        </select>
      </div>

      {/* Rooms Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Room Name & Floor
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Capacity
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Amenities
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
              {loading ? (
                <TableRowSkeleton columns={6} count={5} />
              ) : rooms.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    No meeting rooms found matching your search.
                  </td>
                </tr>
              ) : (
                rooms.map((room) => (
                  <tr
                    key={room._id}
                    className="hover:bg-slate-50/60 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{room.name}</div>
                      <div className="text-xs text-slate-500">{room.floor}</div>
                    </td>

                    <td className="px-6 py-4 text-slate-600">
                      {room.location}
                    </td>

                    <td className="px-6 py-4 text-slate-800 font-semibold whitespace-nowrap">
                      {room.capacity} seats
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {room.amenities?.slice(0, 3).map((a, i) => (
                          <span
                            key={i}
                            className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium"
                          >
                            {a}
                          </span>
                        ))}
                        {room.amenities?.length > 3 && (
                          <span className="text-[10px] text-slate-400">
                            +{room.amenities.length - 3}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(room)}
                        disabled={togglingId === room._id}
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-all ${
                          room.isActive
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                        }`}
                        title="Click to toggle active/inactive status"
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            room.isActive ? 'bg-emerald-500' : 'bg-rose-500'
                          }`}
                        />
                        {room.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>

                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/admin/rooms/${room._id}/edit`}
                          className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Room"
                        >
                          <PencilSquareIcon className="w-4 h-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(room)}
                          className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete / Deactivate"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={page}
        totalPages={pagination.totalPages}
        totalItems={pagination.total}
        pageSize={pagination.limit}
        onPageChange={(newPage) => setPage(newPage)}
      />

      {/* Deletion Modal */}
      <ConfirmationModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        loading={deleting}
        title="Delete or Deactivate Room"
        message={`Are you sure you want to remove '${deleteTarget?.name}'? If the room has historical bookings, it will be safely deactivated instead of breaking audit records.`}
        confirmText="Proceed"
      />
    </div>
  );
};

export default AdminRooms;
