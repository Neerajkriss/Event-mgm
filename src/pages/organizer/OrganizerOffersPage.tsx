import { useState } from 'react';
import {
  BadgePercent, Plus, Trash2, Calendar, Ticket, TrendingUp, Copy,
} from 'lucide-react';
import { useAppData } from '@/context/AppDataContext';
import { useAuth } from '@/context/AuthContext';
import type { Offer } from '@/types';
import PageHeader from '@/components/ui/PageHeader';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import EmptyState from '@/components/ui/EmptyState';
import { formatDate } from '@/lib/format';

const statusColors: Record<Offer['status'], string> = {
  active: 'bg-success-100 text-success-700',
  expired: 'bg-gray-100 text-gray-600',
  disabled: 'bg-error-100 text-error-700',
};

const emptyForm = {
  title: '',
  description: '',
  eventId: '',
  discountPercent: '',
  code: '',
  validUntil: '',
  maxUses: '',
};

export default function OrganizerOffersPage() {
  const { offers, events, addOffer, deleteOffer } = useAppData();
  const { user } = useAuth();

  const myEventIds = new Set(events.filter((e) => e.organizerId === user?.id).map((e) => e.id));
  const myEvents = events.filter((e) => e.organizerId === user?.id);
  const myOffers = offers.filter((o) => myEventIds.has(o.eventId));

  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [copiedCode, setCopiedCode] = useState('');

  const openCreate = () => {
    setForm({ ...emptyForm, eventId: myEvents[0]?.id ?? '' });
    setError('');
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.title.trim().length < 3) {
      setError('Offer title must be at least 3 characters.');
      return;
    }
    if (!form.eventId) {
      setError('Please select an event.');
      return;
    }
    if (Number(form.discountPercent) < 1 || Number(form.discountPercent) > 100) {
      setError('Discount percentage must be between 1 and 100.');
      return;
    }
    if (form.code.trim().length < 3) {
      setError('Discount code must be at least 3 characters.');
      return;
    }
    if (!form.validUntil) {
      setError('Please set an expiry date.');
      return;
    }

    const selectedEvent = myEvents.find((ev) => ev.id === form.eventId);
    addOffer({
      title: form.title.trim(),
      description: form.description.trim(),
      eventId: form.eventId,
      eventTitle: selectedEvent?.title ?? '',
      discountPercent: Number(form.discountPercent),
      code: form.code.trim().toUpperCase(),
      validFrom: new Date().toISOString(),
      validUntil: new Date(form.validUntil).toISOString(),
      maxUses: Number(form.maxUses) || 100,
      usedCount: 0,
      status: 'active',
    });
    setModalOpen(false);
  };

  const copyCode = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Offers & Discounts"
        description="Create and manage promotional discount codes for your events."
        icon={<BadgePercent className="h-5 w-5" />}
        action={
          <button className="btn-primary" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Create Offer
          </button>
        }
      />

      {myOffers.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={<BadgePercent className="h-7 w-7" />}
            title="No offers yet"
            description="Create discount codes to boost ticket sales for your events."
          />
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {myOffers.map((offer) => (
            <div key={offer.id} className="card group p-5 transition-all duration-200 hover:shadow-cardhover">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-accent-500 to-accent-700 text-white shadow-sm">
                    <BadgePercent className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-display text-base font-bold text-gray-900">{offer.title}</h3>
                    <p className="text-xs text-gray-500">{offer.eventTitle}</p>
                  </div>
                </div>
                <span className={`badge ${statusColors[offer.status]} capitalize`}>{offer.status}</span>
              </div>

              <p className="mt-3 text-sm text-gray-600">{offer.description}</p>

              {/* Discount code */}
              <div className="mt-4 flex items-center gap-2">
                <div className="flex-1 rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 px-3 py-2">
                  <p className="text-xs text-gray-400">Discount Code</p>
                  <p className="font-mono text-sm font-bold tracking-wider text-gray-900">{offer.code}</p>
                </div>
                <button
                  onClick={() => copyCode(offer.code)}
                  className="rounded-lg border border-gray-200 p-2.5 text-gray-500 transition hover:bg-gray-50 hover:text-brand-600"
                  aria-label="Copy code"
                >
                  <Copy className="h-4 w-4" />
                </button>
                {copiedCode === offer.code && (
                  <span className="text-xs font-medium text-success-600">Copied!</span>
                )}
              </div>

              {/* Stats */}
              <div className="mt-4 grid grid-cols-3 gap-3 border-t border-gray-50 pt-4">
                <div>
                  <p className="flex items-center gap-1 text-xs text-gray-400">
                    <TrendingUp className="h-3 w-3" />
                    Discount
                  </p>
                  <p className="mt-0.5 font-bold text-gray-900">{offer.discountPercent}%</p>
                </div>
                <div>
                  <p className="flex items-center gap-1 text-xs text-gray-400">
                    <Ticket className="h-3 w-3" />
                    Used
                  </p>
                  <p className="mt-0.5 font-bold text-gray-900">{offer.usedCount}/{offer.maxUses}</p>
                </div>
                <div>
                  <p className="flex items-center gap-1 text-xs text-gray-400">
                    <Calendar className="h-3 w-3" />
                    Expires
                  </p>
                  <p className="mt-0.5 font-medium text-gray-700">{formatDate(offer.validUntil)}</p>
                </div>
              </div>

              {/* Usage bar */}
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-accent-400 to-accent-600 transition-all duration-500"
                  style={{ width: `${Math.min((offer.usedCount / offer.maxUses) * 100, 100)}%` }}
                />
              </div>

              {/* Delete */}
              <div className="mt-4 flex justify-end border-t border-gray-50 pt-3">
                <button
                  onClick={() => setDeleteId(offer.id)}
                  className="rounded-lg p-2 text-gray-400 transition hover:bg-error-50 hover:text-error-600"
                  aria-label="Delete offer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create New Offer"
        description="Set up a discount code for one of your events."
        footer={
          <>
            <button className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button className="btn-primary" type="submit" form="offer-form">Create Offer</button>
          </>
        }
      >
        <form id="offer-form" onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label" htmlFor="offer-title">Offer Title</label>
            <input
              id="offer-title"
              type="text"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="input"
              placeholder="e.g. Early Bird 20% Off"
              autoFocus
            />
          </div>

          <div>
            <label className="label" htmlFor="offer-desc">Description</label>
            <textarea
              id="offer-desc"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={2}
              className="input resize-none"
              placeholder="Brief description of the offer"
            />
          </div>

          <div>
            <label className="label" htmlFor="offer-event">Applicable Event</label>
            <select
              id="offer-event"
              value={form.eventId}
              onChange={(e) => setForm((f) => ({ ...f, eventId: e.target.value }))}
              className="input"
            >
              <option value="">Select an event...</option>
              {myEvents.map((ev) => (
                <option key={ev.id} value={ev.id}>{ev.title}</option>
              ))}
            </select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="offer-percent">Discount Percentage (%)</label>
              <input
                id="offer-percent"
                type="number"
                min="1"
                max="100"
                value={form.discountPercent}
                onChange={(e) => setForm((f) => ({ ...f, discountPercent: e.target.value }))}
                className="input"
                placeholder="e.g. 20"
              />
            </div>
            <div>
              <label className="label" htmlFor="offer-code">Discount Code</label>
              <input
                id="offer-code"
                type="text"
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                className="input font-mono uppercase"
                placeholder="e.g. EARLY20"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="offer-expiry">Expiry Date</label>
              <input
                id="offer-expiry"
                type="date"
                value={form.validUntil}
                onChange={(e) => setForm((f) => ({ ...f, validUntil: e.target.value }))}
                className="input"
              />
            </div>
            <div>
              <label className="label" htmlFor="offer-max">Max Uses</label>
              <input
                id="offer-max"
                type="number"
                min="1"
                value={form.maxUses}
                onChange={(e) => setForm((f) => ({ ...f, maxUses: e.target.value }))}
                className="input"
                placeholder="e.g. 500"
              />
            </div>
          </div>

          {error && <p className="text-sm text-error-600">{error}</p>}
        </form>
      </Modal>

      <ConfirmDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={() => { if (deleteId) deleteOffer(deleteId); }}
        title="Delete Offer"
        message="Are you sure you want to delete this discount code? This action cannot be undone."
        confirmLabel="Delete"
      />
    </div>
  );
}
