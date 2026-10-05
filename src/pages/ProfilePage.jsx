import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../hooks/useProfile';
import { useReviews } from '../hooks/useReviews';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { Star, CheckCircle2, Clock, MapPin, Calendar, MessageSquare, RotateCw, AlertCircle, ArrowLeft } from 'lucide-react';

export const ProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: authUser } = useAuth();

  // Determine if we are viewing our own profile
  const isSelf = id === (authUser?.id || authUser?._id);

  // Fetch real profile from backend (self or peer by ID)
  const { profile, loading, error } = useProfile(isSelf ? null : id);
  // Fetch real reviews from backend
  const { reviews: peerReviews, userMetrics: peerMetrics } = useReviews(isSelf ? null : id);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <div className="h-10 w-10 rounded-2xl bg-brand-primary/10 flex items-center justify-center">
          <RotateCw className="h-5 w-5 animate-spin text-brand-primary" />
        </div>
        <span className="text-sm font-medium text-slate-500">Loading profile...</span>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-rose-700 text-sm max-w-md">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error || 'Profile not found.'}</span>
        </div>
        <Button variant="outline" size="sm" icon={ArrowLeft} onClick={() => navigate('/discover')}>
          Back to Discover
        </Button>
      </div>
    );
  }

  // Normalize fields from MongoDB User document
  const displayProfile = {
    ...profile,
    verified: Boolean(profile.rating >= 4.5 && profile.reviewsCount >= 3),
    availabilitySlots: (profile.availability || []).map((slot) => ({
      days: slot.day,
      time: `${slot.startTime} - ${slot.endTime}`,
    })),
    reviews: peerReviews || [],
    sessionsCount: profile.sessionsCount || 0,
    reviewsCount: peerMetrics?.reviewsCount !== undefined ? peerMetrics.reviewsCount : (profile.reviewsCount || 0),
    rating: peerMetrics?.rating !== undefined ? peerMetrics.rating : (profile.rating || 5.0),
    headline: profile.bio || '',
    matchScore: null,
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* ── Top Section: Avatar + CTA + Match Breakdown ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Avatar + Actions */}
        <div className="lg:col-span-4 flex flex-col items-center text-center space-y-4">
          {/* Avatar with Verified badge */}
          <div className="relative">
            <Avatar
              src={displayProfile.avatar}
              name={displayProfile.name}
              className="h-40 w-40 rounded-full object-cover border-4 border-white shadow-soft"
            />
            {displayProfile.verified && (
              <span className="absolute bottom-2 right-2 flex items-center gap-1 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
                <CheckCircle2 className="h-3 w-3" />
                Verified
              </span>
            )}
          </div>

          {/* Name + Rating + Sessions */}
          <div className="space-y-1">
            <h1 className="text-2xl font-extrabold font-heading text-brand-text">{displayProfile.name}</h1>
            {displayProfile.college && (
              <p className="text-xs text-slate-500 font-medium">{displayProfile.college}{displayProfile.major ? ` · ${displayProfile.major}` : ''}</p>
            )}
            <div className="flex items-center justify-center gap-3 text-sm text-slate-600 flex-wrap mt-1">
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <strong>{displayProfile.rating ? Number(displayProfile.rating).toFixed(1) : '5.0'}</strong>
                <span className="text-slate-400">({displayProfile.reviewsCount} Reviews)</span>
              </span>
              <span className="flex items-center gap-1 text-slate-400">
                <span className="text-slate-300">•</span>
                <Calendar className="h-3.5 w-3.5" />
                <span>{displayProfile.sessionsCount} Sessions</span>
              </span>
            </div>
          </div>

          {/* Edit profile button (self) or request session (peer) */}
          {isSelf ? (
            <div className="flex flex-col w-full gap-2.5 max-w-[280px]">
              <Button
                variant="outline"
                fullWidth
                onClick={() => navigate('/settings')}
              >
                Edit Profile
              </Button>
            </div>
          ) : (
            <div className="flex flex-col w-full gap-2.5 max-w-[280px]">
              <Button
                variant="primary"
                fullWidth
                icon={Calendar}
                onClick={() => navigate(`/sessions/request?peerId=${id}`)}
              >
                Request Learning Session
              </Button>
              <Button
                variant="outline"
                fullWidth
                icon={MessageSquare}
                onClick={() => alert(`Starting conversation with ${displayProfile.name}...`)}
              >
                Message {displayProfile.name.split(' ')[0]}
              </Button>
            </div>
          )}
        </div>

        {/* Right: Match Breakdown or Skills overview (self) */}
        <div className="lg:col-span-8 space-y-4">
          {!isSelf ? (
            /* Match Breakdown Card for peer profiles */
            <>
              <div className="bg-brand-primary rounded-3xl p-5 sm:p-6 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-12 translate-x-12 pointer-events-none" />
                <div className="relative z-10 flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h2 className="text-xl font-bold font-heading flex items-center gap-2">
                      <span>⚡</span> Match Breakdown
                    </h2>
                    <p className="text-xs text-indigo-200 mt-1 max-w-lg">
                      Based on your learning goals and {displayProfile.name.split(' ')[0]}'s expertise, here is why this is a strong connection.
                    </p>
                  </div>
                  <span className="bg-[#6CF8BB] text-emerald-950 text-xs font-extrabold px-3 py-1.5 rounded-full shrink-0 flex items-center gap-1 shadow">
                    ⚡ {displayProfile.matchScore || 92}% Match
                  </span>
                </div>
                <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { title: 'Skills Alignment', desc: `${displayProfile.name.split(' ')[0]} teaches complementary skills.` },
                    { title: 'Schedule Compatibility', desc: 'Overlap on schedule availability slots.' },
                  ].map((reason) => (
                    <div key={reason.title} className="flex items-start gap-2.5 bg-white/10 border border-white/20 rounded-2xl p-4">
                      <CheckCircle2 className="h-4 w-4 text-[#6CF8BB] shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-white">{reason.title}</p>
                        <p className="text-[11px] text-indigo-200 mt-0.5">{reason.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            /* Bio / About card for own profile */
            <div className="bg-[#EEF2FF]/70 border border-indigo-100/60 rounded-3xl p-5 sm:p-6">
              <h2 className="text-xl font-bold font-heading text-brand-text mb-2">About Me</h2>
              {displayProfile.headline ? (
                <p className="text-sm text-slate-600 leading-relaxed">{displayProfile.headline}</p>
              ) : (
                <p className="text-sm text-slate-400 italic">No bio added yet. <button onClick={() => navigate('/settings')} className="text-brand-primary font-semibold hover:underline">Add a bio</button> to let peers know about you.</p>
              )}
            </div>
          )}

          {/* Can Teach + Wants to Learn Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-indigo-50 shadow-soft p-5">
              <h3 className="text-base font-bold font-heading text-brand-text flex items-center gap-2 mb-3">
                🎓 Can Teach
              </h3>
              <div className="flex flex-wrap gap-2">
                {(displayProfile.teachSkills || []).length > 0 ? (
                  displayProfile.teachSkills.map((s) => (
                    <span key={s} className="bg-[#EEF2FF] border border-indigo-100 text-brand-primary text-xs font-semibold px-3 py-1.5 rounded-lg">
                      {s}
                    </span>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic">No teaching skills added yet.</p>
                )}
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-emerald-50 shadow-soft p-5">
              <h3 className="text-base font-bold font-heading text-brand-text flex items-center gap-2 mb-3">
                📖 Wants to Learn
              </h3>
              <div className="flex flex-wrap gap-2">
                {(displayProfile.learnSkills || []).length > 0 ? (
                  displayProfile.learnSkills.map((s) => (
                    <span key={s} className="bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold px-3 py-1.5 rounded-lg">
                      {s}
                    </span>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic">No learning goals added yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom Section: About + Availability + Reviews ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: About + Reviews */}
        <div className="lg:col-span-7 space-y-6">
          {!isSelf && (
            <div className="bg-white rounded-3xl border border-indigo-50 shadow-soft p-6">
              <h2 className="text-xl font-bold font-heading text-brand-text mb-3">
                About {displayProfile.name.split(' ')[0]}
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">{displayProfile.headline}</p>
            </div>
          )}

          {/* Recent Reviews — shown on peer profiles */}
          {!isSelf && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold font-heading text-brand-text">Recent Reviews</h2>
                <button
                  onClick={() => navigate(`/reviews?userId=${id}`)}
                  className="text-xs font-bold text-brand-primary hover:underline"
                >
                  View All ({displayProfile.reviewsCount || 0})
                </button>
              </div>
              {displayProfile.reviews?.length > 0 ? (
                displayProfile.reviews.map((review) => {
                  const revId = review._id || review.id;
                  const reviewer = typeof review.reviewerId === 'object' ? review.reviewerId : null;
                  const reviewerName = reviewer?.name || review.name || 'Student';
                  const reviewerAvatar = reviewer?.avatar || review.avatar;

                  return (
                    <div key={revId} className="bg-white rounded-2xl border border-indigo-50 shadow-soft p-5 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar src={reviewerAvatar} name={reviewerName} size="sm" className="h-9 w-9 rounded-full object-cover shrink-0" />
                          <div>
                            <p className="text-sm font-bold text-brand-text">{reviewerName}</p>
                            <p className="text-[11px] text-slate-400">Verified Exchange</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} className={`h-3.5 w-3.5 ${s <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed pl-12">"{review.comment}"</p>
                    </div>
                  );
                })
              ) : (
                <div className="bg-white rounded-2xl border border-indigo-50 p-6 text-center text-xs text-slate-400">
                  No reviews received yet for this peer.
                </div>
              )}
            </div>
          )}

          {/* Self-profile: prompt to visit Skills/Settings pages */}
          {isSelf && (
            <div className="bg-white rounded-2xl border border-indigo-50 shadow-soft p-6 space-y-3">
              <h2 className="text-xl font-bold font-heading text-brand-text">Manage Your Profile</h2>
              <p className="text-sm text-slate-500">
                Keep your profile up to date to get better matches and more session requests.
              </p>
              <div className="flex flex-wrap gap-3 pt-1">
                <Button variant="primary" size="sm" onClick={() => navigate('/skills')}>
                  Manage Skills
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigate('/settings')}>
                  Edit Profile Info
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Right: Availability */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-3xl border border-indigo-50 shadow-soft p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-brand-primary" />
              <h2 className="text-xl font-bold font-heading text-brand-text">Availability</h2>
            </div>
            <p className="text-xs text-slate-500">Times shown in your local timezone.</p>

            <div className="space-y-2">
              {displayProfile.availabilitySlots?.length > 0 ? (
                displayProfile.availabilitySlots.map((slot) => {
                  const unavailable = slot.time === 'Unavailable';
                  return (
                    <div
                      key={slot.days}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold ${
                        unavailable
                          ? 'bg-slate-50 border border-slate-100 text-slate-400'
                          : 'bg-[#EEF2FF] border border-indigo-100 text-brand-text'
                      }`}
                    >
                      <span>{slot.days}</span>
                      <span className={unavailable ? 'text-slate-400' : 'text-brand-primary font-bold'}>
                        {slot.time}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="rounded-xl p-4 bg-slate-50 border border-slate-100 text-center">
                  <p className="text-xs text-slate-400">
                    {isSelf
                      ? <>No availability set. <button onClick={() => navigate('/settings')} className="text-brand-primary font-semibold hover:underline">Add availability</button> in Settings.</>
                      : 'No availability information available.'}
                  </p>
                </div>
              )}
            </div>

            {/* Location Info (peer only, keep for visual completeness) */}
            {!isSelf && (
              <div className="pt-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">PRIMARY LOCATION</p>
                <div className="rounded-2xl p-4 bg-[#F9F9FF] border border-indigo-50 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-indigo-100/70 text-brand-primary flex items-center justify-center shrink-0">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-brand-text">Central Library & Computer Lab</p>
                    <p className="text-[11px] text-slate-500">GLA University Campus • Mathura, UP</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
