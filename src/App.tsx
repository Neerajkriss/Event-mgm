import { useState } from 'react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { AppDataProvider } from '@/context/AppDataContext';
import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/DashboardPage';
import PlaceholderPage from '@/pages/PlaceholderPage';
import AppLayout from '@/components/layout/AppLayout';
import { useNavItems } from '@/lib/navigation';

import AdminCategoriesPage from '@/pages/admin/AdminCategoriesPage';
import AdminOrganizersPage from '@/pages/admin/AdminOrganizersPage';
import AdminUsersPage from '@/pages/admin/AdminUsersPage';
import AdminComplaintsPage from '@/pages/admin/AdminComplaintsPage';
import AdminFeedbackPage from '@/pages/admin/AdminFeedbackPage';
import AdminPaymentsPage from '@/pages/admin/AdminPaymentsPage';

import OrganizerProfilePage from '@/pages/organizer/OrganizerProfilePage';
import OrganizerEventsPage from '@/pages/organizer/OrganizerEventsPage';
import OrganizerBookingsPage from '@/pages/organizer/OrganizerBookingsPage';
import OrganizerOffersPage from '@/pages/organizer/OrganizerOffersPage';
import OrganizerEarningsPage from '@/pages/organizer/OrganizerEarningsPage';

import CustomerEventsPage from '@/pages/customer/CustomerEventsPage';
import CustomerBookingsPage from '@/pages/customer/CustomerBookingsPage';
import CustomerOffersPage from '@/pages/customer/CustomerOffersPage';
import CustomerComplaintsPage from '@/pages/customer/CustomerComplaintsPage';
import CustomerFeedbackPage from '@/pages/customer/CustomerFeedbackPage';

const pageMeta: Record<string, { title: string; description: string }> = {
  settings: { title: 'Settings', description: 'Configure your account and application preferences.' },
};

const adminPageMap: Record<string, () => JSX.Element> = {
  categories: AdminCategoriesPage,
  organizers: AdminOrganizersPage,
  users: AdminUsersPage,
  complaints: AdminComplaintsPage,
  feedback: AdminFeedbackPage,
  payments: AdminPaymentsPage,
};

const organizerPageMap: Record<string, () => JSX.Element> = {
  'org-profile': OrganizerProfilePage,
  events: OrganizerEventsPage,
  requests: OrganizerBookingsPage,
  offers: OrganizerOffersPage,
  'org-earnings': OrganizerEarningsPage,
};

const customerPageMap: Record<string, () => JSX.Element> = {
  events: CustomerEventsPage,
  bookings: CustomerBookingsPage,
  'cust-offers': CustomerOffersPage,
  'cust-complaints': CustomerComplaintsPage,
  'cust-feedback': CustomerFeedbackPage,
};

function AuthedApp() {
  const { user } = useAuth();
  const [activePage, setActivePage] = useState('dashboard');
  const navItems = useNavItems(user?.role ?? null);

  const validIds = new Set(['dashboard', ...navItems.map((n) => n.id)]);
  const currentId = validIds.has(activePage) ? activePage : 'dashboard';

  if (!user) return null;

  const handleNavigate = (id: string) => {
    if (id === 'dashboard' || validIds.has(id)) {
      setActivePage(id);
    }
  };

  const pageMap =
    user.role === 'admin' ? adminPageMap :
    user.role === 'organizer' ? organizerPageMap :
    customerPageMap;
  const Page = pageMap[currentId];
  const placeholder = pageMeta[currentId];

  return (
    <AppLayout activeId={currentId} onNavigate={handleNavigate}>
      {currentId === 'dashboard' ? (
        <DashboardPage />
      ) : Page ? (
        <Page />
      ) : placeholder ? (
        <PlaceholderPage title={placeholder.title} description={placeholder.description} />
      ) : (
        <PlaceholderPage title="Coming Soon" description="This page is under construction." />
      )}
    </AppLayout>
  );
}

function AppContent() {
  const { isAuthed } = useAuth();
  return isAuthed ? <AuthedApp /> : <LoginPage />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppDataProvider>
        <AppContent />
      </AppDataProvider>
    </AuthProvider>
  );
}
