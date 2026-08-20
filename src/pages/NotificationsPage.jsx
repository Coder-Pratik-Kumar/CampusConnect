import React from 'react';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { mockPeerUser } from '../data/mockData';
import { Bell, Sparkles, Calendar, Star } from 'lucide-react';

export const NotificationsPage = () => {
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

      <div className="space-y-3">
        <Card className="bg-indigo-50/40 border-indigo-100">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar src={mockPeerUser.avatar} name={mockPeerUser.name} size="sm" />
              <div>
                <p className="text-xs text-slate-800 font-semibold">
                  <span className="text-brand-primary">{mockPeerUser.name}</span> accepted your session request for tomorrow at 4:00 PM.
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">10 minutes ago</p>
              </div>
            </div>
            <Badge variant="primary" size="sm">Session</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-emerald-50 text-brand-secondary">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-slate-800 font-semibold">
                  New 96% Match found! Sophia Chen teaches React and wants to learn Java.
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">1 hour ago</p>
              </div>
            </div>
            <Badge variant="secondary" size="sm">Match Alert</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-amber-50 text-amber-600">
                <Star className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-slate-800 font-semibold">
                  Marcus Vance left a 5-star review for your Java Data Structures session!
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">2 days ago</p>
              </div>
            </div>
            <Badge variant="tertiary" size="sm">Review</Badge>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
