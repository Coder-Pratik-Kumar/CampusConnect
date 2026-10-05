import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSessions } from '../hooks/useSessions';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import {
  Calendar,
  Clock,
  Video,
  CheckCircle2,
  XCircle,
  Clock3,
  Plus,
  RotateCw,
  AlertCircle,
  MessageSquare,
  Sparkles,
  BookOpen,
} from 'lucide-react';

export const SessionsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { sessions, loading, submitting, error, refetch, updateSessionStatus } = useSessions();
  const [activeTab, setActiveTab] = useState('all');
  const [actionError, setActionError] = useState('');

  const currentUserId = user?.id || user?._id;

  const handleAction = async (sessionId, status) => {
    setActionError('');
    try {
      await updateSessionStatus(sessionId, { status });
    } catch (err) {
      setActionError(err.message || `Failed to update session status to ${status}`);
    }
  };

  const filteredSessions = sessions.filter((s) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return s.status === 'pending';
    if (activeTab === 'accepted') return s.status === 'accepted';
    if (activeTab === 'completed') return s.status === 'completed';
    if (activeTab === 'cancelled') return s.status === 'cancelled' || s.status === 'rejected';
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-text font-heading tracking-tight">
            Learning Sessions
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your peer learning sessions, accept requests, and track your completed exchanges.
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

      {/* Action Error Alert */}
      {actionError && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl p-4 flex items-center gap-3 text-xs sm:text-sm">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-indigo-50 pb-3">
        {[
          { id: 'all', label: 'All Sessions' },
          { id: 'pending', label: 'Pending Requests' },
          { id: 'accepted', label: 'Upcoming' },
          { id: 'completed', label: 'Completed' },
          { id: 'cancelled', label: 'Cancelled / Rejected' },
        ].map((tab) => {
          const count = sessions.filter((s) => {
            if (tab.id === 'all') return true;
            if (tab.id === 'pending') return s.status === 'pending';
            if (tab.id === 'accepted') return s.status === 'accepted';
            if (tab.id === 'completed') return s.status === 'completed';
            if (tab.id === 'cancelled') return s.status === 'cancelled' || s.status === 'rejected';
            return false;
          }).length;

          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition focus:outline-none flex items-center gap-1.5 ${
                isActive
                  ? 'bg-brand-primary text-white shadow-soft'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-indigo-200 hover:text-brand-primary'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-3 bg-white rounded-3xl border border-indigo-50 shadow-soft">
          <div className="h-10 w-10 rounded-2xl bg-brand-primary/10 flex items-center justify-center">
            <RotateCw className="h-5 w-5 animate-spin text-brand-primary" />
          </div>
          <span className="text-sm font-medium text-slate-500">Loading learning sessions...</span>
        </div>
      )}

      {/* API Error State */}
      {!loading && error && (
        <div className="bg-rose-50 border border-rose-200 rounded-3xl p-6 text-center space-y-4 max-w-md mx-auto my-8">
          <div className="h-12 w-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">Failed to Load Sessions</h3>
            <p className="text-xs text-slate-600 mt-1">{error}</p>
          </div>
          <Button variant="primary" onClick={refetch} icon={RotateCw}>
            Try Again
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && sessions.length === 0 && (
        <div className="bg-white rounded-3xl border border-indigo-50/80 shadow-soft p-10 text-center space-y-4 max-w-lg mx-auto my-8">
          <div className="h-16 w-16 rounded-2xl bg-indigo-50 text-brand-primary flex items-center justify-center mx-auto">
            <BookOpen className="h-8 w-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold font-heading text-brand-text">No Learning Sessions Yet</h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
              You haven't created or received any session requests yet. Discover compatible peers with matching skills and request your first session!
            </p>
          </div>
          <Button variant="primary" onClick={() => navigate('/discover')}>
            Discover Peers
          </Button>
        </div>
      )}

      {/* Empty Filtered State */}
      {!loading && !error && sessions.length > 0 && filteredSessions.length === 0 && (
        <div className="bg-white rounded-3xl border border-indigo-50/80 shadow-soft p-8 text-center space-y-3 max-w-md mx-auto my-8">
          <p className="text-sm font-bold text-brand-text">No sessions under this category</p>
          <button
            onClick={() => setActiveTab('all')}
            className="text-xs font-bold text-brand-primary hover:underline"
          >
            View All Sessions
          </button>
        </div>
      )}

      {/* Sessions List */}
      {!loading && !error && filteredSessions.length > 0 && (
        <div className="space-y-4">
          {filteredSessions.map((session) => {
            const requesterIdStr =
              typeof session.requesterId === 'object'
                ? session.requesterId?._id || session.requesterId?.id
                : session.requesterId;
            const isRequester = String(requesterIdStr) === String(currentUserId);
            const isProvider = !isRequester;

            const peer = isRequester
              ? typeof session.providerId === 'object'
                ? session.providerId
                : null
              : typeof session.requesterId === 'object'
              ? session.requesterId
              : null;

            const peerName = peer?.name || (isRequester ? 'Provider' : 'Requester');
            const peerAvatar = peer?.avatar;
            const peerCollege = peer?.college ? `${peer.major || 'Student'} at ${peer.college}` : '';

            return (
              <Card key={session._id} hoverEffect className="border-indigo-100">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    {/* Left: Avatar + Details */}
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <Avatar
                        src={peerAvatar}
                        name={peerName}
                        size="lg"
                        className="h-12 w-12 rounded-full object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-brand-text font-heading text-base truncate">
                            {peerName}
                          </h3>

                          {/* Role Tag */}
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-indigo-50 text-brand-primary border border-indigo-100">
                            {isRequester ? 'You requested' : 'Requested you'}
                          </span>

                          {/* Status Badge */}
                          {session.status === 'pending' && (
                            <Badge variant="warning" icon={Clock3}>
                              Pending Approval
                            </Badge>
                          )}
                          {session.status === 'accepted' && (
                            <Badge variant="primary" icon={Calendar}>
                              Upcoming Session
                            </Badge>
                          )}
                          {session.status === 'completed' && (
                            <Badge variant="success" icon={CheckCircle2}>
                              Completed
                            </Badge>
                          )}
                          {session.status === 'rejected' && (
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                              <XCircle className="h-3 w-3" /> Rejected
                            </span>
                          )}
                          {session.status === 'cancelled' && (
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                              Cancelled
                            </span>
                          )}
                        </div>

                        {peerCollege && (
                          <p className="text-xs text-slate-400">{peerCollege}</p>
                        )}

                        <p className="text-xs text-slate-600 font-medium pt-0.5">
                          Topic:{' '}
                          <span className="font-bold text-brand-text bg-[#F9F9FF] border border-indigo-50 px-2 py-0.5 rounded-md">
                            {session.skill}
                          </span>
                        </p>

                        {/* Date, Time & Duration */}
                        <div className="flex items-center gap-4 text-xs text-slate-500 pt-1 flex-wrap">
                          <span className="flex items-center gap-1 font-semibold text-brand-primary">
                            <Calendar className="h-3.5 w-3.5" /> {session.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" /> {session.time} ({session.duration || '60 min'})
                          </span>
                        </div>

                        {/* Session Message */}
                        {session.message && (
                          <p className="text-xs text-slate-500 bg-[#F9F9FF] border border-indigo-50/80 rounded-xl p-2.5 mt-2 italic leading-relaxed">
                            "{session.message}"
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 w-full md:w-auto justify-end flex-wrap shrink-0">
                      {/* Pending Actions */}
                      {session.status === 'pending' && (
                        <>
                          {isProvider ? (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={submitting}
                                onClick={() => handleAction(session._id, 'rejected')}
                                className="text-rose-600 border-rose-200 hover:bg-rose-50"
                              >
                                Reject
                              </Button>
                              <Button
                                variant="primary"
                                size="sm"
                                disabled={submitting}
                                onClick={() => handleAction(session._id, 'accepted')}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                              >
                                Accept
                              </Button>
                            </>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={submitting}
                              onClick={() => handleAction(session._id, 'cancelled')}
                              className="text-slate-600 hover:bg-slate-50"
                            >
                              Cancel Request
                            </Button>
                          )}
                        </>
                      )}

                      {/* Accepted Actions */}
                      {session.status === 'accepted' && (
                        <>
                          {/* Zoom Meeting Panel */}
                          {session.zoom?.joinUrl ? (
                            <div className="w-full md:w-auto flex flex-col gap-2 bg-indigo-50 border border-indigo-100 rounded-2xl p-3 mb-1">
                              <div className="flex items-center gap-2">
                                <Video className="h-4 w-4 text-brand-primary shrink-0" />
                                <span className="text-xs font-bold text-brand-primary">Meeting Ready</span>
                              </div>
                              <button
                                onClick={() =>
                                  window.open(session.zoom.joinUrl, '_blank', 'noopener,noreferrer')
                                }
                                className="flex items-center justify-center gap-2 w-full px-4 py-2 rounded-xl bg-brand-primary text-white text-xs font-bold hover:bg-brand-primary/90 transition focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
                              >
                                <Video className="h-3.5 w-3.5" />
                                Join Zoom Meeting
                              </button>
                            </div>
                          ) : (
                            <div className="w-full md:w-auto flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 mb-1">
                              <Video className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                              <span className="text-xs text-slate-400">Meeting unavailable</span>
                            </div>
                          )}

                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={submitting}
                              onClick={() => handleAction(session._id, 'cancelled')}
                              className="text-slate-600 hover:bg-slate-50"
                            >
                              Cancel
                            </Button>
                            <Button
                              variant="primary"
                              size="sm"
                              disabled={submitting}
                              onClick={() => handleAction(session._id, 'completed')}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                              Mark Completed
                            </Button>
                          </div>
                        </>
                      )}

                      {/* Completed Actions */}
                      {session.status === 'completed' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/reviews?sessionId=${session._id}`)}
                        >
                          Leave Review
                        </Button>
                      )}
                    </div>
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

