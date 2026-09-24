import React, { useState, useEffect, useCallback } from 'react';
import { roomService } from '../../services/roomService';
import SearchBar from '../../components/rooms/SearchBar';
import FilterPanel from '../../components/rooms/FilterPanel';
import RoomGrid from '../../components/rooms/RoomGrid';
import Pagination from '../../components/common/Pagination';
import ErrorState from '../../components/common/ErrorState';
import toast from 'react-hot-toast';

const Rooms = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1, limit: 9 });
  const [filters, setFilters] = useState({
    capacity: '',
    floor: '',
    amenities: [],
  });

  const fetchRooms = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        page,
        limit: 9,
        isActive: true,
        search: search || undefined,
        capacity: filters.capacity || undefined,
        floor: filters.floor || undefined,
        amenities: filters.amenities.length > 0 ? filters.amenities : undefined,
      };

      const res = await roomService.getRooms(params);
      if (res.success) {
        setRooms(res.data.rooms || []);
        setPagination(res.data.pagination || { total: 0, totalPages: 1, limit: 9 });
      }
    } catch (err) {
      setError(err.customMessage || 'Failed to fetch rooms');
      toast.error('Failed to load meeting rooms');
    } finally {
      setLoading(false);
    }
  }, [page, search, filters]);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  const handleResetFilters = () => {
    setSearch('');
    setFilters({ capacity: '', floor: '', amenities: [] });
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Meeting Rooms
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Browse, filter, and inspect conference rooms available across your office campus.
        </p>
      </div>

      {/* Search Header Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <SearchBar
          value={search}
          onChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
          placeholder="Search by room name, location, or amenities..."
        />
      </div>

      {/* Layout with Filters Sidebar & Rooms Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Filter Column */}
        <div className="lg:col-span-1">
          <FilterPanel
            filters={filters}
            onChange={(newFilters) => {
              setFilters(newFilters);
              setPage(1);
            }}
            onReset={handleResetFilters}
          />
        </div>

        {/* Rooms Grid Column */}
        <div className="lg:col-span-3 space-y-6">
          {error ? (
            <ErrorState message={error} onRetry={fetchRooms} />
          ) : (
            <>
              <RoomGrid
                rooms={rooms}
                loading={loading}
                showBookButton={true}
                emptyMessage="No meeting rooms found matching your current filters."
                onResetFilters={handleResetFilters}
              />

              <Pagination
                currentPage={page}
                totalPages={pagination.totalPages}
                totalItems={pagination.total}
                pageSize={pagination.limit}
                onPageChange={(newPage) => setPage(newPage)}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Rooms;
