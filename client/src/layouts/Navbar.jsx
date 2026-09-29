import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import ThemeToggle from '../components/common/ThemeToggle';
import { BRAND_LOGO_URL } from '../constants/brand';
import {
  Bars3Icon,
  ArrowRightOnRectangleIcon,
  PlusCircleIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const Navbar = ({ onToggleSidebar }) => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [avatarError, setAvatarError] = useState(false);

  useEffect(() => {
    setAvatarError(false);
  }, [user?.avatar]);

  const userInitial = user?.name?.charAt(0).toUpperCase() || 'U';

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch {
      toast.error('Logout error');
    }
  };

  return (
    <header className="sticky top-0 z-30 h-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-600 shadow-2xs">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Mobile hamburger & Brand */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 focus:outline-none"
              onClick={onToggleSidebar}
            >
              <Bars3Icon className="h-6 w-6" />
            </button>

            <Link
              to={isAdmin ? "/admin" : "/dashboard"}
              className="flex items-center gap-2.5"
            >
              <div className="w-9 h-9 shrink-0 overflow-hidden rounded-full bg-white flex items-center justify-center">
                <img src={BRAND_LOGO_URL} alt="" className="h-full w-full object-cover" width="36" height="36" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold text-slate-900 dark:text-slate-100 leading-none tracking-tight">
                  RoomReserve
                </span>
                <span className="text-[10px] uppercase font-semibold text-blue-600 dark:text-blue-300 tracking-wider">
                  Office Booking
                </span>
              </div>
            </Link>
          </div>

          {/* Right: Quick Action, User Info, Logout */}
          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              to="/book-room"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-semibold hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors border border-blue-200 dark:border-blue-700"
            >
              <PlusCircleIcon className="w-4 h-4" />
              Book a Room
            </Link>

            <ThemeToggle />

            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block" />

            <Link
              to="/profile"
              className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-950 transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-semibold flex items-center justify-center text-xs ring-2 ring-blue-500/20 dark:ring-blue-500/20 overflow-hidden">
                {user?.avatar && !avatarError ? (
                  <img
                    src={user.avatar}
                    alt={`${user?.name || "User"} profile`}
                    className="h-full w-full object-cover"
                    onError={() => setAvatarError(true)}
                  />
                ) : (
                  <span aria-hidden="true">{userInitial}</span>
                )}
              </div>
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-100 leading-tight">
                  {user?.name}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 capitalize">
                  {user?.role} {user?.department ? `• ${user.department}` : ""}
                </span>
              </div>
            </Link>

            <button
              onClick={handleLogout}
              title="Logout"
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg transition-colors"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
