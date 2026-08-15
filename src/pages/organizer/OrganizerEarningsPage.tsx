import { useMemo } from 'react';
import {
  Wallet, IndianRupee, CheckCircle2, Clock, TrendingUp, Ticket,
  Calendar, ArrowUpRight,
} from 'lucide-react';
import { useAppData } from '@/context/AppDataContext';
import { useAuth } from '@/context/AuthContext';
import type { Booking } from '@/types';
import PageHeader from '@/components/ui/PageHeader';
import EmptyState from '@/components/ui/EmptyState';
import { formatCurrency, formatDate } from '@/lib/format';

const statusColors: Record<Booking['status'], string> = {
  confirmed: 'bg-success-100 text-success-700',
  attended: 'bg-brand-100 text-brand-700',
  pending: 'bg-warning-100 text-warning-700',
  cancelled: 'bg-error-100 text-error-700',
};

export default function OrganizerEarningsPage() {
  const { events, bookings } = useAppData();
  const { user } = useAuth();

  const myEventIds = useMemo(
    () => new Set(events.filter((e) => e.organizerId === user?.id).map((e) => e.id)),
    [events, user],
  );

  const myBookings = useMemo(
    () => bookings.filter((b) => myEventIds.has(b.eventId)),
    [bookings, myEventIds],
  );

  const stats = useMemo(() => {
    const paid = myBookings.filter((b) => b.status === 'confirmed' || b.status === 'attended');
    const totalEarnings = paid.reduce((s, b) => s + b.totalPrice, 0);
    const confirmedCount = paid.length;
    const pendingBookings = myBookings.filter((b) => b.status === 'pending');
    const pendingPayouts = pendingBookings.reduce((s, b) => s + b.totalPrice, 0);
    const totalTickets = paid.reduce((s, b) => s + b.tickets, 0);
    const avgBookingValue = paid.length > 0 ? Math.round(totalEarnings / paid.length) : 0;
    return { totalEarnings, confirmedCount, pendingPayouts, pendingCount: pendingBookings.length, totalTickets, avgBookingValue };
  }, [myBookings]);

  const perEventEarnings = useMemo(() => {
    return events
      .filter((e) => myEventIds.has(e.id))
      .map((evt) => {
        const evtPaid = myBookings.filter((b) => b.eventId === evt.id && (b.status === 'confirmed' || b.status === 'attended'));
        const revenue = evtPaid.reduce((s, b) => s + b.totalPrice, 0);
        const tickets = evtPaid.reduce((s, b) => s + b.tickets, 0);
        return { event: evt, revenue, tickets, bookingCount: evtPaid.length };
      })
      .filter((r) => r.bookingCount > 0)
      .sort((a, b) => b.revenue - a.revenue);
  }, [events, myBookings, myEventIds]);

  const paidBookings = myBookings
    .filter((b) => b.status === 'confirmed' || b.status === 'attended')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const maxRevenue = perEventEarnings.length > 0 ? perEventEarnings[0].revenue : 1;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Earnings & Payments"
        description="Track your revenue, monitor payouts, and review transaction history."
        icon={<Wallet className="h-5 w-5" />}
      />

      {/* Metric cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card p-5 transition-all hover:shadow-cardhover">
          <div className="flex items-start justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-success-100 text-success-600">
              <IndianRupee className="h-5 w-5" />
            </div>
            <span className="badge bg-success-50 text-success-700">
              <ArrowUpRight className="h-3 w-3" />
              +15%
            </span>
          </div>
          <p className="mt-4 text-2xl font-bold tracking-tight text-gray-900">{formatCurrency(stats.totalEarnings)}</p>
          <p className="mt-1 text-sm text-gray-500">Total Earnings</p>
          <p className="mt-0.5 text-xs text-gray-400">{stats.confirmedCount} confirmed bookings</p>
        </div>

        <div className="card p-5 transition-all hover:shadow-cardhover">
          <div className="flex items-start justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-100 text-brand-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-4 text-2xl font-bold tracking-tight text-gray-900">{stats.confirmedCount}</p>
          <p className="mt-1 text-sm text-gray-500">Confirmed Bookings</p>
          <p className="mt-0.5 text-xs text-gray-400">{stats.totalTickets} tickets sold</p>
        </div>

        <div className="card p-5 transition-all hover:shadow-cardhover">
          <div className="flex items-start justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-warning-100 text-warning-600">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-4 text-2xl font-bold tracking-tight text-gray-900">{formatCurrency(stats.pendingPayouts)}</p>
          <p className="mt-1 text-sm text-gray-500">Pending Payouts</p>
          <p className="mt-0.5 text-xs text-gray-400">{stats.pendingCount} pending bookings</p>
        </div>

        <div className="card p-5 transition-all hover:shadow-cardhover">
          <div className="flex items-start justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-100 text-accent-600">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-4 text-2xl font-bold tracking-tight text-gray-900">{formatCurrency(stats.avgBookingValue)}</p>
          <p className="mt-1 text-sm text-gray-500">Avg. Booking Value</p>
          <p className="mt-0.5 text-xs text-gray-400">Per confirmed transaction</p>
        </div>
      </div>

      {/* Revenue by event */}
      <div className="card p-5">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-gray-900">Revenue by Event</h2>
          <span className="text-sm text-gray-400">{perEventEarnings.length} events</span>
        </div>
        {perEventEarnings.length === 0 ? (
          <EmptyState
            icon={<Calendar className="h-7 w-7" />}
            title="No revenue data yet"
            description="Revenue breakdown will appear here once bookings are confirmed."
          />
        ) : (
          <div className="space-y-3">
            {perEventEarnings.map(({ event, revenue, tickets }) => (
              <div key={event.id} className="group">
                <div className="mb-1.5 flex items-center justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <img src={event.image} alt="" className="h-8 w-8 shrink-0 rounded-lg object-cover" />
                    <p className="truncate text-sm font-medium text-gray-700">{event.title}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-4 text-sm">
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <Ticket className="h-3 w-3" />
                      {tickets}
                    </span>
                    <span className="font-semibold text-gray-900">{formatCurrency(revenue)}</span>
                  </div>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-success-500 to-success-600 transition-all duration-700 group-hover:from-success-600 group-hover:to-success-700"
                    style={{ width: `${(revenue / maxRevenue) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Transaction history */}
      <div className="card overflow-hidden">
        <div className="border-b border-gray-100 p-5">
          <h2 className="font-display text-lg font-bold text-gray-900">Transaction History</h2>
          <p className="mt-1 text-sm text-gray-500">All confirmed and attended bookings with payment details.</p>
        </div>

        {paidBookings.length === 0 ? (
          <EmptyState
            icon={<IndianRupee className="h-7 w-7" />}
            title="No transactions yet"
            description="Confirmed booking transactions will appear here."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="px-5 py-3 font-semibold text-gray-600">Event</th>
                  <th className="hidden px-5 py-3 font-semibold text-gray-600 sm:table-cell">Customer</th>
                  <th className="px-5 py-3 text-center font-semibold text-gray-600">Tickets</th>
                  <th className="px-5 py-3 font-semibold text-gray-600">Amount</th>
                  <th className="hidden px-5 py-3 font-semibold text-gray-600 md:table-cell">Date</th>
                  <th className="px-5 py-3 font-semibold text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paidBookings.map((b) => (
                  <tr key={b.id} className="transition hover:bg-gray-50/50">
                    <td className="px-5 py-3.5">
                      <p className="truncate font-medium text-gray-900">{b.eventTitle}</p>
                    </td>
                    <td className="hidden px-5 py-3.5 text-gray-600 sm:table-cell">{b.userName}</td>
                    <td className="px-5 py-3.5 text-center text-gray-700">{b.tickets}</td>
                    <td className="px-5 py-3.5 font-semibold text-gray-900">{formatCurrency(b.totalPrice)}</td>
                    <td className="hidden px-5 py-3.5 text-gray-500 md:table-cell">{formatDate(b.createdAt)}</td>
                    <td className="px-5 py-3.5">
                      <span className={`badge ${statusColors[b.status]} capitalize`}>{b.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-gray-100 bg-gray-50/50">
                  <td className="px-5 py-3 font-semibold text-gray-700" colSpan={2}>
                    Total ({paidBookings.length} transactions)
                  </td>
                  <td className="px-5 py-3 text-center font-semibold text-gray-700">
                    {paidBookings.reduce((s, b) => s + b.tickets, 0)}
                  </td>
                  <td className="px-5 py-3 font-bold text-gray-900">
                    {formatCurrency(paidBookings.reduce((s, b) => s + b.totalPrice, 0))}
                  </td>
                  <td className="hidden px-5 py-3 md:table-cell" />
                  <td className="px-5 py-3" />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
