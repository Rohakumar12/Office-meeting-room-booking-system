import { Link } from 'react-router-dom';
import {
  UsersIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import Button from '../common/Button';

const RoomCard = ({
  room,
  showBookButton = true,
  isAdmin = false,
}) => {
  const defaultImage =
    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800';

  return (
    <div className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-600 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col">
      {/* Room Image & Status Badge */}
      <div className="relative h-44 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
        <img
          src={room.image || defaultImage}
          alt={room.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.src = defaultImage;
          }}
        />
        <div className="absolute top-3 right-3">
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-md shadow-xs ${
              room.isActive
                ? 'bg-emerald-500/90 dark:bg-emerald-600/90 text-white'
                : 'bg-rose-500/90 dark:bg-rose-600/90 text-white'
            }`}
          >
            {room.isActive ? (
              <>
                <CheckCircleIcon className="w-3.5 h-3.5" />
                Active
              </>
            ) : (
              <>
                <XCircleIcon className="w-3.5 h-3.5" />
                Inactive
              </>
            )}
          </span>
        </div>
        <div className="absolute bottom-3 left-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-slate-900/80 dark:bg-slate-950/80 text-white backdrop-blur-md">
            <UsersIcon className="w-3.5 h-3.5 text-blue-400 dark:text-blue-300" />
            Capacity: {room.capacity}
          </span>
        </div>
      </div>

      {/* Room Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors">
              {room.name}
            </h3>
          </div>

          <div className="mt-2 space-y-1 text-xs text-slate-500 dark:text-slate-400">
            <p className="flex items-center gap-1.5">
              <MapPinIcon className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
              <span className="truncate">{room.location}</span>
            </p>
            <p className="flex items-center gap-1.5">
              <BuildingOfficeIcon className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
              <span>{room.floor}</span>
            </p>
          </div>

          {room.description && (
            <p className="mt-3 text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
              {room.description}
            </p>
          )}

          {/* Amenities Chips */}
          <div className="mt-4 flex flex-wrap gap-1.5">
            {room.amenities?.slice(0, 3).map((amenity, idx) => (
              <span
                key={idx}
                className="inline-block px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
              >
                {amenity}
              </span>
            ))}
            {room.amenities?.length > 3 && (
              <span className="inline-block px-2 py-0.5 rounded-md text-[11px] font-medium bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                +{room.amenities.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between gap-2">
          <Link
            to={`/rooms/${room._id}`}
            className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-300"
          >
            View Details →
          </Link>

          {isAdmin ? (
            <div className="flex items-center gap-2">
              <Link to={`/admin/rooms/${room._id}/edit`}>
                <Button size="sm" variant="secondary">
                  Edit
                </Button>
              </Link>
            </div>
          ) : (
            showBookButton &&
            room.isActive && (
              <Link to={`/book-room?roomId=${room._id}`}>
                <Button size="sm" variant="primary">
                  Book Room
                </Button>
              </Link>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default RoomCard;
