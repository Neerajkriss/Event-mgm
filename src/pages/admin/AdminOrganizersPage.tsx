import { useState } from 'react';
import {
  UserCheck, Check, X, Mail, Phone, Building2, Clock,
} from 'lucide-react';
import { useAppData } from '@/context/AppDataContext';
import type { OrganizerRequest } from '@/types';
import PageHeader from '@/components/ui/PageHeader';
import EmptyState from '@/components/ui/EmptyState';
import { formatDate, formatTimeAgo } from '@/lib/format';

type Tab = 'pending' | 'accepted' | 'rejected';

const tabs: { id: Tab; label: string }[] = [
  { id: 'pending', label: 'Pending' },
  { id: 'accepted', label: 'Accepted' },
  { id: 'rejected', label: 'Rejected' },
];

const statusBadge: Record<OrganizerRequest['status'], string> = {
  pending: 'bg-warning-100 text-warning-700',
  accepted: 'bg-success-100 text-success-700',
  rejected: 'bg-error-100 text-error-700',
};

export default function AdminOrganizersPage() {
  const { organizerRequests, updateOrganizerRequest } = useAppData();
  const [tab, setTab] = useState<Tab>('pending');

  const counts = {
    pending: organizerRequests.filter((r) => r.status === 'pending').length,
    accepted: organizerRequests.filter((r) => r.status === 'accepted').length,
    rejected: organizerRequests.filter((r) => r.status === 'rejected').length,
  };

  const filtered = organizerRequests.filter((r) => r.status === tab);

  const handleAction = (req: OrganizerRequest, action: 'accepted' | 'rejected') => {
    updateOrganizerRequest(req.id, { status: action, reviewedAt: new Date().toISOString() });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Organizer Management"
        description="Review and approve event organizer applications. Accept or reject pending requests."
        icon={<UserCheck className="h-5 w-5" />}
      />

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-md py-2 text-sm font-semibold transition-all ${
              tab === t.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
            <span className={`badge ${tab === t.id ? 'bg-brand-100 text-brand-700' : 'bg-gray-200 text-gray-600'}`}>
              {counts[t.id]}
            </span>
          </button>
        ))}
      </div>

      {/* Request cards */}
      {filtered.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={<UserCheck className="h-7 w-7" />}
            title={`No ${tab} requests`}
            description={tab === 'pending' ? 'New organizer applications will appear here.' : `No ${tab} organizers at this time.`}
          />
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {filtered.map((req) => (
            <div key={req.id} className="card p-5 transition-all duration-200 hover:shadow-cardhover">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-sm font-bold text-white">
                    {req.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-display text-base font-bold text-gray-900">{req.name}</h3>
                    <p className="text-xs text-gray-500">{req.company}</p>
                  </div>
                </div>
                <span className={`badge ${statusBadge[req.status]} capitalize`}>{req.status}</span>
              </div>

              <p className="mt-4 text-sm text-gray-600">{req.description}</p>

              <div className="mt-4 space-y-2 border-t border-gray-50 pt-4">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Mail className="h-4 w-4 text-gray-400" />
                  {req.email}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Phone className="h-4 w-4 text-gray-400" />
                  {req.phone}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Building2 className="h-4 w-4 text-gray-400" />
                  {req.company}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock className="h-4 w-4 text-gray-400" />
                  Submitted {formatTimeAgo(req.submittedAt)}
                  {req.reviewedAt && <span className="text-gray-400">· Reviewed {formatDate(req.reviewedAt)}</span>}
                </div>
              </div>

              {req.status === 'pending' && (
                <div className="mt-4 flex gap-3 border-t border-gray-50 pt-4">
                  <button
                    onClick={() => handleAction(req, 'accepted')}
                    className="btn-primary flex-1"
                  >
                    <Check className="h-4 w-4" />
                    Accept
                  </button>
                  <button
                    onClick={() => handleAction(req, 'rejected')}
                    className="btn-danger flex-1"
                  >
                    <X className="h-4 w-4" />
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
