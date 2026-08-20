import React, { useState } from 'react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { mockReputationData } from '../data/mockData';
import { Star, MessageSquare, Plus, ChevronDown } from 'lucide-react';

export const ReviewsPage = () => {
  const [selectedRating, setSelectedRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');

  const { avgRating, totalReviews, sessionsCompleted, completionRate, distribution, recentFeedback } =
    mockReputationData;

  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (selectedRating > 0 && reviewText.trim()) {
      alert('Review submitted successfully!');
      setSelectedRating(0);
      setReviewText('');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-brand-text font-heading tracking-tight">
            Reputation
          </h1>
          <p className="text-xs sm:text-sm text-brand-muted mt-1">
            Manage your feedback and track your impact across the CampusConnect community.
          </p>
        </div>
        <div>
          <Button variant="primary" icon={Plus} onClick={() => alert('Review request link generated and copied to clipboard!')}>
            Request Review
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

            <form onSubmit={handleSubmitReview} className="space-y-4">
              {/* Rating Stars */}
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

              {/* Review Textarea */}
              <textarea
                rows={4}
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Describe your session experience..."
                className="w-full bg-white border border-slate-200 rounded-xl p-3.5 text-sm text-brand-text placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all resize-none"
              />

              <div className="flex justify-end">
                <Button type="submit" variant="primary" disabled={!selectedRating || !reviewText.trim()}>
                  Submit Review
                </Button>
              </div>
            </form>
          </Card>

          {/* Recent Feedback Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-brand-text font-heading">Recent Feedback</h3>
              <div className="flex items-center gap-1 text-xs text-slate-500 font-medium cursor-pointer hover:text-slate-700">
                <span>Sort by: Newest</span>
                <ChevronDown className="h-3.5 w-3.5" />
              </div>
            </div>

            {/* Feedback Cards */}
            <div className="space-y-3 sm:space-y-4">
              {recentFeedback.map((fb) => (
                <Card key={fb.id} className="border-indigo-50 shadow-soft-sm rounded-2xl p-5">
                  <div className="flex items-start gap-3.5">
                    {fb.authorAvatar ? (
                      <Avatar src={fb.authorAvatar} name={fb.authorName} size="md" />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-emerald-400 text-white font-bold text-sm flex items-center justify-center shrink-0">
                        {fb.authorInitials}
                      </div>
                    )}
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <h4 className="text-sm font-bold text-brand-text font-heading">{fb.authorName}</h4>
                          <p className="text-[11px] text-slate-400">{fb.date}</p>
                        </div>
                        {/* Rating Stars */}
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-3.5 w-3.5 ${
                                star <= fb.rating
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-slate-200'
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Skill Tag Pill */}
                      <span className="inline-block bg-indigo-50/80 text-brand-primary text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-md uppercase">
                        {fb.skillTag}
                      </span>

                      {/* Review Text */}
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-1">
                        {fb.comment}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
