import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/common/Button';
import { BuildingOffice2Icon } from '@heroicons/react/24/outline';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
        <BuildingOffice2Icon className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">404</h1>
      <h2 className="text-xl font-bold text-slate-800 mt-2">Page Not Found</h2>
      <p className="text-sm text-slate-500 max-w-sm mt-1 mb-6">
        The meeting room or page you're trying to reach does not exist or has been relocated.
      </p>
      <Link to="/dashboard">
        <Button variant="primary">Return to Dashboard</Button>
      </Link>
    </div>
  );
};

export default NotFound;
