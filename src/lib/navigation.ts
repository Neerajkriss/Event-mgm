import { useMemo } from 'react';
import type { Role } from '@/types';

export interface NavItem {
  id: string;
  label: string;
  icon: string;
  roles: Role[];
}

const allRoles: Role[] = ['admin', 'organizer', 'customer'];

export const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard', roles: allRoles },
  { id: 'events', label: 'Events', icon: 'CalendarDays', roles: allRoles },
  { id: 'categories', label: 'Categories', icon: 'Tags', roles: ['admin'] },
  { id: 'organizers', label: 'Organizers', icon: 'UserCheck', roles: ['admin'] },
  { id: 'users', label: 'Users', icon: 'Users', roles: ['admin'] },
  { id: 'bookings', label: 'My Bookings', icon: 'Ticket', roles: ['customer'] },
  { id: 'cust-offers', label: 'Active Offers', icon: 'BadgePercent', roles: ['customer'] },
  { id: 'cust-complaints', label: 'Support', icon: 'MessageSquareWarning', roles: ['customer'] },
  { id: 'cust-feedback', label: 'My Reviews', icon: 'Star', roles: ['customer'] },
  { id: 'requests', label: 'Bookings', icon: 'ClipboardList', roles: ['admin', 'organizer'] },
  { id: 'offers', label: 'Offers', icon: 'BadgePercent', roles: ['admin', 'organizer'] },
  { id: 'complaints', label: 'Complaints', icon: 'MessageSquareWarning', roles: ['admin'] },
  { id: 'feedback', label: 'Feedback', icon: 'Star', roles: ['admin'] },
  { id: 'payments', label: 'Payment Reports', icon: 'IndianRupee', roles: ['admin'] },
  { id: 'org-profile', label: 'Organizer Profile', icon: 'UserCog', roles: ['organizer'] },
  { id: 'org-earnings', label: 'Earnings', icon: 'Wallet', roles: ['organizer'] },
  { id: 'settings', label: 'Settings', icon: 'Settings', roles: allRoles },
];

export function useNavItems(role: Role | null): NavItem[] {
  return useMemo(() => {
    if (!role) return [];
    return navItems.filter((item) => item.roles.includes(role));
  }, [role]);
}
