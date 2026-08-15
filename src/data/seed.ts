import type { User, Category, Event, Booking, Offer, Complaint, OrganizerRequest, Feedback } from '@/types';

export const mockUsers: User[] = [
  {
    id: 'u-admin-001',
    name: 'Alex Morgan',
    email: 'alex.admin@eventhub.com',
    role: 'admin',
    avatar: 'AM',
  },
  {
    id: 'u-org-001',
    name: 'Jamie Chen',
    email: 'jamie@brightlightevents.com',
    role: 'organizer',
    avatar: 'JC',
  },
  {
    id: 'u-att-001',
    name: 'Sam Rivera',
    email: 'sam.rivera@gmail.com',
    role: 'customer',
    avatar: 'SR',
  },
];

export const seedCategories: Category[] = [
  { id: 'cat-1', name: 'Music & Concerts', description: 'Live performances, concerts, and music festivals', color: '#8b5cf6', icon: 'Music', createdAt: '2024-01-10T09:00:00Z' },
  { id: 'cat-2', name: 'Technology', description: 'Tech conferences, hackathons, and workshops', color: '#2563eb', icon: 'Laptop', createdAt: '2024-01-10T09:05:00Z' },
  { id: 'cat-3', name: 'Sports', description: 'Sporting events, tournaments, and matches', color: '#16a34a', icon: 'Trophy', createdAt: '2024-01-10T09:10:00Z' },
  { id: 'cat-4', name: 'Arts & Culture', description: 'Art exhibitions, theater, and cultural events', color: '#f59e0b', icon: 'Palette', createdAt: '2024-01-10T09:15:00Z' },
  { id: 'cat-5', name: 'Food & Drink', description: 'Food festivals, tastings, and culinary events', color: '#ef4444', icon: 'UtensilsCrossed', createdAt: '2024-01-10T09:20:00Z' },
  { id: 'cat-6', name: 'Business', description: 'Networking, seminars, and business conferences', color: '#0891b2', icon: 'Briefcase', createdAt: '2024-01-10T09:25:00Z' },
];

export const seedEvents: Event[] = [
  {
    id: 'evt-1', title: 'Summer Beats Festival 2025', description: 'A three-day outdoor music festival featuring top artists across pop, rock, and electronic genres. Multiple stages, food courts, and camping options available.',
    categoryId: 'cat-1', organizerId: 'u-org-001', organizerName: 'Jamie Chen',
    location: 'Los Angeles, CA', venue: 'Hollywood Bowl',
    startDate: '2025-07-18T16:00:00Z', endDate: '2025-07-20T23:00:00Z',
    price: 1499, capacity: 18000, bookedCount: 12450, status: 'published',
    image: 'https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg',
    tags: ['festival', 'outdoor', 'live-music'], createdAt: '2025-01-15T10:00:00Z',
  },
  {
    id: 'evt-2', title: 'AI & Future Tech Summit', description: 'Explore the cutting edge of artificial intelligence, machine learning, and emerging technologies with industry leaders and hands-on workshops.',
    categoryId: 'cat-2', organizerId: 'u-org-001', organizerName: 'Jamie Chen',
    location: 'San Francisco, CA', venue: 'Moscone Center',
    startDate: '2025-09-12T09:00:00Z', endDate: '2025-09-13T17:00:00Z',
    price: 2999, capacity: 5000, bookedCount: 3200, status: 'published',
    image: 'https://images.pexels.com/photos/7988079/pexels-photo-7988079.jpeg',
    tags: ['conference', 'AI', 'workshops'], createdAt: '2025-02-01T10:00:00Z',
  },
  {
    id: 'evt-3', title: 'City Marathon 2025', description: 'Annual city marathon with 5K, 10K, and full marathon categories. Open to all skill levels with medals and refreshments for all finishers.',
    categoryId: 'cat-3', organizerId: 'u-org-001', organizerName: 'Jamie Chen',
    location: 'Chicago, IL', venue: 'Grant Park',
    startDate: '2025-10-05T06:00:00Z', endDate: '2025-10-05T13:00:00Z',
    price: 499, capacity: 25000, bookedCount: 18200, status: 'published',
    image: 'https://images.pexels.com/photos/4123665/pexels-photo-4123665.jpeg',
    tags: ['marathon', 'outdoor', 'competition'], createdAt: '2025-02-10T10:00:00Z',
  },
  {
    id: 'evt-4', title: 'Modern Art Exhibition', description: 'A curated exhibition of contemporary art from emerging and established artists. Interactive installations and guided tours available.',
    categoryId: 'cat-4', organizerId: 'u-org-001', organizerName: 'Jamie Chen',
    location: 'New York, NY', venue: 'MoMA PS1',
    startDate: '2025-08-01T10:00:00Z', endDate: '2025-08-30T18:00:00Z',
    price: 299, capacity: 800, bookedCount: 410, status: 'published',
    image: 'https://images.pexels.com/photos/1839919/pexels-photo-1839919.jpeg',
    tags: ['exhibition', 'art', 'gallery'], createdAt: '2025-03-01T10:00:00Z',
  },
  {
    id: 'evt-5', title: 'Gourmet Food Festival', description: 'Sample dishes from 50+ local restaurants and food trucks. Live cooking demos, wine tastings, and family-friendly activities.',
    categoryId: 'cat-5', organizerId: 'u-org-001', organizerName: 'Jamie Chen',
    location: 'Austin, TX', venue: 'Zilker Park',
    startDate: '2025-09-20T11:00:00Z', endDate: '2025-09-21T20:00:00Z',
    price: 399, capacity: 6000, bookedCount: 2400, status: 'published',
    image: 'https://images.pexels.com/photos/326278/pexels-photo-326278.jpeg',
    tags: ['food', 'festival', 'family'], createdAt: '2025-03-15T10:00:00Z',
  },
  {
    id: 'evt-6', title: 'Startup Connect 2025', description: 'Networking event for founders, investors, and professionals. Pitch sessions, panel discussions, and investor meetups.',
    categoryId: 'cat-6', organizerId: 'u-org-001', organizerName: 'Jamie Chen',
    location: 'Seattle, WA', venue: 'Washington State Convention Center',
    startDate: '2025-11-08T08:00:00Z', endDate: '2025-11-08T18:00:00Z',
    price: 1200, capacity: 1500, bookedCount: 680, status: 'published',
    image: 'https://images.pexels.com/photos/2776240/pexels-photo-2776240.jpeg',
    tags: ['networking', 'startup', 'business'], createdAt: '2025-04-01T10:00:00Z',
  },
  {
    id: 'evt-7', title: 'Indie Night Live', description: 'An intimate evening with indie bands performing acoustic and full sets at a cozy downtown venue.',
    categoryId: 'cat-1', organizerId: 'u-org-001', organizerName: 'Jamie Chen',
    location: 'Portland, OR', venue: 'Mississippi Studios',
    startDate: '2025-08-15T19:00:00Z', endDate: '2025-08-15T23:00:00Z',
    price: 299, capacity: 500, bookedCount: 420, status: 'published',
    image: 'https://images.pexels.com/photos/1389429/pexels-photo-1389429.jpeg',
    tags: ['indie', 'concert', 'intimate'], createdAt: '2025-04-10T10:00:00Z',
  },
  {
    id: 'evt-8', title: 'Web Dev Bootcamp Workshop', description: 'A hands-on weekend workshop covering modern web development: React, Next.js, and deployment best practices.',
    categoryId: 'cat-2', organizerId: 'u-org-001', organizerName: 'Jamie Chen',
    location: 'Boston, MA', venue: 'Cambridge Innovation Center',
    startDate: '2025-10-18T09:00:00Z', endDate: '2025-10-19T17:00:00Z',
    price: 1999, capacity: 120, bookedCount: 95, status: 'draft',
    image: 'https://images.pexels.com/photos/270404/pexels-photo-270404.jpeg',
    tags: ['workshop', 'coding', 'web-dev'], createdAt: '2025-05-01T10:00:00Z',
  },
];

export const seedBookings: Booking[] = [
  { id: 'bkg-1', eventId: 'evt-1', eventTitle: 'Summer Beats Festival 2025', userId: 'u-att-001', userName: 'Sam Rivera', userEmail: 'sam.rivera@gmail.com', tickets: 2, totalPrice: 2998, status: 'confirmed', paid: true, notes: 'Excited for the festival!', createdAt: '2025-06-01T14:30:00Z' },
  { id: 'bkg-2', eventId: 'evt-3', eventTitle: 'City Marathon 2025', userId: 'u-att-001', userName: 'Sam Rivera', userEmail: 'sam.rivera@gmail.com', tickets: 1, totalPrice: 499, status: 'confirmed', paid: true, notes: 'Running the 10K', createdAt: '2025-06-15T10:00:00Z' },
  { id: 'bkg-3', eventId: 'evt-2', eventTitle: 'AI & Future Tech Summit', userId: 'u-att-001', userName: 'Sam Rivera', userEmail: 'sam.rivera@gmail.com', tickets: 1, totalPrice: 2999, status: 'pending', paid: false, notes: 'Awaiting approval from manager', createdAt: '2025-07-20T09:15:00Z' },
  { id: 'bkg-4', eventId: 'evt-5', eventTitle: 'Gourmet Food Festival', userId: 'u-att-001', userName: 'Sam Rivera', userEmail: 'sam.rivera@gmail.com', tickets: 3, totalPrice: 1197, status: 'attended', paid: true, notes: 'Great experience!', createdAt: '2025-08-25T11:00:00Z' },
  { id: 'bkg-5', eventId: 'evt-4', eventTitle: 'Modern Art Exhibition', userId: 'u-att-001', userName: 'Sam Rivera', userEmail: 'sam.rivera@gmail.com', tickets: 2, totalPrice: 598, status: 'cancelled', paid: false, notes: 'Schedule conflict', createdAt: '2025-07-10T16:00:00Z' },
  { id: 'bkg-6', eventId: 'evt-7', eventTitle: 'Indie Night Live', userId: 'u-att-001', userName: 'Sam Rivera', userEmail: 'sam.rivera@gmail.com', tickets: 2, totalPrice: 598, status: 'confirmed', paid: false, notes: 'Looking forward to it!', createdAt: '2025-07-28T18:00:00Z' },
];

export const seedOffers: Offer[] = [
  { id: 'off-1', title: 'Early Bird 20% Off', description: 'Get 20% off on Summer Beats Festival tickets for a limited time.', eventId: 'evt-1', eventTitle: 'Summer Beats Festival 2025', discountPercent: 20, code: 'EARLY20', validFrom: '2025-06-01T00:00:00Z', validUntil: '2025-07-01T00:00:00Z', maxUses: 500, usedCount: 342, status: 'active', createdAt: '2025-05-20T10:00:00Z' },
  { id: 'off-2', title: 'Tech Summit Bundle', description: '15% off when you book 2+ tickets for AI & Future Tech Summit.', eventId: 'evt-2', eventTitle: 'AI & Future Tech Summit', discountPercent: 15, code: 'TECHBUNDLE', validFrom: '2025-07-01T00:00:00Z', validUntil: '2025-09-01T00:00:00Z', maxUses: 200, usedCount: 88, status: 'active', createdAt: '2025-06-25T10:00:00Z' },
  { id: 'off-3', title: 'Marathon Flash Sale', description: 'Last chance! 30% off City Marathon registration.', eventId: 'evt-3', eventTitle: 'City Marathon 2025', discountPercent: 30, code: 'FLASH30', validFrom: '2025-05-01T00:00:00Z', validUntil: '2025-06-01T00:00:00Z', maxUses: 1000, usedCount: 1000, status: 'expired', createdAt: '2025-04-20T10:00:00Z' },
  { id: 'off-4', title: 'Foodie Friday Deal', description: 'Buy one get one 50% off on Gourmet Food Festival.', eventId: 'evt-5', eventTitle: 'Gourmet Food Festival', discountPercent: 50, code: 'FOODIE50', validFrom: '2025-08-01T00:00:00Z', validUntil: '2025-09-19T00:00:00Z', maxUses: 300, usedCount: 12, status: 'disabled', createdAt: '2025-07-25T10:00:00Z' },
];

export const seedComplaints: Complaint[] = [
  { id: 'cmp-1', subject: 'Payment was charged twice', description: 'I was charged twice for my Summer Beats Festival booking. I need a refund for the duplicate charge.', category: 'payment', userId: 'u-att-001', userName: 'Sam Rivera', userEmail: 'sam.rivera@gmail.com', eventId: 'evt-1', eventTitle: 'Summer Beats Festival 2025', priority: 'high', status: 'in-progress', response: 'We are investigating the duplicate charge with our payment processor. Will resolve within 48 hours.', createdAt: '2025-06-02T09:00:00Z', updatedAt: '2025-06-02T15:00:00Z' },
  { id: 'cmp-2', subject: 'Sound quality was poor', description: 'During the Gourmet Food Festival, the cooking demo sound system was not working properly. Could not hear the chef.', category: 'event-quality', userId: 'u-att-001', userName: 'Sam Rivera', userEmail: 'sam.rivera@gmail.com', eventId: 'evt-5', eventTitle: 'Gourmet Food Festival', priority: 'medium', status: 'resolved', response: 'We apologize for the inconvenience. We have upgraded the sound equipment for all future cooking demos.', createdAt: '2025-08-26T10:00:00Z', updatedAt: '2025-08-28T14:00:00Z' },
  { id: 'cmp-3', subject: 'Need refund for cancelled booking', description: 'I cancelled my Modern Art Exhibition booking but have not received my refund yet. It has been over a week.', category: 'payment', userId: 'u-att-001', userName: 'Sam Rivera', userEmail: 'sam.rivera@gmail.com', eventId: 'evt-4', eventTitle: 'Modern Art Exhibition', priority: 'high', status: 'open', createdAt: '2025-07-18T11:00:00Z', updatedAt: '2025-07-18T11:00:00Z' },
  { id: 'cmp-4', subject: 'Venue was hard to find', description: 'The venue for the Gourmet Food Festival had poor signage. It took me 30 minutes to find the entrance.', category: 'venue', userId: 'u-att-001', userName: 'Sam Rivera', userEmail: 'sam.rivera@gmail.com', eventId: 'evt-5', eventTitle: 'Gourmet Food Festival', priority: 'low', status: 'dismissed', response: 'Noted. We will improve signage for next year.', createdAt: '2025-08-22T16:00:00Z', updatedAt: '2025-08-24T10:00:00Z' },
];

export const seedOrganizerRequests: OrganizerRequest[] = [
  { id: 'org-req-1', name: 'Priya Sharma', email: 'priya@vibrantevents.in', company: 'Vibrant Events Co.', phone: '+91 98765 43210', description: 'Specializing in corporate events and conferences across Mumbai and Delhi.', status: 'pending', submittedAt: '2025-08-01T10:00:00Z' },
  { id: 'org-req-2', name: 'Rahul Verma', email: 'rahul@stellarweddings.in', company: 'Stellar Weddings', phone: '+91 98123 45678', description: 'Premium wedding planning service. 10+ years of experience in luxury weddings.', status: 'pending', submittedAt: '2025-08-05T14:30:00Z' },
  { id: 'org-req-3', name: 'Anita Desai', email: 'anita@culturecurry.in', company: 'Culture Curry', phone: '+91 99887 76655', description: 'Cultural events, music festivals, and art exhibitions across South India.', status: 'accepted', submittedAt: '2025-07-15T09:00:00Z', reviewedAt: '2025-07-18T11:00:00Z' },
  { id: 'org-req-4', name: 'Vikram Singh', email: 'vikram@eventpro.in', company: 'EventPro Solutions', phone: '+91 90123 45678', description: 'Full-service event management for tech conferences and product launches.', status: 'rejected', submittedAt: '2025-07-20T16:00:00Z', reviewedAt: '2025-07-22T10:00:00Z' },
  { id: 'org-req-5', name: 'Meera Iyer', email: 'meera@celebrationcentral.in', company: 'Celebration Central', phone: '+91 88776 55443', description: 'Birthday parties, anniversaries, and private celebrations. Serving Bangalore.', status: 'pending', submittedAt: '2025-08-10T12:00:00Z' },
];

export const seedFeedback: Feedback[] = [
  { id: 'fb-1', eventId: 'evt-1', eventTitle: 'Summer Beats Festival 2025', userId: 'u-att-001', userName: 'Sam Rivera', userEmail: 'sam.rivera@gmail.com', rating: 5, comment: 'Absolutely incredible festival! The lineup was amazing and the organization was top-notch.', createdAt: '2025-07-22T10:00:00Z' },
  { id: 'fb-2', eventId: 'evt-5', eventTitle: 'Gourmet Food Festival', userId: 'u-att-001', userName: 'Sam Rivera', userEmail: 'sam.rivera@gmail.com', rating: 4, comment: 'Great variety of food stalls but the lines were a bit long. Overall a fun experience.', createdAt: '2025-09-22T18:00:00Z' },
  { id: 'fb-3', eventId: 'evt-3', eventTitle: 'City Marathon 2025', userId: 'u-att-001', userName: 'Sam Rivera', userEmail: 'sam.rivera@gmail.com', rating: 5, comment: 'Best organized marathon I have participated in. Water stations were well placed and the route was scenic.', createdAt: '2025-10-06T08:00:00Z' },
  { id: 'fb-4', eventId: 'evt-2', eventTitle: 'AI & Future Tech Summit', userId: 'u-att-001', userName: 'Sam Rivera', userEmail: 'sam.rivera@gmail.com', rating: 4, comment: 'Excellent speakers and workshops. Would have liked more networking time between sessions.', createdAt: '2025-09-14T16:00:00Z' },
];

export const seedUsers: User[] = [
  { id: 'u-admin-001', name: 'Alex Morgan', email: 'alex.admin@eventhub.com', role: 'admin', avatar: 'AM' },
  { id: 'u-org-001', name: 'Jamie Chen', email: 'jamie@brightlightevents.com', role: 'organizer', avatar: 'JC' },
  { id: 'u-att-001', name: 'Sam Rivera', email: 'sam.rivera@gmail.com', role: 'customer', avatar: 'SR' },
  { id: 'u-cust-002', name: 'Priya Patel', email: 'priya.patel@gmail.com', role: 'customer', avatar: 'PP' },
  { id: 'u-cust-003', name: 'Arjun Kumar', email: 'arjun.kumar@gmail.com', role: 'customer', avatar: 'AK' },
  { id: 'u-cust-004', name: 'Nisha Gupta', email: 'nisha.gupta@gmail.com', role: 'customer', avatar: 'NG' },
  { id: 'u-org-002', name: 'Anita Desai', email: 'anita@culturecurry.in', role: 'organizer', avatar: 'AD' },
];
