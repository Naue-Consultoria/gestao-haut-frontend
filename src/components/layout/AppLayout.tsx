import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { MobileToggle } from './MobileToggle';

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen">
      <MobileToggle onClick={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(c => !c)}
      />
      <main className={`flex-1 px-10 py-8 min-h-screen transition-all duration-300 max-lg:px-6 max-md:ml-0 max-md:px-4 ${
        collapsed ? 'ml-[72px]' : 'ml-[260px] max-lg:ml-[220px]'
      }`}>
        <div className="animate-fadeIn">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
