import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import {
  Bars3Icon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
  BuildingOffice2Icon,
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
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-2xs">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Mobile hamburger & Brand */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:outline-none"
              onClick={onToggleSidebar}
            >
              <Bars3Icon className="h-6 w-6" />
            </button>

            <Link to={isAdmin ? '/admin' : '/dashboard'} className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs">
                <BuildingOffice2Icon className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold text-slate-900 leading-none tracking-tight">
                  RoomReserve
                </span>
                <span className="text-[10px] uppercase font-semibold text-blue-600 tracking-wider">
                  Office Booking
                </span>
              </div>
            </Link>
          </div>

          {/* Right: Quick Action, User Info, Logout */}
          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              to="/book-room"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold hover:bg-blue-100 transition-colors border border-blue-200"
            >
              <PlusCircleIcon className="w-4 h-4" />
              Book a Room
            </Link>

            <div className="h-6 w-px bg-slate-200 hidden sm:block" />

            <Link
              to="/profile"
              className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-semibold flex items-center justify-center text-xs ring-2 ring-blue-500/20 overflow-hidden">
                {user?.avatar && !avatarError ? (
                  <img
                    src={user.avatar}
                    alt={`${user?.name || 'User'} profile`}
                    className="h-full w-full object-cover"
                    onError={() => setAvatarError(true)}
                  />
                ) : (
                  <span aria-hidden="true">{userInitial}</span>
                )}
              </div>
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-semibold text-slate-800 leading-tight">
                  {user?.name}
                </span>
                <span className="text-[10px] text-slate-500 capitalize">
                  {user?.role} {user?.department ? `• ${user.department}` : ''}
                </span>
              </div>
            </Link>

            <button
              onClick={handleLogout}
              title="Logout"
              className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
