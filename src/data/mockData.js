import {
  LayoutDashboard,
  Compass,
  Sparkles,
  Calendar,
  Star,
  Bell,
  Settings,
} from 'lucide-react';

/**
 * Primary sidebar navigation links.
 */
export const navigationLinks = [
  {
    name: 'Dashboard',
    path: '/dashboard',
    icon: LayoutDashboard,
    badge: null,
  },
  {
    name: 'Discover',
    path: '/discover',
    icon: Compass,
    badge: null,
  },
  {
    name: 'My Skills',
    path: '/skills',
    icon: Sparkles,
    badge: null,
  },
  {
    name: 'Sessions',
    path: '/sessions',
    icon: Calendar,
    badge: null,
  },
  {
    name: 'Reviews',
    path: '/reviews',
    icon: Star,
    badge: null,
  },
];

/**
 * Secondary sidebar navigation links.
 */
export const secondaryNavigationLinks = [
  {
    name: 'Notifications',
    path: '/notifications',
    icon: Bell,
    badge: null,
  },
  {
    name: 'Settings',
    path: '/settings',
    icon: Settings,
    badge: null,
  },
];
