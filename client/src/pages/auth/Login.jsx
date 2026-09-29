import { useId, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { CheckIcon } from '@heroicons/react/24/outline';
import useAuth from '../../hooks/useAuth';
import AuthShell from '../../components/auth/AuthShell';
import toast from 'react-hot-toast';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname;

  const emailId = useId();
  const passwordId = useId();
  const rememberId = useId();

  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setServerError('');

      const res = await login({ ...data, rememberMe });

      toast.success('Logged in successfully!');

      if (from) {
        navigate(from, { replace: true });
      } else if (res.data?.user?.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      setServerError(err.customMessage || 'Invalid email or password');
      toast.error(err.customMessage || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (email, password) => {
    setValue('email', email, { shouldValidate: false });
    setValue('password', password, { shouldValidate: false });
    setServerError('');
  };

  return (
    <AuthShell label="Sign in to RoomReserve">
      <header>
        <h1 className="login-title">Welcome back</h1>
        <p className="login-subtitle">Sign in with your work email to book a meeting room.</p>
      </header>

      {serverError && (
        <p className="form-alert" role="alert">
          {serverError}
        </p>
      )}

      <form className="login-form" onSubmit={handleSubmit(onSubmit)} noValidate>
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

        <label className="field-label" htmlFor={passwordId}>
          Password
        </label>
        <input
          className="login-input password-input"
          id={passwordId}
          type="password"
          autoComplete="current-password"
          placeholder="Enter your password"
          aria-invalid={errors.password ? 'true' : undefined}
          aria-describedby={errors.password ? `${passwordId}-error` : undefined}
          {...register('password', {
            required: 'Password is required',
          })}
        />
        {errors.password && (
          <p className="form-error" id={`${passwordId}-error`}>
            {errors.password.message}
          </p>
        )}

        <div className="form-options">
          <label className="remember-row" htmlFor={rememberId}>
            <input
              id={rememberId}
              type="checkbox"
              className="sr-only"
              checked={rememberMe}
              onChange={(event) => setRememberMe(event.target.checked)}
            />
            <span className="remember-box" data-checked={rememberMe} aria-hidden="true">
              {rememberMe && <CheckIcon className="h-3 w-3 text-white" strokeWidth={3} />}
            </span>
            <span>Keep me signed in</span>
          </label>

          <Link to="/register">Create an account</Link>
        </div>

        <button type="submit" className="sign-in-button" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <div className="demo-row" aria-label="Demo accounts">
        <button
          type="button"
          className="demo-button"
          onClick={() => fillDemo('admin@office.com', 'Admin@123')}
        >
          👑 Demo Admin
        </button>
        <button
          type="button"
          className="demo-button"
          onClick={() => fillDemo('rahul@office.com', 'Employee@123')}
        >
          👤 Demo Employee
        </button>
      </div>

      <Link to="/register" className="auth-alt-link">
        New here? Register as an employee
      </Link>
    </AuthShell>
  );
};

export default Login;
