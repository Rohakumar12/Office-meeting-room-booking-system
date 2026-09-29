import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { roomService } from '../../services/roomService';
import { bookingService } from '../../services/bookingService';
import { TIME_SLOTS, AMENITIES_LIST } from '../../utils/constants';
import { getTodayDateInputString, formatTime12h, formatDate } from '../../utils/formatters';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  UsersIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const BookRoom = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const preselectedRoomId = searchParams.get('roomId') || '';
  const preselectedDate = searchParams.get('date') || getTodayDateInputString();
  const preselectedStart = searchParams.get('startTime') || '10:00';

  const [availableRooms, setAvailableRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  // Form state
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: '',
      description: '',
      date: preselectedDate,
      startTime: preselectedStart,
      endTime: '11:00',
      attendees: 2,
      requiredAmenities: [],
    },
  });

  const watchDate = watch('date');
  const watchStartTime = watch('startTime');
  const watchEndTime = watch('endTime');
  const watchAttendees = watch('attendees');
  const watchAmenities = watch('requiredAmenities');

  // Search available rooms matching criteria
  useEffect(() => {
    const fetchAvailable = async () => {
      if (!watchDate || !watchStartTime || !watchEndTime) return;

      try {
        setLoadingRooms(true);
        setServerError('');
        const res = await roomService.getAvailableRooms({
          date: watchDate,
          startTime: watchStartTime,
          endTime: watchEndTime,
          capacity: watchAttendees || undefined,
          amenities: watchAmenities?.length > 0 ? watchAmenities : undefined,
        });

        if (res.success) {
          const rooms = res.data.rooms || [];
          setAvailableRooms(rooms);

          // Reconcile the current pick against the fresh results.
          // The functional form always receives the latest state, so this
          // cannot read a stale closure and needs no extra dependency.
          // Reading selectedRoom directly left a room selected after the
          // date, time, capacity or amenities changed - even once that room
          // was no longer in the available set.
          setSelectedRoom((current) => {
            if (preselectedRoomId) {
              const preselected = rooms.find((r) => r._id === preselectedRoomId);
              if (preselected) return preselected;
            }
            // Keep the existing pick only while it is still bookable.
            if (current && rooms.some((r) => r._id === current._id)) {
              return current;
            }
            return rooms.length > 0 ? rooms[0] : null;
          });
        }
      } catch {
        toast.error('Failed to query available rooms');
      } finally {
        setLoadingRooms(false);
      }
    };

    fetchAvailable();
  }, [
    watchDate,
    watchStartTime,
    watchEndTime,
    watchAttendees,
    watchAmenities,
    preselectedRoomId,
  ]);

  const handleAmenityToggle = (amenity) => {
    const current = watchAmenities || [];
    const updated = current.includes(amenity)
      ? current.filter((a) => a !== amenity)
      : [...current, amenity];
    setValue('requiredAmenities', updated);
  };

  const onSubmit = async (data) => {
    if (!selectedRoom) {
      toast.error('Please select an available room');
      return;
    }

    try {
      setSubmitting(true);
      setServerError('');

      const payload = {
        roomId: selectedRoom._id,
        title: data.title,
        description: data.description,
        date: data.date,
        startTime: data.startTime,
        endTime: data.endTime,
        attendees: Number(data.attendees) || 1,
      };

      const res = await bookingService.createBooking(payload);
      if (res.success) {
        toast.success(`Booking confirmed for ${selectedRoom.name}!`);
        navigate('/bookings');
      }
    } catch (err) {
      setServerError(err.customMessage || 'Failed to book room');
      toast.error(err.customMessage || 'Booking failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          Book a Meeting Room
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Find available rooms matching your schedule and reserve instantly.
        </p>
      </div>

      {serverError && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-700 flex items-start gap-3 text-sm text-red-700 dark:text-red-300">
          <ExclamationCircleIcon className="w-5 h-5 text-red-500 dark:text-red-300 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Booking Conflict or Validation Error</p>
            <p>{serverError}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left 2 Cols: Step-by-Step Filter & Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Meeting Details */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-600 p-6 shadow-xs">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-600 dark:bg-blue-600 text-white text-xs flex items-center justify-center font-bold">
                  1
                </span>
                Meeting Details
              </h2>

              <div className="space-y-4">
                <Input
                  label="Meeting Title"
                  placeholder="e.g. Q3 Roadmap Review"
                  required
                  error={errors.title?.message}
                  {...register('title', {
                    required: 'Meeting title is required',
                    maxLength: {
                      value: 200,
                      message: 'Title cannot exceed 200 characters',
                    },
                  })}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Date"
                    type="date"
                    min={getTodayDateInputString()}
                    required
                    error={errors.date?.message}
                    {...register('date', { required: 'Date is required' })}
                  />

                  <Input
                    label="Expected Attendees"
                    type="number"
                    min="1"
                    max="50"
                    required
                    error={errors.attendees?.message}
                    {...register('attendees', {
                      required: 'Attendees required',
                      min: { value: 1, message: 'Minimum 1 attendee' },
                    })}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select
                    label="Start Time"
                    options={TIME_SLOTS.slice(0, -1)}
                    required
                    error={errors.startTime?.message}
                    {...register('startTime', {
                      required: 'Start time is required',
                    })}
                  />

                  <Select
                    label="End Time"
                    options={TIME_SLOTS.slice(1)}
                    required
                    error={errors.endTime?.message}
                    {...register('endTime', {
                      required: 'End time is required',
                      validate: (val) =>
                        val > watchStartTime || 'End time must be after start time',
                    })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
                    Agenda / Notes (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Brief description or meeting agenda..."
                    className="block w-full rounded-lg border border-slate-300 dark:border-slate-500 py-2.5 px-3.5 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-blue-500 dark:focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-500"
                    {...register('description')}
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Required Amenities */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-600 p-6 shadow-xs">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-600 dark:bg-blue-600 text-white text-xs flex items-center justify-center font-bold">
                  2
                </span>
                Required Amenities
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                Rooms lacking any of your checked amenities will be filtered out.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {AMENITIES_LIST.map((amenity) => {
                  const isChecked = (watchAmenities || []).includes(amenity);
                  return (
                    <button
                      key={amenity}
                      type="button"
                      onClick={() => handleAmenityToggle(amenity)}
                      className={`p-2.5 text-xs font-semibold rounded-xl border text-left flex items-center gap-2 transition-all ${
                        isChecked
                          ? 'bg-blue-50 dark:bg-blue-950 border-blue-500 dark:border-blue-500 text-blue-800 dark:text-blue-200 ring-1 ring-blue-500/20 dark:ring-blue-500/20'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-950'
                      }`}
                    >
                      <span
                        className={`w-4 h-4 rounded border flex items-center justify-center text-[10px] ${
                          isChecked
                            ? 'bg-blue-600 dark:bg-blue-600 border-blue-600 dark:border-blue-400 text-white'
                            : 'border-slate-300 dark:border-slate-500'
                        }`}
                      >
                        {isChecked && '✓'}
                      </span>
                      <span className="truncate">{amenity}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Available Rooms Selection */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-600 p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-600 dark:bg-blue-600 text-white text-xs flex items-center justify-center font-bold">
                    3
                  </span>
                  Select an Available Room
                </h2>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {availableRooms.length} room(s) available
                </span>
              </div>

              {loadingRooms ? (
                <div className="py-8 flex justify-center">
                  <LoadingSpinner text="Checking real-time room availability..." />
                </div>
              ) : availableRooms.length === 0 ? (
                <div className="text-center py-8 px-4 bg-amber-50/50 dark:bg-amber-950/50 rounded-xl border border-amber-200 dark:border-amber-700">
                  <ExclamationCircleIcon className="w-8 h-8 text-amber-500 dark:text-amber-300 mx-auto mb-2" />
                  <p className="text-sm font-bold text-amber-900 dark:text-amber-100">
                    No Rooms Available for this Slot
                  </p>
                  <p className="text-xs text-amber-700 dark:text-amber-300 mt-1 max-w-md mx-auto">
                    Try changing your selected time, choosing a different date,
                    or unchecking non-essential amenities.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {availableRooms.map((room) => {
                    const isSelected = selectedRoom?._id === room._id;
                    return (
                      <div
                        key={room._id}
                        onClick={() => setSelectedRoom(room)}
                        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all duration-150 ${
                          isSelected
                            ? 'bg-blue-50/60 dark:bg-blue-950/60 border-blue-600 dark:border-blue-400 shadow-sm ring-2 ring-blue-500/20 dark:ring-blue-500/20'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                              {room.name}
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                              {room.location} • {room.floor}
                            </p>
                          </div>
                          <span
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-xs ${
                              isSelected
                                ? 'bg-blue-600 dark:bg-blue-600 border-blue-600 dark:border-blue-400 text-white'
                                : 'border-slate-300 dark:border-slate-500'
                            }`}
                          >
                            {isSelected && '✓'}
                          </span>
                        </div>

                        <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200">
                          <UsersIcon className="w-4 h-4 text-blue-600 dark:text-blue-300" />
                          <span>Capacity: {room.capacity}</span>
                        </div>

                        <div className="mt-2 flex flex-wrap gap-1">
                          {room.amenities?.slice(0, 3).map((a, i) => (
                            <span
                              key={i}
                              className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded"
                            >
                              {a}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right 1 Col: Booking Summary & Confirm Button */}
          <div className="space-y-6 lg:sticky lg:top-20">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-600 p-6 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-4">
                Booking Summary
              </h3>

              <div className="space-y-3 text-xs border-b border-slate-100 dark:border-slate-700 pb-4">
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Selected Room:</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100 text-right">
                    {selectedRoom?.name || 'None selected'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Date:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-100">
                    {formatDate(watchDate)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Time Window:</span>
                  <span className="font-mono font-semibold text-slate-800 dark:text-slate-100">
                    {formatTime12h(watchStartTime)} -{' '}
                    {formatTime12h(watchEndTime)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Attendees:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-100">
                    {watchAttendees} person(s)
                  </span>
                </div>
              </div>

              {selectedRoom && (
                <div className="mt-4 p-3.5 bg-emerald-50 dark:bg-emerald-950 rounded-xl border border-emerald-200 dark:border-emerald-700 text-xs text-emerald-800 dark:text-emerald-200">
                  <div className="flex items-center gap-1.5 font-bold mb-1">
                    <CheckCircleIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-300" />
                    Slot Verified & Available
                  </div>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
                    This room meets all your capacity and amenity requirements.
                  </p>
                </div>
              )}

              <div className="mt-6">
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  size="lg"
                  disabled={!selectedRoom || loadingRooms}
                  loading={submitting}
                >
                  Confirm & Reserve Room
                </Button>
              </div>

              <p className="mt-3 text-center text-[11px] text-slate-400 dark:text-slate-500">
                You can edit or cancel this booking anytime before the meeting starts.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default BookRoom;
