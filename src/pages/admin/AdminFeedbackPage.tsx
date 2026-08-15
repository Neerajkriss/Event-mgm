import { useState, useMemo } from 'react';
import { Star, Search, TrendingUp, ThumbsUp, MessageSquare } from 'lucide-react';
import { useAppData } from '@/context/AppDataContext';
import PageHeader from '@/components/ui/PageHeader';
import EmptyState from '@/components/ui/EmptyState';
import { formatDate } from '@/lib/format';

function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'lg' }) {
  const sizeClass = size === 'lg' ? 'h-5 w-5' : 'h-4 w-4';
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${sizeClass} ${star <= rating ? 'fill-warning-400 text-warning-400' : 'fill-gray-200 text-gray-200'}`}
        />
      ))}
    </div>
  );
}

export default function AdminFeedbackPage() {
  const { feedback, events } = useAppData();
  const [search, setSearch] = useState('');
  const [eventFilter, setEventFilter] = useState<string>('all');

  const filtered = useMemo(() => {
    return feedback.filter((f) => {
      const matchesSearch =
        f.userName.toLowerCase().includes(search.toLowerCase()) ||
        f.comment.toLowerCase().includes(search.toLowerCase()) ||
        f.eventTitle.toLowerCase().includes(search.toLowerCase());
      const matchesEvent = eventFilter === 'all' || f.eventId === eventFilter;
      return matchesSearch && matchesEvent;
    });
  }, [feedback, search, eventFilter]);

  const avgRating = feedback.length > 0
    ? (feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length).toFixed(1)
    : '0.0';

  const ratingDistribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: feedback.filter((f) => f.rating === star).length,
    percent: feedback.length > 0 ? (feedback.filter((f) => f.rating === star).length / feedback.length) * 100 : 0,
  }));

  const positiveCount = feedback.filter((f) => f.rating >= 4).length;
  const positivePercent = feedback.length > 0 ? Math.round((positiveCount / feedback.length) * 100) : 0;

  const eventOptions = events.filter((e) => feedback.some((f) => f.eventId === e.id));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Feedback & Ratings"
        description="Review user-submitted ratings and feedback for events across the platform."
        icon={<Star className="h-5 w-5" />}
      />

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card p-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-warning-100 text-warning-600">
            <Star className="h-5 w-5" />
          </div>
          <p className="mt-4 text-3xl font-bold text-gray-900">{avgRating}</p>
          <p className="mt-1 text-sm text-gray-500">Average Rating</p>
          <div className="mt-2">
            <StarRating rating={Math.round(Number(avgRating))} />
          </div>
        </div>

        <div className="card p-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-100 text-brand-600">
            <MessageSquare className="h-5 w-5" />
          </div>
          <p className="mt-4 text-3xl font-bold text-gray-900">{feedback.length}</p>
          <p className="mt-1 text-sm text-gray-500">Total Reviews</p>
        </div>

        <div className="card p-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-success-100 text-success-600">
            <ThumbsUp className="h-5 w-5" />
          </div>
          <p className="mt-4 text-3xl font-bold text-gray-900">{positivePercent}%</p>
          <p className="mt-1 text-sm text-gray-500">Positive (4-5 stars)</p>
        </div>

        <div className="card p-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-100 text-accent-600">
            <TrendingUp className="h-5 w-5" />
          </div>
          <p className="mt-4 text-3xl font-bold text-gray-900">{eventOptions.length}</p>
          <p className="mt-1 text-sm text-gray-500">Events Reviewed</p>
        </div>
      </div>

      {/* Rating distribution bar */}
      <div className="card p-5">
        <h3 className="font-display text-base font-bold text-gray-900">Rating Distribution</h3>
        <div className="mt-4 space-y-2.5">
          {ratingDistribution.map(({ star, count, percent }) => (
            <div key={star} className="flex items-center gap-3">
              <div className="flex w-16 items-center gap-1 text-sm font-medium text-gray-600">
                {star} <Star className="h-3.5 w-3.5 fill-warning-400 text-warning-400" />
              </div>
              <div className="h-6 flex-1 overflow-hidden rounded-lg bg-gray-100">
                <div
                  className="flex h-full items-center justify-end rounded-lg bg-gradient-to-r from-warning-400 to-warning-500 px-2 transition-all duration-500"
                  style={{ width: `${Math.max(percent, count > 0 ? 8 : 0)}%` }}
                >
                  {count > 0 && <span className="text-xs font-semibold text-white">{count}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search feedback..."
            className="input pl-10"
          />
        </div>
        <select
          value={eventFilter}
          onChange={(e) => setEventFilter(e.target.value)}
          className="input sm:w-56"
        >
          <option value="all">All Events</option>
          {eventOptions.map((e) => (
            <option key={e.id} value={e.id}>{e.title}</option>
          ))}
        </select>
      </div>

      {/* Feedback cards */}
      {filtered.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={<Star className="h-7 w-7" />}
            title="No feedback found"
            description="User feedback and ratings will appear here once submitted."
          />
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {filtered.map((fb) => (
            <div key={fb.id} className="card p-5 transition-all duration-200 hover:shadow-cardhover">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-sm font-bold text-brand-700">
                    {fb.userName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{fb.userName}</p>
                    <p className="text-xs text-gray-400">{formatDate(fb.createdAt)}</p>
                  </div>
                </div>
                <StarRating rating={fb.rating} size="lg" />
              </div>
              <div className="mt-3 rounded-lg bg-gray-50 p-3">
                <p className="text-xs font-medium text-gray-500">{fb.eventTitle}</p>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">{fb.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
