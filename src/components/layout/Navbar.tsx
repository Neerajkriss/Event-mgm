import { CalendarDays, Menu } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface NavbarProps {
  onMenuClick: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-gray-200 bg-white/80 px-4 backdrop-blur-md md:px-6">
      <button
        onClick={onMenuClick}
        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 lg:hidden"
        aria-label="Toggle sidebar"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white shadow-sm">
          <CalendarDays className="h-5 w-5" />
        </div>
        <span className="font-display text-lg font-bold tracking-tight text-gray-900">
          Event<span className="text-brand-600">Hub</span>
        </span>
      </div>

      <div className="ml-auto flex items-center gap-3">
        {user && (
          <div className="flex items-center gap-3 rounded-lg bg-gray-50 px-3 py-1.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
              {user.avatar}
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold leading-tight text-gray-900">{user.name}</p>
              <p className="text-xs leading-tight text-gray-500 capitalize">{user.role}</p>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
