import { useState, useMemo } from 'react';
import {
  Ticket, Check, X, Clock, IndianRupee, CreditCard, Smartphone,
  CheckCircle2, Download, Calendar, MapPin, Receipt,
} from 'lucide-react';
import { useAppData } from '@/context/AppDataContext';
import { useAuth } from '@/context/AuthContext';
import type { Booking } from '@/types';
import PageHeader from '@/components/ui/PageHeader';
import Modal from '@/components/ui/Modal';
import EmptyState from '@/components/ui/EmptyState';
import { formatCurrency, formatDateTime, formatDate } from '@/lib/format';

type Filter = 'all' | 'pending' | 'confirmed' | 'attended' | 'cancelled';

const statusConfig: Record<Booking['status'], { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: 'Pending', color: 'bg-warning-100 text-warning-700', icon: Clock },
  confirmed: { label: 'Confirmed', color: 'bg-success-100 text-success-700', icon: CheckCircle2 },
  attended: { label: 'Attended', color: 'bg-brand-100 text-brand-700', icon: CheckCircle2 },
  cancelled: { label: 'Rejected', color: 'bg-error-100 text-error-700', icon: X },
};

export default function CustomerBookingsPage() {
  const { bookings, events, updateBooking } = useAppData();
  const { user } = useAuth();

  const [filter, setFilter] = useState<Filter>('all');
  const [payBooking, setPayBooking] = useState<Booking | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi'>('card');
  const [cardForm, setCardForm] = useState({ number: '', name: '', expiry: '', cvv: '' });
  const [upiId, setUpiId] = useState('');
  const [processing, setProcessing] = useState(false);
  const [receiptBooking, setReceiptBooking] = useState<Booking | null>(null);

  const myBookings = useMemo(
    () => bookings.filter((b) => b.userId === user?.id).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [bookings, user],
  );

  const filtered = myBookings.filter((b) => filter === 'all' || b.status === filter);

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
    { id: 'cancelled', label: 'Rejected', count: counts.cancelled },
  ];

  const getEvent = (eventId: string) => events.find((e) => e.id === eventId);

  const openPay = (b: Booking) => {
    setPayBooking(b);
    setPaymentMethod('card');
    setCardForm({ number: '', name: '', expiry: '', cvv: '' });
    setUpiId('');
  };

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payBooking) return;
    setProcessing(true);
    setTimeout(() => {
      updateBooking(payBooking.id, { paid: true, status: 'confirmed' });
      setProcessing(false);
      setReceiptBooking({ ...payBooking, paid: true, status: 'confirmed' });
      setPayBooking(null);
    }, 1500);
  };

  const downloadReceipt = (b: Booking) => {
    const evt = getEvent(b.eventId);
    const receipt = `
========================================
         EVENTHUB - PAYMENT RECEIPT
========================================

Receipt No: ${b.id.toUpperCase()}
Date: ${formatDateTime(b.createdAt)}

EVENT DETAILS:
  Event: ${b.eventTitle}
  Venue: ${evt?.venue ?? 'N/A'}
  Location: ${evt?.location ?? 'N/A'}
  Date: ${evt ? formatDate(evt.startDate) : 'N/A'}

CUSTOMER DETAILS:
  Name: ${b.userName}
  Email: ${b.userEmail}

BOOKING DETAILS:
  Tickets: ${b.tickets}
  Total Amount: ${formatCurrency(b.totalPrice)}
  Payment Status: PAID
  Booking Status: ${b.status.toUpperCase()}

Notes: ${b.notes || 'None'}

========================================
  Thank you for booking with EventHub!
========================================
`.trim();
    const blob = new Blob([receipt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${b.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Bookings"
        description="Track your booking requests, complete payments, and download receipts."
        icon={<Ticket className="h-5 w-5" />}
      />

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-1 rounded-lg bg-gray-100 p-1">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition ${
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

      {/* Bookings list */}
      {filtered.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={<Ticket className="h-7 w-7" />}
            title="No bookings found"
            description="Browse events and request a booking to get started."
          />
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((b) => {
            const evt = getEvent(b.eventId);
            const config = statusConfig[b.status];
            const StatusIcon = config.icon;
            const canPay = b.status === 'confirmed' && !b.paid;
            return (
              <div key={b.id} className="card p-5 transition-all hover:shadow-cardhover">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  {/* Event image */}
                  {evt && (
                    <img src={evt.image} alt={b.eventTitle} className="h-20 w-full rounded-lg object-cover sm:w-28" />
                  )}

                  {/* Details */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start gap-2">
                      <h3 className="truncate font-display text-base font-bold text-gray-900">{b.eventTitle}</h3>
                      <span className={`badge ${config.color} shrink-0`}>
                        <StatusIcon className="h-3 w-3" />
                        {config.label}
                      </span>
                    </div>
                    {evt && (
                      <div className="mt-1.5 flex flex-wrap gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {evt.venue}, {evt.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(evt.startDate)}
                        </span>
                      </div>
                    )}
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
                      <span className="font-semibold text-gray-900">{formatCurrency(b.totalPrice)}</span>
                      <span className="text-gray-300">·</span>
                      <span className="text-gray-500">{b.tickets} ticket{b.tickets > 1 ? 's' : ''}</span>
                      <span className="text-gray-300">·</span>
                      <span className="text-xs text-gray-400">Booked {formatDateTime(b.createdAt)}</span>
                    </div>
                    {b.notes && (
                      <p className="mt-1.5 text-xs italic text-gray-400">"{b.notes}"</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex shrink-0 flex-col gap-2 sm:items-end">
                    {canPay && (
                      <button onClick={() => openPay(b)} className="btn-primary w-full sm:w-auto">
                        <IndianRupee className="h-4 w-4" />
                        Pay Now ({formatCurrency(b.totalPrice)})
                      </button>
                    )}
                    {b.paid && b.status === 'confirmed' && (
                      <button onClick={() => downloadReceipt(b)} className="btn-secondary w-full sm:w-auto">
                        <Download className="h-4 w-4" />
                        Receipt
                      </button>
                    )}
                    {b.status === 'pending' && (
                      <span className="flex items-center gap-1.5 text-sm text-warning-600">
                        <Clock className="h-4 w-4" />
                        Awaiting organizer approval
                      </span>
                    )}
                    {b.paid && (
                      <span className="flex items-center gap-1.5 text-sm text-success-600">
                        <CheckCircle2 className="h-4 w-4" />
                        Payment Complete
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Payment modal */}
      <Modal
        open={payBooking !== null}
        onClose={() => setPayBooking(null)}
        title="Complete Payment"
        description={payBooking ? `Pay ${formatCurrency(payBooking.totalPrice)} for ${payBooking.eventTitle}` : ''}
        footer={
          payBooking ? (
            <>
              <button className="btn-secondary" onClick={() => setPayBooking(null)}>Cancel</button>
              <button className="btn-primary" type="submit" form="payment-form" disabled={processing}>
                {processing ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
                {processing ? 'Processing...' : `Pay ${formatCurrency(payBooking.totalPrice)}`}
              </button>
            </>
          ) : null
        }
      >
        {payBooking && (
          <div className="space-y-5">
            {/* Payment summary */}
            <div className="rounded-lg bg-gray-50 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Event</span>
                <span className="text-sm font-medium text-gray-900">{payBooking.eventTitle}</span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-sm text-gray-500">Tickets</span>
                <span className="text-sm font-medium text-gray-900">{payBooking.tickets}</span>
              </div>
              <div className="mt-2 flex items-center justify-between border-t border-gray-200 pt-2">
                <span className="text-sm font-semibold text-gray-700">Total</span>
                <span className="font-display text-lg font-bold text-brand-700">{formatCurrency(payBooking.totalPrice)}</span>
              </div>
            </div>

            {/* Payment method tabs */}
            <div>
              <p className="label">Payment Method</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`flex items-center gap-2 rounded-lg border-2 p-3 text-sm font-medium transition ${
                    paymentMethod === 'card' ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <CreditCard className="h-4 w-4" />
                  Card
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  className={`flex items-center gap-2 rounded-lg border-2 p-3 text-sm font-medium transition ${
                    paymentMethod === 'upi' ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <Smartphone className="h-4 w-4" />
                  UPI
                </button>
              </div>
            </div>

            {/* Payment form */}
            <form id="payment-form" onSubmit={handlePayment} className="space-y-4">
              {paymentMethod === 'card' ? (
                <>
                  <div>
                    <label className="label" htmlFor="card-number">Card Number</label>
                    <input
                      id="card-number"
                      type="text"
                      value={cardForm.number}
                      onChange={(e) => setCardForm((f) => ({ ...f, number: e.target.value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim() }))}
                      className="input font-mono"
                      placeholder="1234 5678 9012 3456"
                      required
                    />
                  </div>
                  <div>
                    <label className="label" htmlFor="card-name">Name on Card</label>
                    <input
                      id="card-name"
                      type="text"
                      value={cardForm.name}
                      onChange={(e) => setCardForm((f) => ({ ...f, name: e.target.value }))}
                      className="input"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="label" htmlFor="card-expiry">Expiry</label>
                      <input
                        id="card-expiry"
                        type="text"
                        value={cardForm.expiry}
                        onChange={(e) => setCardForm((f) => ({ ...f, expiry: e.target.value }))}
                        className="input"
                        placeholder="MM/YY"
                        required
                      />
                    </div>
                    <div>
                      <label className="label" htmlFor="card-cvv">CVV</label>
                      <input
                        id="card-cvv"
                        type="password"
                        value={cardForm.cvv}
                        onChange={(e) => setCardForm((f) => ({ ...f, cvv: e.target.value.replace(/\D/g, '').slice(0, 3) }))}
                        className="input"
                        placeholder="•••"
                        required
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div>
                  <label className="label" htmlFor="upi-id">UPI ID</label>
                  <input
                    id="upi-id"
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="input"
                    placeholder="yourname@upi"
                    required
                  />
                  <p className="mt-1.5 text-xs text-gray-400">Enter your UPI ID to proceed with the payment.</p>
                </div>
              )}
            </form>

            <p className="text-center text-xs text-gray-400">
              This is a simulated payment. No real transaction will occur.
            </p>
          </div>
        )}
      </Modal>

      {/* Receipt modal */}
      <Modal
        open={receiptBooking !== null}
        onClose={() => setReceiptBooking(null)}
        title="Payment Successful!"
        size="md"
        footer={
          receiptBooking ? (
            <>
              <button className="btn-secondary" onClick={() => setReceiptBooking(null)}>Close</button>
              <button className="btn-primary" onClick={() => downloadReceipt(receiptBooking)}>
                <Download className="h-4 w-4" />
                Download Receipt
              </button>
            </>
          ) : null
        }
      >
        {receiptBooking && (
          <div className="space-y-4">
            <div className="flex flex-col items-center py-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-success-100 text-success-600">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <p className="mt-3 font-display text-lg font-bold text-gray-900">Payment Complete!</p>
              <p className="mt-1 text-sm text-gray-500">
                Your booking for <span className="font-medium text-gray-700">{receiptBooking.eventTitle}</span> is now confirmed.
              </p>
            </div>

            {/* Receipt summary */}
            <div className="rounded-lg border border-gray-200 p-4">
              <div className="mb-3 flex items-center gap-2 border-b border-gray-100 pb-3">
                <Receipt className="h-4 w-4 text-gray-400" />
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Receipt Summary</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Receipt No:</span>
                  <span className="font-mono font-medium text-gray-900">{receiptBooking.id.toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Event:</span>
                  <span className="font-medium text-gray-900">{receiptBooking.eventTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Tickets:</span>
                  <span className="font-medium text-gray-900">{receiptBooking.tickets}</span>
                </div>
                <div className="flex justify-between border-t border-gray-100 pt-2">
                  <span className="font-semibold text-gray-700">Amount Paid:</span>
                  <span className="font-display text-lg font-bold text-success-600">{formatCurrency(receiptBooking.totalPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Date:</span>
                  <span className="font-medium text-gray-900">{formatDateTime(receiptBooking.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
