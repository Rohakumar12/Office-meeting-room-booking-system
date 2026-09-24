import React, { useState, useEffect } from 'react';
import useAuth from '../../hooks/useAuth';
import { bookingService } from '../../services/bookingService';
import { formatDate } from '../../utils/formatters';
import {
  UserCircleIcon,
  EnvelopeIcon,
  BriefcaseIcon,
  IdentificationIcon,
  ShieldCheckIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';

const Profile = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, confirmed: 0, cancelled: 0, completed: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        setLoading(true);
        const res = await bookingService.getBookings({ limit: 100 });
        if (res.success) {
          const list = res.data.bookings || [];
          setStats({
            total: list.length,
            confirmed: list.filter((b) => b.status === 'confirmed').length,
            cancelled: list.filter((b) => b.status === 'cancelled').length,
            completed: list.filter((b) => b.status === 'completed').length,
          });
        }
      } catch {
        // quiet error
      } finally {
        setLoading(false);
      }
    };

    fetchUserStats();
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          User Profile
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Account details and your meeting booking activity.
        </p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center gap-6 pb-8 border-b border-slate-100">
          <div className="w-20 h-20 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-2xl font-bold shadow-md shadow-blue-500/20">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                {user?.name}
              </h2>
              <span
                className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                  user?.role === 'admin'
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-blue-100 text-blue-700'
                }`}
              >
                {user?.role}
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">{user?.email}</p>
          </div>
        </div>

        {/* Detailed Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 text-sm">
          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <EnvelopeIcon className="w-5 h-5 text-blue-600 shrink-0" />
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase">Email Address</p>
              <p className="font-semibold text-slate-800">{user?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <BriefcaseIcon className="w-5 h-5 text-blue-600 shrink-0" />
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase">Department</p>
              <p className="font-semibold text-slate-800">{user?.department || 'Not assigned'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <IdentificationIcon className="w-5 h-5 text-blue-600 shrink-0" />
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase">Employee ID</p>
              <p className="font-semibold font-mono text-slate-800">{user?.employeeId || 'N/A'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <CalendarDaysIcon className="w-5 h-5 text-blue-600 shrink-0" />
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase">Member Since</p>
              <p className="font-semibold text-slate-800">{formatDate(user?.createdAt, 'MMMM d, yyyy')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Stats */}
      <div>
        <h3 className="text-base font-bold text-slate-900 uppercase tracking-wider mb-4">
          My Booking Statistics
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs text-center">
            <p className="text-2xl font-extrabold text-slate-900">{stats.total}</p>
            <p className="text-xs text-slate-500 font-semibold mt-1">Total Bookings</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs text-center">
            <p className="text-2xl font-extrabold text-emerald-600">{stats.confirmed}</p>
            <p className="text-xs text-slate-500 font-semibold mt-1">Confirmed</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs text-center">
            <p className="text-2xl font-extrabold text-blue-600">{stats.completed}</p>
            <p className="text-xs text-slate-500 font-semibold mt-1">Completed</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs text-center">
            <p className="text-2xl font-extrabold text-slate-400">{stats.cancelled}</p>
            <p className="text-xs text-slate-500 font-semibold mt-1">Cancelled</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
