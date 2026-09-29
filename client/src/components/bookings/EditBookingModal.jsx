import React, { useEffect, useState } from 'react';
import { bookingService } from '../../services/bookingService';
import { TIME_SLOTS } from '../../utils/constants';
import { getTodayDateInputString } from '../../utils/formatters';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';
import Modal from '../common/Modal';
import toast from 'react-hot-toast';

const EMPTY_FORM = {
  title: '',
  description: '',
  date: '',
  startTime: '',
  endTime: '',
  attendees: 1,
};

const EditBookingModal = ({
  booking,
  onClose,
  onSaved,
  title = 'Edit Meeting Reservation',
}) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!booking) {
      setForm({ ...EMPTY_FORM });
      setError('');
      return;
    }

    setForm({
      title: booking.title || '',
      description: booking.description || '',
      date: new Date(booking.date).toISOString().split('T')[0],
      startTime: booking.startTime,
      endTime: booking.endTime,
      attendees: booking.attendees || 1,
    });
    setError('');
  }, [booking]);

  if (!booking) return null;

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (form.endTime <= form.startTime) {
      setError('End time must be after start time');
      return;
    }

    try {
      setSaving(true);
      setError('');
      await bookingService.updateBooking(booking._id, form);
      toast.success('Booking updated successfully');
      onSaved?.();
    } catch (err) {
      const message = err.customMessage || 'Failed to update booking';
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={Boolean(booking)} onClose={onClose} title={title}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-red-50 text-xs text-red-700 font-medium">
            {error}
          </div>
        )}

        <Input
          label="Meeting Title"
          value={form.title}
          onChange={(event) => updateField('title', event.target.value)}
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Date"
            type="date"
            min={getTodayDateInputString()}
            value={form.date}
            onChange={(event) => updateField('date', event.target.value)}
            required
          />
          <Input
            label="Attendees"
            type="number"
            min="1"
            value={form.attendees}
            onChange={(event) => updateField('attendees', Number(event.target.value))}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Start Time"
            options={TIME_SLOTS.slice(0, -1)}
            value={form.startTime}
            onChange={(event) => updateField('startTime', event.target.value)}
            required
          />
          <Select
            label="End Time"
            options={TIME_SLOTS.slice(1)}
            value={form.endTime}
            onChange={(event) => updateField('endTime', event.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Description
          </label>
          <textarea
            rows={2}
            value={form.description}
            onChange={(event) => updateField('description', event.target.value)}
            className="block w-full rounded-lg border border-slate-300 py-2 px-3 text-sm"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={saving}>
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EditBookingModal;
