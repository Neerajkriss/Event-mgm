import { useState, useMemo } from 'react';
import {
  IndianRupee, TrendingUp, Ticket, Calendar, ArrowUpRight,
  CreditCard, CheckCircle2, XCircle, Clock,
} from 'lucide-react';
import { useAppData } from '@/context/AppDataContext';
import type { Booking } from '@/types';
import PageHeader from '@/components/ui/PageHeader';
import EmptyState from '@/components/ui/EmptyState';
import { formatCurrency, formatDate } from '@/lib/format';

function StatCard({ label, value, sublabel, icon: Icon, color, trend }: {
  label: string;
  value: string;
  sublabel: string;
  icon: typeof IndianRupee;
  color: string;
  trend?: string;
}) {
  return (
    <div className="card p-5 transition-all duration-200 hover:shadow-cardhover">
      <div className="flex items-start justify-between">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
        {trend && (
          <span className="badge bg-success-50 text-success-700">
            <TrendingUp className="h-3 w-3" />
            {trend}
          </span>
        )}
      </div>
      <p className="mt-4 text-2xl font-bold tracking-tight text-gray-900">{value}</p>
      <p className="mt-1 text-sm text-gray-500">{label}</p>
      <p className="mt-0.5 text-xs text-gray-400">{sublabel}</p>
    </div>
  );
}

const statusConfig: Record<Booking['status'], { color: string; icon: typeof Clock }> = {
  confirmed: { color: 'bg-success-100 text-success-700', icon: CheckCircle2 },
  attended: { color: 'bg-brand-100 text-brand-700', icon: CheckCircle2 },
  pending: { color: 'bg-warning-100 text-warning-700', icon: Clock },
  cancelled: { color: 'bg-error-100 text-error-700', icon: XCircle },
};

export default function AdminPaymentsPage() {
  const { bookings, events } = useAppData();
  const [statusFilter, setStatusFilter] = useState<'all' | Booking['status']>('all');

  const revenueData = useMemo(() => {
    const confirmed = bookings.filter((b) => b.status === 'confirmed' || b.status === 'attended');
    const totalRevenue = confirmed.reduce((sum, b) => sum + b.totalPrice, 0);
    const totalTickets = confirmed.reduce((sum, b) => sum + b.tickets, 0);
    const pendingRevenue = bookings.filter((b) => b.status === 'pending').reduce((sum, b) => sum + b.totalPrice, 0);
    const refundedRevenue = bookings.filter((b) => b.status === 'cancelled').reduce((sum, b) => sum + b.totalPrice, 0);
    const avgOrderValue = confirmed.length > 0 ? Math.round(totalRevenue / confirmed.length) : 0;
    return { totalRevenue, totalTickets, pendingRevenue, refundedRevenue, avgOrderValue, confirmedCount: confirmed.length };
  }, [bookings]);

  const perEventRevenue = useMemo(() => {
    return events.map((evt) => {
      const evtBookings = bookings.filter((b) => b.eventId === evt.id && (b.status === 'confirmed' || b.status === 'attended'));
      const revenue = evtBookings.reduce((sum, b) => sum + b.totalPrice, 0);
      const tickets = evtBookings.reduce((sum, b) => sum + b.tickets, 0);
      return { event: evt, revenue, tickets, bookingCount: evtBookings.length };
    }).filter((r) => r.bookingCount > 0).sort((a, b) => b.revenue - a.revenue);
  }, [events, bookings]);

  const filteredBookings = bookings.filter((b) => statusFilter === 'all' || b.status === statusFilter);

  const maxRevenue = perEventRevenue.length > 0 ? perEventRevenue[0].revenue : 1;

  const filters: { id: 'all' | Booking['status']; label: string }[] = [
    { id: 'all', label: 'All Transactions' },
    { id: 'confirmed', label: 'Confirmed' },
    { id: 'attended', label: 'Attended' },
    { id: 'pending', label: 'Pending' },
    { id: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payment Reports"
        description="System-wide revenue overview, transaction summaries, and per-event breakdowns."
        icon={<IndianRupee className="h-5 w-5" />}
      />

      {/* Revenue stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Revenue"
          value={formatCurrency(revenueData.totalRevenue)}
          sublabel={`${revenueData.confirmedCount} confirmed transactions`}
          icon={IndianRupee}
          color="bg-success-100 text-success-600"
          trend="+8%"
        />
        <StatCard
          label="Tickets Sold"
          value={revenueData.totalTickets.toLocaleString('en-IN')}
          sublabel="Across all confirmed bookings"
          icon={Ticket}
          color="bg-brand-100 text-brand-600"
          trend="+12%"
        />
        <StatCard
          label="Avg Order Value"
          value={formatCurrency(revenueData.avgOrderValue)}
          sublabel="Per confirmed booking"
          icon={CreditCard}
          color="bg-accent-100 text-accent-600"
        />
        <StatCard
          label="Pending Revenue"
          value={formatCurrency(revenueData.pendingRevenue)}
          sublabel={`${bookings.filter((b) => b.status === 'pending').length} pending bookings`}
          icon={Clock}
          color="bg-warning-100 text-warning-600"
        />
      </div>

      {/* Revenue by event bar chart */}
      <div className="card p-5">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-gray-900">Revenue by Event</h2>
          <span className="text-sm text-gray-400">{perEventRevenue.length} events with bookings</span>
        </div>
        {perEventRevenue.length === 0 ? (
          <EmptyState
            icon={<Calendar className="h-7 w-7" />}
            title="No revenue data yet"
            description="Revenue breakdown by event will appear here once bookings are confirmed."
          />
        ) : (
          <div className="space-y-3">
            {perEventRevenue.map(({ event, revenue, tickets }) => (
              <div key={event.id} className="group">
                <div className="mb-1.5 flex items-center justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <img src={event.image} alt="" className="h-8 w-8 shrink-0 rounded-lg object-cover" />
                    <p className="truncate text-sm font-medium text-gray-700">{event.title}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-4 text-sm">
                    <span className="text-xs text-gray-400">{tickets} tickets</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(revenue)}</span>
                  </div>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-600 transition-all duration-700 group-hover:from-brand-600 group-hover:to-brand-700"
                    style={{ width: `${(revenue / maxRevenue) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Refund summary */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-error-100 text-error-600">
              <XCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="font-display text-lg font-bold text-gray-900">{formatCurrency(revenueData.refundedRevenue)}</p>
              <p className="text-sm text-gray-500">Refunded / Cancelled</p>
            </div>
          </div>
          <p className="mt-3 text-xs text-gray-400">
            {bookings.filter((b) => b.status === 'cancelled').length} cancelled bookings resulting in refunds.
          </p>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success-100 text-success-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="font-display text-lg font-bold text-gray-900">
                {revenueData.confirmedCount > 0 ? Math.round((revenueData.confirmedCount / bookings.length) * 100) : 0}%
              </p>
              <p className="text-sm text-gray-500">Confirmation Rate</p>
            </div>
          </div>
          <p className="mt-3 text-xs text-gray-400">
            {revenueData.confirmedCount} of {bookings.length} total bookings confirmed.
          </p>
        </div>
      </div>

      {/* Transaction table */}
      <div className="card overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-display text-lg font-bold text-gray-900">Transaction Summary</h2>
          <div className="flex flex-wrap gap-1">
            {filters.map((f) => (
              <button
                key={f.id}
                onClick={() => setStatusFilter(f.id)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                  statusFilter === f.id
                    ? 'bg-brand-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {filteredBookings.length === 0 ? (
          <EmptyState
            icon={<CreditCard className="h-7 w-7" />}
            title="No transactions found"
            description="Transactions matching this filter will appear here."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="px-5 py-3 font-semibold text-gray-600">Transaction</th>
                  <th className="hidden px-5 py-3 font-semibold text-gray-600 sm:table-cell">Customer</th>
                  <th className="px-5 py-3 text-center font-semibold text-gray-600">Tickets</th>
                  <th className="px-5 py-3 font-semibold text-gray-600">Amount</th>
                  <th className="hidden px-5 py-3 font-semibold text-gray-600 md:table-cell">Date</th>
                  <th className="px-5 py-3 font-semibold text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredBookings.map((b) => {
                  const config = statusConfig[b.status];
                  const StatusIcon = config.icon;
                  return (
                    <tr key={b.id} className="transition hover:bg-gray-50/50">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 shrink-0 text-gray-400" />
                          <span className="truncate font-medium text-gray-900">{b.eventTitle}</span>
                        </div>
                      </td>
                      <td className="hidden px-5 py-3.5 text-gray-600 sm:table-cell">{b.userName}</td>
                      <td className="px-5 py-3.5 text-center text-gray-700">{b.tickets}</td>
                      <td className="px-5 py-3.5 font-semibold text-gray-900">{formatCurrency(b.totalPrice)}</td>
                      <td className="hidden px-5 py-3.5 text-gray-500 md:table-cell">{formatDate(b.createdAt)}</td>
                      <td className="px-5 py-3.5">
                        <span className={`badge ${config.color} capitalize`}>
                          <StatusIcon className="h-3 w-3" />
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t border-gray-100 bg-gray-50/50">
                  <td className="px-5 py-3 font-semibold text-gray-700" colSpan={2}>Total ({filteredBookings.length} transactions)</td>
                  <td className="px-5 py-3 text-center font-semibold text-gray-700">
                    {filteredBookings.reduce((s, b) => s + b.tickets, 0)}
                  </td>
                  <td className="px-5 py-3 font-bold text-gray-900">
                    {formatCurrency(filteredBookings.reduce((s, b) => s + b.totalPrice, 0))}
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
