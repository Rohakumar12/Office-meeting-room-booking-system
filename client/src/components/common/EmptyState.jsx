import React from 'react';
import Button from './Button';

const EmptyState = ({
  icon: Icon,
  title = 'No records found',
  description = 'There are no items to display at this time.',
  actionText,
  onAction,
}) => {
  return (
    <div className="text-center py-12 px-4 bg-white rounded-xl border border-slate-200 shadow-xs max-w-lg mx-auto my-6">
      {Icon && (
        <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
          <Icon className="w-6 h-6" />
        </div>
      )}
      <h3 className="text-base font-semibold text-slate-900 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6">{description}</p>
      {actionText && onAction && (
        <Button onClick={onAction} variant="primary">
          {actionText}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
