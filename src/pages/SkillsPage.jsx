import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '../hooks/useProfile';
import { Button } from '../components/ui/Button';
import {
  GraduationCap,
  Plus,
  BookOpen,
  Sparkles,
  TrendingUp,
  CheckCircle,
  RotateCw,
  X,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

const SUGGESTED = ['TypeScript', 'Next.js', 'GraphQL', 'Docker', 'AWS', 'Kubernetes'];

export const SkillsPage = () => {
  const navigate = useNavigate();
  const { profile, loading, saving, error, successMsg, updateProfile, setError, setSuccessMsg } = useProfile();

  // Local skill state — mirrors the backend; used optimistically in the UI
  const [teachSkills, setTeachSkills] = useState([]);
  const [learnSkills, setLearnSkills] = useState([]);

  // Sync local state when profile is first loaded
  useEffect(() => {
    if (profile) {
      setTeachSkills(profile.teachSkills || []);
      setLearnSkills(profile.learnSkills || []);
    }
  }, [profile]);

  // Modal state
  const [showTeachModal, setShowTeachModal] = useState(false);
  const [showLearnModal, setShowLearnModal] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [modalError, setModalError] = useState('');

  // ── Save helpers ──

  const saveSkills = async (updatedTeach, updatedLearn) => {
    setError(null);
    setSuccessMsg(null);
    try {
      await updateProfile({
        teachSkills: updatedTeach,
        learnSkills: updatedLearn,
      });
    } catch (_) {
      // error is set by useProfile hook
    }
  };

  // ── Add Skill Handlers ──

  const addTeach = async () => {
    const trimmed = newSkill.trim();
    if (!trimmed) {
      setModalError('Skill name cannot be empty');
      return;
    }
    if (teachSkills.map((s) => s.toLowerCase()).includes(trimmed.toLowerCase())) {
      setModalError('You already have this skill in your teaching list');
      return;
    }
    const updated = [...teachSkills, trimmed];
    setTeachSkills(updated);
    setNewSkill('');
    setModalError('');
    setShowTeachModal(false);
    await saveSkills(updated, learnSkills);
  };

  const addLearn = async () => {
    const trimmed = newSkill.trim();
    if (!trimmed) {
      setModalError('Skill name cannot be empty');
      return;
    }
    if (learnSkills.map((s) => s.toLowerCase()).includes(trimmed.toLowerCase())) {
      setModalError('You already have this skill in your learning list');
      return;
    }
    const updated = [...learnSkills, trimmed];
    setLearnSkills(updated);
    setNewSkill('');
    setModalError('');
    setShowLearnModal(false);
    await saveSkills(teachSkills, updated);
  };

  // ── Remove Skill Handlers ──

  const removeTeach = async (skillName) => {
    const updated = teachSkills.filter((s) => s !== skillName);
    setTeachSkills(updated);
    await saveSkills(updated, learnSkills);
  };

  const removeLearn = async (skillName) => {
    const updated = learnSkills.filter((s) => s !== skillName);
    setLearnSkills(updated);
    await saveSkills(teachSkills, updated);
  };

  // ── Add from Suggestions ──

  const addSuggestedToLearn = async (skill) => {
    if (learnSkills.map((s) => s.toLowerCase()).includes(skill.toLowerCase())) return;
    const updated = [...learnSkills, skill];
    setLearnSkills(updated);
    await saveSkills(teachSkills, updated);
  };

  // ── Profile completion ──

  const profileCompletion = !profile
    ? 0
    : Math.min(
        100,
        (profile.name ? 20 : 0) +
          (profile.bio ? 20 : 0) +
          (profile.college ? 10 : 0) +
          (teachSkills.length > 0 ? 25 : 0) +
          (learnSkills.length > 0 ? 25 : 0)
      );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <div className="h-10 w-10 rounded-2xl bg-brand-primary/10 flex items-center justify-center">
          <RotateCw className="h-5 w-5 animate-spin text-brand-primary" />
        </div>
        <span className="text-sm font-medium text-slate-500">Loading your skills...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ── Feedback Banners ── */}
      {error && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200/80 flex items-center gap-3 text-rose-700 text-xs font-medium">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto text-rose-400 hover:text-rose-700">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
      {successMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center gap-3 text-emerald-700 text-xs font-medium">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg(null)} className="ml-auto text-emerald-400 hover:text-emerald-700">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Main Grid: Left wide content + Right sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column — Skills Lists */}
        <div className="lg:col-span-7 space-y-5">
          {/* Skills I Can Teach Card */}
          <div className="bg-white rounded-3xl border border-indigo-50/80 shadow-soft overflow-hidden">
            <div className="flex items-center justify-between p-5 sm:p-6 border-b border-indigo-50">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-brand-primary flex items-center justify-center">
                  <GraduationCap className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold font-heading text-brand-text">Skills I Can Teach</h2>
                  <p className="text-xs text-slate-500">Subjects you're confident mentoring others in.</p>
                </div>
              </div>
              <Button
                variant="primary"
                size="sm"
                icon={saving ? RotateCw : Plus}
                disabled={saving}
                onClick={() => { setNewSkill(''); setModalError(''); setShowTeachModal(true); }}
              >
                Add Skill
              </Button>
            </div>

            {/* Skill Grid */}
            <div className="p-5 sm:p-6">
              {teachSkills.length === 0 ? (
                <div className="text-center py-8">
                  <GraduationCap className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-400">No teaching skills added yet.</p>
                  <p className="text-xs text-slate-400 mt-1">Click "Add Skill" to get started.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {teachSkills.map((skill) => (
                    <div
                      key={skill}
                      className="flex items-center justify-between bg-[#F4F4FD] border border-indigo-100/60 rounded-xl px-4 py-3 group"
                    >
                      <span className="font-semibold text-sm text-brand-text">{skill}</span>
                      <button
                        onClick={() => removeTeach(skill)}
                        disabled={saving}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-rose-500 disabled:opacity-30"
                        title={`Remove ${skill}`}
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Skills I Want To Learn Card */}
          <div className="bg-white rounded-3xl border border-emerald-50/80 shadow-soft overflow-hidden">
            <div className="flex items-center justify-between p-5 sm:p-6 border-b border-emerald-50">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-brand-secondary flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold font-heading text-brand-text">Skills I Want To Learn</h2>
                  <p className="text-xs text-slate-500">Areas you are looking to improve or start learning.</p>
                </div>
              </div>
              <Button
                variant="secondary"
                size="sm"
                icon={saving ? RotateCw : Plus}
                disabled={saving}
                onClick={() => { setNewSkill(''); setModalError(''); setShowLearnModal(true); }}
              >
                Add Goal
              </Button>
            </div>

            {/* Skill Grid */}
            <div className="p-5 sm:p-6">
              {learnSkills.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-400">No learning goals added yet.</p>
                  <p className="text-xs text-slate-400 mt-1">Click "Add Goal" to track your learning journey.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {learnSkills.map((skill) => (
                    <div
                      key={skill}
                      className="flex items-center justify-between bg-[#F0FDF8] border border-emerald-100/60 rounded-xl px-4 py-3 group"
                    >
                      <span className="font-semibold text-sm text-brand-text">{skill}</span>
                      <button
                        onClick={() => removeLearn(skill)}
                        disabled={saving}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-rose-500 disabled:opacity-30"
                        title={`Remove ${skill}`}
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="lg:col-span-5 space-y-5">
          {/* Profile Strength Card */}
          <div className="bg-brand-primary rounded-3xl p-6 text-white space-y-4 relative overflow-hidden shadow-soft">
            <div className="absolute top-0 right-0 w-28 h-28 bg-white/10 rounded-full -translate-y-8 translate-x-8 pointer-events-none" />

            <div className="relative z-10">
              <h3 className="text-xl font-bold font-heading">Profile Strength</h3>
              <p className="text-xs text-indigo-200 mt-0.5">
                A complete profile increases your match rate by up to 40%.
              </p>
            </div>

            <div className="relative z-10 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-indigo-200">Completion</span>
                <span className="text-white">{profileCompletion}%</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-500"
                  style={{ width: `${profileCompletion}%` }}
                />
              </div>
            </div>

            <div className="relative z-10 bg-white/15 border border-white/20 rounded-2xl p-4 space-y-1">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-indigo-200" />
                <span className="text-xs font-bold text-white">Next Step</span>
              </div>
              <p className="text-xs text-indigo-200">
                {!profile?.bio
                  ? 'Add a bio in Settings to improve your profile strength.'
                  : learnSkills.length === 0
                  ? 'Add learning goals to show peers what you want to master.'
                  : teachSkills.length === 0
                  ? 'Add skills you can teach to start getting session requests.'
                  : 'Great job! Keep your skills up to date for the best matches.'}
              </p>
            </div>
          </div>

          {/* Suggested For You Card */}
          <div className="bg-white rounded-3xl border border-indigo-50/80 shadow-soft p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-brand-primary" />
              <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">
                SUGGESTED FOR YOU
              </span>
            </div>

            <p className="text-xs text-slate-600">
              Popular skills among CampusConnect peers. Click to add to your learning goals.
            </p>

            <div className="space-y-2">
              {SUGGESTED.filter((s) => !teachSkills.map((t) => t.toLowerCase()).includes(s.toLowerCase())).slice(0, 5).map((skill) => {
                const alreadyAdded = learnSkills.map((s) => s.toLowerCase()).includes(skill.toLowerCase());
                return (
                  <div
                    key={skill}
                    className="flex items-center justify-between bg-[#F9F9FF] border border-indigo-50 rounded-xl px-4 py-3 hover:border-indigo-200 transition cursor-pointer group"
                    onClick={() => !alreadyAdded && !saving && addSuggestedToLearn(skill)}
                  >
                    <span className="text-sm font-semibold text-brand-text">{skill}</span>
                    {alreadyAdded ? (
                      <CheckCircle className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <div className="h-5 w-5 rounded-full border-2 border-indigo-200 group-hover:border-brand-primary flex items-center justify-center transition">
                        <Plus className="h-3 w-3 text-slate-400 group-hover:text-brand-primary" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── Add Skill Modal (Teach) ── */}
      {showTeachModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowTeachModal(false)}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-xl space-y-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-heading font-bold text-lg text-brand-text">Add a Skill You Teach</h3>
            {modalError && (
              <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">{modalError}</p>
            )}
            <input
              type="text"
              value={newSkill}
              onChange={(e) => { setNewSkill(e.target.value); setModalError(''); }}
              placeholder="Skill name e.g. Python"
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
              onKeyDown={(e) => e.key === 'Enter' && addTeach()}
              autoFocus
            />
            <div className="flex gap-3 pt-1">
              <Button variant="ghost" fullWidth onClick={() => { setShowTeachModal(false); setModalError(''); }}>Cancel</Button>
              <Button variant="primary" fullWidth onClick={addTeach} disabled={saving}>
                {saving ? 'Saving...' : 'Add Skill'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Skill Modal (Learn) ── */}
      {showLearnModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowLearnModal(false)}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-xl space-y-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-heading font-bold text-lg text-brand-text">Add a Learning Goal</h3>
            {modalError && (
              <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">{modalError}</p>
            )}
            <input
              type="text"
              value={newSkill}
              onChange={(e) => { setNewSkill(e.target.value); setModalError(''); }}
              placeholder="Skill name e.g. React"
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
              onKeyDown={(e) => e.key === 'Enter' && addLearn()}
              autoFocus
            />
            <div className="flex gap-3 pt-1">
              <Button variant="ghost" fullWidth onClick={() => { setShowLearnModal(false); setModalError(''); }}>Cancel</Button>
              <Button variant="secondary" fullWidth onClick={addLearn} disabled={saving}>
                {saving ? 'Saving...' : 'Add Goal'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
