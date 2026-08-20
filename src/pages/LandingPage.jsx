import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sparkles, TrendingUp, Calendar, Users, ArrowRight } from 'lucide-react';

const HOW_IT_WORKS = [
  { num: '01', title: 'Create Profile', desc: 'Sign up with your university email to verify your student status and join the network.' },
  { num: '02', title: 'List Your Skills', desc: 'Add subjects you excel at and are willing to teach others. Set your proficiency levels.' },
  { num: '03', title: 'Set Learning Goals', desc: 'Identify subjects or tools you need help with. Our system begins searching for overlaps.' },
  { num: '04', title: 'Get Matched', desc: 'Review AI-suggested peers with high match percentages based on mutual needs.' },
  { num: '05', title: 'Schedule Session', desc: 'Use the built-in calendar to propose meeting times for virtual or physical library sessions.' },
  { num: '06', title: 'Learn & Rate', desc: 'Complete your knowledge exchange and leave constructive feedback to build trust.' },
];

const FEATURES = [
  {
    icon: Sparkles,
    title: 'Smart Skill Matching',
    desc: 'Our algorithm pairs you with students who excel in what you want to learn, and want to learn what you excel in.',
    bg: 'bg-white',
    accent: 'bg-indigo-50 text-brand-primary',
    wave: false,
  },
  {
    icon: TrendingUp,
    title: 'Track Your Growth',
    desc: 'Visualize your learning milestones and teaching hours.',
    bg: 'bg-brand-primary',
    accent: 'bg-white/20 text-white',
    text: 'text-white',
    subdesc: 'text-indigo-200',
    wave: true,
  },
  {
    icon: Calendar,
    title: 'Flexible Sessions',
    desc: 'Schedule online or on-campus meetups that fit your academic calendar.',
    bg: 'bg-slate-100',
    accent: 'bg-slate-200 text-slate-700',
    wave: false,
  },
  {
    icon: Users,
    title: 'Trusted Community',
    desc: 'Verified student profiles and session ratings maintain a high-quality learning environment.',
    bg: 'bg-white',
    accent: 'bg-amber-50 text-amber-700',
    wave: false,
    image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=400',
  },
];

export const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F9F9FF] font-body">
      {/* ── Top Navbar ── */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/60 px-6 sm:px-10 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-brand-primary font-heading font-extrabold text-xl tracking-tight">
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
          CampusConnect
        </div>

        <div className="hidden sm:flex items-center gap-6 text-sm font-medium text-slate-600">
          <a href="#features" className="hover:text-brand-primary transition">Features</a>
          <a href="#how-it-works" className="hover:text-brand-primary transition">How it Works</a>
          <a href="#community" className="hover:text-brand-primary transition">Community</a>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/login')}
            className="text-sm font-semibold text-slate-700 hover:text-brand-primary transition px-3 py-1.5"
          >
            Log In
          </button>
          <button
            onClick={() => navigate('/register')}
            className="bg-brand-primary text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-indigo-700 transition"
          >
            Join Now
          </button>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <section className="max-w-5xl mx-auto px-6 sm:px-10 pt-16 pb-12 text-center">
        <h1 className="font-heading font-extrabold text-4xl sm:text-5xl lg:text-6xl text-brand-text leading-tight tracking-tight">
          Turn your skills into connections.
        </h1>
        <p className="text-sm sm:text-base text-slate-500 mt-4 max-w-2xl mx-auto leading-relaxed">
          Learn from students around you, share what you know, and build meaningful connections through peer-to-peer learning.
        </p>

        <div className="flex items-center justify-center gap-3 mt-8 flex-wrap">
          <button
            onClick={() => navigate('/register')}
            className="bg-brand-primary text-white font-bold text-sm px-6 py-3 rounded-xl hover:bg-indigo-700 transition shadow-soft"
          >
            Find Your Skill Match
          </button>
          <button
            onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-white border border-slate-200 text-slate-700 font-semibold text-sm px-6 py-3 rounded-xl hover:border-indigo-200 hover:text-brand-primary transition shadow-soft"
          >
            How It Works
          </button>
        </div>
      </section>

      {/* ── Match Overview Widget ── */}
      <section className="max-w-2xl mx-auto px-6 sm:px-10 pb-16">
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-soft-md overflow-hidden">
          {/* Mini top bar */}
          <div className="flex items-center gap-2 px-5 py-3 border-b border-slate-100 bg-slate-50/60">
            <svg className="h-4 w-4 text-brand-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            <span className="text-xs font-bold text-slate-600">Match Overview</span>
            <div className="ml-auto flex gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-rose-400" />
              <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
            </div>
          </div>

          {/* Two Students */}
          <div className="flex items-center justify-between gap-4 p-6 flex-wrap sm:flex-nowrap">
            {/* Student A */}
            <div className="flex-1 space-y-2 min-w-0">
              <div className="flex items-center gap-2">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=80"
                  className="h-10 w-10 rounded-full object-cover border-2 border-white shadow-soft"
                  alt="Pratik"
                />
                <div>
                  <p className="text-xs font-bold text-brand-text">Pratik Kumar</p>
                  <p className="text-[10px] text-slate-400">Computer Science, 3rd Year</p>
                </div>
              </div>
              <div>
                <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">TEACHES</p>
                <div className="flex gap-1.5 flex-wrap">
                  {['Java', 'SQL'].map(s => (
                    <span key={s} className="bg-[#EEF2FF] border border-indigo-100 text-brand-primary text-[10px] font-bold px-2 py-0.5 rounded-md">{s}</span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">LEARNS</p>
                <span className="bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-md">React</span>
              </div>
            </div>

            {/* Center Match Score */}
            <div className="flex flex-col items-center justify-center shrink-0">
              <div className="h-14 w-14 rounded-full bg-brand-primary text-white font-extrabold text-sm flex flex-col items-center justify-center shadow-soft font-heading">
                <span>92%</span>
                <span className="text-[8px] font-bold text-indigo-200 uppercase tracking-wider">Match</span>
              </div>
            </div>

            {/* Student B */}
            <div className="flex-1 space-y-2 min-w-0">
              <div className="flex items-center gap-2">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=80"
                  className="h-10 w-10 rounded-full object-cover border-2 border-white shadow-soft"
                  alt="Rahul"
                />
                <div>
                  <p className="text-xs font-bold text-brand-text">Rahul Sharma</p>
                  <p className="text-[10px] text-slate-400">Information Tech, 4th Year</p>
                </div>
              </div>
              <div>
                <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">TEACHES</p>
                <div className="flex gap-1.5 flex-wrap">
                  {['React', 'Node.js'].map(s => (
                    <span key={s} className="bg-[#EEF2FF] border border-indigo-100 text-brand-primary text-[10px] font-bold px-2 py-0.5 rounded-md">{s}</span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">LEARNS</p>
                <span className="bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-md">Java</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="max-w-5xl mx-auto px-6 sm:px-10 pb-20">
        <div className="mb-10">
          <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-brand-text">
            Empowering Peer-to-Peer Growth
          </h2>
          <p className="text-sm text-slate-500 mt-2 max-w-lg">
            CampusConnect provides the tools and environment you need to exchange knowledge seamlessly.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className={`${f.bg} rounded-3xl border border-slate-200/60 p-6 flex flex-col gap-4 relative overflow-hidden shadow-soft`}
            >
              <div className={`h-10 w-10 rounded-xl ${f.accent} flex items-center justify-center shrink-0`}>
                <f.icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className={`font-heading font-bold text-lg ${f.text || 'text-brand-text'}`}>{f.title}</h3>
                <p className={`text-sm leading-relaxed mt-1 ${f.subdesc || 'text-slate-500'}`}>{f.desc}</p>
              </div>

              {/* Image thumbnail for Trusted Community */}
              {f.image && (
                <div className="absolute bottom-4 right-4 w-24 h-24 rounded-2xl overflow-hidden shadow-soft border-2 border-white">
                  <img src={f.image} alt="Community" className="w-full h-full object-cover" />
                </div>
              )}

              {/* Abstract wave for Track Your Growth */}
              {f.wave && (
                <svg className="absolute bottom-0 right-0 w-28 opacity-20" viewBox="0 0 100 40" fill="none">
                  <path d="M0 20 Q25 0 50 20 Q75 40 100 20" stroke="white" strokeWidth="3" fill="none"/>
                  <path d="M0 30 Q25 10 50 30 Q75 50 100 30" stroke="white" strokeWidth="2" fill="none"/>
                </svg>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="bg-slate-900 py-20 px-6 sm:px-10">
        <div className="max-w-5xl mx-auto">
          <div className="mb-10">
            <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">
              How It Works
            </h2>
            <p className="text-sm text-slate-400 mt-2 max-w-lg">
              Six simple steps to transform your academic journey from solitary studying to collaborative mastery.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {HOW_IT_WORKS.map((step) => (
              <div key={step.num} className="space-y-2">
                <p className="text-2xl font-extrabold font-heading text-indigo-500">{step.num}</p>
                <h3 className="font-heading font-bold text-white text-base">{step.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-slate-900 border-t border-slate-800 py-6 px-6 sm:px-10">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-500">© 2024 CampusConnect</p>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <a href="#" className="hover:text-slate-300 transition">Privacy Policy</a>
            <a href="#" className="hover:text-slate-300 transition">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
