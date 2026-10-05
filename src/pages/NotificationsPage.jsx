import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../hooks/useNotifications';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import {
  Bell,
  Calendar,
  CheckCircle,
  XCircle,
  Star,
  Sparkles,
  BellOff,
  RefreshCw,
  CheckCheck,
  Loader2,
} from 'lucide-react';

/**
 * Notification type → icon, badge variant, badge label mapping
 */
const NOTIFICATION_CONFIG = {
  session_request: {
    icon: Calendar,
    variant: 'primary',
    label: 'Session Request',
    iconBg: 'bg-indigo-50 text-brand-primary',
  },
  session_accepted: {
    icon: CheckCircle,
    variant: 'success',
    label: 'Accepted',
    iconBg: 'bg-emerald-50 text-emerald-600',
  },
  session_rejected: {
    icon: XCircle,
    variant: 'error',
    label: 'Declined',
    iconBg: 'bg-rose-50 text-rose-600',
  },
  session_completed: {
    icon: CheckCircle,
    variant: 'secondary',
    label: 'Completed',
    iconBg: 'bg-emerald-50 text-brand-secondary',
  },
  session_cancelled: {
    icon: XCircle,
    variant: 'warning',
    label: 'Cancelled',
    iconBg: 'bg-amber-50 text-amber-600',
  },
  review_received: {
    icon: Star,
    variant: 'tertiary',
    label: 'Review',
    iconBg: 'bg-amber-50 text-amber-600',
  },
  match_alert: {
    icon: Sparkles,
    variant: 'secondary',
    label: 'Match Alert',
    iconBg: 'bg-emerald-50 text-brand-secondary',
  },
};

const DEFAULT_CONFIG = {
  icon: Bell,
  variant: 'neutral',
  label: 'Update',
  iconBg: 'bg-slate-100 text-slate-500',
};

/**
 * Formats a date string into relative time (e.g. "2 hours ago", "3 days ago")
 */
const formatRelativeTime = (dateString) => {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHrs = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHrs / 24);

  if (diffSecs < 60) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHrs < 24) return `${diffHrs} hour${diffHrs > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export const NotificationsPage = () => {
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    loading,
    error,
    refetch,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      markAsRead(notification._id);
    }
    if (notification.link) {
      navigate(notification.link);
    }
  };

  /* ─── Loading State ─── */
  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-text font-heading tracking-tight">
            Notifications
          </h1>
          <p className="text-xs sm:text-sm text-brand-muted mt-1">
            Stay updated on session requests, new matches, and peer reviews.
          </p>
        </div>
        <div className="flex flex-col items-center justify-center py-20 text-brand-muted">
          <Loader2 className="h-8 w-8 animate-spin text-brand-primary mb-3" />
          <p className="text-sm font-medium">Loading notifications…</p>
        </div>
      </div>
    );
  }

  /* ─── Error State ─── */
  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-text font-heading tracking-tight">
            Notifications
          </h1>
          <p className="text-xs sm:text-sm text-brand-muted mt-1">
            Stay updated on session requests, new matches, and peer reviews.
          </p>
        </div>
        <Card className="border-rose-100 bg-rose-50/40">
          <CardContent className="p-6 text-center space-y-3">
            <XCircle className="h-8 w-8 text-rose-500 mx-auto" />
            <p className="text-sm font-semibold text-rose-700">{error}</p>
            <Button variant="outline" size="sm" icon={RefreshCw} onClick={refetch}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Mark All Read */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-text font-heading tracking-tight">
            Notifications
          </h1>
          <p className="text-xs sm:text-sm text-brand-muted mt-1">
            Stay updated on session requests, new matches, and peer reviews.
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" icon={CheckCheck} onClick={markAllAsRead}>
            Mark all as read
          </Button>
        )}
      </div>

      {/* Empty State */}
      {notifications.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center space-y-3">
            <div className="mx-auto h-14 w-14 rounded-full bg-indigo-50 flex items-center justify-center">
              <BellOff className="h-7 w-7 text-brand-primary" />
            </div>
            <h2 className="text-lg font-bold text-brand-text font-heading">You're all caught up!</h2>
            <p className="text-sm text-brand-muted max-w-sm mx-auto">
              No new notifications. When peers send you session requests or leave reviews, they'll appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => {
            const config = NOTIFICATION_CONFIG[notification.type] || DEFAULT_CONFIG;
            const IconComponent = config.icon;
            const sender = typeof notification.senderId === 'object' ? notification.senderId : null;

            return (
              <Card
                key={notification._id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-soft-md hover:border-indigo-100 ${
                  !notification.isRead ? 'bg-indigo-50/40 border-indigo-100' : ''
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <CardContent className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {/* Avatar or Icon */}
                    {sender?.avatar || sender?.name ? (
                      <Avatar src={sender.avatar} name={sender.name} size="sm" />
                    ) : (
                      <div className={`p-2 rounded-full shrink-0 ${config.iconBg}`}>
                        <IconComponent className="h-4 w-4" />
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-slate-800 font-semibold leading-relaxed">
                        {notification.title}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                        {notification.message}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1">
                        {formatRelativeTime(notification.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={config.variant} size="sm">{config.label}</Badge>
                    {!notification.isRead && (
                      <span className="h-2 w-2 rounded-full bg-brand-primary shrink-0" />
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
