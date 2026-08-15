import { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

interface AppLayoutProps {
  activeId: string;
  onNavigate: (id: string) => void;
  children: React.ReactNode;
}

export default function AppLayout({ activeId, onNavigate, children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onMenuClick={() => setSidebarOpen(true)} />
      <div className="flex">
        <Sidebar
          activeId={activeId}
          onNavigate={onNavigate}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <main className="flex-1 px-4 py-6 md:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl animate-fade-in">{children}</div>
        </main>
      </div>
    </div>
  );
}
