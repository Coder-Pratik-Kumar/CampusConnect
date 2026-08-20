import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockDiscoverPeers } from '../data/mockData';
import { Button } from '../components/ui/Button';
import { Search, SlidersHorizontal, Star, ChevronDown, Zap } from 'lucide-react';

const VISIBLE_DEFAULT = 6;

export const DiscoverPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [skillLevel, setSkillLevel] = useState('Any');
  const [college, setCollege] = useState('GLA University');
  const [sortBy, setSortBy] = useState('Match Score');
  const [showAll, setShowAll] = useState(false);

  const filtered = mockDiscoverPeers.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.teachSkills.some((s) => s.toLowerCase().includes(search.toLowerCase())) ||
      p.learnSkills.some((s) => s.toLowerCase().includes(search.toLowerCase()))
  );

  const displayed = showAll ? filtered : filtered.slice(0, VISIBLE_DEFAULT);

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
            Connect with peers who possess the knowledge you seek. Our matching algorithm analyzes your learning goals to find the best mentors and study partners.
          </p>
        </div>
        <Button variant="primary" icon={SlidersHorizontal}>
          Advanced Filters
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
            placeholder="Search by name, skill, or t..."
            className="w-full bg-[#F9F9FF] border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-xs text-brand-text placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
          />
        </div>

        {/* Dropdowns */}
        {[
          { label: 'Skill Level', value: skillLevel, setter: setSkillLevel, options: ['Any', 'Beginner', 'Intermediate', 'Advanced', 'Expert'] },
          { label: 'College', value: college, setter: setCollege, options: ['GLA University', 'Amity University', 'Delhi University', 'NID', 'VIT', 'IIM'] },
          { label: 'Sort by', value: sortBy, setter: setSortBy, options: ['Match Score', 'Rating', 'Sessions', 'Newest'] },
        ].map(({ label, value, setter, options }) => (
          <div key={label} className="relative flex items-center gap-1.5 bg-[#F9F9FF] border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-700 cursor-pointer hover:border-indigo-200 transition select-none">
            <span className="text-slate-400">{label}:</span>
            <span className="text-brand-text font-bold">{value}</span>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={value}
              onChange={(e) => setter(e.target.value)}
              className="absolute inset-0 opacity-0 cursor-pointer w-full"
            >
              {options.map((o) => <option key={o}>{o}</option>)}
            </select>
          </div>
        ))}
      </div>

      {/* ── Peer Cards Grid ── */}
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
                <img
                  src={peer.avatar}
                  alt={peer.name}
                  className="h-14 w-14 rounded-full border-3 border-white object-cover shadow-soft"
                  style={{ borderWidth: 3 }}
                />
              </div>
              {/* Match Badge */}
              <div className="absolute top-3 right-3">
                <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1 shadow ${
                  peer.matchScore >= 95
                    ? 'bg-[#6CF8BB] text-emerald-900'
                    : peer.matchScore >= 85
                    ? 'bg-white/90 text-brand-primary'
                    : 'bg-white/80 text-slate-700'
                }`}>
                  {peer.matchScore >= 95 && <Zap className="h-2.5 w-2.5" />}
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
                  {peer.teachSkills.map((s) => (
                    <span key={s} className="bg-[#EEF2FF] border border-indigo-100 text-brand-primary text-[11px] font-semibold px-2.5 py-1 rounded-lg">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Learns */}
              <div>
                <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">LEARNS</p>
                <div className="flex flex-wrap gap-1.5">
                  {peer.learnSkills.map((s) => (
                    <span key={s} className="bg-slate-50 border border-slate-200 text-slate-600 text-[11px] font-semibold px-2.5 py-1 rounded-lg">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1 mt-auto">
                <button
                  onClick={() => navigate(`/profile/${peer.id}`)}
                  className="flex-1 bg-white border border-slate-200 text-slate-700 text-xs font-bold py-2.5 rounded-xl hover:border-indigo-200 hover:text-brand-primary transition focus:outline-none"
                >
                  View Profile
                </button>
                <button
                  onClick={() => navigate('/sessions/request')}
                  className="flex-1 bg-brand-primary text-white text-xs font-bold py-2.5 rounded-xl hover:bg-indigo-700 transition focus:outline-none"
                >
                  Request Session
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Load More ── */}
      {!showAll && filtered.length > VISIBLE_DEFAULT && (
        <div className="flex justify-center pt-2">
          <button
            onClick={() => setShowAll(true)}
            className="bg-white border border-slate-200 text-slate-700 text-sm font-semibold px-8 py-3 rounded-full hover:border-indigo-200 hover:text-brand-primary transition shadow-soft focus:outline-none"
          >
            Load More Matches
          </button>
        </div>
      )}
    </div>
  );
};
