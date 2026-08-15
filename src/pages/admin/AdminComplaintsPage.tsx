import { useState } from 'react';
import {
  MessageSquareWarning, Send, AlertCircle, Mail, Calendar,
  Tag, ChevronRight, Reply,
} from 'lucide-react';
import { useAppData } from '@/context/AppDataContext';
import type { Complaint } from '@/types';
import PageHeader from '@/components/ui/PageHeader';
import Modal from '@/components/ui/Modal';
import EmptyState from '@/components/ui/EmptyState';
import { formatDateTime, formatTimeAgo } from '@/lib/format';

const statusColors: Record<Complaint['status'], string> = {
  open: 'bg-error-100 text-error-700',
  'in-progress': 'bg-warning-100 text-warning-700',
  resolved: 'bg-success-100 text-success-700',
  dismissed: 'bg-gray-100 text-gray-600',
};

const priorityColors: Record<Complaint['priority'], string> = {
  high: 'bg-error-50 text-error-600',
  medium: 'bg-warning-50 text-warning-600',
  low: 'bg-gray-100 text-gray-600',
};

const categoryLabels: Record<Complaint['category'], string> = {
  payment: 'Payment Issue',
  'event-quality': 'Event Quality',
  organizer: 'Organizer Issue',
  venue: 'Venue Issue',
  other: 'Other',
};

export default function AdminComplaintsPage() {
  const { complaints, updateComplaint } = useAppData();
  const [selected, setSelected] = useState<Complaint | null>(null);
  const [response, setResponse] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | Complaint['status']>('all');
  const [sending, setSending] = useState(false);

  const filtered = complaints.filter((c) => statusFilter === 'all' || c.status === statusFilter);

  const filters: { id: 'all' | Complaint['status']; label: string; count: number }[] = [
    { id: 'all', label: 'All', count: complaints.length },
    { id: 'open', label: 'Open', count: complaints.filter((c) => c.status === 'open').length },
    { id: 'in-progress', label: 'In Progress', count: complaints.filter((c) => c.status === 'in-progress').length },
    { id: 'resolved', label: 'Resolved', count: complaints.filter((c) => c.status === 'resolved').length },
    { id: 'dismissed', label: 'Dismissed', count: complaints.filter((c) => c.status === 'dismissed').length },
  ];

  const openDetail = (c: Complaint) => {
    setSelected(c);
    setResponse(c.response ?? '');
  };

  const handleSendResponse = () => {
    if (!selected || response.trim().length < 5) return;
    setSending(true);
    setTimeout(() => {
      const newStatus = selected.status === 'open' ? 'in-progress' : selected.status;
      updateComplaint(selected.id, { response: response.trim(), status: newStatus });
      setSelected((prev) => prev ? { ...prev, response: response.trim(), status: newStatus, updatedAt: new Date().toISOString() } : prev);
      setSending(false);
    }, 300);
  };

  const handleStatusChange = (status: Complaint['status']) => {
    if (!selected) return;
    updateComplaint(selected.id, { status });
    setSelected((prev) => prev ? { ...prev, status } : prev);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Complaints & Support"
        description="Review user complaints, send responses, and update complaint status."
        icon={<MessageSquareWarning className="h-5 w-5" />}
      />

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-1 rounded-lg bg-gray-100 p-1">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setStatusFilter(f.id)}
            className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition-all ${
              statusFilter === f.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {f.label}
            <span className={`badge ${statusFilter === f.id ? 'bg-brand-100 text-brand-700' : 'bg-gray-200 text-gray-600'}`}>
              {f.count}
            </span>
          </button>
        ))}
      </div>

      {/* Complaint list */}
      {filtered.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={<MessageSquareWarning className="h-7 w-7" />}
            title="No complaints found"
            description="Complaints matching this filter will appear here."
          />
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((c) => (
            <button
              key={c.id}
              onClick={() => openDetail(c)}
              className="card group flex w-full items-center gap-4 p-5 text-left transition-all hover:shadow-cardhover"
            >
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${priorityColors[c.priority]}`}>
                <AlertCircle className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="truncate font-display text-base font-semibold text-gray-900 group-hover:text-brand-700">{c.subject}</h3>
                  <span className={`badge ${statusColors[c.status]} capitalize`}>{c.status.replace('-', ' ')}</span>
                </div>
                <p className="mt-1 truncate text-sm text-gray-500">{c.description}</p>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{c.userName}</span>
                  <span className="flex items-center gap-1"><Tag className="h-3 w-3" />{categoryLabels[c.category]}</span>
                  {c.eventTitle && <span className="truncate">{c.eventTitle}</span>}
                  <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{formatTimeAgo(c.createdAt)}</span>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 shrink-0 text-gray-300 transition group-hover:text-brand-500" />
            </button>
          ))}
        </div>
      )}

      {/* Detail modal */}
      <Modal
        open={selected !== null}
        onClose={() => setSelected(null)}
        title={selected?.subject ?? ''}
        size="lg"
        footer={
          selected ? (
            <>
              <button className="btn-secondary" onClick={() => setSelected(null)}>Close</button>
              <button
                className="btn-primary"
                onClick={handleSendResponse}
                disabled={response.trim().length < 5 || sending}
              >
                {sending ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Send Response
              </button>
            </>
          ) : null
        }
      >
        {selected && (
          <div className="space-y-5">
            {/* Meta */}
            <div className="flex flex-wrap gap-2">
              <span className={`badge ${statusColors[selected.status]} capitalize`}>{selected.status.replace('-', ' ')}</span>
              <span className={`badge ${priorityColors[selected.priority]} capitalize`}>{selected.priority} priority</span>
              <span className="badge bg-gray-100 text-gray-600">{categoryLabels[selected.category]}</span>
            </div>

            {/* User info */}
            <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100 text-sm font-bold text-brand-700">
                {selected.userName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-900">{selected.userName}</p>
                <p className="truncate text-xs text-gray-500">{selected.userEmail}</p>
              </div>
              <span className="text-xs text-gray-400">{formatDateTime(selected.createdAt)}</span>
            </div>

            {/* Event info */}
            {selected.eventTitle && (
              <div className="rounded-lg border border-gray-100 bg-brand-50/30 p-3">
                <p className="text-xs font-medium text-gray-500">Related Event</p>
                <p className="mt-0.5 text-sm font-semibold text-gray-900">{selected.eventTitle}</p>
              </div>
            )}

            {/* Description */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700">Complaint Details</h4>
              <p className="mt-2 rounded-lg bg-gray-50 p-4 text-sm leading-relaxed text-gray-600">{selected.description}</p>
            </div>

            {/* Previous response */}
            {selected.response && (
              <div>
                <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Reply className="h-4 w-4" />
                  Previous Response
                </h4>
                <p className="mt-2 rounded-lg bg-success-50 p-4 text-sm leading-relaxed text-gray-600">{selected.response}</p>
              </div>
            )}

            {/* Response form */}
            <div>
              <label className="label" htmlFor="response">Admin Response</label>
              <textarea
                id="response"
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                placeholder="Type your response to the user..."
                rows={4}
                className="input resize-none"
              />
              <p className="mt-1 text-xs text-gray-400">Minimum 5 characters. Sending will set status to "In Progress" if currently open.</p>
            </div>

            {/* Status changer */}
            <div className="flex items-center gap-2 border-t border-gray-100 pt-4">
              <span className="text-sm font-medium text-gray-600">Update status:</span>
              {(['open', 'in-progress', 'resolved', 'dismissed'] as Complaint['status'][]).map((s) => (
                <button
                  key={s}
                  onClick={() => handleStatusChange(s)}
                  className={`rounded-md px-3 py-1 text-xs font-medium transition capitalize ${
                    selected.status === s
                      ? 'bg-brand-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {s.replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
