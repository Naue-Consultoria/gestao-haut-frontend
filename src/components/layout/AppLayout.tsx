import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { MobileToggle } from './MobileToggle';
import { Toast } from '../ui/Toast';

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <MobileToggle onClick={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="flex-1 ml-[260px] px-10 py-8 min-h-screen max-lg:ml-[220px] max-lg:px-6 max-md:ml-0 max-md:px-4">
        <div className="animate-fadeIn">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
