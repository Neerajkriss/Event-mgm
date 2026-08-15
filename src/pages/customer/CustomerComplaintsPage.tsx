import { useState, useMemo } from 'react';
import {
  MessageSquareWarning, Send, Mail, Calendar, Tag, Reply,
  AlertCircle, CheckCircle2, Clock, XCircle, Plus,
} from 'lucide-react';
import { useAppData } from '@/context/AppDataContext';
import { useAuth } from '@/context/AuthContext';
import type { Complaint } from '@/types';
import PageHeader from '@/components/ui/PageHeader';
import Modal from '@/components/ui/Modal';
import EmptyState from '@/components/ui/EmptyState';
import { formatDateTime, formatTimeAgo } from '@/lib/format';

const statusConfig: Record<Complaint['status'], { label: string; color: string; icon: typeof Clock }> = {
  open: { label: 'Open', color: 'bg-error-100 text-error-700', icon: AlertCircle },
  'in-progress': { label: 'In Progress', color: 'bg-warning-100 text-warning-700', icon: Clock },
  resolved: { label: 'Resolved', color: 'bg-success-100 text-success-700', icon: CheckCircle2 },
  dismissed: { label: 'Dismissed', color: 'bg-gray-100 text-gray-600', icon: XCircle },
};

const categoryOptions: { value: Complaint['category']; label: string }[] = [
  { value: 'payment', label: 'Payment Issue' },
  { value: 'event-quality', label: 'Event Quality' },
  { value: 'organizer', label: 'Organizer Issue' },
  { value: 'venue', label: 'Venue Issue' },
  { value: 'other', label: 'Other' },
];

const emptyForm = {
  subject: '',
  description: '',
  category: '' as Complaint['category'] | '',
  eventId: '',
};

export default function CustomerComplaintsPage() {
  const { complaints, events, addComplaint } = useAppData();
  const { user } = useAuth();

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const myComplaints = useMemo(
    () => complaints.filter((c) => c.userId === user?.id).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [complaints, user],
  );

  const openCreate = () => {
    setForm(emptyForm);
    setError('');
    setSuccess(false);
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.subject.trim().length < 5) {
      setError('Subject must be at least 5 characters.');
      return;
    }
    if (form.description.trim().length < 10) {
      setError('Description must be at least 10 characters.');
      return;
    }
    if (!form.category) {
      setError('Please select a complaint category.');
      return;
    }

    const selectedEvent = form.eventId ? events.find((ev) => ev.id === form.eventId) : undefined;
    addComplaint({
      subject: form.subject.trim(),
      description: form.description.trim(),
      category: form.category as Complaint['category'],
      userId: user?.id ?? '',
      userName: user?.name ?? '',
      userEmail: user?.email ?? '',
      eventId: selectedEvent?.id,
      eventTitle: selectedEvent?.title,
      priority: 'medium',
      status: 'open',
    });
    setSuccess(true);
    setTimeout(() => {
      setModalOpen(false);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Support & Complaints"
        description="File a complaint and track responses from our support team."
        icon={<MessageSquareWarning className="h-5 w-5" />}
        action={
          <button className="btn-primary" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            File Complaint
          </button>
        }
      />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        {(['open', 'in-progress', 'resolved', 'dismissed'] as Complaint['status'][]).map((s) => {
          const config = statusConfig[s];
          const Icon = config.icon;
          const count = myComplaints.filter((c) => c.status === s).length;
          return (
            <div key={s} className="card p-4">
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${config.color}`}>
                <Icon className="h-4 w-4" />
              </div>
              <p className="mt-3 text-2xl font-bold text-gray-900">{count}</p>
              <p className="mt-0.5 text-sm text-gray-500">{config.label}</p>
            </div>
          );
        })}
      </div>

      {/* Complaint list */}
      {myComplaints.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={<MessageSquareWarning className="h-7 w-7" />}
            title="No complaints filed"
            description="If you have an issue with an event or booking, file a complaint and our team will respond."
          />
        </div>
      ) : (
        <div className="space-y-3">
          {myComplaints.map((c) => {
            const config = statusConfig[c.status];
            const Icon = config.icon;
            const isExpanded = expandedId === c.id;
            return (
              <div key={c.id} className="card overflow-hidden transition-all hover:shadow-cardhover">
                <button
                  onClick={() => setExpandedId(isExpanded ? null : c.id)}
                  className="flex w-full items-center gap-4 p-5 text-left"
                >
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${config.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate font-display text-base font-semibold text-gray-900">{c.subject}</h3>
                      <span className={`badge ${config.color} shrink-0`}>{config.label}</span>
                    </div>
                    <p className={`mt-1 text-sm text-gray-500 ${isExpanded ? '' : 'line-clamp-1'}`}>{c.description}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Tag className="h-3 w-3" />
                        {categoryOptions.find((o) => o.value === c.category)?.label}
                      </span>
                      {c.eventTitle && <span>{c.eventTitle}</span>}
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatTimeAgo(c.createdAt)}
                      </span>
                    </div>
                  </div>
                </button>

                {/* Expanded view with admin response */}
                {isExpanded && (
                  <div className="border-t border-gray-100 p-5">
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Full Description</p>
                        <p className="mt-1 text-sm leading-relaxed text-gray-600">{c.description}</p>
                      </div>

                      <div className="flex flex-wrap gap-3 text-xs text-gray-400 border-t border-gray-50 pt-3">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {c.userEmail}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Filed {formatDateTime(c.createdAt)}
                        </span>
                        {c.updatedAt !== c.createdAt && (
                          <span>Updated {formatDateTime(c.updatedAt)}</span>
                        )}
                      </div>

                      {c.response ? (
                        <div className="rounded-lg bg-success-50 p-4">
                          <p className="flex items-center gap-2 text-sm font-semibold text-success-700">
                            <Reply className="h-4 w-4" />
                            Support Response
                          </p>
                          <p className="mt-2 text-sm leading-relaxed text-gray-600">{c.response}</p>
                          <p className="mt-2 text-xs text-gray-400">Responded {formatTimeAgo(c.updatedAt)}</p>
                        </div>
                      ) : (
                        <div className="rounded-lg bg-gray-50 p-4 text-center">
                          <p className="text-sm text-gray-400">
                            {c.status === 'open'
                              ? 'Your complaint is awaiting a response from our support team.'
                              : 'No response yet.'}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* File complaint modal */}
      <Modal
        open={modalOpen && !success}
        onClose={() => setModalOpen(false)}
        title="File a Complaint"
        description="Tell us about the issue you're experiencing."
        footer={
          <>
            <button className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button className="btn-primary" type="submit" form="complaint-form">
              <Send className="h-4 w-4" />
              Submit Complaint
            </button>
          </>
        }
      >
        <form id="complaint-form" onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label" htmlFor="cmp-subject">Subject</label>
            <input
              id="cmp-subject"
              type="text"
              value={form.subject}
              onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
              className="input"
              placeholder="Brief summary of the issue"
              autoFocus
            />
          </div>

          <div>
            <label className="label" htmlFor="cmp-category">Category</label>
            <select
              id="cmp-category"
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as Complaint['category'] | '' }))}
              className="input"
            >
              <option value="">Select a category...</option>
              {categoryOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label" htmlFor="cmp-event">Related Event (optional)</label>
            <select
              id="cmp-event"
              value={form.eventId}
              onChange={(e) => setForm((f) => ({ ...f, eventId: e.target.value }))}
              className="input"
            >
              <option value="">No specific event</option>
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>{ev.title}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label" htmlFor="cmp-desc">Description</label>
            <textarea
              id="cmp-desc"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={4}
              className="input resize-none"
              placeholder="Provide detailed information about your issue..."
            />
          </div>

          {error && <p className="text-sm text-error-600">{error}</p>}
        </form>
      </Modal>

      {/* Success modal */}
      <Modal
        open={success}
        onClose={() => { setSuccess(false); setModalOpen(false); }}
        title="Complaint Filed!"
        size="sm"
        footer={
          <button className="btn-primary" onClick={() => { setSuccess(false); setModalOpen(false); }}>Done</button>
        }
      >
        <div className="flex flex-col items-center py-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-success-100 text-success-600">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <p className="mt-4 text-sm text-gray-600">
            Your complaint has been submitted. Our support team will review it and respond as soon as possible.
          </p>
        </div>
      </Modal>
    </div>
  );
}
