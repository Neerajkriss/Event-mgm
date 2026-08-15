import { useState } from 'react';
import {
  CalendarDays, Plus, Pencil, Trash2, MapPin, Users, IndianRupee,
  Calendar, Tag, FileText, Image as ImageIcon,
} from 'lucide-react';
import { useAppData } from '@/context/AppDataContext';
import { useAuth } from '@/context/AuthContext';
import type { Event } from '@/types';
import PageHeader from '@/components/ui/PageHeader';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import EmptyState from '@/components/ui/EmptyState';
import { formatCurrency, formatDate } from '@/lib/format';

const statusColors: Record<Event['status'], string> = {
  published: 'bg-success-100 text-success-700',
  draft: 'bg-gray-100 text-gray-600',
  cancelled: 'bg-error-100 text-error-700',
  completed: 'bg-brand-100 text-brand-700',
};

const defaultImages = [
  'https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg',
  'https://images.pexels.com/photos/2776240/pexels-photo-2776240.jpeg',
  'https://images.pexels.com/photos/4123665/pexels-photo-4123665.jpeg',
];

const emptyForm = {
  title: '',
  description: '',
  categoryId: '',
  location: '',
  venue: '',
  startDate: '',
  endDate: '',
  price: '',
  capacity: '',
  image: defaultImages[0],
  tags: '',
};

export default function OrganizerEventsPage() {
  const { events, categories, addEvent, updateEvent, deleteEvent } = useAppData();
  const { user } = useAuth();

  const myEvents = events.filter((e) => e.organizerId === user?.id);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Event | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm, categoryId: categories[0]?.id ?? '' });
    setError('');
    setModalOpen(true);
  };

  const openEdit = (evt: Event) => {
    setEditing(evt);
    setForm({
      title: evt.title,
      description: evt.description,
      categoryId: evt.categoryId,
      location: evt.location,
      venue: evt.venue,
      startDate: evt.startDate.slice(0, 16),
      endDate: evt.endDate.slice(0, 16),
      price: String(evt.price),
      capacity: String(evt.capacity),
      image: evt.image,
      tags: evt.tags.join(', '),
    });
    setError('');
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.title.trim().length < 3) {
      setError('Event title must be at least 3 characters.');
      return;
    }
    if (!form.categoryId) {
      setError('Please select a category.');
      return;
    }
    if (!form.startDate || !form.endDate) {
      setError('Please set both start and end date/time.');
      return;
    }
    if (Number(form.price) < 0) {
      setError('Price cannot be negative.');
      return;
    }
    if (Number(form.capacity) < 1) {
      setError('Capacity must be at least 1.');
      return;
    }

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      categoryId: form.categoryId,
      organizerId: user?.id ?? '',
      organizerName: user?.name ?? '',
      location: form.location.trim(),
      venue: form.venue.trim(),
      startDate: new Date(form.startDate).toISOString(),
      endDate: new Date(form.endDate).toISOString(),
      price: Number(form.price),
      capacity: Number(form.capacity),
      bookedCount: editing?.bookedCount ?? 0,
      status: editing?.status ?? ('draft' as Event['status']),
      image: form.image,
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
    };

    if (editing) {
      updateEvent(editing.id, payload);
    } else {
      addEvent(payload);
    }
    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hosted Events"
        description="Create, edit, and manage events you organize on the platform."
        icon={<CalendarDays className="h-5 w-5" />}
        action={
          <button className="btn-primary" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Create New Event
          </button>
        }
      />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card p-4">
          <p className="text-2xl font-bold text-gray-900">{myEvents.length}</p>
          <p className="mt-0.5 text-sm text-gray-500">Total Events</p>
        </div>
        <div className="card p-4">
          <p className="text-2xl font-bold text-gray-900">{myEvents.filter((e) => e.status === 'published').length}</p>
          <p className="mt-0.5 text-sm text-gray-500">Published</p>
        </div>
        <div className="card p-4">
          <p className="text-2xl font-bold text-gray-900">{myEvents.filter((e) => e.status === 'draft').length}</p>
          <p className="mt-0.5 text-sm text-gray-500">Drafts</p>
        </div>
      </div>

      {myEvents.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={<CalendarDays className="h-7 w-7" />}
            title="No events yet"
            description="Create your first event to start selling tickets."
          />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {myEvents.map((evt) => (
            <div key={evt.id} className="card group overflow-hidden transition-all duration-200 hover:shadow-cardhover">
              <div className="relative h-40 overflow-hidden">
                <img src={evt.image} alt={evt.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                <div className="absolute left-3 top-3">
                  <span className={`badge ${statusColors[evt.status]} capitalize`}>{evt.status}</span>
                </div>
                <div className="absolute right-3 top-3 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    onClick={() => openEdit(evt)}
                    className="rounded-lg bg-white/90 p-2 text-gray-600 shadow-sm backdrop-blur transition hover:bg-white hover:text-brand-600"
                    aria-label="Edit event"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setDeleteId(evt.id)}
                    className="rounded-lg bg-white/90 p-2 text-gray-600 shadow-sm backdrop-blur transition hover:bg-white hover:text-error-600"
                    aria-label="Delete event"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <h3 className="truncate font-display text-base font-bold text-gray-900">{evt.title}</h3>
                <div className="mt-2 space-y-1.5">
                  <p className="flex items-center gap-1.5 text-xs text-gray-500">
                    <MapPin className="h-3.5 w-3.5 text-gray-400" />
                    {evt.venue}, {evt.location}
                  </p>
                  <p className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Calendar className="h-3.5 w-3.5 text-gray-400" />
                    {formatDate(evt.startDate)}
                  </p>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-gray-50 pt-3">
                  <div>
                    <p className="font-display text-lg font-bold text-gray-900">{formatCurrency(evt.price)}</p>
                    <p className="text-xs text-gray-400">per ticket</p>
                  </div>
                  <div className="text-right">
                    <p className="flex items-center gap-1 text-sm font-medium text-gray-700">
                      <Users className="h-3.5 w-3.5" />
                      {evt.bookedCount}/{evt.capacity}
                    </p>
                    <p className="text-xs text-gray-400">booked</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Event' : 'Create New Event'}
        description={editing ? 'Update the event details below.' : 'Fill in the details to publish a new event.'}
        size="lg"
        footer={
          <>
            <button className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button className="btn-primary" type="submit" form="event-form">
              {editing ? 'Save Changes' : 'Create Event'}
            </button>
          </>
        }
      >
        <form id="event-form" onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label" htmlFor="evt-title">
              <Tag className="mr-1 inline h-3.5 w-3.5" />
              Event Title
            </label>
            <input
              id="evt-title"
              type="text"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="input"
              placeholder="e.g. Summer Music Festival 2025"
              autoFocus
            />
          </div>

          <div>
            <label className="label" htmlFor="evt-category">Category</label>
            <select
              id="evt-category"
              value={form.categoryId}
              onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
              className="input"
            >
              <option value="">Select a category...</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="evt-start">
                <Calendar className="mr-1 inline h-3.5 w-3.5" />
                Start Date & Time
              </label>
              <input
                id="evt-start"
                type="datetime-local"
                value={form.startDate}
                onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                className="input"
              />
            </div>
            <div>
              <label className="label" htmlFor="evt-end">
                <Calendar className="mr-1 inline h-3.5 w-3.5" />
                End Date & Time
              </label>
              <input
                id="evt-end"
                type="datetime-local"
                value={form.endDate}
                onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
                className="input"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="evt-location">
                <MapPin className="mr-1 inline h-3.5 w-3.5" />
                Location (City)
              </label>
              <input
                id="evt-location"
                type="text"
                value={form.location}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                className="input"
                placeholder="e.g. Mumbai, MH"
              />
            </div>
            <div>
              <label className="label" htmlFor="evt-venue">Venue Name</label>
              <input
                id="evt-venue"
                type="text"
                value={form.venue}
                onChange={(e) => setForm((f) => ({ ...f, venue: e.target.value }))}
                className="input"
                placeholder="e.g. Jio World Convention Centre"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="evt-price">
                <IndianRupee className="mr-1 inline h-3.5 w-3.5" />
                Ticket Price (₹)
              </label>
              <input
                id="evt-price"
                type="number"
                min="0"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                className="input"
                placeholder="e.g. 1499"
              />
            </div>
            <div>
              <label className="label" htmlFor="evt-capacity">
                <Users className="mr-1 inline h-3.5 w-3.5" />
                Capacity
              </label>
              <input
                id="evt-capacity"
                type="number"
                min="1"
                value={form.capacity}
                onChange={(e) => setForm((f) => ({ ...f, capacity: e.target.value }))}
                className="input"
                placeholder="e.g. 5000"
              />
            </div>
          </div>

          <div>
            <label className="label" htmlFor="evt-desc">
              <FileText className="mr-1 inline h-3.5 w-3.5" />
              Description
            </label>
            <textarea
              id="evt-desc"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={3}
              className="input resize-none"
              placeholder="Describe your event..."
            />
          </div>

          <div>
            <label className="label" htmlFor="evt-tags">Tags (comma-separated)</label>
            <input
              id="evt-tags"
              type="text"
              value={form.tags}
              onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
              className="input"
              placeholder="e.g. festival, outdoor, live-music"
            />
          </div>

          <div>
            <label className="label">
              <ImageIcon className="mr-1 inline h-3.5 w-3.5" />
              Cover Image
            </label>
            <div className="flex gap-2">
              {defaultImages.map((img) => (
                <button
                  key={img}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, image: img }))}
                  className={`h-16 w-24 overflow-hidden rounded-lg border-2 transition ${form.image === img ? 'border-brand-500 ring-2 ring-brand-500/20' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-error-600">{error}</p>}
        </form>
      </Modal>

      <ConfirmDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={() => { if (deleteId) deleteEvent(deleteId); }}
        title="Delete Event"
        message="Are you sure you want to delete this event? This action cannot be undone and all associated bookings will be affected."
        confirmLabel="Delete"
      />
    </div>
  );
}
