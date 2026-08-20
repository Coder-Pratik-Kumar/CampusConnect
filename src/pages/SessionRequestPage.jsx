import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { mockPeerUser } from '../data/mockData';
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
} from 'lucide-react';

export const SessionRequestPage = () => {
  const navigate = useNavigate();

  const [currentMonthIndex, setCurrentMonthIndex] = useState(0);
  const months = ['October 2023', 'November 2023', 'December 2023'];

  const prevMonth = () => {
    setCurrentMonthIndex((prev) => (prev > 0 ? prev - 1 : months.length - 1));
  };

  const nextMonth = () => {
    setCurrentMonthIndex((prev) => (prev < months.length - 1 ? prev + 1 : 0));
  };

  const daysList = [
    { day: 'Mon', date: 1 },
    { day: 'Tue', date: 2 },
    { day: 'Wed', date: 3 },
    { day: 'Thu', date: 4 },
    { day: 'Fri', date: 5 },
  ];

  const durations = ['30 Min', '60 Min', '90 Min'];
  const timeslots = ['6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM'];

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Session request sent to Rahul Sharma for ${months[currentMonthIndex]}, Date ${selectedDate} at ${selectedTime}!`);
    navigate('/sessions');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Section */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-brand-text font-heading tracking-tight">
          Request a Learning Session
        </h1>
        <p className="text-xs sm:text-sm text-brand-muted mt-1">
          Select an available time to connect with Rahul. Prepare specific questions to make the most of your session.
        </p>
      </div>

      {/* Main Grid Layout */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Mentor Info & Stats */}
        <div className="lg:col-span-4 space-y-6">
          {/* Mentor Profile Card */}
          <div className="bg-[#EEF2FF]/70 border border-indigo-100/60 rounded-3xl p-6 text-center space-y-3 flex flex-col items-center">
            <img
              src={mockPeerUser.avatar}
              alt={mockPeerUser.name}
              className="h-24 w-24 rounded-full object-cover shadow-soft border-4 border-white"
            />
            <div>
              <h2 className="font-heading font-extrabold text-xl text-brand-text">
                {mockPeerUser.name}
              </h2>
              <p className="text-xs font-medium text-slate-500 mt-0.5">
                React & Frontend Architecture
              </p>
            </div>

            {/* Skill Tags */}
            <div className="flex flex-wrap justify-center gap-1.5 pt-2">
              {['React', 'Redux', 'Next.js'].map((skill) => (
                <span
                  key={skill}
                  className="bg-white/80 border border-indigo-100 text-brand-primary text-xs font-semibold px-3 py-1 rounded-full shadow-2xs"
                >
                  {skill}
                </span>
              ))}
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
                <span className="font-bold text-brand-text">4.9/5.0</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-600 font-medium">
                  <GraduationCap className="h-4 w-4 text-indigo-600" />
                  <span>Sessions</span>
                </div>
                <span className="font-bold text-brand-text">142</span>
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
            {/* Section 1: Select Date */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-brand-primary" />
                  <h2 className="font-heading font-bold text-xl text-brand-text">Select Date</h2>
                </div>

                <div className="flex items-center gap-3 text-xs font-semibold text-slate-600">
                  <button type="button" onClick={prevMonth} className="hover:text-brand-primary flex items-center gap-0.5 focus:outline-none">
                    <ChevronLeft className="h-4 w-4" />
                    <span>Prev</span>
                  </button>
                  <span className="font-bold text-brand-text min-w-[100px] text-center">{months[currentMonthIndex]}</span>
                  <button type="button" onClick={nextMonth} className="hover:text-brand-primary flex items-center gap-0.5 focus:outline-none">
                    <span>Next</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Days Selector */}
              <div className="grid grid-cols-5 gap-2 sm:gap-3 pt-1">
                {daysList.map((item) => {
                  const isSelected = selectedDate === item.date;
                  return (
                    <button
                      type="button"
                      key={item.date}
                      onClick={() => setSelectedDate(item.date)}
                      className={`flex flex-col items-center justify-center p-3.5 sm:p-4 rounded-2xl transition-all focus:outline-none ${
                        isSelected
                          ? 'bg-brand-primary text-white shadow-soft font-bold'
                          : 'bg-[#F4F4FD] hover:bg-indigo-100/60 text-slate-700 font-medium'
                      }`}
                    >
                      <span className="text-[11px] uppercase opacity-80">{item.day}</span>
                      <span className="text-lg font-extrabold font-heading mt-1">{item.date}</span>
                    </button>
                  );
                })}
              </div>
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
                  What do you want to learn?
                </h3>
              </div>

              <div className="space-y-2">
                <textarea
                  rows={4}
                  value={learningNotes}
                  onChange={(e) => setLearningNotes(e.target.value)}
                  placeholder="E.g., I'm struggling with Redux Toolkit setup in my current project and would love a walkthrough..."
                  className="w-full bg-[#F9F9FF] border border-slate-200 rounded-2xl p-4 text-sm text-brand-text placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all resize-none"
                />
                <div className="flex items-center justify-end gap-1 text-[11px] text-slate-400">
                  <Info className="h-3 w-3" />
                  <span>Markdown supported</span>
                </div>
              </div>
            </div>

            {/* Section 4: Submit Button */}
            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                variant="primary"
                icon={Send}
                iconPosition="right"
                className="py-3 px-6"
              >
                Send Session Request
              </Button>
            </div>
          </Card>
        </div>
      </form>
    </div>
  );
};
