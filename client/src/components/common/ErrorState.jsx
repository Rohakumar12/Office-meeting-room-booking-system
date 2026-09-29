import Button from './Button';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';

const ErrorState = ({
  title = 'Failed to load data',
  message = 'An unexpected error occurred while fetching data. Please try again.',
  onRetry,
}) => {
  return (
    <div className="text-center py-12 px-4 bg-red-50/50 dark:bg-red-950/50 rounded-xl border border-red-200 dark:border-red-700 max-w-lg mx-auto my-6">
      <div className="mx-auto w-12 h-12 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center text-red-600 dark:text-red-300 mb-4">
        <ExclamationCircleIcon className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-red-900 dark:text-red-100 mb-1">{title}</h3>
      <p className="text-sm text-red-700 dark:text-red-300 max-w-sm mx-auto mb-6">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="secondary">
          Try Again
        </Button>
      )}
    </div>
  );
};

export default ErrorState;
