import { useState, useMemo } from 'react';
import {
  ClipboardList, Check, X, Mail, Calendar, Ticket, Search,
} from 'lucide-react';
import { useAppData } from '@/context/AppDataContext';
import { useAuth } from '@/context/AuthContext';
import type { Booking } from '@/types';
import PageHeader from '@/components/ui/PageHeader';
import EmptyState from '@/components/ui/EmptyState';
import { formatCurrency, formatDateTime, formatTimeAgo } from '@/lib/format';

type Filter = 'all' | 'pending' | 'confirmed' | 'cancelled' | 'attended';

const statusColors: Record<Booking['status'], string> = {
  pending: 'bg-warning-100 text-warning-700',
  confirmed: 'bg-success-100 text-success-700',
  attended: 'bg-brand-100 text-brand-700',
  cancelled: 'bg-error-100 text-error-700',
};

export default function OrganizerBookingsPage() {
  const { events, bookings, updateBooking } = useAppData();
  const { user } = useAuth();
  const [filter, setFilter] = useState<Filter>('pending');
  const [search, setSearch] = useState('');

  const myEventIds = useMemo(
    () => new Set(events.filter((e) => e.organizerId === user?.id).map((e) => e.id)),
    [events, user],
  );

  const myBookings = useMemo(
    () => bookings.filter((b) => myEventIds.has(b.eventId)),
    [bookings, myEventIds],
  );

  const filtered = useMemo(() => {
    return myBookings.filter((b) => {
      const matchesFilter = filter === 'all' || b.status === filter;
      const matchesSearch =
        b.userName.toLowerCase().includes(search.toLowerCase()) ||
        b.eventTitle.toLowerCase().includes(search.toLowerCase()) ||
        b.userEmail.toLowerCase().includes(search.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [myBookings, filter, search]);

  const counts = {
    all: myBookings.length,
    pending: myBookings.filter((b) => b.status === 'pending').length,
    confirmed: myBookings.filter((b) => b.status === 'confirmed').length,
    attended: myBookings.filter((b) => b.status === 'attended').length,
    cancelled: myBookings.filter((b) => b.status === 'cancelled').length,
  };

  const filters: { id: Filter; label: string; count: number }[] = [
    { id: 'all', label: 'All', count: counts.all },
    { id: 'pending', label: 'Pending', count: counts.pending },
    { id: 'confirmed', label: 'Confirmed', count: counts.confirmed },
    { id: 'attended', label: 'Attended', count: counts.attended },
    { id: 'cancelled', label: 'Cancelled', count: counts.cancelled },
  ];

  const handleAction = (booking: Booking, action: 'confirmed' | 'cancelled') => {
    updateBooking(booking.id, { status: action });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Booking Requests"
        description="Review and manage customer booking requests for your events."
        icon={<ClipboardList className="h-5 w-5" />}
      />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900">{counts.pending}</p>
              <p className="mt-0.5 text-sm text-gray-500">Pending Review</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning-100 text-warning-600">
              <ClipboardList className="h-5 w-5" />
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900">{counts.confirmed}</p>
              <p className="mt-0.5 text-sm text-gray-500">Confirmed</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success-100 text-success-600">
              <Check className="h-5 w-5" />
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900">{counts.attended}</p>
              <p className="mt-0.5 text-sm text-gray-500">Attended</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100 text-brand-600">
              <Ticket className="h-5 w-5" />
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900">{myBookings.reduce((s, b) => s + b.tickets, 0)}</p>
              <p className="mt-0.5 text-sm text-gray-500">Total Tickets</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-100 text-accent-600">
              <Calendar className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter + search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1 rounded-lg bg-gray-100 p-1">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-semibold transition ${
                filter === f.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {f.label}
              <span className={`badge ${filter === f.id ? 'bg-brand-100 text-brand-700' : 'bg-gray-200 text-gray-600'}`}>
                {f.count}
              </span>
            </button>
          ))}
        </div>
        <div className="relative sm:w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search bookings..."
            className="input pl-10"
          />
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={<ClipboardList className="h-7 w-7" />}
            title="No booking requests"
            description="Booking requests for your events will appear here."
          />
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="px-5 py-3 font-semibold text-gray-600">Customer</th>
                  <th className="hidden px-5 py-3 font-semibold text-gray-600 sm:table-cell">Event</th>
                  <th className="px-5 py-3 text-center font-semibold text-gray-600">Tickets</th>
                  <th className="hidden px-5 py-3 font-semibold text-gray-600 md:table-cell">Amount</th>
                  <th className="hidden px-5 py-3 font-semibold text-gray-600 lg:table-cell">Booked</th>
                  <th className="px-5 py-3 font-semibold text-gray-600">Status</th>
                  <th className="px-5 py-3 text-right font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((b) => (
                  <tr key={b.id} className="transition hover:bg-gray-50/50">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-xs font-bold text-brand-700">
                          {b.userName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-gray-900">{b.userName}</p>
                          <p className="flex items-center gap-1 truncate text-xs text-gray-400">
                            <Mail className="h-3 w-3" />
                            {b.userEmail}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="hidden px-5 py-3.5 text-gray-600 sm:table-cell">
                      <p className="truncate">{b.eventTitle}</p>
                    </td>
                    <td className="px-5 py-3.5 text-center font-medium text-gray-700">{b.tickets}</td>
                    <td className="hidden px-5 py-3.5 font-semibold text-gray-900 md:table-cell">{formatCurrency(b.totalPrice)}</td>
                    <td className="hidden px-5 py-3.5 text-gray-500 lg:table-cell">{formatTimeAgo(b.createdAt)}</td>
                    <td className="px-5 py-3.5">
                      <span className={`badge ${statusColors[b.status]} capitalize`}>{b.status}</span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {b.status === 'pending' ? (
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => handleAction(b, 'confirmed')}
                            className="rounded-lg bg-success-50 p-2 text-success-600 transition hover:bg-success-100"
                            aria-label="Accept booking"
                            title="Accept"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleAction(b, 'cancelled')}
                            className="rounded-lg bg-error-50 p-2 text-error-600 transition hover:bg-error-100"
                            aria-label="Reject booking"
                            title="Reject"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">{formatDateTime(b.createdAt)}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
