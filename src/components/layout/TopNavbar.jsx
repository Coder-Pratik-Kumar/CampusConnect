import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../hooks/useNotifications';
import { Menu, Search, Bell, MessageSquare } from 'lucide-react';

export const TopNavbar = ({ onMenuToggle }) => {
  const navigate = useNavigate();
  const { unreadCount } = useNotifications();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-20 px-6 sm:px-8 bg-[#F8F9FD]/90 backdrop-blur-md">
      {/* Left side: Hamburger button + Search pill input */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={onMenuToggle}
          className="p-2 -ml-2 text-slate-500 rounded-lg hover:text-slate-700 hover:bg-slate-100 lg:hidden focus:outline-none"
          aria-label="Toggle navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Stitch-style Pill Search Input */}
        <div className="relative w-full max-w-md hidden sm:block">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            placeholder="Search peers or skills..."
            onClick={() => navigate('/discover')}
            readOnly
            className="w-full bg-[#EEF2FF]/70 border border-transparent hover:border-indigo-200 text-slate-700 text-xs rounded-full pl-10 pr-4 py-2.5 transition-all cursor-pointer focus:outline-none placeholder-slate-400"
          />
        </div>
      </div>

      {/* Right side: Chat Icon + Notification Bell */}
      <div className="flex items-center gap-4 shrink-0">
        {/* Chat Message Bubble */}
        <button
          onClick={() => navigate('/notifications')}
          className="p-2 text-slate-600 hover:text-brand-primary hover:bg-white rounded-full transition-colors focus:outline-none"
          title="Messages"
        >
          <MessageSquare className="h-5 w-5" />
        </button>

        {/* Notification Bell with Real Unread Indicator */}
        <button
          onClick={() => navigate('/notifications')}
          className="relative p-2 text-slate-600 hover:text-brand-primary hover:bg-white rounded-full transition-colors focus:outline-none"
          title="Notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
          )}
        </button>
      </div>
    </header>
  );
};

