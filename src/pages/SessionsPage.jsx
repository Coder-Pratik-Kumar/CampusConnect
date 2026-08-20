import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { SkillTag } from '../components/ui/SkillTag';
import { mockPeerUser } from '../data/mockData';
import { Calendar, Clock, Video, CheckCircle2, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const SessionsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-text font-heading tracking-tight">
            Learning Sessions
          </h1>
          <p className="text-xs sm:text-sm text-brand-muted mt-1">
            Manage upcoming scheduled peer sessions and view past exchange history.
          </p>
        </div>

        <Button
          variant="primary"
          icon={Plus}
          onClick={() => navigate('/sessions/request')}
        >
          Request New Session
        </Button>
      </div>

      {/* Sessions List */}
      <div className="space-y-4">
        {/* Session Card 1 */}
        <Card hoverEffect className="border-indigo-100">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <Avatar src={mockPeerUser.avatar} name={mockPeerUser.name} size="lg" status="online" />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-brand-text font-heading">{mockPeerUser.name}</h3>
                    <Badge variant="primary">Upcoming Session</Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Topic: <span className="font-semibold text-slate-700">React Components & State Management</span>
                  </p>

                  <div className="flex items-center gap-4 text-xs text-slate-500 mt-2">
                    <span className="flex items-center gap-1 font-medium text-brand-primary">
                      <Calendar className="h-3.5 w-3.5" /> Tomorrow, 4:00 PM
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" /> 60 mins
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                <Button variant="outline" size="sm" onClick={() => alert('Reschedule request sent to Rahul!')}>
                  Reschedule
                </Button>
                <Button variant="primary" size="sm" icon={Video} onClick={() => alert('Launching video session meeting room...')}>
                  Join Meeting
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Past Session Card */}
        <Card className="opacity-90">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <Avatar name="Marcus Vance" size="lg" />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-brand-text font-heading">Marcus Vance</h3>
                    <Badge variant="success" icon={CheckCircle2}>
                      Completed
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Topic: <span className="font-semibold text-slate-700">Java OOP Principles & Interfaces</span>
                  </p>
                  <p className="text-xs text-slate-400 mt-1">Completed on Aug 16, 2026</p>
                </div>
              </div>

              <Button variant="outline" size="sm" onClick={() => navigate('/reviews')}>
                Leave Review
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
