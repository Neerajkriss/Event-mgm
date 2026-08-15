import { useState, useMemo } from 'react';
import { Star, Send, CheckCircle2, MessageSquare, Calendar } from 'lucide-react';
import { useAppData } from '@/context/AppDataContext';
import { useAuth } from '@/context/AuthContext';
import type { Booking, Feedback } from '@/types';
import PageHeader from '@/components/ui/PageHeader';
import Modal from '@/components/ui/Modal';
import EmptyState from '@/components/ui/EmptyState';
import { formatDate } from '@/lib/format';

function StarInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          className="transition-transform hover:scale-110"
          aria-label={`Rate ${star} stars`}
        >
          <Star
            className={`h-7 w-7 ${(hover || value) >= star ? 'fill-warning-400 text-warning-400' : 'fill-gray-200 text-gray-200'}`}
          />
        </button>
      ))}
    </div>
  );
}

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${star <= rating ? 'fill-warning-400 text-warning-400' : 'fill-gray-200 text-gray-200'}`}
        />
      ))}
    </div>
  );
}

export default function CustomerFeedbackPage() {
  const { bookings, feedback, events, addFeedback } = useAppData();
  const { user } = useAuth();

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Bookings eligible for feedback: confirmed (paid) or attended
  const eligibleBookings = useMemo(() => {
    return bookings.filter((b) => {
      if (b.userId !== user?.id) return false;
      if (b.status !== 'confirmed' && b.status !== 'attended') return false;
      // Check if feedback already exists
      const hasFeedback = feedback.some((f) => f.eventId === b.eventId && f.userId === b.userId);
      return !hasFeedback;
    });
  }, [bookings, feedback, user]);

  const myFeedback = useMemo(
    () => feedback.filter((f) => f.userId === user?.id).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [feedback, user],
  );

  const openFeedback = (b: Booking) => {
    setSelectedBooking(b);
    setRating(0);
    setComment('');
    setError('');
    setSuccess(false);
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking || !user) return;
    if (rating < 1) {
      setError('Please select a star rating.');
      return;
    }
    if (comment.trim().length < 10) {
      setError('Please write at least 10 characters in your review.');
      return;
    }

    addFeedback({
      eventId: selectedBooking.eventId,
      eventTitle: selectedBooking.eventTitle,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      rating,
      comment: comment.trim(),
    });
    setSuccess(true);
    setTimeout(() => {
      setModalOpen(false);
    }, 1500);
  };

  const getEvent = (eventId: string) => events.find((e) => e.id === eventId);

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Reviews"
        description="Rate and review events you've attended. Your feedback helps organizers improve."
        icon={<Star className="h-5 w-5" />}
      />

      {/* Eligible events */}
      {eligibleBookings.length > 0 && (
        <div className="card p-5">
          <h2 className="font-display text-base font-bold text-gray-900">Events to Review</h2>
          <p className="mt-1 text-sm text-gray-500">You have attended these events but haven't submitted a review yet.</p>
          <div className="mt-4 space-y-2">
            {eligibleBookings.map((b) => {
              const evt = getEvent(b.eventId);
              return (
                <div key={b.id} className="flex items-center gap-3 rounded-lg border border-gray-100 p-3">
                  {evt && <img src={evt.image} alt="" className="h-12 w-12 rounded-lg object-cover" />}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-gray-900">{b.eventTitle}</p>
                    <p className="text-xs text-gray-400">
                      {evt ? `${formatDate(evt.startDate)} · ${evt.venue}` : ''}
                    </p>
                  </div>
                  <button onClick={() => openFeedback(b)} className="btn-primary shrink-0">
                    <Star className="h-4 w-4" />
                    Review
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Submitted reviews */}
      <div>
        <h2 className="mb-4 font-display text-lg font-bold text-gray-900">Your Submitted Reviews</h2>
        {myFeedback.length === 0 ? (
          <div className="card">
            <EmptyState
              icon={<MessageSquare className="h-7 w-7" />}
              title="No reviews yet"
              description="Attend an event and submit your first review to see it here."
            />
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {myFeedback.map((fb: Feedback) => {
              const evt = getEvent(fb.eventId);
              return (
                <div key={fb.id} className="card p-5 transition-all hover:shadow-cardhover">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {evt && <img src={evt.image} alt="" className="h-12 w-12 rounded-lg object-cover" />}
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{fb.eventTitle}</p>
                        <p className="text-xs text-gray-400">{formatDate(fb.createdAt)}</p>
                      </div>
                    </div>
                    <StarDisplay rating={fb.rating} />
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-gray-600">{fb.comment}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Feedback modal */}
      <Modal
        open={modalOpen && !success}
        onClose={() => setModalOpen(false)}
        title="Write a Review"
        description={selectedBooking ? `Share your experience for ${selectedBooking.eventTitle}` : ''}
        footer={
          <>
            <button className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button className="btn-primary" type="submit" form="feedback-form">
              <Send className="h-4 w-4" />
              Submit Review
            </button>
          </>
        }
      >
        {selectedBooking && (
          <form id="feedback-form" onSubmit={handleSubmit} className="space-y-5">
            {/* Event info */}
            <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
              {(() => {
                const evt = getEvent(selectedBooking.eventId);
                return evt ? <img src={evt.image} alt="" className="h-12 w-12 rounded-lg object-cover" /> : null;
              })()}
              <div>
                <p className="text-sm font-semibold text-gray-900">{selectedBooking.eventTitle}</p>
                <p className="flex items-center gap-1 text-xs text-gray-400">
                  <Calendar className="h-3 w-3" />
                  {(() => {
                    const evt = getEvent(selectedBooking.eventId);
                    return evt ? formatDate(evt.startDate) : '';
                  })()}
                </p>
              </div>
            </div>

            {/* Star rating */}
            <div>
              <label className="label">Your Rating</label>
              <StarInput value={rating} onChange={setRating} />
              <p className="mt-1 text-xs text-gray-400">
                {rating === 0 && 'Click a star to rate'}
                {rating === 1 && 'Poor'}
                {rating === 2 && 'Fair'}
                {rating === 3 && 'Good'}
                {rating === 4 && 'Very Good'}
                {rating === 5 && 'Excellent'}
              </p>
            </div>

            {/* Comment */}
            <div>
              <label className="label" htmlFor="fb-comment">Your Review</label>
              <textarea
                id="fb-comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                className="input resize-none"
                placeholder="Share details about your experience..."
              />
            </div>

            {error && <p className="text-sm text-error-600">{error}</p>}
          </form>
        )}
      </Modal>

      {/* Success modal */}
      <Modal
        open={success}
        onClose={() => { setSuccess(false); setModalOpen(false); }}
        title="Review Submitted!"
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
            Thank you for your review! Your feedback has been shared with the organizer and our team.
          </p>
        </div>
      </Modal>
    </div>
  );
}
