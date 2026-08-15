import { useMemo } from 'react';
import { BadgePercent, Calendar, Ticket, Copy, TrendingUp, MapPin } from 'lucide-react';
import { useState } from 'react';
import { useAppData } from '@/context/AppDataContext';
import type { Offer } from '@/types';
import PageHeader from '@/components/ui/PageHeader';
import EmptyState from '@/components/ui/EmptyState';
import { formatDate } from '@/lib/format';

export default function CustomerOffersPage() {
  const { offers, events } = useAppData();
  const [copiedCode, setCopiedCode] = useState('');

  const activeOffers = useMemo(
    () => offers.filter((o) => o.status === 'active'),
    [offers],
  );

  const copyCode = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  const getEvent = (eventId: string) => events.find((e) => e.id === eventId);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Active Offers"
        description="Browse available discount codes and save on your next event booking."
        icon={<BadgePercent className="h-5 w-5" />}
      />

      {activeOffers.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={<BadgePercent className="h-7 w-7" />}
            title="No active offers"
            description="Check back later for new discount codes and promotions."
          />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {activeOffers.map((offer: Offer) => {
            const evt = getEvent(offer.eventId);
            return (
              <div key={offer.id} className="card group overflow-hidden transition-all duration-200 hover:shadow-cardhover">
                {/* Discount banner */}
                <div className="relative bg-gradient-to-br from-accent-500 to-accent-700 p-5 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-3xl font-bold">{offer.discountPercent}%</p>
                      <p className="text-sm text-white/80">Off</p>
                    </div>
                    <BadgePercent className="h-10 w-10 text-white/30" />
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-display text-base font-bold text-gray-900">{offer.title}</h3>
                  <p className="mt-1 text-sm text-gray-500">{offer.description}</p>

                  {evt && (
                    <div className="mt-3 flex items-center gap-1.5 text-xs text-gray-500">
                      <MapPin className="h-3.5 w-3.5 text-gray-400" />
                      {evt.venue}, {evt.location}
                    </div>
                  )}

                  {/* Code */}
                  <div className="mt-4 flex items-center gap-2">
                    <div className="flex-1 rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 px-3 py-2">
                      <p className="text-xs text-gray-400">Discount Code</p>
                      <p className="font-mono text-sm font-bold tracking-wider text-gray-900">{offer.code}</p>
                    </div>
                    <button
                      onClick={() => copyCode(offer.code)}
                      className="rounded-lg border border-gray-200 p-2.5 text-gray-500 transition hover:bg-gray-50 hover:text-brand-600"
                      aria-label="Copy code"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                  {copiedCode === offer.code && (
                    <p className="mt-1 text-xs font-medium text-success-600">Code copied to clipboard!</p>
                  )}

                  {/* Stats */}
                  <div className="mt-4 grid grid-cols-2 gap-3 border-t border-gray-50 pt-3">
                    <div>
                      <p className="flex items-center gap-1 text-xs text-gray-400">
                        <Calendar className="h-3 w-3" />
                        Expires
                      </p>
                      <p className="mt-0.5 text-sm font-medium text-gray-700">{formatDate(offer.validUntil)}</p>
                    </div>
                    <div>
                      <p className="flex items-center gap-1 text-xs text-gray-400">
                        <Ticket className="h-3 w-3" />
                        Used
                      </p>
                      <p className="mt-0.5 text-sm font-medium text-gray-700">{offer.usedCount}/{offer.maxUses}</p>
                    </div>
                  </div>

                  {/* Usage bar */}
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-accent-400 to-accent-600 transition-all duration-500"
                      style={{ width: `${Math.min((offer.usedCount / offer.maxUses) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
