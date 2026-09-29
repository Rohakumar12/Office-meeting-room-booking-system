import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  BuildingOfficeIcon,
  CalendarDaysIcon,
  UsersIcon,
  ChartPieIcon,
  PlusCircleIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import toast from 'react-hot-toast';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsRes, analyticsRes] = await Promise.all([
          adminService.getStatistics(),
          adminService.getAnalytics({ period: '7d' }),
        ]);

        if (statsRes.success) setStats(statsRes.data);
        if (analyticsRes.success) setAnalytics(analyticsRes.data);
      } catch (err) {
        toast.error('Failed to load admin dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="py-24 flex justify-center">
        <LoadingSpinner size="lg" text="Loading enterprise metrics & analytics..." />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Banner & Quick Add Room CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-purple-600 dark:text-purple-300 uppercase tracking-wider">
            Enterprise Admin Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight mt-0.5">
            Admin Overview & Analytics
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/rooms/add"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 dark:bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 dark:hover:bg-blue-600 shadow-sm transition-all"
          >
            <PlusCircleIcon className="w-5 h-5" />
            Add Meeting Room
          </Link>
        </div>
      </div>

      {/* 4 Stat Cards from Requirement 14 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-600 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Rooms
            </p>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 mt-2">
              {stats?.totalRooms ?? 0}
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
              {stats?.activeRooms ?? 0} actively bookable
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-300 flex items-center justify-center">
            <BuildingOfficeIcon className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-600 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Today&rsquo;s Bookings
            </p>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 mt-2">
              {stats?.todayBookings ?? 0}
            </p>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-300 font-semibold mt-1">
              Active meetings today
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-300 flex items-center justify-center">
            <CalendarDaysIcon className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-600 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Active Employees
            </p>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 mt-2">
              {stats?.activeUsers ?? 0}
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
              Registered team members
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-300 flex items-center justify-center">
            <UsersIcon className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-600 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Room Utilization
            </p>
            <p className="text-3xl font-extrabold text-blue-600 dark:text-blue-300 mt-2">
              {stats?.utilizationRate ?? 0}%
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
              Past 30-day average
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 flex items-center justify-center">
            <ChartPieIcon className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Daily Bookings Trend */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-600 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Daily Bookings (Last 7 Days)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Number of meetings booked per day
              </p>
            </div>
            <ArrowTrendingUpIcon className="w-5 h-5 text-blue-600 dark:text-blue-300" />
          </div>

          <div className="h-64 w-full">
            {analytics?.dailyBookings?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.dailyBookings}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#2563eb"
                    fillOpacity={1}
                    fill="url(#colorCount)"
                    name="Bookings"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400 dark:text-slate-500">
                No booking activity in this period
              </div>
            )}
          </div>
        </div>

        {/* Chart 2: Most-Used Rooms */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-600 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Most-Used Rooms
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Top rooms by reservation count
              </p>
            </div>
            <BuildingOfficeIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-300" />
          </div>

          <div className="h-64 w-full">
            {analytics?.topRooms?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.topRooms}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar
                    dataKey="bookings"
                    fill="#10b981"
                    radius={[6, 6, 0, 0]}
                    name="Total Bookings"
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400 dark:text-slate-500">
                No room usage data available
              </div>
            )}
          </div>
        </div>

        {/* Chart 3: Booking Status Breakdown */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-600 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Booking Status Distribution
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Confirmed, completed, vs cancelled
              </p>
            </div>
            <ChartPieIcon className="w-5 h-5 text-purple-600 dark:text-purple-300" />
          </div>

          <div className="h-64 w-full">
            {analytics?.statusDistribution?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.statusDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {analytics.statusDistribution.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400 dark:text-slate-500">
                No status records
              </div>
            )}
          </div>
        </div>

        {/* Chart 4: Peak Booking Hours */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-600 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Peak Booking Hours
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Distribution of meeting start times
              </p>
            </div>
            <CalendarDaysIcon className="w-5 h-5 text-amber-600 dark:text-amber-300" />
          </div>

          <div className="h-64 w-full">
            {analytics?.peakHours?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.peakHours}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="hour" tick={{ fontSize: 10 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar
                    dataKey="count"
                    fill="#f59e0b"
                    radius={[6, 6, 0, 0]}
                    name="Meetings"
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400 dark:text-slate-500">
                No peak hours data available
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
