import { useState, useEffect, useCallback } from 'react';
import { adminService } from '../../services/adminService';
import SearchBar from '../../components/rooms/SearchBar';
import Pagination from '../../components/common/Pagination';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import { TableRowSkeleton } from '../../components/common/Skeleton';
import { formatDate } from '../../utils/formatters';

import toast from 'react-hot-toast';

const getFirstNameInitial = (name = '') =>
  (name.trim().split(/\s+/)[0] || '').charAt(0).toUpperCase() || 'U';

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

  // Track broken avatar URLs so we can fall back to initials per row
  const [failedAvatarUrls, setFailedAvatarUrls] = useState({});

  const markAvatarFailed = useCallback((userId, url) => {
    setFailedAvatarUrls((prev) =>
      prev[userId] === url ? prev : { ...prev, [userId]: url }
    );
  }, []);

  const hasAvatar = (emp) =>
    Boolean(emp.avatar) && failedAvatarUrls[emp._id] !== emp.avatar;

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
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          Employee Management
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          View all registered company employees and manage access privileges.
        </p>
      </div>

      {/* Filter toolbar */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-600 shadow-2xs">
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
          className="w-full sm:w-48 text-sm rounded-xl border border-slate-300 dark:border-slate-500 py-2.5 px-3 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200"
        >
          <option value="">All Accounts</option>
          <option value="true">Active Accounts</option>
          <option value="false">Deactivated Accounts</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-600 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-600 text-sm">
            <thead className="bg-slate-50 dark:bg-slate-950">
              <tr>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Employee ID
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Joined Date
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3.5 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700 bg-white dark:bg-slate-900">
              {loading ? (
                <TableRowSkeleton columns={6} count={5} />
              ) : users.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-12 text-center text-slate-500 dark:text-slate-400"
                  >
                    No employees found.
                  </td>
                </tr>
              ) : (
                users.map((emp) => (
                  <tr
                    key={emp._id}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-950/60 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 shrink-0 overflow-hidden rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-xs">
                          {hasAvatar(emp) ? (
                            <img
                              src={emp.avatar}
                              alt={`${emp.name} profile`}
                              className="h-full w-full object-cover"
                              loading="lazy"
                              onError={() =>
                                markAvatarFailed(emp._id, emp.avatar)
                              }
                            />
                          ) : (
                            <span aria-hidden="true">
                              {getFirstNameInitial(emp.name)}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-slate-100">
                            {emp.name}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {emp.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 font-mono text-xs text-slate-700 dark:text-slate-200">
                      {emp.employeeId || "—"}
                    </td>

                    <td className="px-6 py-4 text-slate-700 dark:text-slate-200">
                      {emp.department || "General"}
                    </td>

                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400 whitespace-nowrap text-xs">
                      {formatDate(emp.createdAt)}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                          emp.isActive
                            ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700"
                            : "bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-700"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            emp.isActive
                              ? "bg-emerald-500 dark:bg-emerald-600"
                              : "bg-rose-500 dark:bg-rose-600"
                          }`}
                        />
                        {emp.isActive ? "Active" : "Deactivated"}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setTargetUser(emp)}
                        className={`text-xs font-semibold px-3 py-1 rounded-lg border transition-colors ${
                          emp.isActive
                            ? "border-red-200 dark:border-red-700 text-red-600 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-950"
                            : "border-emerald-200 dark:border-emerald-700 text-emerald-600 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950"
                        }`}
                      >
                        {emp.isActive ? "Deactivate" : "Reactivate"}
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
        title={
          targetUser?.isActive ? "Deactivate Employee" : "Reactivate Employee"
        }
        message={`Are you sure you want to ${
          targetUser?.isActive ? "deactivate" : "reactivate"
        } ${targetUser?.name}'s account? ${
          targetUser?.isActive
            ? "They will not be able to log in or book rooms while deactivated."
            : "They will regain full booking portal access immediately."
        }`}
        confirmVariant={targetUser?.isActive ? "danger" : "primary"}
        confirmText={
          targetUser?.isActive ? "Deactivate Account" : "Reactivate Account"
        }
      />
    </div>
  );
};

export default AdminUsers;
