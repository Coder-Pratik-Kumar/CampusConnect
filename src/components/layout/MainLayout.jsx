import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopNavbar } from './TopNavbar';

export const MainLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-brand-background flex flex-col">
      {/* Sidebar Navigation */}
      <Sidebar
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Column */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0 transition-all duration-300">
        <TopNavbar onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />

        <main className="flex-1 px-4 sm:px-8 pb-12 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
