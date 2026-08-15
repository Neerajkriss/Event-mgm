export type Role = 'admin' | 'organizer' | 'customer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  createdAt: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  organizerId: string;
  organizerName: string;
  location: string;
  venue: string;
  startDate: string;
  endDate: string;
  price: number;
  capacity: number;
  bookedCount: number;
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  image: string;
  tags: string[];
  createdAt: string;
}

export interface Booking {
  id: string;
  eventId: string;
  eventTitle: string;
  userId: string;
  userName: string;
  userEmail: string;
  tickets: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'attended';
  paid: boolean;
  notes: string;
  createdAt: string;
}

export interface Offer {
  id: string;
  title: string;
  description: string;
  eventId: string;
  eventTitle: string;
  discountPercent: number;
  code: string;
  validFrom: string;
  validUntil: string;
  maxUses: number;
  usedCount: number;
  status: 'active' | 'expired' | 'disabled';
  createdAt: string;
}

export interface Complaint {
  id: string;
  subject: string;
  description: string;
  category: 'payment' | 'event-quality' | 'organizer' | 'venue' | 'other';
  userId: string;
  userName: string;
  userEmail: string;
  eventId?: string;
  eventTitle?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'in-progress' | 'resolved' | 'dismissed';
  response?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizerRequest {
  id: string;
  name: string;
  email: string;
  company: string;
  phone: string;
  description: string;
  status: 'pending' | 'accepted' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
}

export interface Feedback {
  id: string;
  eventId: string;
  eventTitle: string;
  userId: string;
  userName: string;
  userEmail: string;
  rating: number;
  comment: string;
  createdAt: string;
}
