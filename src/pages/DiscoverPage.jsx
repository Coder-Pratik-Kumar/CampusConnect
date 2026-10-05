import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMatches } from '../hooks/useMatches';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import {
  Search,
  SlidersHorizontal,
  Star,
  ChevronDown,
  Zap,
  RotateCw,
  AlertCircle,
  Users,
  Sparkles,
} from 'lucide-react';

const VISIBLE_DEFAULT = 6;

const BANNER_GRADIENTS = [
  'from-indigo-600 to-brand-primary',
  'from-purple-600 to-indigo-500',
  'from-blue-600 to-indigo-500',
  'from-violet-600 to-purple-500',
  'from-cyan-600 to-blue-500',
  'from-rose-500 to-pink-500',
];

export const DiscoverPage = () => {
  const navigate = useNavigate();
  const { matches, totalMatches, loading, error, refetch } = useMatches();

  const [search, setSearch] = useState('');
  const [skillLevel, setSkillLevel] = useState('Any');
  const [college, setCollege] = useState('All Colleges');
  const [sortBy, setSortBy] = useState('Match Score');
  const [showAll, setShowAll] = useState(false);

  // Map backend matches to UI peer representation
  const peers = matches.map((m, idx) => ({
    id: m.user?.id || m.user?._id,
    name: m.user?.name || 'Student',
    college: m.user?.college || 'University',
    major: m.user?.major || 'Major N/A',
    avatar: m.user?.avatar,
    rating: m.user?.rating ? Number(m.user.rating).toFixed(1) : '5.0',
    sessionsCount: m.user?.sessionsCount || 0,
    createdAt: m.user?.createdAt,
    teachSkills: m.user?.teachSkills || [],
    learnSkills: m.user?.learnSkills || [],
    matchScore: m.matchScore || 0,
    reasons: m.reasons || [],
    bannerColor: BANNER_GRADIENTS[idx % BANNER_GRADIENTS.length],
  }));

  // Build unique college options from real data
  const availableColleges = ['All Colleges', ...new Set(peers.map((p) => p.college).filter(Boolean))];

  // Filtering
  const filtered = peers.filter((p) => {
    const searchLower = search.toLowerCase().trim();
    const matchesSearch =
      searchLower === '' ||
      p.name.toLowerCase().includes(searchLower) ||
      p.college.toLowerCase().includes(searchLower) ||
      p.major.toLowerCase().includes(searchLower) ||
      p.teachSkills.some((s) => s.toLowerCase().includes(searchLower)) ||
      p.learnSkills.some((s) => s.toLowerCase().includes(searchLower));

    const matchesCollege =
      college === 'All Colleges' ||
      college === 'Any' ||
      p.college.toLowerCase().trim() === college.toLowerCase().trim();

    return matchesSearch && matchesCollege;
  });

  // Sorting
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'Match Score') return b.matchScore - a.matchScore;
    if (sortBy === 'Rating') return Number(b.rating) - Number(a.rating);
    if (sortBy === 'Sessions') return b.sessionsCount - a.sessionsCount;
    if (sortBy === 'Newest') return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    return 0;
  });

  const displayed = showAll ? sorted : sorted.slice(0, VISIBLE_DEFAULT);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-extrabold text-brand-primary uppercase tracking-[0.2em] mb-1">
            ALGORITHM POWERED
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-brand-text tracking-tight">
            Discover Your Skill Matches
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-lg leading-relaxed">
            Connect with peers who possess the knowledge you seek. Our rule-based matching engine analyzes your learning goals to calculate match compatibility scores.
          </p>
        </div>
        <Button variant="primary" icon={SlidersHorizontal} onClick={refetch}>
          Refresh Matches
        </Button>
      </div>

      {/* ── Filter Bar ── */}
      <div className="bg-white rounded-2xl border border-indigo-50 shadow-soft p-3 sm:p-4 flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, skill, or college..."
            className="w-full bg-[#F9F9FF] border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-xs text-brand-text placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
          />
        </div>

        {/* Dropdowns */}
        {[
          {
            label: 'College',
            value: college,
            setter: setCollege,
            options: availableColleges,
          },
          {
            label: 'Sort by',
            value: sortBy,
            setter: setSortBy,
            options: ['Match Score', 'Rating', 'Sessions', 'Newest'],
          },
        ].map(({ label, value, setter, options }) => (
          <div
            key={label}
            className="relative flex items-center gap-1.5 bg-[#F9F9FF] border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-700 cursor-pointer hover:border-indigo-200 transition select-none"
          >
            <span className="text-slate-400">{label}:</span>
            <span className="text-brand-text font-bold">{value}</span>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={value}
              onChange={(e) => setter(e.target.value)}
              className="absolute inset-0 opacity-0 cursor-pointer w-full"
            >
              {options.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {/* ── Loading State ── */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-3 bg-white rounded-3xl border border-indigo-50 shadow-soft">
          <div className="h-12 w-12 rounded-2xl bg-brand-primary/10 flex items-center justify-center">
            <RotateCw className="h-6 w-6 animate-spin text-brand-primary" />
          </div>
          <p className="text-sm font-semibold text-brand-text">Analyzing skills & calculating matches...</p>
          <p className="text-xs text-slate-400">Comparing your learning goals with peer profiles</p>
        </div>
      )}

      {/* ── Error State ── */}
      {!loading && error && (
        <div className="bg-rose-50 border border-rose-200 rounded-3xl p-6 text-center space-y-4 max-w-md mx-auto my-8">
          <div className="h-12 w-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">Failed to Load Matches</h3>
            <p className="text-xs text-slate-600 mt-1">{error}</p>
          </div>
          <Button variant="primary" onClick={refetch} icon={RotateCw}>
            Try Again
          </Button>
        </div>
      )}

      {/* ── Empty State (No Matches from API) ── */}
      {!loading && !error && matches.length === 0 && (
        <div className="bg-white rounded-3xl border border-indigo-50/80 shadow-soft p-10 text-center space-y-4 max-w-lg mx-auto my-8">
          <div className="h-16 w-16 rounded-2xl bg-indigo-50 text-brand-primary flex items-center justify-center mx-auto">
            <Users className="h-8 w-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold font-heading text-brand-text">No Compatible Peers Found Yet</h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
              We couldn't find any peer matches with your current skill list. Add skills you can teach and skills you want to learn to get matched with fellow students!
            </p>
          </div>
          <Button variant="primary" onClick={() => navigate('/skills')}>
            Update My Skills
          </Button>
        </div>
      )}

      {/* ── Empty Filtered State ── */}
      {!loading && !error && matches.length > 0 && sorted.length === 0 && (
        <div className="bg-white rounded-3xl border border-indigo-50/80 shadow-soft p-8 text-center space-y-3 max-w-md mx-auto my-8">
          <p className="text-sm font-bold text-brand-text">No matches found matching "{search || college}"</p>
          <p className="text-xs text-slate-500">Try searching for a different skill, student name, or resetting filters.</p>
          <button
            onClick={() => {
              setSearch('');
              setCollege('All Colleges');
              setSkillLevel('Any');
            }}
            className="text-xs font-bold text-brand-primary hover:underline"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* ── Peer Cards Grid ── */}
      {!loading && !error && sorted.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayed.map((peer) => (
            <div
              key={peer.id}
              className="bg-white rounded-3xl border border-indigo-50/80 shadow-soft overflow-hidden flex flex-col hover:shadow-soft-md hover:-translate-y-0.5 transition-all duration-200 group"
            >
              {/* Card Banner with gradient + avatar */}
              <div className={`relative h-24 bg-gradient-to-br ${peer.bannerColor} flex-shrink-0`}>
                {/* Avatar */}
                <div className="absolute -bottom-6 left-5">
                  <Avatar
                    src={peer.avatar}
                    name={peer.name}
                    className="h-14 w-14 rounded-full border-3 border-white object-cover shadow-soft"
                    style={{ borderWidth: 3 }}
                  />
                </div>
                {/* Match Badge */}
                <div className="absolute top-3 right-3">
                  <span
                    className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1 shadow ${
                      peer.matchScore >= 90
                        ? 'bg-[#6CF8BB] text-emerald-900'
                        : peer.matchScore >= 50
                        ? 'bg-white/90 text-brand-primary'
                        : 'bg-white/80 text-slate-700'
                    }`}
                  >
                    {peer.matchScore >= 90 && <Zap className="h-2.5 w-2.5" />}
                    {peer.matchScore}% Match
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="pt-8 pb-5 px-5 flex-1 flex flex-col gap-3">
                {/* Name + Rating */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-heading font-extrabold text-base text-brand-text leading-snug">
                      {peer.name}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {peer.major} at {peer.college}
                    </p>
                  </div>
                  <span className="flex items-center gap-1 text-xs font-bold text-amber-600 shrink-0">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> {peer.rating}
                  </span>
                </div>

                {/* Teaches */}
                <div>
                  <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">TEACHES</p>
                  <div className="flex flex-wrap gap-1.5">
                    {peer.teachSkills.length > 0 ? (
                      peer.teachSkills.map((s) => (
                        <span
                          key={s}
                          className="bg-[#EEF2FF] border border-indigo-100 text-brand-primary text-[11px] font-semibold px-2.5 py-1 rounded-lg"
                        >
                          {s}
                        </span>
                      ))
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">None listed</span>
                    )}
                  </div>
                </div>

                {/* Learns */}
                <div>
                  <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">LEARNS</p>
                  <div className="flex flex-wrap gap-1.5">
                    {peer.learnSkills.length > 0 ? (
                      peer.learnSkills.map((s) => (
                        <span
                          key={s}
                          className="bg-slate-50 border border-slate-200 text-slate-600 text-[11px] font-semibold px-2.5 py-1 rounded-lg"
                        >
                          {s}
                        </span>
                      ))
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">None listed</span>
                    )}
                  </div>
                </div>

                {/* Match Reasons */}
                {peer.reasons && peer.reasons.length > 0 && (
                  <div className="bg-[#F9F9FF] border border-indigo-50/80 rounded-xl p-2.5 space-y-1">
                    <div className="flex items-center gap-1 font-bold text-brand-primary text-[10px] uppercase tracking-wider">
                      <Sparkles className="h-3 w-3" /> Why You Match
                    </div>
                    <ul className="space-y-0.5 text-[11px] text-slate-600">
                      {peer.reasons.map((r, i) => (
                        <li key={i} className="flex items-start gap-1 leading-snug">
                          <span className="text-brand-primary font-bold">•</span>
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-1 mt-auto">
                  <button
                    onClick={() => navigate(`/profile/${peer.id}`)}
                    className="flex-1 bg-white border border-slate-200 text-slate-700 text-xs font-bold py-2.5 rounded-xl hover:border-indigo-200 hover:text-brand-primary transition focus:outline-none"
                  >
                    View Profile
                  </button>
                  <button
                    onClick={() =>
                      navigate(
                        `/sessions/request?peerId=${peer.id}${
                          peer.teachSkills?.[0] ? `&skill=${encodeURIComponent(peer.teachSkills[0])}` : ''
                        }`,
                        { state: { peer } }
                      )
                    }
                    className="flex-1 bg-brand-primary text-white text-xs font-bold py-2.5 rounded-xl hover:bg-indigo-700 transition focus:outline-none"
                  >
                    Request Session
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Load More ── */}
      {!loading && !error && !showAll && sorted.length > VISIBLE_DEFAULT && (
        <div className="flex justify-center pt-2">
          <button
            onClick={() => setShowAll(true)}
            className="bg-white border border-slate-200 text-slate-700 text-sm font-semibold px-8 py-3 rounded-full hover:border-indigo-200 hover:text-brand-primary transition shadow-soft focus:outline-none"
          >
            Load More Matches ({sorted.length - VISIBLE_DEFAULT} remaining)
          </button>
        </div>
      )}
    </div>
  );
};

