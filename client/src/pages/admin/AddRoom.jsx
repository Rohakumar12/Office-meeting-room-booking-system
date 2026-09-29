import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { roomService } from '../../services/roomService';
import { AMENITIES_LIST } from '../../utils/constants';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const MAX_ROOM_IMAGE_SIZE = 5 * 1024 * 1024;
const ROOM_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const AddRoom = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [imageError, setImageError] = useState('');

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

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

  const handleRoomImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      setImageFile(null);
      setImagePreview('');
      return;
    }

    if (!ROOM_IMAGE_TYPES.includes(file.type)) {
      event.target.value = '';
      setImageFile(null);
      setImagePreview('');
      setImageError('Please upload a JPG, PNG, WEBP, or GIF image.');
      return;
    }

    if (file.size > MAX_ROOM_IMAGE_SIZE) {
      event.target.value = '';
      setImageFile(null);
      setImagePreview('');
      setImageError('Room image must be smaller than 5 MB.');
      return;
    }

    setImageError('');
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

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

      const { image: _unusedImage, ...roomData } = data;
      const payload = {
        ...roomData,
        capacity: Number(roomData.capacity),
      };

      if (imageFile) {
        const uploadRes = await roomService.uploadRoomImage(imageFile);
        if (!uploadRes.success || !uploadRes.data?.url) {
          throw new Error('Room image upload failed');
        }
        payload.image = uploadRes.data.url;
      }

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
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back to Room Management
        </Link>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-600 p-6 sm:p-8 shadow-xs">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight mb-2">
          Add New Meeting Room
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 pb-4 border-b border-slate-100 dark:border-slate-700">
          Configure a new conference space or huddle room for employee reservations.
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

          <div>
            <label
              htmlFor="room-image"
              className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1"
            >
              Room Photo <span className="text-slate-400 dark:text-slate-500 font-normal">(Optional)</span>
            </label>
            <input
              id="room-image"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleRoomImageChange}
              className="block w-full text-sm text-slate-600 dark:text-slate-300 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 dark:file:bg-blue-950 file:text-blue-700 dark:file:text-blue-300 file:font-semibold hover:file:bg-blue-100 cursor-pointer rounded-lg border border-slate-300 dark:border-slate-500 bg-white dark:bg-slate-900 p-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-500"
            />
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Upload a JPG, PNG, WEBP, or GIF image up to 5 MB.
            </p>
            {imageError && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-300 font-medium">{imageError}</p>
            )}
            {imagePreview && (
              <div className="mt-3">
                <img
                  src={imagePreview}
                  alt="Room preview"
                  className="h-40 w-full max-w-md rounded-xl object-cover border border-slate-200 dark:border-slate-600"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
              Room Description
            </label>
            <textarea
              rows={3}
              placeholder="Describe room features, recommended use cases, or lighting..."
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
              Activate immediately (makes room available for bookings)
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-700">
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
