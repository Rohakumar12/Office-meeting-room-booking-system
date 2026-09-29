import RoomCard from './RoomCard';
import { RoomCardSkeleton } from '../common/Skeleton';
import EmptyState from '../common/EmptyState';
import { BuildingOfficeIcon } from '@heroicons/react/24/outline';

const RoomGrid = ({
  rooms = [],
  loading = false,
  isAdmin = false,
  showBookButton = true,
  emptyMessage = 'No meeting rooms found matching your search.',
  onResetFilters,
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <RoomCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (rooms.length === 0) {
    return (
      <EmptyState
        icon={BuildingOfficeIcon}
        title="No Rooms Found"
        description={emptyMessage}
        actionText={onResetFilters ? 'Reset Filters' : undefined}
        onAction={onResetFilters}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {rooms.map((room) => (
        <RoomCard
          key={room._id}
          room={room}
          isAdmin={isAdmin}
          showBookButton={showBookButton}
        />
      ))}
    </div>
  );
};

export default RoomGrid;
