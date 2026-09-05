import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { Category, Event, Booking, Offer, Complaint, OrganizerRequest, Feedback, User } from '@/types';
import {
  seedCategories, seedEvents, seedBookings, seedOffers, seedComplaints,
  seedOrganizerRequests, seedFeedback, seedUsers,
} from '@/data/seed';
import { supabase } from '@/lib/supabase';

interface AppState {
  categories: Category[];
  events: Event[];
  bookings: Booking[];
  offers: Offer[];
  complaints: Complaint[];
  organizerRequests: OrganizerRequest[];
  feedback: Feedback[];
  users: User[];
}

interface AppDataContextValue extends AppState {
  // Categories
  addCategory: (cat: Omit<Category, 'id' | 'createdAt'>) => void;
  updateCategory: (id: string, patch: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  // Events
  addEvent: (evt: Omit<Event, 'id' | 'createdAt'>) => void;
  updateEvent: (id: string, patch: Partial<Event>) => void;
  deleteEvent: (id: string) => void;
  // Bookings
  addBooking: (bkg: Omit<Booking, 'id' | 'createdAt'>) => void;
  updateBooking: (id: string, patch: Partial<Booking>) => void;
  deleteBooking: (id: string) => void;
  // Offers
  addOffer: (off: Omit<Offer, 'id' | 'createdAt'>) => void;
  updateOffer: (id: string, patch: Partial<Offer>) => void;
  deleteOffer: (id: string) => void;
  // Complaints
  addComplaint: (cmp: Omit<Complaint, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateComplaint: (id: string, patch: Partial<Complaint>) => void;
  deleteComplaint: (id: string) => void;
  // Organizer Requests
  addOrganizerRequest: (req: Omit<OrganizerRequest, 'id' | 'submittedAt'>) => void;
  updateOrganizerRequest: (id: string, patch: Partial<OrganizerRequest>) => void;
  deleteOrganizerRequest: (id: string) => void;
  // Feedback
  addFeedback: (fb: Omit<Feedback, 'id' | 'createdAt'>) => void;
  updateFeedback: (id: string, patch: Partial<Feedback>) => void;
  deleteFeedback: (id: string) => void;
  // Users
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (id: string, patch: Partial<User>) => void;
  deleteUser: (id: string) => void;
  // Utility
  resetData: () => void;
}

const initialState: AppState = {
  categories: seedCategories,
  events: seedEvents,
  bookings: seedBookings,
  offers: seedOffers,
  complaints: seedComplaints,
  organizerRequests: seedOrganizerRequests,
  feedback: seedFeedback,
  users: seedUsers,
};

const AppDataContext = createContext<AppDataContextValue | null>(null);

function genId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(initialState);

  useEffect(() => {
    let isMounted = true;

    async function loadAndSeedData() {
      try {
        const [
          catRes,
          userRes,
          evtRes,
          bkgRes,
          offRes,
          cmpRes,
          orgRes,
          fbRes,
        ] = await Promise.all([
          supabase.from('categories').select('*'),
          supabase.from('users').select('*'),
          supabase.from('events').select('*'),
          supabase.from('bookings').select('*'),
          supabase.from('offers').select('*'),
          supabase.from('complaints').select('*'),
          supabase.from('organizer_requests').select('*'),
          supabase.from('feedback').select('*'),
        ]);

        let categoriesData = catRes.data && catRes.data.length > 0 ? (catRes.data as Category[]) : null;
        let usersData = userRes.data && userRes.data.length > 0 ? (userRes.data as User[]) : null;
        let eventsData = evtRes.data && evtRes.data.length > 0 ? (evtRes.data as Event[]) : null;
        let bookingsData = bkgRes.data && bkgRes.data.length > 0 ? (bkgRes.data as Booking[]) : null;
        let offersData = offRes.data && offRes.data.length > 0 ? (offRes.data as Offer[]) : null;
        let complaintsData = cmpRes.data && cmpRes.data.length > 0 ? (cmpRes.data as Complaint[]) : null;
        let orgRequestsData = orgRes.data && orgRes.data.length > 0 ? (orgRes.data as OrganizerRequest[]) : null;
        let feedbackData = fbRes.data && fbRes.data.length > 0 ? (fbRes.data as Feedback[]) : null;

        // If any table is completely empty on first load, seed it using the corresponding seed data
        // Respect foreign key dependency order: users & categories -> events -> bookings, offers, complaints, feedback, organizer_requests
        if (!usersData) {
          const { error } = await supabase.from('users').insert(seedUsers);
          if (error) console.error('Error seeding users:', error);
          usersData = seedUsers;
        }

        if (!categoriesData) {
          const { error } = await supabase.from('categories').insert(seedCategories);
          if (error) console.error('Error seeding categories:', error);
          categoriesData = seedCategories;
        }

        if (!eventsData) {
          const { error } = await supabase.from('events').insert(seedEvents);
          if (error) console.error('Error seeding events:', error);
          eventsData = seedEvents;
        }

        if (!bookingsData) {
          const { error } = await supabase.from('bookings').insert(seedBookings);
          if (error) console.error('Error seeding bookings:', error);
          bookingsData = seedBookings;
        }

        if (!offersData) {
          const { error } = await supabase.from('offers').insert(seedOffers);
          if (error) console.error('Error seeding offers:', error);
          offersData = seedOffers;
        }

        if (!complaintsData) {
          const { error } = await supabase.from('complaints').insert(seedComplaints);
          if (error) console.error('Error seeding complaints:', error);
          complaintsData = seedComplaints;
        }

        if (!orgRequestsData) {
          const { error } = await supabase.from('organizer_requests').insert(seedOrganizerRequests);
          if (error) console.error('Error seeding organizer_requests:', error);
          orgRequestsData = seedOrganizerRequests;
        }

        if (!feedbackData) {
          const { error } = await supabase.from('feedback').insert(seedFeedback);
          if (error) console.error('Error seeding feedback:', error);
          feedbackData = seedFeedback;
        }

        if (isMounted) {
          setState({
            categories: categoriesData,
            users: usersData,
            events: eventsData,
            bookings: bookingsData,
            offers: offersData,
            complaints: complaintsData,
            organizerRequests: orgRequestsData,
            feedback: feedbackData,
          });
        }
      } catch (err) {
        console.error('Error loading data from Supabase:', err);
      }
    }

    loadAndSeedData();

    return () => {
      isMounted = false;
    };
  }, []);

  const addCategory = useCallback((cat: Omit<Category, 'id' | 'createdAt'>) => {
    const newCat: Category = { ...cat, id: genId('cat'), createdAt: new Date().toISOString() };
    setState((prev) => ({ ...prev, categories: [...prev.categories, newCat] }));
    supabase.from('categories').insert(newCat).then(({ error }) => {
      if (error) console.error('Error inserting category into Supabase:', error);
    });
  }, []);

  const updateCategory = useCallback((id: string, patch: Partial<Category>) => {
    setState((prev) => ({ ...prev, categories: prev.categories.map((c) => c.id === id ? { ...c, ...patch } : c) }));
    supabase.from('categories').update(patch).eq('id', id).then(({ error }) => {
      if (error) console.error('Error updating category in Supabase:', error);
    });
  }, []);

  const deleteCategory = useCallback((id: string) => {
    setState((prev) => ({ ...prev, categories: prev.categories.filter((c) => c.id !== id) }));
    supabase.from('categories').delete().eq('id', id).then(({ error }) => {
      if (error) console.error('Error deleting category in Supabase:', error);
    });
  }, []);

  const addEvent = useCallback((evt: Omit<Event, 'id' | 'createdAt'>) => {
    const newEvt: Event = { ...evt, id: genId('evt'), createdAt: new Date().toISOString() };
    setState((prev) => ({ ...prev, events: [...prev.events, newEvt] }));
    supabase.from('events').insert(newEvt).then(({ error }) => {
      if (error) console.error('Error inserting event into Supabase:', error);
    });
  }, []);

  const updateEvent = useCallback((id: string, patch: Partial<Event>) => {
    setState((prev) => ({ ...prev, events: prev.events.map((e) => e.id === id ? { ...e, ...patch } : e) }));
    supabase.from('events').update(patch).eq('id', id).then(({ error }) => {
      if (error) console.error('Error updating event in Supabase:', error);
    });
  }, []);

  const deleteEvent = useCallback((id: string) => {
    setState((prev) => ({ ...prev, events: prev.events.filter((e) => e.id !== id) }));
    supabase.from('events').delete().eq('id', id).then(({ error }) => {
      if (error) console.error('Error deleting event in Supabase:', error);
    });
  }, []);

  const addBooking = useCallback((bkg: Omit<Booking, 'id' | 'createdAt'>) => {
    const newBkg: Booking = { ...bkg, paid: bkg.paid ?? false, id: genId('bkg'), createdAt: new Date().toISOString() };
    setState((prev) => ({ ...prev, bookings: [...prev.bookings, newBkg] }));
    supabase.from('bookings').insert(newBkg).then(({ error }) => {
      if (error) console.error('Error inserting booking into Supabase:', error);
    });
  }, []);

  const updateBooking = useCallback((id: string, patch: Partial<Booking>) => {
    setState((prev) => ({ ...prev, bookings: prev.bookings.map((b) => b.id === id ? { ...b, ...patch } : b) }));
    supabase.from('bookings').update(patch).eq('id', id).then(({ error }) => {
      if (error) console.error('Error updating booking in Supabase:', error);
    });
  }, []);

  const deleteBooking = useCallback((id: string) => {
    setState((prev) => ({ ...prev, bookings: prev.bookings.filter((b) => b.id !== id) }));
    supabase.from('bookings').delete().eq('id', id).then(({ error }) => {
      if (error) console.error('Error deleting booking in Supabase:', error);
    });
  }, []);

  const addOffer = useCallback((off: Omit<Offer, 'id' | 'createdAt'>) => {
    const newOff: Offer = { ...off, id: genId('off'), createdAt: new Date().toISOString() };
    setState((prev) => ({ ...prev, offers: [...prev.offers, newOff] }));
    supabase.from('offers').insert(newOff).then(({ error }) => {
      if (error) console.error('Error inserting offer into Supabase:', error);
    });
  }, []);

  const updateOffer = useCallback((id: string, patch: Partial<Offer>) => {
    setState((prev) => ({ ...prev, offers: prev.offers.map((o) => o.id === id ? { ...o, ...patch } : o) }));
    supabase.from('offers').update(patch).eq('id', id).then(({ error }) => {
      if (error) console.error('Error updating offer in Supabase:', error);
    });
  }, []);

  const deleteOffer = useCallback((id: string) => {
    setState((prev) => ({ ...prev, offers: prev.offers.filter((o) => o.id !== id) }));
    supabase.from('offers').delete().eq('id', id).then(({ error }) => {
      if (error) console.error('Error deleting offer in Supabase:', error);
    });
  }, []);

  const addComplaint = useCallback((cmp: Omit<Complaint, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newCmp: Complaint = { ...cmp, id: genId('cmp'), createdAt: now, updatedAt: now };
    setState((prev) => ({ ...prev, complaints: [...prev.complaints, newCmp] }));
    supabase.from('complaints').insert(newCmp).then(({ error }) => {
      if (error) console.error('Error inserting complaint into Supabase:', error);
    });
  }, []);

  const updateComplaint = useCallback((id: string, patch: Partial<Complaint>) => {
    const now = new Date().toISOString();
    const updateData = { ...patch, updatedAt: now };
    setState((prev) => ({
      ...prev,
      complaints: prev.complaints.map((c) => c.id === id ? { ...c, ...updateData } : c),
    }));
    supabase.from('complaints').update(updateData).eq('id', id).then(({ error }) => {
      if (error) console.error('Error updating complaint in Supabase:', error);
    });
  }, []);

  const deleteComplaint = useCallback((id: string) => {
    setState((prev) => ({ ...prev, complaints: prev.complaints.filter((c) => c.id !== id) }));
    supabase.from('complaints').delete().eq('id', id).then(({ error }) => {
      if (error) console.error('Error deleting complaint in Supabase:', error);
    });
  }, []);

  const addOrganizerRequest = useCallback((req: Omit<OrganizerRequest, 'id' | 'submittedAt'>) => {
    const newReq: OrganizerRequest = { ...req, id: genId('org-req'), submittedAt: new Date().toISOString() };
    setState((prev) => ({ ...prev, organizerRequests: [...prev.organizerRequests, newReq] }));
    supabase.from('organizer_requests').insert(newReq).then(({ error }) => {
      if (error) console.error('Error inserting organizer request into Supabase:', error);
    });
  }, []);

  const updateOrganizerRequest = useCallback((id: string, patch: Partial<OrganizerRequest>) => {
    setState((prev) => ({
      ...prev,
      organizerRequests: prev.organizerRequests.map((r) => r.id === id ? { ...r, ...patch } : r),
    }));
    supabase.from('organizer_requests').update(patch).eq('id', id).then(({ error }) => {
      if (error) console.error('Error updating organizer request in Supabase:', error);
    });
  }, []);

  const deleteOrganizerRequest = useCallback((id: string) => {
    setState((prev) => ({ ...prev, organizerRequests: prev.organizerRequests.filter((r) => r.id !== id) }));
    supabase.from('organizer_requests').delete().eq('id', id).then(({ error }) => {
      if (error) console.error('Error deleting organizer request in Supabase:', error);
    });
  }, []);

  const addFeedback = useCallback((fb: Omit<Feedback, 'id' | 'createdAt'>) => {
    const newFb: Feedback = { ...fb, id: genId('fb'), createdAt: new Date().toISOString() };
    setState((prev) => ({ ...prev, feedback: [...prev.feedback, newFb] }));
    supabase.from('feedback').insert(newFb).then(({ error }) => {
      if (error) console.error('Error inserting feedback into Supabase:', error);
    });
  }, []);

  const updateFeedback = useCallback((id: string, patch: Partial<Feedback>) => {
    setState((prev) => ({ ...prev, feedback: prev.feedback.map((f) => f.id === id ? { ...f, ...patch } : f) }));
    supabase.from('feedback').update(patch).eq('id', id).then(({ error }) => {
      if (error) console.error('Error updating feedback in Supabase:', error);
    });
  }, []);

  const deleteFeedback = useCallback((id: string) => {
    setState((prev) => ({ ...prev, feedback: prev.feedback.filter((f) => f.id !== id) }));
    supabase.from('feedback').delete().eq('id', id).then(({ error }) => {
      if (error) console.error('Error deleting feedback in Supabase:', error);
    });
  }, []);

  const addUser = useCallback((user: Omit<User, 'id'>) => {
    const newUser: User = { ...user, id: genId('u') };
    setState((prev) => ({ ...prev, users: [...prev.users, newUser] }));
    supabase.from('users').insert(newUser).then(({ error }) => {
      if (error) console.error('Error inserting user into Supabase:', error);
    });
  }, []);

  const updateUser = useCallback((id: string, patch: Partial<User>) => {
    setState((prev) => ({ ...prev, users: prev.users.map((u) => u.id === id ? { ...u, ...patch } : u) }));
    supabase.from('users').update(patch).eq('id', id).then(({ error }) => {
      if (error) console.error('Error updating user in Supabase:', error);
    });
  }, []);

  const deleteUser = useCallback((id: string) => {
    setState((prev) => ({ ...prev, users: prev.users.filter((u) => u.id !== id) }));
    supabase.from('users').delete().eq('id', id).then(({ error }) => {
      if (error) console.error('Error deleting user in Supabase:', error);
    });
  }, []);

  const resetData = useCallback(async () => {
    setState(initialState);
    try {
      // Delete all records in reverse dependency order
      await supabase.from('feedback').delete().neq('id', '');
      await supabase.from('complaints').delete().neq('id', '');
      await supabase.from('offers').delete().neq('id', '');
      await supabase.from('bookings').delete().neq('id', '');
      await supabase.from('events').delete().neq('id', '');
      await supabase.from('organizer_requests').delete().neq('id', '');
      await supabase.from('categories').delete().neq('id', '');
      await supabase.from('users').delete().neq('id', '');

      // Re-insert seed data in dependency order
      await supabase.from('users').insert(seedUsers);
      await supabase.from('categories').insert(seedCategories);
      await supabase.from('events').insert(seedEvents);
      await supabase.from('bookings').insert(seedBookings);
      await supabase.from('offers').insert(seedOffers);
      await supabase.from('complaints').insert(seedComplaints);
      await supabase.from('organizer_requests').insert(seedOrganizerRequests);
      await supabase.from('feedback').insert(seedFeedback);
    } catch (err) {
      console.error('Error resetting Supabase data:', err);
    }
  }, []);

  const value: AppDataContextValue = {
    ...state,
    addCategory, updateCategory, deleteCategory,
    addEvent, updateEvent, deleteEvent,
    addBooking, updateBooking, deleteBooking,
    addOffer, updateOffer, deleteOffer,
    addComplaint, updateComplaint, deleteComplaint,
    addOrganizerRequest, updateOrganizerRequest, deleteOrganizerRequest,
    addFeedback, updateFeedback, deleteFeedback,
    addUser, updateUser, deleteUser,
    resetData,
  };

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData(): AppDataContextValue {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used within AppDataProvider');
  return ctx;
}
