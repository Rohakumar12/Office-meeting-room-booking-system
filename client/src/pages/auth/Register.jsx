import React, { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import useAuth from '../../hooks/useAuth';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import {
  BuildingOffice2Icon,
  UserIcon,
  EnvelopeIcon,
  LockClosedIcon,
  IdentificationIcon,
  BriefcaseIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const MAX_AVATAR_BYTES = 1_500_000;
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const Register = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      department: '',
      employeeId: '',
      password: '',
      confirmPassword: '',
      avatar: '',
    },
  });

  const password = watch('password');
  const avatar = watch('avatar');
  const avatarInputRef = useRef(null);
  const [photoLoading, setPhotoLoading] = useState(false);

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      setPhotoLoading(false);
      setValue('avatar', '', { shouldDirty: true, shouldValidate: true });
      return;
    }

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      event.target.value = '';
      setPhotoLoading(false);
      setValue('avatar', '', { shouldDirty: true, shouldValidate: true });
      setError('avatar', {
        type: 'validate',
        message: 'Please upload a JPG, PNG, WEBP, or GIF image.',
      });
      return;
    }

    if (file.size > MAX_AVATAR_BYTES) {
      event.target.value = '';
      setPhotoLoading(false);
      setValue('avatar', '', { shouldDirty: true, shouldValidate: true });
      setError('avatar', {
        type: 'validate',
        message: 'Profile photo must be smaller than 1.5 MB.',
      });
      return;
    }

    clearErrors('avatar');
    setPhotoLoading(true);
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setValue('avatar', reader.result, {
          shouldDirty: true,
          shouldValidate: true,
        });
      }
      setPhotoLoading(false);
    };

    reader.onerror = () => {
      setPhotoLoading(false);
      setValue('avatar', '', { shouldDirty: true, shouldValidate: true });
      setError('avatar', {
        type: 'validate',
        message: 'Unable to read that image. Please try another file.',
      });
    };

    reader.readAsDataURL(file);
  };

  const removeAvatar = () => {
    if (avatarInputRef.current) {
      avatarInputRef.current.value = '';
    }
    setValue('avatar', '', { shouldDirty: true, shouldValidate: true });
    clearErrors('avatar');
  };

  const onSubmit = async (data) => {
    if (photoLoading) return;

    try {
      setLoading(true);
      setServerError('');
      const {
        confirmPassword,
        avatar: submittedAvatar,
        department,
        employeeId,
        ...payload
      } = data;
      if (department) {
        payload.department = department;
      }
      if (employeeId) {
        payload.employeeId = employeeId;
      }
      if (submittedAvatar) {
        payload.avatar = submittedAvatar;
      }
      await registerUser(payload);
      toast.success('Registration successful! Welcome aboard.');
      navigate('/dashboard');
    } catch (err) {
      setServerError(
        err.customMessage ||
          'Registration failed. Please check your information.'
      );
      toast.error(err.customMessage || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 px-4">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="mx-auto w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 mb-4">
          <BuildingOffice2Icon className="w-7 h-7" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Create Employee Account
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Join your organization's meeting room booking portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-2xl rounded-2xl sm:px-10 border border-slate-100">
          {serverError && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-medium text-red-700">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              icon={UserIcon}
              placeholder="e.g. John Doe"
              required
              error={errors.name?.message}
              {...register('name', {
                required: 'Full name is required',
                minLength: {
                  value: 2,
                  message: 'Name must be at least 2 characters',
                },
              })}
            />

            <Input
              label="Work Email"
              type="email"
              icon={EnvelopeIcon}
              placeholder="john@office.com"
              required
              error={errors.email?.message}
              {...register('email', {
                required: 'Work email is required',
                pattern: {
                  value: /^\S+@\S+\.\S+$/,
                  message: 'Please enter a valid email address',
                },
              })}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Department"
                type="text"
                icon={BriefcaseIcon}
                placeholder="Engineering"
                error={errors.department?.message}
                {...register('department')}
              />

              <Input
                label="Employee ID"
                type="text"
                icon={IdentificationIcon}
                placeholder="EMP102"
                error={errors.employeeId?.message}
                {...register('employeeId')}
              />
            </div>

            <div>
              <label
                htmlFor="avatar"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Profile Photo <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                ref={avatarInputRef}
                id="avatar"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleAvatarChange}
                className="block w-full text-sm text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 file:font-semibold hover:file:bg-blue-100 cursor-pointer rounded-lg border border-slate-300 bg-white p-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <input type="hidden" {...register('avatar')} />
              <p className="mt-1 text-xs text-slate-500">
                Upload a JPG, PNG, WEBP, or GIF image up to 1.5 MB.
              </p>
              {errors.avatar?.message && (
                <p className="mt-1 text-xs text-red-600 font-medium">
                  {errors.avatar.message}
                </p>
              )}
              {photoLoading && (
                <p className="mt-1 text-xs text-blue-600 font-medium">
                  Processing photo...
                </p>
              )}
              {avatar && !photoLoading && (
                <div className="mt-3 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <img
                    src={avatar}
                    alt="Profile preview"
                    className="h-12 w-12 rounded-full object-cover ring-2 ring-blue-500/20"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-700">
                      Profile photo selected
                    </p>
                    <button
                      type="button"
                      onClick={removeAvatar}
                      className="mt-1 text-xs font-medium text-red-600 hover:text-red-700"
                    >
                      Remove photo
                    </button>
                  </div>
                </div>
              )}
            </div>

            <Input
              label="Password"
              type="password"
              icon={LockClosedIcon}
              placeholder="••••••••"
              required
              helperText="Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char"
              error={errors.password?.message}
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 8,
                  message: 'Password must be at least 8 characters',
                },
                pattern: {
                  value:
                    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                  message:
                    'Must include uppercase, lowercase, number, and special character',
                },
              })}
            />

            <Input
              label="Confirm Password"
              type="password"
              icon={LockClosedIcon}
              placeholder="••••••••"
              required
              error={errors.confirmPassword?.message}
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (val) =>
                  val === password || 'Passwords do not match',
              })}
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full mt-2"
              size="lg"
              loading={loading || photoLoading}
            >
              Complete Registration
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold text-blue-600 hover:text-blue-700"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
