import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '../hooks/useProfile';
import { useMatches } from '../hooks/useMatches';
import { useSessions } from '../hooks/useSessions';
import { useAuth } from '../context/AuthContext';
import { Avatar } from '../components/ui/Avatar';
import { SkillTag } from '../components/ui/SkillTag';
import { Button } from '../components/ui/Button';
import {
  Sparkles,
  Users,
  Calendar,
  Star,
  TrendingUp,
  Video,
  MapPin,
  Clock,
  Lightbulb,
  Plus,
  RotateCw,
} from 'lucide-react';

const getHour = () => new Date().getHours();
const greeting = getHour() < 12 ? 'morning' : getHour() < 17 ? 'afternoon' : 'evening';

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const { matches, totalMatches, loading: matchesLoading } = useMatches();
  const { sessions, loading: sessionsLoading } = useSessions();

  const loading = profileLoading || matchesLoading || sessionsLoading;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <div className="h-10 w-10 rounded-2xl bg-brand-primary/10 flex items-center justify-center">
          <RotateCw className="h-5 w-5 animate-spin text-brand-primary" />
        </div>
        <span className="text-sm font-medium text-slate-500">Loading dashboard...</span>
      </div>
    );
  }

  const currentUserId = user?.id || user?._id;
  const firstName = profile?.name?.split(' ')[0] || 'Student';
  const skillCount = (profile?.teachSkills?.length || 0) + (profile?.learnSkills?.length || 0);
  const topThreeMatches = matches.slice(0, 3);
  const activeSessions = sessions.filter((s) => s.status === 'accepted' || s.status === 'pending').slice(0, 3);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ── Greeting Banner ── */}
      <div className="bg-white rounded-3xl border border-indigo-100/60 shadow-soft p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6">
        <Avatar
          src={profile?.avatar}
          name={profile?.name || 'Student'}
          size="xl"
          className="h-20 w-20 rounded-2xl object-cover shadow-soft border-2 border-white shrink-0"
        />
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-brand-text font-heading tracking-tight flex items-center gap-3 flex-wrap">
            Good {greeting}, {firstName} 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
            Your learning journey is accelerating. Here is your daily overview of skills, upcoming sessions, and top peer matches.
          </p>
        </div>
      </div>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'SKILLS', value: skillCount || 0, Icon: Sparkles, bg: 'bg-[#3525CD]', text: 'text-white' },
          { label: 'MATCHES', value: totalMatches || matches.length || 0, Icon: Users, bg: 'bg-[#006C49]', text: 'text-white' },
          { label: 'SESSIONS', value: sessions.length || profile?.sessionsCount || 0, Icon: Calendar, bg: 'bg-[#684000]', text: 'text-white' },
          { label: 'RATING', value: profile?.rating?.toFixed(1) || '—', Icon: Star, bg: 'bg-slate-100', text: 'text-brand-text' },
        ].map(({ label, value, Icon, bg, text }) => (
          <div key={label} className="bg-white rounded-2xl border border-indigo-50/80 shadow-soft p-4 sm:p-5 flex items-center gap-4">
            <div className={`h-11 w-11 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
              <Icon className={`h-5 w-5 ${text}`} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
              <p className="text-2xl font-extrabold text-brand-text font-heading leading-none mt-0.5">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Main Two-Column Section ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Top Skill Matches + Upcoming Sessions */}
        <div className="lg:col-span-7 space-y-6">
          {/* Top Skill Matches */}
          <div className="bg-white rounded-2xl border border-indigo-50/80 shadow-soft p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold font-heading text-brand-text">Top Skill Matches</h2>
              <button
                onClick={() => navigate('/discover')}
                className="text-xs font-bold text-brand-primary hover:underline flex items-center gap-1"
              >
                View all →
              </button>
            </div>

            {topThreeMatches.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {topThreeMatches.map((match) => {
                  const peerId = match.user?.id || match.user?._id;
                  const teachSkill = match.user?.teachSkills?.[0] || 'Peer Skills';
                  return (
                    <div
                      key={peerId}
                      onClick={() => navigate(`/profile/${peerId}`)}
                      className="flex flex-col items-center text-center p-4 bg-[#F9F9FF] border border-indigo-50 rounded-2xl gap-2 hover:border-indigo-200 transition cursor-pointer"
                    >
                      <div className="relative">
                        <Avatar
                          src={match.user?.avatar}
                          name={match.user?.name || 'Peer'}
                          size="lg"
                          className="h-14 w-14 rounded-full object-cover border-2 border-white shadow-soft"
                        />
                        <span className="absolute -bottom-1 -right-1 text-[9px] font-extrabold bg-brand-secondary text-white px-1.5 py-0.5 rounded-full">
                          {match.matchScore}%
                        </span>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-brand-text truncate max-w-[120px]">{match.user?.name}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          Teaches{' '}
                          <SkillTag name={teachSkill} type="teach" size="sm" className="ml-1 inline-flex" />
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 bg-[#F9F9FF] rounded-2xl text-center space-y-2">
                <p className="text-xs text-slate-500 font-medium">No skill matches found yet.</p>
                <button
                  onClick={() => navigate('/skills')}
                  className="text-xs font-bold text-brand-primary hover:underline"
                >
                  Add skills in My Skills to discover peers →
                </button>
              </div>
            )}
          </div>

          {/* Upcoming Sessions */}
          <div className="bg-white rounded-2xl border border-indigo-50/80 shadow-soft p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold font-heading text-brand-text">Upcoming Sessions</h2>
              <button
                onClick={() => navigate('/sessions/request')}
                className="h-7 w-7 rounded-full bg-slate-100 text-slate-500 hover:bg-indigo-100 hover:text-brand-primary transition flex items-center justify-center"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            {activeSessions.length > 0 ? (
              <div className="space-y-3">
                {activeSessions.map((session) => {
                  const requesterIdStr =
                    typeof session.requesterId === 'object'
                      ? session.requesterId?._id || session.requesterId?.id
                      : session.requesterId;
                  const isRequester = String(requesterIdStr) === String(currentUserId);
                  const peer = isRequester
                    ? typeof session.providerId === 'object'
                      ? session.providerId
                      : null
                    : typeof session.requesterId === 'object'
                    ? session.requesterId
                    : null;
                  const peerName = peer?.name || (isRequester ? 'Provider' : 'Requester');

                  return (
                    <div
                      key={session._id}
                      className="flex items-stretch gap-4 bg-[#F9F9FF] border border-indigo-50 rounded-2xl p-4 hover:border-indigo-200 transition"
                    >
                      {/* Date Block */}
                      <div className="flex flex-col items-center justify-center bg-white border border-indigo-100 rounded-xl px-3 py-2 shrink-0 text-center min-w-[52px]">
                        <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">
                          DATE
                        </span>
                        <span className="text-xs font-extrabold text-brand-text leading-tight mt-0.5">
                          {session.date}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <p className="text-sm font-bold text-brand-text truncate">
                          {session.skill} with {peerName}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-brand-primary" /> {session.time} ({session.duration || '60 min'})
                          </span>
                        </div>
                      </div>

                      {/* Status + Action */}
                      <div className="flex flex-col items-end justify-between shrink-0 gap-2">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                            session.status === 'accepted'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {session.status === 'accepted' ? 'Accepted' : 'Pending'}
                        </span>
                        <button
                          onClick={() => navigate('/sessions')}
                          className="text-xs font-bold px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition"
                        >
                          Details
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 bg-[#F9F9FF] rounded-2xl text-center space-y-2">
                <p className="text-xs text-slate-500 font-medium">No upcoming learning sessions scheduled.</p>
                <button
                  onClick={() => navigate('/sessions/request')}
                  className="text-xs font-bold text-brand-primary hover:underline"
                >
                  + Request a new learning session →
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right: Your Learning Progress */}
        <div className="lg:col-span-5">
          <div className="bg-[#EEF2FF]/70 border border-indigo-100/60 rounded-3xl p-5 sm:p-6 space-y-5 h-full relative overflow-hidden">
            {/* Subtle top-right blob */}
            <div className="absolute top-0 right-0 w-28 h-28 bg-indigo-200/30 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between relative z-10">
              <h2 className="text-xl font-bold font-heading text-brand-text">Your Learning Progress</h2>
              <TrendingUp className="h-5 w-5 text-brand-primary" />
            </div>

            {/* Show real learn skills if available, otherwise mock bars */}
            {profile?.learnSkills?.length > 0 ? (
              <div className="space-y-4 relative z-10">
                {profile.learnSkills.slice(0, 4).map((skill, idx) => {
                  const colors = ['#3525CD', '#006C49', '#684000', '#8B5CF6'];
                  const fakePercent = 85 - idx * 18;
                  return (
                    <div key={skill} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: colors[idx % colors.length] }} />
                          <span className="font-semibold text-slate-700">{skill}</span>
                        </div>
                        <span className="font-extrabold text-brand-text">{fakePercent}%</span>
                      </div>
                      <div className="w-full bg-white/70 rounded-full h-2 overflow-hidden shadow-inner">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${fakePercent}%`, backgroundColor: colors[idx % colors.length] }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-6 text-center space-y-2 relative z-10">
                <p className="text-xs text-slate-500">No learning skills added yet.</p>
                <button
                  onClick={() => navigate('/skills')}
                  className="text-xs font-bold text-brand-primary hover:underline inline-flex items-center gap-1"
                >
                  <Plus className="h-3 w-3" /> Add skills to learn
                </button>
              </div>
            )}

            {/* Learning Tip */}
            <div className="relative z-10 flex items-start gap-3 bg-white/60 border border-indigo-100/60 rounded-2xl p-4">
              <Lightbulb className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-600 leading-relaxed">
                {profile?.learnSkills?.length > 0
                  ? <>You're working towards <strong className="text-brand-text">{profile.learnSkills[0]}</strong>. Schedule a peer session to accelerate your progress.</>
                  : <>Add skills you want to learn on the <button onClick={() => navigate('/skills')} className="font-bold text-brand-primary hover:underline">My Skills</button> page to track your progress.</>
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
