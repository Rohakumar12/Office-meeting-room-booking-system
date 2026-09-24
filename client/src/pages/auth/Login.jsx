import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import useAuth from '../../hooks/useAuth';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import {
  BuildingOffice2Icon,
  EnvelopeIcon,
  LockClosedIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname;

  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

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
      const res = await login(data);
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
    setValue('email', email);
    setValue('password', password);
    setServerError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 px-4">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="mx-auto w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 mb-4">
          <BuildingOffice2Icon className="w-7 h-7" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Welcome to RoomReserve
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Enterprise Office Meeting Room Booking System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-2xl rounded-2xl sm:px-10 border border-slate-100">
          {/* Demo quick login buttons */}
          <div className="mb-6 p-3.5 bg-blue-50/80 rounded-xl border border-blue-100">
            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900 mb-2">
              <SparklesIcon className="w-4 h-4 text-blue-600" />
              Quick Demo Logins
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillDemo('admin@office.com', 'Admin@123')}
                className="py-1.5 px-2.5 text-xs font-semibold rounded-lg bg-white border border-blue-200 text-blue-800 hover:bg-blue-100/60 transition-colors text-center"
              >
                👑 Demo Admin
              </button>
              <button
                type="button"
                onClick={() => fillDemo('rahul@office.com', 'Employee@123')}
                className="py-1.5 px-2.5 text-xs font-semibold rounded-lg bg-white border border-blue-200 text-blue-800 hover:bg-blue-100/60 transition-colors text-center"
              >
                👤 Demo Employee
              </button>
            </div>
          </div>

          {serverError && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-medium text-red-700">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Work Email"
              type="email"
              icon={EnvelopeIcon}
              placeholder="you@office.com"
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

            <Input
              label="Password"
              type="password"
              icon={LockClosedIcon}
              placeholder="••••••••"
              required
              error={errors.password?.message}
              {...register('password', {
                required: 'Password is required',
              })}
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full mt-2"
              size="lg"
              loading={loading}
            >
              Sign In to Portal
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            Don't have an account yet?{' '}
            <Link
              to="/register"
              className="font-semibold text-blue-600 hover:text-blue-700"
            >
              Register as Employee
            </Link>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          Default Office Hours: Monday - Friday, 08:00 AM - 08:00 PM
        </p>
      </div>
    </div>
  );
};

export default Login;
