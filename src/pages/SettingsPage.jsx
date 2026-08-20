import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useProfile } from '../hooks/useProfile';
import {
  User,
  GraduationCap,
  BookOpen,
  Repeat,
  Clock,
  Plus,
  X,
  Save,
  RotateCw,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

export const SettingsPage = () => {
  const { profile, loading, saving, error, successMsg, updateProfile, setError, setSuccessMsg } =
    useProfile();

  // ── Local form state (mirrors backend) ──
  const [fullName, setFullName] = useState('');
  const [college, setCollege] = useState('');
  const [major, setMajor] = useState('');
  const [bio, setBio] = useState('');
  const [teachSkills, setTeachSkills] = useState([]);
  const [learnSkills, setLearnSkills] = useState([]);
  const [teachInput, setTeachInput] = useState('');
  const [learnInput, setLearnInput] = useState('');
  const [availability, setAvailability] = useState([]);

  // Sync form state when profile loads from backend
  useEffect(() => {
    if (profile) {
      setFullName(profile.name || '');
      setCollege(profile.college || '');
      setMajor(profile.major || '');
      setBio(profile.bio || '');
      setTeachSkills(profile.teachSkills || []);
      setLearnSkills(profile.learnSkills || []);
      // Availability slots from backend: [{day, startTime, endTime}]
      // Add a local `id` for React keys
      setAvailability(
        (profile.availability || []).map((slot, i) => ({
          id: `slot_${i}_${slot.day}`,
          day: slot.day,
          startTime: slot.startTime,
          endTime: slot.endTime,
        }))
      );
    }
  }, [profile]);

  // ── Teach skill handlers ──
  const handleAddTeachSkill = (e) => {
    if (e.key === 'Enter' && teachInput.trim()) {
      e.preventDefault();
      const trimmed = teachInput.trim();
      if (!teachSkills.map((s) => s.toLowerCase()).includes(trimmed.toLowerCase())) {
        setTeachSkills([...teachSkills, trimmed]);
      }
      setTeachInput('');
    }
  };

  const handleRemoveTeachSkill = (skillToRemove) => {
    setTeachSkills(teachSkills.filter((s) => s !== skillToRemove));
  };

  // ── Learn skill handlers ──
  const handleAddLearnSkill = (e) => {
    if (e.key === 'Enter' && learnInput.trim()) {
      e.preventDefault();
      const trimmed = learnInput.trim();
      if (!learnSkills.map((s) => s.toLowerCase()).includes(trimmed.toLowerCase())) {
        setLearnSkills([...learnSkills, trimmed]);
      }
      setLearnInput('');
    }
  };

  const handleRemoveLearnSkill = (skillToRemove) => {
    setLearnSkills(learnSkills.filter((s) => s !== skillToRemove));
  };

  // ── Availability slot handlers ──
  const handleAddSlot = () => {
    const newSlot = {
      id: `slot_${Date.now()}`,
      day: 'Friday',
      startTime: '04:00 PM',
      endTime: '06:00 PM',
    };
    setAvailability([...availability, newSlot]);
  };

  const handleRemoveSlot = (slotId) => {
    setAvailability(availability.filter((s) => s.id !== slotId));
  };

  const handleSlotChange = (slotId, field, value) => {
    setAvailability(
      availability.map((s) => (s.id === slotId ? { ...s, [field]: value } : s))
    );
  };

  // ── Save handler — sends all form state to PUT /api/profile ──
  const handleSave = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    try {
      await updateProfile({
        name: fullName.trim(),
        college: college.trim(),
        major: major.trim(),
        bio: bio.trim(),
        teachSkills,
        learnSkills,
        // Strip local `id` field before sending to backend
        availability: availability.map(({ day, startTime, endTime }) => ({
          day,
          startTime,
          endTime,
        })),
      });
    } catch (_) {
      // error already set by useProfile hook
    }
  };

  // ── Loading skeleton ──
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <div className="h-10 w-10 rounded-2xl bg-brand-primary/10 flex items-center justify-center">
          <RotateCw className="h-5 w-5 animate-spin text-brand-primary" />
        </div>
        <span className="text-sm font-medium text-slate-500">Loading your profile...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Section */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-brand-text font-heading tracking-tight">
          Edit Profile
        </h1>
        <p className="text-xs sm:text-sm text-brand-muted mt-1">
          Update your personal details, skills, and availability.
        </p>
      </div>

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

      <form onSubmit={handleSave} className="space-y-6">
        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-7 space-y-6">
            {/* Profile Photo Card */}
            <Card className="border-indigo-50 shadow-soft-sm rounded-2xl p-5 sm:p-6">
              <h3 className="text-lg font-bold text-brand-text font-heading mb-4">Profile Photo</h3>
              <div className="bg-[#EEF2FF]/60 border border-indigo-100/60 rounded-2xl p-5 flex items-center gap-5">
                {/* Avatar: show real avatar if available, else initials placeholder */}
                {profile?.avatar ? (
                  <img
                    src={profile.avatar}
                    alt={fullName}
                    className="h-16 w-16 rounded-full object-cover shadow-sm border-2 border-white shrink-0"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-full bg-brand-primary flex items-center justify-center text-white font-extrabold text-xl shrink-0 border-2 border-white shadow-sm">
                    {fullName?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                )}
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <Button type="button" variant="primary" size="sm">
                      Change Photo
                    </Button>
                    <button
                      type="button"
                      className="text-xs font-semibold text-rose-600 hover:text-rose-700 transition"
                    >
                      Remove
                    </button>
                  </div>
                  <p className="text-xs text-slate-500">JPG, GIF or PNG. Max size of 5MB.</p>
                </div>
              </div>
            </Card>

            {/* Basic Information Card */}
            <Card className="border-indigo-50 shadow-soft-sm rounded-2xl p-5 sm:p-6 space-y-4">
              <h3 className="text-xl font-bold text-brand-text font-heading">Basic Information</h3>

              <Input
                label="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                icon={User}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="College / University"
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  icon={GraduationCap}
                />
                <Input
                  label="Course / Major"
                  value={major}
                  onChange={(e) => setMajor(e.target.value)}
                  icon={BookOpen}
                />
              </div>

              {/* Bio Field */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Bio
                </label>
                <textarea
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value.slice(0, 500))}
                  placeholder="Tell us a little bit about yourself..."
                  className="w-full bg-[#F9F9FF] border border-brand-border rounded-xl p-3.5 text-sm text-brand-text placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all resize-none"
                />
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Brief description for your profile.</span>
                  <span>{bio.length}/500</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-5 space-y-6">
            {/* Skill Exchange Card */}
            <Card className="border-indigo-50 shadow-soft-sm rounded-2xl p-5 sm:p-6 space-y-5 relative overflow-hidden">
              {/* Subtle top-right accent blur */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-teal-100/50 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center gap-2">
                <Repeat className="h-5 w-5 text-brand-primary" />
                <h3 className="text-lg font-bold text-brand-text font-heading">Skill Exchange</h3>
              </div>

              {/* Skills I Can Teach */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-brand-primary" />
                  <span className="text-xs font-semibold text-slate-700">Skills I Can Teach</span>
                </div>
                <div className="bg-[#F9F9FF] border border-brand-border rounded-xl p-3 space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {teachSkills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1 bg-brand-primary text-white text-xs font-medium px-2.5 py-1 rounded-full"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => handleRemoveTeachSkill(skill)}
                          className="hover:text-slate-200 focus:outline-none"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={teachInput}
                    onChange={(e) => setTeachInput(e.target.value)}
                    onKeyDown={handleAddTeachSkill}
                    placeholder="Type and press Enter..."
                    className="w-full bg-transparent text-xs text-brand-text placeholder-slate-400 focus:outline-none py-1"
                  />
                </div>
              </div>

              {/* Skills I Want To Learn */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-xs font-semibold text-slate-700">Skills I Want To Learn</span>
                </div>
                <div className="bg-[#F9F9FF] border border-brand-border rounded-xl p-3 space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {learnSkills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1 bg-emerald-500 text-white text-xs font-medium px-2.5 py-1 rounded-full"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => handleRemoveLearnSkill(skill)}
                          className="hover:text-emerald-100 focus:outline-none"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={learnInput}
                    onChange={(e) => setLearnInput(e.target.value)}
                    onKeyDown={handleAddLearnSkill}
                    placeholder="Type and press Enter..."
                    className="w-full bg-transparent text-xs text-brand-text placeholder-slate-400 focus:outline-none py-1"
                  />
                </div>
              </div>
            </Card>

            {/* Availability Card */}
            <Card className="border-indigo-50 shadow-soft-sm rounded-2xl p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-amber-600" />
                  <h3 className="text-lg font-bold text-brand-text font-heading">Availability</h3>
                </div>
                <button
                  type="button"
                  onClick={handleAddSlot}
                  className="inline-flex items-center gap-1 text-xs font-bold text-brand-primary hover:underline"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Slot</span>
                </button>
              </div>

              <p className="text-xs text-slate-500">
                Set times when peers can schedule sessions with you.
              </p>

              {/* Time Slots List */}
              <div className="space-y-3">
                {availability.length === 0 && (
                  <p className="text-xs text-slate-400 text-center py-3">
                    No availability slots. Click "Add Slot" to add one.
                  </p>
                )}
                {availability.map((slot) => (
                  <div
                    key={slot.id}
                    className="bg-[#F9F9FF] border border-brand-border rounded-xl p-3 flex items-center justify-between gap-2 text-xs"
                  >
                    <select
                      value={slot.day}
                      onChange={(e) => handleSlotChange(slot.id, 'day', e.target.value)}
                      className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-semibold text-slate-700 focus:outline-none"
                    >
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(
                        (d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        )
                      )}
                    </select>

                    <div className="flex items-center gap-1.5 text-slate-600">
                      <span className="bg-white border border-slate-200 rounded-lg px-2 py-1 flex items-center gap-1">
                        <Clock className="h-3 w-3 text-slate-400" />
                        <input
                          type="text"
                          value={slot.startTime}
                          onChange={(e) => handleSlotChange(slot.id, 'startTime', e.target.value)}
                          className="w-20 bg-transparent focus:outline-none text-xs text-slate-700"
                          placeholder="e.g. 06:00 PM"
                        />
                      </span>
                      <span>to</span>
                      <span className="bg-white border border-slate-200 rounded-lg px-2 py-1">
                        <input
                          type="text"
                          value={slot.endTime}
                          onChange={(e) => handleSlotChange(slot.id, 'endTime', e.target.value)}
                          className="w-20 bg-transparent focus:outline-none text-xs text-slate-700"
                          placeholder="e.g. 08:00 PM"
                        />
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveSlot(slot.id)}
                      className="text-slate-400 hover:text-rose-500 transition shrink-0"
                      title="Remove slot"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* Bottom Actions Bar */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
          <Button type="button" variant="ghost" onClick={() => window.history.back()}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            icon={saving ? RotateCw : Save}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
};
