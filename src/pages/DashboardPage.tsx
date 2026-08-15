import {
  CalendarDays, Ticket, BadgePercent, MessageSquareWarning,
  TrendingUp, Users, IndianRupee, Clock, ArrowUpRight, CircleDot,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useAppData } from '@/context/AppDataContext';
import type { Role } from '@/types';

function StatCard({ label, value, sublabel, icon: Icon, trend, color }: {
  label: string;
  value: string | number;
  sublabel?: string;
  icon: typeof CalendarDays;
  trend?: string;
  color: string;
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
      <p className="mt-4 text-3xl font-bold tracking-tight text-gray-900">{value}</p>
      <p className="mt-1 text-sm text-gray-500">{label}</p>
      {sublabel && <p className="mt-0.5 text-xs text-gray-400">{sublabel}</p>}
    </div>
  );
}

function RecentItem({ title, subtitle, status, statusColor, date }: {
  title: string;
  subtitle: string;
  status: string;
  statusColor: string;
  date: string;
}) {
  return (
    <div className="flex items-center gap-3 py-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100">
        <CircleDot className="h-4 w-4 text-gray-500" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-gray-900">{title}</p>
        <p className="truncate text-xs text-gray-500">{subtitle}</p>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <span className={`badge ${statusColor} capitalize`}>{status}</span>
        <span className="hidden text-xs text-gray-400 sm:block">{date}</span>
      </div>
    </div>
  );
}

const statusColors: Record<string, string> = {
  confirmed: 'bg-success-100 text-success-700',
  pending: 'bg-warning-100 text-warning-700',
  cancelled: 'bg-error-100 text-error-700',
  attended: 'bg-brand-100 text-brand-700',
  active: 'bg-success-100 text-success-700',
  expired: 'bg-gray-100 text-gray-600',
  open: 'bg-error-100 text-error-700',
  'in-progress': 'bg-warning-100 text-warning-700',
  resolved: 'bg-success-100 text-success-700',
  dismissed: 'bg-gray-100 text-gray-600',
};

const roleLabels: Record<Role, string> = {
  admin: 'Administrator',
  organizer: 'Event Organizer',
  customer: 'Customer',
};

export default function DashboardPage() {
  const { user } = useAuth();
  const { events, bookings, offers, complaints } = useAppData();

  if (!user) return null;

  const isOrganizer = user.role === 'organizer';
  const isCustomer = user.role === 'customer';
  const myEvents = isOrganizer ? events.filter((e) => e.organizerId === user.id) : events;
  const myBookings = isCustomer ? bookings.filter((b) => b.userId === user.id) : bookings;
  const myComplaints = isCustomer ? complaints.filter((c) => c.userId === user.id) : complaints;

  const totalRevenue = bookings.filter((b) => b.status === 'confirmed' || b.status === 'attended').reduce((sum, b) => sum + b.totalPrice, 0);
  const totalTicketsSold = bookings.filter((b) => b.status === 'confirmed' || b.status === 'attended').reduce((sum, b) => sum + b.tickets, 0);
  const activeOffers = offers.filter((o) => o.status === 'active').length;
  const openComplaints = complaints.filter((c) => c.status === 'open' || c.status === 'in-progress').length;

  const recentBookings = bookings.slice(-5).reverse();
  const recentComplaints = complaints.slice(-4).reverse();

  const formatDate = (iso: string) => new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-gray-900">
            Welcome back, {user.name.split(' ')[0]}
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            You're signed in as <span className="font-medium text-brand-600">{roleLabels[user.role]}</span>. Here's your overview.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 shadow-card">
          <Clock className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-600">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label={isCustomer ? 'My Bookings' : 'Total Bookings'}
          value={myBookings.length}
          sublabel={`${bookings.filter((b) => b.status === 'pending').length} pending`}
          icon={Ticket}
          color="bg-brand-100 text-brand-600"
          trend="+12%"
        />
        <StatCard
          label={isCustomer ? 'Available Events' : 'Active Events'}
          value={isCustomer ? events.filter((e) => e.status === 'published').length : myEvents.filter((e) => e.status === 'published').length}
          sublabel={`${events.length} total on platform`}
          icon={CalendarDays}
          color="bg-accent-100 text-accent-600"
        />
        <StatCard
          label={isCustomer ? 'Active Offers' : 'Revenue'}
          value={isCustomer ? activeOffers : `₹${totalRevenue.toLocaleString('en-IN')}`}
          sublabel={isCustomer ? 'Discount codes available' : `${totalTicketsSold} tickets sold`}
          icon={isCustomer ? BadgePercent : IndianRupee}
          color="bg-success-100 text-success-600"
          trend={!isCustomer ? '+8%' : undefined}
        />
        <StatCard
          label={isCustomer ? 'My Complaints' : 'Open Complaints'}
          value={isCustomer ? myComplaints.length : openComplaints}
          sublabel={`${complaints.filter((c) => c.status === 'resolved').length} resolved`}
          icon={MessageSquareWarning}
          color="bg-error-100 text-error-600"
        />
      </div>

      {/* Two-column section */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent bookings */}
        <div className="card p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-gray-900">Recent Bookings</h2>
            <button className="flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700">
              View all <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
          <div className="divide-y divide-gray-100">
            {recentBookings.length > 0 ? (
              recentBookings.map((b) => (
                <RecentItem
                  key={b.id}
                  title={b.eventTitle}
                  subtitle={`${b.userName} · ${b.tickets} ticket${b.tickets > 1 ? 's' : ''} · ₹${b.totalPrice.toLocaleString('en-IN')}`}
                  status={b.status}
                  statusColor={statusColors[b.status] ?? 'bg-gray-100 text-gray-600'}
                  date={formatDate(b.createdAt)}
                />
              ))
            ) : (
              <p className="py-8 text-center text-sm text-gray-400">No bookings yet</p>
            )}
          </div>
        </div>

        {/* Recent complaints */}
        <div className="card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-gray-900">Recent Complaints</h2>
            <Users className="h-5 w-5 text-gray-400" />
          </div>
          <div className="divide-y divide-gray-100">
            {recentComplaints.length > 0 ? (
              recentComplaints.map((c) => (
                <RecentItem
                  key={c.id}
                  title={c.subject}
                  subtitle={c.userName}
                  status={c.status}
                  statusColor={statusColors[c.status] ?? 'bg-gray-100 text-gray-600'}
                  date={formatDate(c.createdAt)}
                />
              ))
            ) : (
              <p className="py-8 text-center text-sm text-gray-400">No complaints yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Upcoming events preview */}
      <div className="card p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-gray-900">
            {isCustomer ? 'Upcoming Events' : 'Your Events'}
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(isCustomer ? events.filter((e) => e.status === 'published') : myEvents).slice(0, 6).map((evt) => (
            <div key={evt.id} className="group flex gap-3 rounded-xl border border-gray-100 p-3 transition hover:border-brand-200 hover:bg-brand-50/30">
              <img src={evt.image} alt={evt.title} className="h-16 w-16 shrink-0 rounded-lg object-cover" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-gray-900 group-hover:text-brand-700">{evt.title}</p>
                <p className="mt-0.5 text-xs text-gray-500">{evt.venue}, {evt.location}</p>
                <div className="mt-1.5 flex items-center gap-2">
                  <span className="badge bg-brand-50 text-brand-700">₹{evt.price.toLocaleString('en-IN')}</span>
                  <span className="text-xs text-gray-400">{evt.bookedCount}/{evt.capacity} booked</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
