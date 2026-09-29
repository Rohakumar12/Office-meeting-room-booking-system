import { useEffect, useId, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';
import useAuth from '../../hooks/useAuth';
import AuthShell from '../../components/auth/AuthShell';
import { userService } from '../../services/userService';
import toast from 'react-hot-toast';

const MAX_AVATAR_BYTES = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const Register = () => {
  const { register: registerUser, refreshUser } = useAuth();
  const navigate = useNavigate();

  const nameId = useId();
  const emailId = useId();
  const departmentId = useId();
  const employeeIdId = useId();
  const avatarId = useId();
  const passwordId = useId();
  const confirmId = useId();

  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [avatarError, setAvatarError] = useState('');
  const avatarInputRef = useRef(null);

  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      department: '',
      employeeId: '',
      password: '',
      confirmPassword: '',
    },
  });

  const password = watch('password');

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      setAvatarFile(null);
      setAvatarPreview('');
      return;
    }

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      event.target.value = '';
      setAvatarFile(null);
      setAvatarPreview('');
      setAvatarError('Please upload a JPG, PNG, WEBP, or GIF image.');
      return;
    }

    if (file.size > MAX_AVATAR_BYTES) {
      event.target.value = '';
      setAvatarFile(null);
      setAvatarPreview('');
      setAvatarError('Profile photo must be smaller than 5 MB.');
      return;
    }

    setAvatarError('');
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const removeAvatar = () => {
    if (avatarInputRef.current) avatarInputRef.current.value = '';
    setAvatarFile(null);
    setAvatarPreview('');
    setAvatarError('');
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setServerError('');

      // Never send the client-only confirm field, and omit the optional
      // fields entirely when the employee left them blank.
      const payload = { ...data };
      delete payload.confirmPassword;
      if (!payload.department) delete payload.department;
      if (!payload.employeeId) delete payload.employeeId;

      await registerUser(payload);

      if (avatarFile) {
        try {
          const uploadRes = await userService.uploadProfileImage(avatarFile);
          if (!uploadRes.success) throw new Error('Profile image upload failed');
          await refreshUser();
        } catch {
          toast.error('Account created, but profile photo upload failed. You can retry from Profile.');
        }
      }

      toast.success('Registration successful! Welcome aboard.');
      navigate('/dashboard');
    } catch (err) {
      setServerError(err.customMessage || 'Registration failed. Please check your information.');
      toast.error(err.customMessage || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell tall label="Create a RoomReserve account">
      <header>
        <h1 className="login-title">Create your account</h1>
        <p className="login-subtitle">Join your workspace and book your first meeting room.</p>
      </header>

      {serverError && (
        <p className="form-alert" role="alert">
          {serverError}
        </p>
      )}

      <form className="login-form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <label className="field-label" htmlFor={nameId}>
          Full Name
        </label>
        <input
          className="login-input"
          id={nameId}
          type="text"
          autoComplete="name"
          placeholder="e.g. John Doe"
          aria-invalid={errors.name ? 'true' : undefined}
          aria-describedby={errors.name ? `${nameId}-error` : undefined}
          {...register('name', {
            required: 'Full name is required',
            minLength: { value: 2, message: 'Name must be at least 2 characters' },
          })}
        />
        {errors.name && (
          <p className="form-error" id={`${nameId}-error`}>
            {errors.name.message}
          </p>
        )}

        <label className="field-label" htmlFor={emailId}>
          Work Email
        </label>
        <input
          className="login-input"
          id={emailId}
          type="email"
          autoComplete="email"
          placeholder="you@office.com"
          aria-invalid={errors.email ? 'true' : undefined}
          aria-describedby={errors.email ? `${emailId}-error` : undefined}
          {...register('email', {
            required: 'Work email is required',
            pattern: {
              value: /^\S+@\S+\.\S+$/,
              message: 'Please enter a valid email address',
            },
          })}
        />
        {errors.email && (
          <p className="form-error" id={`${emailId}-error`}>
            {errors.email.message}
          </p>
        )}

        <div className="field-row">
          <div>
            <label className="field-label" htmlFor={departmentId}>
              Department
            </label>
            <input
              className="login-input"
              id={departmentId}
              type="text"
              placeholder="Engineering"
              aria-invalid={errors.department ? 'true' : undefined}
              aria-describedby={errors.department ? `${departmentId}-error` : undefined}
              {...register('department')}
            />
            {errors.department && (
              <p className="form-error" id={`${departmentId}-error`}>
                {errors.department.message}
              </p>
            )}
          </div>

          <div>
            <label className="field-label" htmlFor={employeeIdId}>
              Employee ID
            </label>
            <input
              className="login-input"
              id={employeeIdId}
              type="text"
              placeholder="EMP102"
              aria-invalid={errors.employeeId ? 'true' : undefined}
              aria-describedby={errors.employeeId ? `${employeeIdId}-error` : undefined}
              {...register('employeeId')}
            />
            {errors.employeeId && (
              <p className="form-error" id={`${employeeIdId}-error`}>
                {errors.employeeId.message}
              </p>
            )}
          </div>
        </div>

        <div className="avatar-picker">
          <span className="avatar-preview">
            {avatarPreview ? (
              <img src={avatarPreview} alt="Profile preview" className="h-full w-full object-cover" />
            ) : (
              <PhotoIcon className="h-5 w-5" aria-hidden="true" />
            )}
          </span>

          <div className="min-w-0 flex-1">
            <label className="sr-only" htmlFor={avatarId}>
              Profile photo (optional)
            </label>
            <input
              ref={avatarInputRef}
              id={avatarId}
              type="file"
              className="avatar-file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleAvatarChange}
              aria-describedby={avatarError ? `${avatarId}-error` : `${avatarId}-hint`}
            />
            <p className="field-hint" id={`${avatarId}-hint`} style={{ margin: '0.3rem 0 0' }}>
              Optional. JPG, PNG, WEBP or GIF up to 5 MB.
            </p>
            {avatarError && (
              <p className="form-error" id={`${avatarId}-error`} style={{ margin: '0.3rem 0 0' }}>
                {avatarError}
              </p>
            )}
          </div>

          {avatarPreview && (
            <button
              type="button"
              className="avatar-remove"
              onClick={removeAvatar}
              aria-label="Remove selected photo"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          )}
        </div>

        <label className="field-label" htmlFor={passwordId}>
          Password
        </label>
        <input
          className="login-input password-input"
          id={passwordId}
          type="password"
          autoComplete="new-password"
          placeholder="Create a password"
          aria-invalid={errors.password ? 'true' : undefined}
          aria-describedby={errors.password ? `${passwordId}-error` : `${passwordId}-hint`}
          {...register('password', {
            required: 'Password is required',
            minLength: { value: 8, message: 'Password must be at least 8 characters' },
            pattern: {
              value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/,
              message:
                'Must include uppercase, lowercase, number, and special character',
            },
          })}
        />
        {errors.password ? (
          <p className="form-error" id={`${passwordId}-error`}>
            {errors.password.message}
          </p>
        ) : (
          <p className="field-hint" id={`${passwordId}-hint`}>
            Min 8 characters, with 1 uppercase, 1 lowercase, 1 number and 1 special
            character (e.g. @ # _ - . !).
          </p>
        )}

        <label className="field-label" htmlFor={confirmId}>
          Confirm Password
        </label>
        <input
          className="login-input password-input"
          id={confirmId}
          type="password"
          autoComplete="new-password"
          placeholder="Re-enter your password"
          aria-invalid={errors.confirmPassword ? 'true' : undefined}
          aria-describedby={errors.confirmPassword ? `${confirmId}-error` : undefined}
          {...register('confirmPassword', {
            required: 'Please confirm your password',
            validate: (val) => val === password || 'Passwords do not match',
          })}
        />
        {errors.confirmPassword && (
          <p className="form-error" id={`${confirmId}-error`}>
            {errors.confirmPassword.message}
          </p>
        )}

        <button type="submit" className="sign-in-button" disabled={loading}>
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <Link to="/login" className="auth-alt-link">
        Already have an account? Sign in
      </Link>
    </AuthShell>
  );
};

export default Register;
