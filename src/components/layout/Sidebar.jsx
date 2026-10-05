import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../hooks/useNotifications';
import { BrandLogo } from '../common/BrandLogo';
import { navigationLinks, secondaryNavigationLinks } from '../../data/mockData';
import { Avatar } from '../ui/Avatar';
import { X, LogOut } from 'lucide-react';

export const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();

  const handleLogout = () => {
    logout();
    navigate('/login');
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container matching Stitch */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col w-64 bg-white border-r border-slate-100 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:shadow-none'
        }`}
      >
        {/* Header Logo */}
        <div className="flex items-center justify-between h-20 px-6">
          <BrandLogo />
          <button
            onClick={onClose}
            className="p-1 rounded-std text-slate-400 hover:text-slate-600 hover:bg-slate-100 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Section */}
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1">
          {navigationLinks.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-brand-primary text-white shadow-soft font-semibold'
                      : 'text-slate-600 hover:text-brand-text hover:bg-slate-50'
                  }`
                }
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}

          <div className="my-5 border-t border-slate-100" />

          {secondaryNavigationLinks.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-brand-primary text-white shadow-soft font-semibold'
                      : 'text-slate-600 hover:text-brand-text hover:bg-slate-50'
                  }`
                }
              >
                <div className="flex items-center gap-3.5">
                  <Icon className="h-5 w-5 shrink-0" />
                  <span>{item.name}</span>
                </div>

                {item.badge && (
                  <span className="flex items-center justify-center h-5 min-w-[20px] px-1.5 text-[11px] font-bold rounded-full bg-rose-500 text-white">
                    {item.badge}
                  </span>
                )}
                {/* Dynamic unread badge for Notifications */}
                {item.name === 'Notifications' && !item.badge && unreadCount > 0 && (
                  <span className="flex items-center justify-center h-5 min-w-[20px] px-1.5 text-[11px] font-bold rounded-full bg-rose-500 text-white">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Bottom User Profile & Logout Section */}
        <div className="p-4 border-t border-slate-100 space-y-2">
          <button
            onClick={() => {
              if (user?.id || user?._id) {
                navigate(`/profile/${user.id || user._id}`);
              }
              if (onClose) onClose();
            }}
            className="flex items-center gap-3 w-full p-2 rounded-xl hover:bg-slate-50 transition-colors text-left focus:outline-none"
          >
            <Avatar src={user?.avatar} name={user?.name || 'Student'} size="md" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-900 truncate">{user?.name || 'Student'}</p>
              <p className="text-[11px] text-slate-500 font-medium truncate">{user?.college || user?.email || 'GLA University'}</p>
            </div>
          </button>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
