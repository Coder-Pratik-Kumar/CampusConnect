import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useReviews } from '../hooks/useReviews';
import { useSessions } from '../hooks/useSessions';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import {
  Star,
  MessageSquare,
  Plus,
  ChevronDown,
  RotateCw,
  AlertCircle,
  CheckCircle2,
  BookOpen,
} from 'lucide-react';

export const ReviewsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user: authUser } = useAuth();

  const queryParams = new URLSearchParams(location.search);
  const queryUserId = queryParams.get('userId');
  const querySessionId = queryParams.get('sessionId');

  const currentUserId = authUser?.id || authUser?._id;
  const targetUserId = queryUserId || currentUserId;

  const { reviews, userMetrics, loading, submitting, error: apiError, refetch, submitReview } = useReviews(targetUserId);
  const { sessions, loading: sessionsLoading } = useSessions();

  const completedSessions = sessions.filter((s) => s.status === 'completed');

  const [selectedSessionId, setSelectedSessionId] = useState(querySessionId || '');
  const [selectedRating, setSelectedRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [formError, setFormError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Pre-select first completed session if available and none selected
  useEffect(() => {
    if (!selectedSessionId && completedSessions.length > 0) {
      setSelectedSessionId(completedSessions[0]._id);
    }
  }, [completedSessions, selectedSessionId]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setFormError('');
    setSuccessMsg('');

    if (!selectedSessionId) {
      setFormError('Please select a completed session to review.');
      return;
    }

    if (selectedRating < 1 || selectedRating > 5) {
      setFormError('Please select a rating between 1 and 5 stars.');
      return;
    }

    if (!reviewText.trim()) {
      setFormError('Please enter a comment for your review.');
      return;
    }

    try {
      await submitReview({
        sessionId: selectedSessionId,
        rating: selectedRating,
        comment: reviewText.trim(),
      });

      setSuccessMsg('Review submitted successfully!');
      setSelectedRating(0);
      setReviewText('');
      await refetch(targetUserId);
    } catch (err) {
      setFormError(err.message || 'Failed to submit review');
    }
  };

  // Metrics
  const avgRating = userMetrics?.rating !== undefined ? Number(userMetrics.rating).toFixed(1) : '5.0';
  const totalReviews = reviews.length;
  const sessionsCompleted = completedSessions.length;
  const completionRate = sessions.length > 0 ? Math.round((sessionsCompleted / sessions.length) * 100) : 100;

  // Calculate rating distribution dynamically
  const distribution = [5, 4, 3, 2, 1].map((stars) => {
    const count = reviews.filter((r) => Math.round(r.rating) === stars).length;
    const percent = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
    return { stars, count, percent };
  });

  // Client-side sorting
  const sortedReviews = [...reviews].sort((a, b) => {
    if (sortBy === 'highest') return b.rating - a.rating;
    if (sortBy === 'lowest') return a.rating - b.rating;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-brand-text font-heading tracking-tight">
            Reputation & Reviews
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your feedback and track your impact across the CampusConnect community.
          </p>
        </div>
        <div>
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => navigate('/sessions')}
          >
            View Completed Sessions
          </Button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Reputation Metrics */}
        <div className="lg:col-span-5 space-y-6">
          {/* Top 2 Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#EEF2FF] border border-indigo-100/60 rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
              <Star className="h-5 w-5 text-indigo-600 mb-3" />
              <div>
                <p className="text-3xl font-extrabold text-brand-text font-heading">{avgRating}</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">
                  AVG RATING
                </p>
              </div>
            </div>

            <div className="bg-[#EEF2FF] border border-indigo-100/60 rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
              <MessageSquare className="h-5 w-5 text-emerald-600 mb-3" />
              <div>
                <p className="text-3xl font-extrabold text-brand-text font-heading">{totalReviews}</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">
                  REVIEWS
                </p>
              </div>
            </div>
          </div>

          {/* Sessions Completed Stat */}
          <div className="bg-[#EEF2FF] border border-indigo-100/60 rounded-2xl p-5 flex items-center justify-between">
            <div>
              <p className="text-3xl font-extrabold text-brand-text font-heading">{sessionsCompleted}</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">
                SESSIONS COMPLETED
              </p>
            </div>

            {/* Circular Progress Ring */}
            <div className="relative w-14 h-14 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-indigo-100 stroke-current"
                  strokeWidth="3.5"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-indigo-600 stroke-current"
                  strokeDasharray={`${completionRate}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute text-xs font-extrabold text-brand-text font-heading">
                {completionRate}%
              </span>
            </div>
          </div>

          {/* Rating Distribution Card */}
          <Card className="border-indigo-50 shadow-soft-sm rounded-2xl p-5 sm:p-6">
            <h3 className="text-lg font-bold text-brand-text font-heading mb-4">Rating Distribution</h3>
            <div className="space-y-3">
              {distribution.map((item) => (
                <div key={item.stars} className="flex items-center gap-3 text-xs">
                  <span className="w-3 text-slate-600 font-semibold">{item.stars}</span>
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400 shrink-0" />
                  <div className="flex-1 bg-indigo-50 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-brand-primary h-full rounded-full transition-all duration-300"
                      style={{ width: `${item.percent}%` }}
                    />
                  </div>
                  <span className="w-5 text-right font-medium text-slate-500">{item.count}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column: Leave Review & Feedback */}
        <div className="lg:col-span-7 space-y-6">
          {/* Leave a Review Card */}
          <Card className="border-indigo-50 shadow-soft-sm rounded-2xl p-5 sm:p-6 bg-gradient-to-br from-indigo-50/40 via-white to-purple-50/20">
            <div className="space-y-1 mb-4">
              <h3 className="text-xl font-bold text-brand-text font-heading">Leave a Review</h3>
              <p className="text-xs text-slate-500">Share your experience to help others in the community.</p>
            </div>

            {/* Banners */}
            {formError && (
              <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl p-3 flex items-center gap-2 text-xs">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}
            {successMsg && (
              <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl p-3 flex items-center gap-2 text-xs">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmitReview} className="space-y-4">
              {/* Select Completed Session */}
              <div>
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-1">
                  SELECT COMPLETED SESSION
                </label>
                {completedSessions.length > 0 ? (
                  <select
                    value={selectedSessionId}
                    onChange={(e) => setSelectedSessionId(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                    required
                  >
                    {completedSessions.map((s) => {
                      const requesterIdStr = typeof s.requesterId === 'object' ? s.requesterId?._id || s.requesterId?.id : s.requesterId;
                      const isRequester = String(requesterIdStr) === String(currentUserId);
                      const peer = isRequester ? (typeof s.providerId === 'object' ? s.providerId : null) : (typeof s.requesterId === 'object' ? s.requesterId : null);
                      const peerName = peer?.name || 'Peer';

                      return (
                        <option key={s._id} value={s._id}>
                          {s.skill} with {peerName} ({s.date})
                        </option>
                      );
                    })}
                  </select>
                ) : (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-500">
                    No completed sessions available to review. Complete a learning session first!
                  </div>
                )}
              </div>

              {/* Rating Stars */}
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">
                  RATING (1-5 STARS)
                </label>
                <div className="flex items-center gap-1.5 py-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setSelectedRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="focus:outline-none transition-transform hover:scale-110"
                    >
                      <Star
                        className={`h-6 w-6 ${
                          star <= (hoverRating || selectedRating)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Review Textarea */}
              <textarea
                rows={4}
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Describe your session experience..."
                className="w-full bg-white border border-slate-200 rounded-xl p-3.5 text-xs sm:text-sm text-brand-text placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all resize-none"
                maxLength={500}
              />

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-400">Max 500 characters</span>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={submitting || !selectedRating || !reviewText.trim() || completedSessions.length === 0}
                  icon={submitting ? RotateCw : undefined}
                >
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </Button>
              </div>
            </form>
          </Card>

          {/* Recent Feedback Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-brand-text font-heading">Recent Feedback</h3>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                <span>Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                >
                  <option value="newest">Newest</option>
                  <option value="highest">Highest Rating</option>
                  <option value="lowest">Lowest Rating</option>
                </select>
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-12 gap-3 bg-white rounded-2xl border border-indigo-50 shadow-soft">
                <RotateCw className="h-6 w-6 animate-spin text-brand-primary" />
                <span className="text-xs font-medium text-slate-500">Loading reviews...</span>
              </div>
            )}

            {/* API Error State */}
            {!loading && apiError && (
              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center space-y-3">
                <AlertCircle className="h-6 w-6 text-rose-600 mx-auto" />
                <p className="text-xs text-rose-700 font-bold">{apiError}</p>
                <Button variant="primary" size="sm" onClick={() => refetch(targetUserId)}>
                  Retry
                </Button>
              </div>
            )}

            {/* Empty State */}
            {!loading && !apiError && sortedReviews.length === 0 && (
              <div className="bg-white rounded-2xl border border-indigo-50 shadow-soft p-8 text-center space-y-3">
                <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-brand-primary flex items-center justify-center mx-auto">
                  <BookOpen className="h-6 w-6" />
                </div>
                <h4 className="text-base font-bold text-brand-text font-heading">No Reviews Received Yet</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Complete learning sessions with peers to receive reviews and build your community reputation!
                </p>
              </div>
            )}

            {/* Feedback Cards */}
            {!loading && !apiError && sortedReviews.length > 0 && (
              <div className="space-y-3 sm:space-y-4">
                {sortedReviews.map((rev) => {
                  const reviewer = typeof rev.reviewerId === 'object' ? rev.reviewerId : null;
                  const reviewerName = reviewer?.name || 'Peer Student';
                  const reviewerAvatar = reviewer?.avatar;
                  const reviewerCollege = reviewer?.college ? `${reviewer.major || 'Student'} at ${reviewer.college}` : '';
                  const formattedDate = new Date(rev.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  });

                  return (
                    <Card key={rev._id} className="border-indigo-50 shadow-soft-sm rounded-2xl p-5">
                      <div className="flex items-start gap-3.5">
                        <Avatar src={reviewerAvatar} name={reviewerName} size="md" className="h-10 w-10 rounded-full object-cover shrink-0" />
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <div>
                              <h4 className="text-sm font-bold text-brand-text font-heading">{reviewerName}</h4>
                              <p className="text-[11px] text-slate-400">{reviewerCollege || formattedDate}</p>
                            </div>
                            {/* Rating Stars */}
                            <div className="flex items-center gap-0.5">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`h-3.5 w-3.5 ${
                                    star <= rev.rating
                                      ? 'fill-amber-400 text-amber-400'
                                      : 'text-slate-200'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>

                          {/* Review Text */}
                          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-1">
                            "{rev.comment}"
                          </p>
                          <span className="text-[10px] text-slate-400 block pt-1">{formattedDate}</span>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

