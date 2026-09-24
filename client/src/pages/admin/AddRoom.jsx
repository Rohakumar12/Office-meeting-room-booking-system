import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { roomService } from '../../services/roomService';
import { AMENITIES_LIST } from '../../utils/constants';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const AddRoom = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      location: '',
      floor: '1st Floor',
      capacity: 10,
      description: '',
      image: '',
      amenities: ['WiFi', 'Air Conditioning'],
      isActive: true,
    },
  });

  const watchAmenities = watch('amenities');

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
        image: data.image || undefined,
      };

      const res = await roomService.createRoom(payload);
      if (res.success) {
        toast.success(`Room '${res.data.room.name}' created successfully!`);
        navigate('/admin/rooms');
      }
    } catch (err) {
      setServerError(err.customMessage || 'Failed to create room');
      toast.error(err.customMessage || 'Creation failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <Link
          to="/admin/rooms"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back to Room Management
        </Link>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-2">
          Add New Meeting Room
        </h1>
        <p className="text-sm text-slate-500 mb-6 pb-4 border-b border-slate-100">
          Configure a new conference space or huddle room for employee reservations.
        </p>

        {serverError && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-xs font-medium text-red-700">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Room Name"
              placeholder="e.g. Innovation Hub A"
              required
              error={errors.name?.message}
              {...register('name', { required: 'Room name is required' })}
            />

            <Input
              label="Max Capacity (Persons)"
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
              label="Campus Location / Building"
              placeholder="Building B, West Wing"
              required
              error={errors.location?.message}
              {...register('location', { required: 'Location is required' })}
            />

            <Input
              label="Floor"
              placeholder="3rd Floor"
              required
              error={errors.floor?.message}
              {...register('floor', { required: 'Floor is required' })}
            />
          </div>

          <Input
            label="Room Photo URL (Optional)"
            type="url"
            placeholder="https://images.unsplash.com/..."
            error={errors.image?.message}
            {...register('image')}
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Room Description
            </label>
            <textarea
              rows={3}
              placeholder="Describe room features, recommended use cases, or lighting..."
              className="block w-full rounded-lg border border-slate-300 py-2 px-3 text-sm text-slate-900 placeholder-slate-400 focus:ring-blue-500 focus:border-blue-500"
              {...register('description')}
            />
          </div>

          {/* Amenities Selector */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
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
                        ? 'bg-blue-50 border-blue-500 text-blue-800'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded border flex items-center justify-center text-[10px] ${
                        isChecked
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'border-slate-300'
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
              className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              {...register('isActive')}
            />
            <label
              htmlFor="isActive"
              className="text-sm font-medium text-slate-800 select-none cursor-pointer"
            >
              Activate immediately (makes room available for bookings)
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
            <Link to="/admin/rooms">
              <Button variant="secondary">Cancel</Button>
            </Link>
            <Button type="submit" variant="primary" loading={submitting}>
              Create Room
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddRoom;
