import { useState, useMemo } from 'react';
import {
  Users, Search, Mail, Shield, Megaphone, User as UserIcon,
} from 'lucide-react';
import { useAppData } from '@/context/AppDataContext';
import type { Role } from '@/types';
import PageHeader from '@/components/ui/PageHeader';
import EmptyState from '@/components/ui/EmptyState';
import { formatDate } from '@/lib/format';

const roleConfig: Record<Role, { label: string; icon: typeof Shield; color: string }> = {
  admin: { label: 'Administrator', icon: Shield, color: 'bg-error-100 text-error-700' },
  organizer: { label: 'Event Organizer', icon: Megaphone, color: 'bg-accent-100 text-accent-700' },
  customer: { label: 'Customer', icon: UserIcon, color: 'bg-brand-100 text-brand-700' },
};

type RoleFilter = 'all' | Role;

export default function AdminUsersPage() {
  const { users, bookings } = useAppData();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase());
      const matchesRole = roleFilter === 'all' || u.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  const bookingCount = (userId: string) => bookings.filter((b) => b.userId === userId).length;

  const roleFilters: { id: RoleFilter; label: string; count: number }[] = [
    { id: 'all', label: 'All Users', count: users.length },
    { id: 'customer', label: 'Customers', count: users.filter((u) => u.role === 'customer').length },
    { id: 'organizer', label: 'Organizers', count: users.filter((u) => u.role === 'organizer').length },
    { id: 'admin', label: 'Admins', count: users.filter((u) => u.role === 'admin').length },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Management"
        description="View and manage all registered users on the platform."
        icon={<Users className="h-5 w-5" />}
      />

      {/* Stats summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {roleFilters.map((rf) => {
          const config = rf.id === 'all'
            ? { icon: Users, color: 'bg-gray-100 text-gray-600' }
            : roleConfig[rf.id];
          const Icon = config.icon;
          return (
            <button
              key={rf.id}
              onClick={() => setRoleFilter(rf.id)}
              className={`card flex items-center gap-3 p-4 text-left transition-all hover:shadow-cardhover ${
                roleFilter === rf.id ? 'ring-2 ring-brand-500' : ''
              }`}
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${config.color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{rf.count}</p>
                <p className="text-xs text-gray-500">{rf.label}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="input pl-10"
        />
      </div>

      {/* Users table */}
      {filtered.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={<Users className="h-7 w-7" />}
            title="No users found"
            description="Try adjusting your search or filter criteria."
          />
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="px-5 py-3 font-semibold text-gray-600">User</th>
                  <th className="hidden px-5 py-3 font-semibold text-gray-600 sm:table-cell">Email</th>
                  <th className="px-5 py-3 font-semibold text-gray-600">Role</th>
                  <th className="hidden px-5 py-3 text-center font-semibold text-gray-600 sm:table-cell">Bookings</th>
                  <th className="hidden px-5 py-3 font-semibold text-gray-600 lg:table-cell">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((u) => {
                  const config = roleConfig[u.role];
                  const Icon = config.icon;
                  return (
                    <tr key={u.id} className="transition hover:bg-gray-50/50">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-xs font-bold text-brand-700">
                            {u.avatar}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-medium text-gray-900">{u.name}</p>
                            <p className="truncate text-xs text-gray-500 sm:hidden">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="hidden px-5 py-3.5 text-gray-600 sm:table-cell">
                        <div className="flex items-center gap-2">
                          <Mail className="h-3.5 w-3.5 text-gray-400" />
                          {u.email}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`badge ${config.color}`}>
                          <Icon className="h-3 w-3" />
                          {config.label}
                        </span>
                      </td>
                      <td className="hidden px-5 py-3.5 text-center sm:table-cell">
                        <span className="font-medium text-gray-900">{bookingCount(u.id)}</span>
                      </td>
                      <td className="hidden px-5 py-3.5 text-gray-500 lg:table-cell">
                        {formatDate(u.id.includes('custom') || u.id.includes('cust') || u.id.includes('org') || u.id.includes('att') ? '2025-01-15T00:00:00Z' : new Date().toISOString())}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
