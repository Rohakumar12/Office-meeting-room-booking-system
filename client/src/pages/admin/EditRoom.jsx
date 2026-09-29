import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { roomService } from '../../services/roomService';
import { AMENITIES_LIST } from '../../utils/constants';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorState from '../../components/common/ErrorState';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const EditRoom = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      location: '',
      floor: '',
      capacity: 10,
      description: '',
      image: '',
      amenities: [],
      isActive: true,
    },
  });

  const watchAmenities = watch('amenities');

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        setLoading(true);
        const res = await roomService.getRoomById(id);
        if (res.success) {
          const r = res.data.room;
          reset({
            name: r.name,
            location: r.location,
            floor: r.floor,
            capacity: r.capacity,
            description: r.description || '',
            image: r.image || '',
            amenities: r.amenities || [],
            isActive: r.isActive,
          });
        }
      } catch (err) {
        setLoadError(err.customMessage || 'Failed to load room data');
      } finally {
        setLoading(false);
      }
    };

    fetchRoom();
  }, [id, reset]);

  const handleAmenityToggle = (amenity) => {
    const current = watchAmenities || [];
    const updated = current.includes(amenity)
      ? current.filter((a) => a !== amenity)
      : [...current, amenity];
    setValue('amenities', updated);
  };

  const onSubmit = async (data) => {
    try {
      setSubmitting(true);
      setServerError('');

      const payload = {
        ...data,
        capacity: Number(data.capacity),
        image: data.image || null,
      };

      const res = await roomService.updateRoom(id, payload);
      if (res.success) {
        toast.success(`Room '${res.data.room.name}' updated successfully!`);
        navigate('/admin/rooms');
      }
    } catch (err) {
      setServerError(err.customMessage || 'Failed to update room');
      toast.error(err.customMessage || 'Update failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex justify-center">
        <LoadingSpinner size="lg" text="Loading room editor..." />
      </div>
    );
  }

  if (loadError) {
    return (
      <ErrorState
        title="Room Not Found"
        message={loadError}
        onRetry={() => navigate('/admin/rooms')}
      />
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <Link
          to="/admin/rooms"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back to Room Management
        </Link>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-600 p-6 sm:p-8 shadow-xs">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight mb-2">
          Edit Room Specifications
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 pb-4 border-b border-slate-100 dark:border-slate-700">
          Modify configuration, seating capacity, or equipped amenities for this space.
        </p>

        {serverError && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-700 text-xs font-medium text-red-700 dark:text-red-300">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Room Name"
              required
              error={errors.name?.message}
              {...register('name', { required: 'Room name is required' })}
            />

            <Input
              label="Max Capacity"
              type="number"
              min="1"
              max="500"
              required
              error={errors.capacity?.message}
              {...register('capacity', {
                required: 'Capacity is required',
                min: { value: 1, message: 'Minimum capacity is 1' },
              })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Campus Location"
              required
              error={errors.location?.message}
              {...register('location', { required: 'Location is required' })}
            />

            <Input
              label="Floor"
              required
              error={errors.floor?.message}
              {...register('floor', { required: 'Floor is required' })}
            />
          </div>

          <Input
            label="Room Photo URL"
            type="url"
            error={errors.image?.message}
            {...register('image')}
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
              Room Description
            </label>
            <textarea
              rows={3}
              className="block w-full rounded-lg border border-slate-300 dark:border-slate-500 py-2 px-3 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-blue-500 dark:focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-500"
              {...register('description')}
            />
          </div>

          {/* Amenities Selector */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
              Available Amenities
            </label>
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
                        ? 'bg-blue-50 dark:bg-blue-950 border-blue-500 dark:border-blue-500 text-blue-800 dark:text-blue-200'
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

          {/* Active Status Toggle */}
          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id="isActive"
              className="w-4 h-4 text-blue-600 dark:text-blue-300 rounded border-slate-300 dark:border-slate-500 focus:ring-blue-500 dark:focus:ring-blue-500"
              {...register('isActive')}
            />
            <label
              htmlFor="isActive"
              className="text-sm font-medium text-slate-800 dark:text-slate-100 select-none cursor-pointer"
            >
              Room is Active (ready for employee bookings)
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-700">
            <Link to="/admin/rooms">
              <Button variant="secondary">Cancel</Button>
            </Link>
            <Button type="submit" variant="primary" loading={submitting}>
              Update Room Details
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditRoom;
