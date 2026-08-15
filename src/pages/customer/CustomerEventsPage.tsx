import { useState, useMemo } from 'react';
import {
  CalendarDays, Search, MapPin, Users, IndianRupee, Building2,
  Star, BadgePercent, Ticket, Send, X,
} from 'lucide-react';
import { useAppData } from '@/context/AppDataContext';
import { useAuth } from '@/context/AuthContext';
import type { Event, Offer } from '@/types';
import PageHeader from '@/components/ui/PageHeader';
import Modal from '@/components/ui/Modal';
import EmptyState from '@/components/ui/EmptyState';
import { formatCurrency, formatDate } from '@/lib/format';

type PriceFilter = 'all' | 'under-500' | '500-2000' | 'above-2000';

export default function CustomerEventsPage() {
  const { events, categories, offers, addBooking } = useAppData();
  const { user } = useAuth();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priceFilter, setPriceFilter] = useState<PriceFilter>('all');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [bookingForm, setBookingForm] = useState({ tickets: 1, notes: '' });
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState('');

  const filtered = useMemo(() => {
    return events.filter((e) => {
      if (e.status !== 'published') return false;
      const matchesSearch =
        e.title.toLowerCase().includes(search.toLowerCase()) ||
        e.location.toLowerCase().includes(search.toLowerCase()) ||
        e.organizerName.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || e.categoryId === categoryFilter;
      const matchesPrice =
        priceFilter === 'all' ||
        (priceFilter === 'under-500' && e.price < 500) ||
        (priceFilter === '500-2000' && e.price >= 500 && e.price <= 2000) ||
        (priceFilter === 'above-2000' && e.price > 2000);
      return matchesSearch && matchesCategory && matchesPrice;
    });
  }, [events, search, categoryFilter, priceFilter]);

  const eventOffers = (eventId: string): Offer[] =>
    offers.filter((o) => o.eventId === eventId && o.status === 'active');

  const openDetails = (evt: Event) => {
    setSelectedEvent(evt);
    setBookingForm({ tickets: 1, notes: '' });
    setBookingSuccess(false);
    setBookingError('');
  };

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent || !user) return;
    if (bookingForm.tickets < 1) {
      setBookingError('Please select at least 1 ticket.');
      return;
    }
    const available = selectedEvent.capacity - selectedEvent.bookedCount;
    if (bookingForm.tickets > available) {
      setBookingError(`Only ${available} tickets available for this event.`);
      return;
    }
    addBooking({
      eventId: selectedEvent.id,
      eventTitle: selectedEvent.title,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      tickets: bookingForm.tickets,
      totalPrice: bookingForm.tickets * selectedEvent.price,
      status: 'pending',
      paid: false,
      notes: bookingForm.notes.trim(),
    });
    setBookingSuccess(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Browse Events"
        description="Discover events, check details, and request your booking."
        icon={<CalendarDays className="h-5 w-5" />}
      />

      {/* Search bar */}
      <div className="relative max-w-2xl">
        <Search className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search events, cities, or organizers..."
          className="input py-3 pl-11 text-base"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Category tabs */}
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              categoryFilter === 'all' ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All Categories
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategoryFilter(c.id)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                categoryFilter === c.id ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Price filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-500">Price:</span>
          <select
            value={priceFilter}
            onChange={(e) => setPriceFilter(e.target.value as PriceFilter)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition focus:border-brand-500 focus:outline-none"
          >
            <option value="all">All Prices</option>
            <option value="under-500">Under ₹500</option>
            <option value="500-2000">₹500 - ₹2,000</option>
            <option value="above-2000">Above ₹2,000</option>
          </select>
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-gray-500">
        {filtered.length} event{filtered.length !== 1 ? 's' : ''} found
      </p>

      {/* Event cards */}
      {filtered.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={<CalendarDays className="h-7 w-7" />}
            title="No events found"
            description="Try adjusting your search or filter criteria."
          />
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((evt) => {
            const offers = eventOffers(evt.id);
            const available = evt.capacity - evt.bookedCount;
            return (
              <button
                key={evt.id}
                onClick={() => openDetails(evt)}
                className="card group overflow-hidden text-left transition-all duration-200 hover:shadow-cardhover"
              >
                <div className="relative h-48 overflow-hidden">
                  <img src={evt.image} alt={evt.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  {offers.length > 0 && (
                    <div className="absolute right-3 top-3">
                      <span className="badge bg-accent-600 text-white shadow-sm">
                        <BadgePercent className="h-3 w-3" />
                        {offers.length} Offer{offers.length > 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                  {available <= 50 && available > 0 && (
                    <div className="absolute left-3 top-3">
                      <span className="badge bg-warning-500 text-white shadow-sm">
                        Only {available} left
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-display text-base font-bold text-gray-900 group-hover:text-brand-700">{evt.title}</h3>
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-gray-500">
                    <Building2 className="h-3.5 w-3.5 text-gray-400" />
                    by {evt.organizerName}
                  </div>
                  <div className="mt-1.5 flex items-center gap-1.5 text-xs text-gray-500">
                    <MapPin className="h-3.5 w-3.5 text-gray-400" />
                    {evt.venue}, {evt.location}
                  </div>
                  <div className="mt-1.5 flex items-center gap-1.5 text-xs text-gray-500">
                    <CalendarDays className="h-3.5 w-3.5 text-gray-400" />
                    {formatDate(evt.startDate)}
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-gray-50 pt-3">
                    <div>
                      <p className="font-display text-lg font-bold text-gray-900">{formatCurrency(evt.price)}</p>
                      <p className="text-xs text-gray-400">per ticket</p>
                    </div>
                    <div className="text-right">
                      <p className="flex items-center gap-1 text-xs font-medium text-gray-600">
                        <Users className="h-3.5 w-3.5" />
                        {available} available
                      </p>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Event details modal */}
      <Modal
        open={selectedEvent !== null && !bookingSuccess}
        onClose={() => setSelectedEvent(null)}
        title={selectedEvent?.title ?? ''}
        size="lg"
        footer={
          selectedEvent ? (
            <button className="btn-primary" type="submit" form="booking-form">
              <Send className="h-4 w-4" />
              Request Booking
            </button>
          ) : null
        }
      >
        {selectedEvent && (
          <div className="space-y-5">
            {/* Hero image */}
            <div className="relative h-48 overflow-hidden rounded-xl">
              <img src={selectedEvent.image} alt={selectedEvent.title} className="h-full w-full object-cover" />
            </div>

            {/* Quick info */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-xs text-gray-400">Date</p>
                <p className="mt-0.5 text-sm font-semibold text-gray-900">{formatDate(selectedEvent.startDate)}</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-xs text-gray-400">Price</p>
                <p className="mt-0.5 text-sm font-semibold text-gray-900">{formatCurrency(selectedEvent.price)}</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-xs text-gray-400">Available</p>
                <p className="mt-0.5 text-sm font-semibold text-gray-900">{selectedEvent.capacity - selectedEvent.bookedCount}</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-xs text-gray-400">Capacity</p>
                <p className="mt-0.5 text-sm font-semibold text-gray-900">{selectedEvent.capacity}</p>
              </div>
            </div>

            {/* Organizer info */}
            <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-brand-50/30 p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100 text-sm font-bold text-brand-700">
                {selectedEvent.organizerName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
              </div>
              <div>
                <p className="text-xs text-gray-400">Organized by</p>
                <p className="text-sm font-semibold text-gray-900">{selectedEvent.organizerName}</p>
              </div>
            </div>

            {/* Description */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700">About This Event</h4>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">{selectedEvent.description}</p>
            </div>

            {/* Venue */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4 text-gray-400" />
              {selectedEvent.venue}, {selectedEvent.location}
            </div>

            {/* Active offers */}
            {eventOffers(selectedEvent.id).length > 0 && (
              <div>
                <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <BadgePercent className="h-4 w-4 text-accent-600" />
                  Active Offers
                </h4>
                <div className="mt-2 space-y-2">
                  {eventOffers(selectedEvent.id).map((o) => (
                    <div key={o.id} className="flex items-center justify-between rounded-lg border border-dashed border-accent-200 bg-accent-50/30 p-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{o.title}</p>
                        <p className="text-xs text-gray-500">{o.description}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-mono text-sm font-bold tracking-wider text-accent-700">{o.code}</span>
                        <p className="text-xs font-medium text-accent-600">{o.discountPercent}% off</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {selectedEvent.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {selectedEvent.tags.map((tag) => (
                  <span key={tag} className="badge bg-gray-100 text-gray-600">#{tag}</span>
                ))}
              </div>
            )}

            {/* Booking form */}
            <div className="border-t border-gray-100 pt-4">
              <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Ticket className="h-4 w-4" />
                Request Booking
              </h4>
              <form id="booking-form" onSubmit={handleBooking} className="mt-3 space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="label" htmlFor="bk-tickets">Number of Tickets</label>
                    <input
                      id="bk-tickets"
                      type="number"
                      min="1"
                      max={selectedEvent.capacity - selectedEvent.bookedCount}
                      value={bookingForm.tickets}
                      onChange={(e) => setBookingForm((f) => ({ ...f, tickets: Number(e.target.value) }))}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label" htmlFor="bk-date">Event Date</label>
                    <input
                      id="bk-date"
                      type="text"
                      value={formatDate(selectedEvent.startDate)}
                      disabled
                      className="input bg-gray-50 text-gray-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="label" htmlFor="bk-notes">Notes (optional)</label>
                  <textarea
                    id="bk-notes"
                    value={bookingForm.notes}
                    onChange={(e) => setBookingForm((f) => ({ ...f, notes: e.target.value }))}
                    rows={2}
                    className="input resize-none"
                    placeholder="Any special requests or notes for the organizer..."
                  />
                </div>
                <div className="flex items-center justify-between rounded-lg bg-brand-50 p-3">
                  <span className="text-sm font-medium text-gray-600">Total Amount:</span>
                  <span className="font-display text-lg font-bold text-brand-700">
                    {formatCurrency(bookingForm.tickets * selectedEvent.price)}
                  </span>
                </div>
                {bookingError && <p className="text-sm text-error-600">{bookingError}</p>}
              </form>
            </div>
          </div>
        )}
      </Modal>

      {/* Booking success modal */}
      <Modal
        open={bookingSuccess}
        onClose={() => { setBookingSuccess(false); setSelectedEvent(null); }}
        title="Booking Requested!"
        description="Your booking request has been sent to the organizer."
        size="sm"
        footer={
          <button className="btn-primary" onClick={() => { setBookingSuccess(false); setSelectedEvent(null); }}>
            Done
          </button>
        }
      >
        <div className="flex flex-col items-center py-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-success-100 text-success-600">
            <Ticket className="h-8 w-8" />
          </div>
          <p className="mt-4 text-sm text-gray-600">
            Your request is now <span className="font-semibold text-warning-600">Pending</span>. The organizer will review and respond. You'll be able to pay once your booking is accepted.
          </p>
          <p className="mt-2 text-xs text-gray-400">
            Check "My Bookings" to track the status of your request.
          </p>
        </div>
      </Modal>
    </div>
  );
}
