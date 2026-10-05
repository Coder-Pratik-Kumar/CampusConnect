import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { useMatches } from '../hooks/useMatches';
import { useSessions } from '../hooks/useSessions';
import {
  Calendar,
  Clock,
  Star,
  GraduationCap,
  Hourglass,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Send,
  Info,
  AlertCircle,
  RotateCw,
  Sparkles,
} from 'lucide-react';

export const SessionRequestPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { matches, loading: matchesLoading } = useMatches();
  const { createSession, submitting, error: apiError } = useSessions();

  // Extract query parameters
  const queryParams = new URLSearchParams(location.search);
  const queryPeerId = queryParams.get('peerId');
  const querySkill = queryParams.get('skill');

  const initialPeer = location.state?.peer || null;

  const [selectedPeerId, setSelectedPeerId] = useState(queryPeerId || initialPeer?.id || '');
  const [selectedSkill, setSelectedSkill] = useState(querySkill || '');
  const [learningNotes, setLearningNotes] = useState('');
  const [selectedTime, setSelectedTime] = useState('7:00 PM');
  const [selectedDuration, setSelectedDuration] = useState('60 Min');
  const [formError, setFormError] = useState('');

  // Default to tomorrow's date formatted YYYY-MM-DD
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDateStr = tomorrow.toISOString().split('T')[0];

  const [selectedDateStr, setSelectedDateStr] = useState(defaultDateStr);

  // Synchronize target peer from matches if queryPeerId is present
  const targetMatch = matches.find(
    (m) => (m.user?.id || m.user?._id) === selectedPeerId
  );
  const targetPeer = initialPeer || (targetMatch ? {
    id: targetMatch.user?.id || targetMatch.user?._id,
    name: targetMatch.user?.name,
    avatar: targetMatch.user?.avatar,
    college: targetMatch.user?.college,
    major: targetMatch.user?.major,
    rating: targetMatch.user?.rating ? Number(targetMatch.user.rating).toFixed(1) : '5.0',
    sessionsCount: targetMatch.user?.sessionsCount || 0,
    teachSkills: targetMatch.user?.teachSkills || [],
  } : null);

  // Set default providerId if matches arrive and no peer is selected
  useEffect(() => {
    if (!selectedPeerId && matches.length > 0) {
      const firstPeerId = matches[0].user?.id || matches[0].user?._id;
      setSelectedPeerId(firstPeerId);
    }
  }, [matches, selectedPeerId]);

  // Set default skill from peer's teach skills if not prefilled
  useEffect(() => {
    if (!selectedSkill && targetPeer?.teachSkills?.length > 0) {
      setSelectedSkill(targetPeer.teachSkills[0]);
    }
  }, [targetPeer, selectedSkill]);

  const durations = ['30 Min', '60 Min', '90 Min'];
  const timeslots = ['6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!selectedPeerId) {
      setFormError('Please select a peer to request a session with.');
      return;
    }

    if (!selectedSkill.trim()) {
      setFormError('Please specify the skill you want to learn.');
      return;
    }

    if (!selectedDateStr) {
      setFormError('Please select a valid date for the session.');
      return;
    }

    try {
      await createSession({
        providerId: selectedPeerId,
        skill: selectedSkill.trim(),
        date: selectedDateStr,
        time: selectedTime,
        duration: selectedDuration,
        message: learningNotes.trim(),
      });

      navigate('/sessions');
    } catch (err) {
      setFormError(err.message || 'Failed to submit session request');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Section */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-brand-text font-heading tracking-tight">
          Request a Learning Session
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Select an available time to connect with your peer mentor. Prepare specific questions to make the most of your session.
        </p>
      </div>

      {/* Form Error Banner */}
      {(formError || apiError) && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl p-4 flex items-center gap-3 text-xs sm:text-sm">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{formError || apiError}</span>
        </div>
      )}

      {/* Main Grid Layout */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Peer Info & Stats */}
        <div className="lg:col-span-4 space-y-6">
          {/* Peer Selector / Details Card */}
          <div className="bg-[#EEF2FF]/70 border border-indigo-100/60 rounded-3xl p-6 text-center space-y-4 flex flex-col items-center">
            {/* If multiple matches available, allow switching target peer */}
            {matches.length > 1 && (
              <div className="w-full text-left">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-1">
                  SELECT MENTOR
                </label>
                <select
                  value={selectedPeerId}
                  onChange={(e) => {
                    setSelectedPeerId(e.target.value);
                    const match = matches.find((m) => (m.user?.id || m.user?._id) === e.target.value);
                    if (match?.user?.teachSkills?.[0]) {
                      setSelectedSkill(match.user.teachSkills[0]);
                    }
                  }}
                  className="w-full bg-white border border-indigo-100 rounded-xl px-3 py-2 text-xs font-bold text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                >
                  {matches.map((m) => {
                    const mId = m.user?.id || m.user?._id;
                    return (
                      <option key={mId} value={mId}>
                        {m.user?.name} ({m.matchScore}% Match)
                      </option>
                    );
                  })}
                </select>
              </div>
            )}

            <Avatar
              src={targetPeer?.avatar}
              name={targetPeer?.name || 'Peer Mentor'}
              size="xl"
              className="h-24 w-24 rounded-full object-cover shadow-soft border-4 border-white"
            />
            <div>
              <h2 className="font-heading font-extrabold text-xl text-brand-text">
                {targetPeer?.name || 'Peer Mentor'}
              </h2>
              <p className="text-xs font-medium text-slate-500 mt-0.5">
                {targetPeer?.major || 'Student'} {targetPeer?.college ? `at ${targetPeer.college}` : ''}
              </p>
            </div>

            {/* Skill Tags */}
            <div className="flex flex-wrap justify-center gap-1.5 pt-1">
              {targetPeer?.teachSkills?.length > 0 ? (
                targetPeer.teachSkills.map((s) => (
                  <span
                    key={s}
                    className="bg-white/80 border border-indigo-100 text-brand-primary text-xs font-semibold px-3 py-1 rounded-full shadow-2xs"
                  >
                    {s}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400 italic">No skills listed</span>
              )}
            </div>
          </div>

          {/* Mentorship Stats Card */}
          <Card className="border-indigo-50 shadow-soft-sm rounded-3xl p-5 sm:p-6 space-y-4">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              MENTORSHIP STATS
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-600 font-medium">
                  <Star className="h-4 w-4 text-amber-500" />
                  <span>Rating</span>
                </div>
                <span className="font-bold text-brand-text">{targetPeer?.rating || '5.0'}/5.0</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-600 font-medium">
                  <GraduationCap className="h-4 w-4 text-indigo-600" />
                  <span>Completed Sessions</span>
                </div>
                <span className="font-bold text-brand-text">{targetPeer?.sessionsCount || 0}</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-600 font-medium">
                  <Clock className="h-4 w-4 text-emerald-600" />
                  <span>Response Time</span>
                </div>
                <span className="font-bold text-brand-text">&lt; 2 hrs</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Date, Time & Request Form */}
        <div className="lg:col-span-8">
          <Card className="border-indigo-50 shadow-soft-sm rounded-3xl p-6 sm:p-8 space-y-6">
            {/* Section 0: Topic / Skill to Learn */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-brand-primary" />
                <h2 className="font-heading font-bold text-xl text-brand-text">Skill / Topic to Learn</h2>
              </div>
              <input
                type="text"
                value={selectedSkill}
                onChange={(e) => setSelectedSkill(e.target.value)}
                placeholder="E.g. React, Python, Data Structures, Figma..."
                className="w-full bg-[#F9F9FF] border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold text-brand-text placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
                required
              />
            </div>

            {/* Section 1: Select Date */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-brand-primary" />
                  <h2 className="font-heading font-bold text-xl text-brand-text">Select Date</h2>
                </div>
              </div>

              <input
                type="date"
                value={selectedDateStr}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setSelectedDateStr(e.target.value)}
                className="w-full sm:w-auto bg-[#F9F9FF] border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
                required
              />
            </div>

            {/* Section 2: Duration & Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              {/* Duration */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Hourglass className="h-5 w-5 text-brand-primary" />
                  <h3 className="font-heading font-bold text-lg text-brand-text">Duration</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {durations.map((dur) => {
                    const isSelected = selectedDuration === dur;
                    return (
                      <button
                        type="button"
                        key={dur}
                        onClick={() => setSelectedDuration(dur)}
                        className={`px-4 py-2.5 rounded-xl text-xs font-bold transition focus:outline-none ${
                          isSelected
                            ? 'bg-[#6CF8BB] text-emerald-950 border border-emerald-300 shadow-2xs'
                            : 'bg-[#F4F4FD] text-slate-700 hover:bg-indigo-100/60'
                        }`}
                      >
                        {dur}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-brand-primary" />
                  <h3 className="font-heading font-bold text-lg text-brand-text">Time (IST)</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {timeslots.map((time) => {
                    const isSelected = selectedTime === time;
                    return (
                      <button
                        type="button"
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition focus:outline-none ${
                          isSelected
                            ? 'bg-indigo-100 text-brand-primary border border-indigo-200 shadow-2xs'
                            : 'bg-[#F4F4FD] text-slate-700 hover:bg-indigo-100/60'
                        }`}
                      >
                        {time}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Section 3: What do you want to learn? */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-brand-primary" />
                <h3 className="font-heading font-bold text-lg text-brand-text">
                  Session Notes / Questions
                </h3>
              </div>

              <div className="space-y-2">
                <textarea
                  rows={4}
                  value={learningNotes}
                  onChange={(e) => setLearningNotes(e.target.value)}
                  placeholder="E.g., I'm struggling with state management in React and would love a 1-on-1 walkthrough..."
                  className="w-full bg-[#F9F9FF] border border-slate-200 rounded-2xl p-4 text-xs text-brand-text placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all resize-none"
                />
                <div className="flex items-center justify-end gap-1 text-[11px] text-slate-400">
                  <Info className="h-3 w-3" />
                  <span>Optional session message</span>
                </div>
              </div>
            </div>

            {/* Section 4: Submit Button */}
            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                variant="primary"
                icon={submitting ? RotateCw : Send}
                iconPosition="right"
                disabled={submitting}
                className="py-3 px-6"
              >
                {submitting ? 'Sending Request...' : 'Send Session Request'}
              </Button>
            </div>
          </Card>
        </div>
      </form>
    </div>
  );
};

