import { useRef, useState, useEffect } from 'react';
import useAuth from '../../hooks/useAuth';
import { bookingService } from '../../services/bookingService';
import { userService } from '../../services/userService';
import { formatDate } from '../../utils/formatters';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';
import {
  EnvelopeIcon,
  BriefcaseIcon,
  IdentificationIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline';

const MAX_PROFILE_IMAGE_SIZE = 5 * 1024 * 1024;
const PROFILE_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const Profile = () => {
  const { user, refreshUser } = useAuth();
  const [stats, setStats] = useState({ total: 0, confirmed: 0, cancelled: 0, completed: 0 });
  const [imageUploading, setImageUploading] = useState(false);
  const [imageError, setImageError] = useState('');
  const [avatarError, setAvatarError] = useState(false);
  const imageInputRef = useRef(null);

  useEffect(() => {
    setAvatarError(false);
  }, [user?.avatar]);

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
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
      }
    };

    fetchUserStats();
  }, []);

  const handleProfileImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!PROFILE_IMAGE_TYPES.includes(file.type)) {
      setImageError('Please upload a JPG, PNG, WEBP, or GIF image.');
      event.target.value = '';
      return;
    }

    if (file.size > MAX_PROFILE_IMAGE_SIZE) {
      setImageError('Profile photo must be smaller than 5 MB.');
      event.target.value = '';
      return;
    }

    try {
      setImageUploading(true);
      setImageError('');
      const res = await userService.uploadProfileImage(file);
      if (!res.success) throw new Error('Profile image upload failed');
      await refreshUser();
      toast.success('Profile photo updated successfully');
    } catch (err) {
      setImageError(err.customMessage || err.message || 'Failed to upload photo');
      toast.error(err.customMessage || 'Failed to upload profile photo');
    } finally {
      setImageUploading(false);
      if (imageInputRef.current) imageInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          User Profile
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Account details and your meeting booking activity.
        </p>
      </div>

      {/* Profile Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-600 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col items-center text-center pb-8 border-b border-slate-100 dark:border-slate-700">
          <div className="w-36 h-36 rounded-full bg-blue-600 dark:bg-blue-600 text-white flex items-center justify-center text-4xl font-bold shadow-md shadow-blue-500/20 dark:shadow-blue-500/20 overflow-hidden">
            {user?.avatar && !avatarError ? (
              <img
                src={user.avatar}
                alt={`${user?.name || 'User'} profile`}
                className="h-full w-full object-cover"
                onError={() => setAvatarError(true)}
              />
            ) : (
              <span>{user?.name ? user.name.charAt(0).toUpperCase() : 'U'}</span>
            )}
          </div>

          <div className="mt-5">
            <div className="flex flex-wrap items-center justify-center gap-3">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
                {user?.name}
              </h2>
              <span
                className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                  user?.role === 'admin'
                    ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300'
                    : 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                }`}
              >
                {user?.role}
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{user?.email}</p>
          </div>

          <div className="mt-5 flex flex-col items-center gap-2">
            <input
              ref={imageInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleProfileImageUpload}
              className="hidden"
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              loading={imageUploading}
              onClick={() => imageInputRef.current?.click()}
            >
              Change profile photo
            </Button>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              JPG, PNG, WEBP, or GIF up to 5 MB
            </span>
            {imageError && (
              <p className="text-xs text-red-600 dark:text-red-300 font-medium">{imageError}</p>
            )}
          </div>
        </div>

        {/* Detailed Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 text-sm">
          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-700">
            <EnvelopeIcon className="w-5 h-5 text-blue-600 dark:text-blue-300 shrink-0" />
            <div>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase">Email Address</p>
              <p className="font-semibold text-slate-800 dark:text-slate-100">{user?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-700">
            <BriefcaseIcon className="w-5 h-5 text-blue-600 dark:text-blue-300 shrink-0" />
            <div>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase">Department</p>
              <p className="font-semibold text-slate-800 dark:text-slate-100">{user?.department || 'Not assigned'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-700">
            <IdentificationIcon className="w-5 h-5 text-blue-600 dark:text-blue-300 shrink-0" />
            <div>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase">Employee ID</p>
              <p className="font-semibold font-mono text-slate-800 dark:text-slate-100">{user?.employeeId || 'N/A'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-700">
            <CalendarDaysIcon className="w-5 h-5 text-blue-600 dark:text-blue-300 shrink-0" />
            <div>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase">Member Since</p>
              <p className="font-semibold text-slate-800 dark:text-slate-100">{formatDate(user?.createdAt, 'MMMM d, yyyy')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Stats */}
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-4">
          My Booking Statistics
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-600 shadow-xs text-center">
            <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">{stats.total}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1">Total Bookings</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-600 shadow-xs text-center">
            <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-300">{stats.confirmed}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1">Confirmed</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-600 shadow-xs text-center">
            <p className="text-2xl font-extrabold text-blue-600 dark:text-blue-300">{stats.completed}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1">Completed</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-600 shadow-xs text-center">
            <p className="text-2xl font-extrabold text-slate-400 dark:text-slate-500">{stats.cancelled}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1">Cancelled</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
