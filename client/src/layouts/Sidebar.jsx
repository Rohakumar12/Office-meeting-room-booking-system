import { NavLink } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import ThemeToggle from '../components/common/ThemeToggle';
import {
  HomeIcon,
  BuildingOfficeIcon,
  CalendarDaysIcon,
  PlusCircleIcon,
  UserCircleIcon,
  ChartBarIcon,
  UsersIcon,
  XMarkIcon,
  SquaresPlusIcon,
  ShieldCheckIcon,
  BriefcaseIcon,
} from '@heroicons/react/24/outline';

const Sidebar = ({ isOpen, onClose }) => {
  const { isAdmin, user } = useAuth();

  const employeeLinks = [
    { name: 'Dashboard', to: '/dashboard', icon: HomeIcon },
    { name: 'Meeting Rooms', to: '/rooms', icon: BuildingOfficeIcon },
    { name: 'Book a Room', to: '/book-room', icon: PlusCircleIcon },
    { name: 'My Bookings', to: '/bookings', icon: CalendarDaysIcon },
    { name: 'My Profile', to: '/profile', icon: UserCircleIcon },
  ];

  const adminLinks = [
    { name: 'Admin Dashboard', to: '/admin', icon: HomeIcon, end: true },
    { name: 'Manage Rooms', to: '/admin/rooms', icon: BuildingOfficeIcon },
    { name: 'Add New Room', to: '/admin/rooms/add', icon: SquaresPlusIcon },
    { name: 'Book a Room', to: '/book-room', icon: PlusCircleIcon },
    { name: 'My Bookings', to: '/bookings', icon: CalendarDaysIcon },
    { name: 'All Bookings', to: '/admin/bookings', icon: CalendarDaysIcon },
    { name: 'Employees', to: '/admin/users', icon: UsersIcon },
    { name: 'Analytics & Usage', to: '/admin/analytics', icon: ChartBarIcon },
    { name: 'My Profile', to: '/profile', icon: UserCircleIcon },
  ];

  const links = isAdmin ? adminLinks : employeeLinks;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 dark:bg-slate-950/50 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-600 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Mobile Header with close button */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-700 lg:hidden">
          <span className="font-bold text-slate-900 dark:text-slate-100">Navigation</span>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Role identifier badge */}
        <div className="p-4 mx-3 mt-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-700 flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs ${
              isAdmin
                ? "bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300"
                : "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
            }`}
          >
            {isAdmin ? (
              <ShieldCheckIcon className="w-5 h-5" />
            ) : (
              <BriefcaseIcon className="w-5 h-5" />
            )}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
              {user?.name}
            </p>
            <span
              className={`inline-block px-2 py-0.5 text-[10px] font-semibold rounded-full uppercase tracking-wider ${
                isAdmin
                  ? "bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300"
                  : "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
              }`}
            >
              {user?.role} Mode
            </span>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
            {isAdmin ? "Admin Management" : "Booking Portal"}
          </p>
          {links.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => onClose && onClose()}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-blue-600 dark:bg-blue-600 text-white shadow-xs font-semibold"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-950 hover:text-slate-900 dark:hover:text-slate-100"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    className={`w-5 h-5 shrink-0 ${
                      isActive ? "text-white" : "text-slate-400 dark:text-slate-500"
                    }`}
                  />
                  <span>{item.name}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 mb-3">
          <ThemeToggle className="w-full justify-center" />
        </div>

        {/* Bottom office hours note */}
        <div className="p-4 m-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/70 border border-blue-100 dark:border-blue-800">
          <p className="text-xs font-semibold text-blue-900 dark:text-blue-100">Office Hours</p>
          <p className="text-[11px] text-blue-700 dark:text-blue-300 mt-0.5">
            Mon - Fri: 08:00 AM - 08:00 PM
          </p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
