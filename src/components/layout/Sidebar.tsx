import { X, LogOut, Settings, Circle } from 'lucide-react';
import * as Icons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNavItems } from '@/lib/navigation';
import type { NavItem } from '@/lib/navigation';

interface SidebarProps {
  activeId: string;
  onNavigate: (id: string) => void;
  open: boolean;
  onClose: () => void;
}

function NavButton({ item, active, onClick }: { item: NavItem; active: boolean; onClick: () => void }) {
  const Icon = (Icons as unknown as Record<string, LucideIcon>)[item.icon] ?? Circle;
  return (
    <button
      onClick={onClick}
      className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
        active
          ? 'bg-brand-50 text-brand-700'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      }`}
    >
      <Icon className={`h-5 w-5 shrink-0 transition-transform group-hover:scale-110 ${active ? 'text-brand-600' : ''}`} />
      <span>{item.label}</span>
      {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-brand-500" />}
    </button>
  );
}

export default function Sidebar({ activeId, onNavigate, open, onClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const items = useNavItems(user?.role ?? null);

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-gray-900/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-full w-72 flex-col bg-white shadow-xl transition-transform duration-300 lg:sticky lg:top-16 lg:z-30 lg:h-[calc(100vh-4rem)] lg:shadow-none lg:translate-x-0 lg:border-r lg:border-gray-200 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4 lg:hidden">
          <span className="font-display text-base font-bold text-gray-900">Menu</span>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100" aria-label="Close menu">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">Menu</p>
          {items.map((item) => (
            <NavButton
              key={item.id}
              item={item}
              active={activeId === item.id}
              onClick={() => {
                onNavigate(item.id);
                onClose();
              }}
            />
          ))}
        </nav>

        <div className="border-t border-gray-200 p-3">
          <button
            onClick={() => {
              onNavigate('settings');
              onClose();
            }}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50 hover:text-gray-900"
          >
            <Settings className="h-5 w-5" />
            Settings
          </button>
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-error-600 transition hover:bg-error-50"
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
