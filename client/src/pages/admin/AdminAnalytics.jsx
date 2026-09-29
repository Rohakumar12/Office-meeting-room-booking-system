import { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
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
import {
  ChartBarIcon,
  CalendarDaysIcon,
  BuildingOfficeIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const AdminAnalytics = () => {
  const [period, setPeriod] = useState('30d');
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await adminService.getAnalytics({ period });
        if (res.success) {
          setAnalytics(res.data);
        }
      } catch (err) {
        toast.error('Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [period]);

  return (
    <div className="space-y-8">
      {/* Header & Period Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Advanced Analytics & Reports
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Gain data-driven insights into conference room demand, peak hours, and campus resource utilization.
          </p>
        </div>

        {/* Period Selector */}
        <div className="inline-flex rounded-xl bg-white dark:bg-slate-900 p-1 border border-slate-200 dark:border-slate-600 shadow-2xs self-start sm:self-auto">
          {[
            { id: '7d', label: '7 Days' },
            { id: '30d', label: '30 Days' },
            { id: '90d', label: '90 Days' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setPeriod(item.id)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                period === item.id
                  ? 'bg-blue-600 dark:bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-24 flex justify-center">
          <LoadingSpinner size="lg" text="Calculating usage aggregation..." />
        </div>
      ) : (
        <div className="space-y-8">
          {/* Big Trend Chart */}
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-600 shadow-xs">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Daily Booking Volume
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Total confirmed and completed meetings across all campus rooms
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-300 flex items-center justify-center">
                <CalendarDaysIcon className="w-5 h-5" />
              </div>
            </div>

            <div className="h-72 w-full">
              {analytics?.dailyBookings?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics.dailyBookings}>
                    <defs>
                      <linearGradient id="colorWave" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="#1d4ed8"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorWave)"
                      name="Meetings"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-400 dark:text-slate-500">
                  No data recorded for this duration.
                </div>
              )}
            </div>
          </div>

          {/* 2-Column Row: Most Used & Room Utilization */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Rooms */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-600 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    Most Popular Meeting Rooms
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Highest reservation frequency in selected period
                  </p>
                </div>
                <BuildingOfficeIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-300" />
              </div>

              <div className="h-64 w-full">
                {analytics?.topRooms?.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.topRooms} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                      <YAxis
                        type="category"
                        dataKey="name"
                        width={120}
                        tick={{ fontSize: 11 }}
                      />
                      <Tooltip />
                      <Bar
                        dataKey="bookings"
                        fill="#10b981"
                        radius={[0, 6, 6, 0]}
                        name="Bookings"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-slate-400 dark:text-slate-500">
                    No data available
                  </div>
                )}
              </div>
            </div>

            {/* Room Utilization Rate */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-600 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    Estimated Room Utilization (%)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Percentage of daily operating capacity utilized
                  </p>
                </div>
                <ChartBarIcon className="w-5 h-5 text-purple-600 dark:text-purple-300" />
              </div>

              <div className="h-64 w-full">
                {analytics?.roomUtilization?.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.roomUtilization}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <YAxis
                        unit="%"
                        domain={[0, 100]}
                        tick={{ fontSize: 11 }}
                      />
                      <Tooltip formatter={(value) => `${Number(value).toFixed(1)}%`} />
                      <Bar
                        dataKey="utilization"
                        fill="#8b5cf6"
                        radius={[6, 6, 0, 0]}
                        name="Utilization Rate"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-slate-400 dark:text-slate-500">
                    No utilization data available
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 2-Column Row: Peak Hours & Status Pie */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Peak Hours */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-600 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    Peak Meeting Hours
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    When employees start their meetings most frequently
                  </p>
                </div>
                <ClockIcon className="w-5 h-5 text-amber-600 dark:text-amber-300" />
              </div>

              <div className="h-64 w-full">
                {analytics?.peakHours?.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.peakHours}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="hour" tick={{ fontSize: 11 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar
                        dataKey="count"
                        fill="#f59e0b"
                        radius={[6, 6, 0, 0]}
                        name="Scheduled Starts"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-slate-400 dark:text-slate-500">
                    No time distribution data
                  </div>
                )}
              </div>
            </div>

            {/* Status Breakdown Pie */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-600 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    Reservation Outcomes
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Proportion of completed, confirmed, and cancelled meetings
                  </p>
                </div>
              </div>

              <div className="h-64 w-full">
                {analytics?.statusDistribution?.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics.statusDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
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
                    No status distribution
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAnalytics;
