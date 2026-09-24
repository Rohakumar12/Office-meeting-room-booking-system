import React, { useState, useEffect, useCallback } from 'react';
import { adminService } from '../../services/adminService';
import SearchBar from '../../components/rooms/SearchBar';
import Pagination from '../../components/common/Pagination';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import { TableRowSkeleton } from '../../components/common/Skeleton';
import { formatDate } from '../../utils/formatters';
import { UsersIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1, limit: 10 });
  const [statusFilter, setStatusFilter] = useState('');

  // Status toggle confirmation
  const [targetUser, setTargetUser] = useState(null);
  const [toggling, setToggling] = useState(false);

  const fetchUsers = useCallback(async () => {
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

      const res = await adminService.getAllUsers(params);
      if (res.success) {
        setUsers(res.data.users || []);
        setPagination(res.data.pagination || { total: 0, totalPages: 1, limit: 10 });
      }
    } catch (err) {
      toast.error('Failed to load employee list');
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleConfirmToggle = async () => {
    if (!targetUser) return;
    try {
      setToggling(true);
      const res = await adminService.toggleUserStatus(targetUser._id);
      const isNowActive = res.data.user.isActive;
      toast.success(
        `User ${targetUser.name} has been ${
          isNowActive ? 'activated' : 'deactivated'
        }`
      );
      setTargetUser(null);
      fetchUsers();
    } catch (err) {
      toast.error(err.customMessage || 'Failed to update employee status');
    } finally {
      setToggling(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Employee Management
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          View all registered company employees and manage access privileges.
        </p>
      </div>

      {/* Filter toolbar */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <SearchBar
          value={search}
          onChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
          placeholder="Search by name, email, department, or employee ID..."
        />

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="w-full sm:w-48 text-sm rounded-xl border border-slate-300 py-2.5 px-3 bg-white text-slate-700"
        >
          <option value="">All Accounts</option>
          <option value="true">Active Accounts</option>
          <option value="false">Deactivated Accounts</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Employee ID
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Joined Date
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
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    No employees found.
                  </td>
                </tr>
              ) : (
                users.map((emp) => (
                  <tr
                    key={emp._id}
                    className="hover:bg-slate-50/60 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                          {emp.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">
                            {emp.name}
                          </p>
                          <p className="text-xs text-slate-500">{emp.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 font-mono text-xs text-slate-700">
                      {emp.employeeId || '—'}
                    </td>

                    <td className="px-6 py-4 text-slate-700">
                      {emp.department || 'General'}
                    </td>

                    <td className="px-6 py-4 text-slate-500 whitespace-nowrap text-xs">
                      {formatDate(emp.createdAt)}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                          emp.isActive
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            emp.isActive ? 'bg-emerald-500' : 'bg-rose-500'
                          }`}
                        />
                        {emp.isActive ? 'Active' : 'Deactivated'}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setTargetUser(emp)}
                        className={`text-xs font-semibold px-3 py-1 rounded-lg border transition-colors ${
                          emp.isActive
                            ? 'border-red-200 text-red-600 hover:bg-red-50'
                            : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                        }`}
                      >
                        {emp.isActive ? 'Deactivate' : 'Reactivate'}
                      </button>
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

      {/* Status Toggle Modal */}
      <ConfirmationModal
        isOpen={!!targetUser}
        onClose={() => setTargetUser(null)}
        onConfirm={handleConfirmToggle}
        loading={toggling}
        title={targetUser?.isActive ? 'Deactivate Employee' : 'Reactivate Employee'}
        message={`Are you sure you want to ${
          targetUser?.isActive ? 'deactivate' : 'reactivate'
        } ${targetUser?.name}'s account? ${
          targetUser?.isActive
            ? 'They will not be able to log in or book rooms while deactivated.'
            : 'They will regain full booking portal access immediately.'
        }`}
        confirmVariant={targetUser?.isActive ? 'danger' : 'primary'}
        confirmText={targetUser?.isActive ? 'Deactivate Account' : 'Reactivate Account'}
      />
    </div>
  );
};

export default AdminUsers;
