export const AMENITIES_LIST = [
  'Projector',
  'Whiteboard',
  'TV',
  'Video Conferencing',
  'WiFi',
  'Air Conditioning',
  'Conference Phone',
  'Flip Chart',
  'Laser Pointer',
  'Coffee Machine',
];

export const TIME_SLOTS = [
  '08:00', '08:30',
  '09:00', '09:30',
  '10:00', '10:30',
  '11:00', '11:30',
  '12:00', '12:30',
  '13:00', '13:30',
  '14:00', '14:30',
  '15:00', '15:30',
  '16:00', '16:30',
  '17:00', '17:30',
  '18:00', '18:30',
  '19:00', '19:30',
  '20:00'
];

export const STATUS_COLORS = {
  confirmed: {
    badge: 'bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-700',
    dot: 'bg-emerald-500 dark:bg-emerald-600',
    label: 'Confirmed',
  },
  cancelled: {
    badge: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-600',
    dot: 'bg-slate-400 dark:bg-slate-700',
    label: 'Cancelled',
  },
  completed: {
    badge: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-700',
    dot: 'bg-blue-500 dark:bg-blue-600',
    label: 'Completed',
  },
};
