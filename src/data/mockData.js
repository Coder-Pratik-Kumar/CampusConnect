import {
  LayoutDashboard,
  Compass,
  Sparkles,
  Calendar,
  Star,
  Bell,
  Settings,
} from 'lucide-react';

export const navigationLinks = [
  {
    name: 'Dashboard',
    path: '/dashboard',
    icon: LayoutDashboard,
    badge: null,
  },
  {
    name: 'Discover',
    path: '/discover',
    icon: Compass,
    badge: null,
  },
  {
    name: 'My Skills',
    path: '/skills',
    icon: Sparkles,
    badge: null,
  },
  {
    name: 'Sessions',
    path: '/sessions',
    icon: Calendar,
    badge: null,
  },
  {
    name: 'Reviews',
    path: '/reviews',
    icon: Star,
    badge: null,
  },
];

export const secondaryNavigationLinks = [
  {
    name: 'Notifications',
    path: '/notifications',
    icon: Bell,
    badge: '3',
  },
  {
    name: 'Settings',
    path: '/settings',
    icon: Settings,
    badge: null,
  },
];

export const mockCurrentUser = {
  id: 'usr_pratik',
  name: 'Pratik Kumar',
  role: 'Premium Mentor',
  email: 'pratik.kumar@university.edu',
  major: 'UI/UX & Software Engineering',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256',
  teachSkills: ['UI/UX Design', 'React', 'Figma', 'JavaScript'],
  learnSkills: ['Python', 'Machine Learning', 'Data Science'],
  compatibilityScore: 98,
  rating: 4.9,
  sessionsCount: 24,
  hoursExchanged: 38,
};

export const mockSkillMatches = [
  {
    id: 'usr_002',
    peerId: 'usr_002',
    name: 'Rahul Sharma',
    role: 'Computer Science, Senior',
    major: 'Computer Science, Senior',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
    compatibilityScore: 98,
    matchReason: 'Perfect Match: Rahul teaches Python & wants UI/UX Design!',
    teachSkills: ['Python', 'Data Structures', 'Machine Learning'],
    learnSkills: ['React', 'UI/UX Design', 'Figma'],
    status: 'online',
    rating: 4.9,
    reviewsCount: 16,
  },
  {
    id: 'usr_003',
    peerId: 'usr_003',
    name: 'Priya Patel',
    role: 'Software Engineering, Junior',
    major: 'Software Engineering, Junior',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=256',
    compatibilityScore: 92,
    matchReason: 'Priya teaches Machine Learning and wants React!',
    teachSkills: ['Machine Learning', 'Python', 'SQL'],
    learnSkills: ['JavaScript', 'React', 'Tailwind CSS'],
    status: 'online',
    rating: 5.0,
    reviewsCount: 12,
  },
  {
    id: 'usr_004',
    peerId: 'usr_004',
    name: 'Amit Singh',
    role: 'Data Analytics, Senior',
    major: 'Data Analytics, Senior',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=256',
    compatibilityScore: 86,
    matchReason: 'Amit teaches Data Science & wants Figma basics.',
    teachSkills: ['Data Science', 'R', 'SQL'],
    learnSkills: ['Figma', 'UI Design'],
    status: 'offline',
    rating: 4.8,
    reviewsCount: 9,
  },
];

export const mockPeerUser = mockSkillMatches[0];

export const mockUpcomingSessions = [
  {
    id: 'sess_101',
    peerName: 'Rahul Sharma',
    peerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
    skillToLearn: 'Python Basics & Lists',
    skillToTeach: 'React Hooks & State',
    dateTime: 'Tomorrow at 2:00 PM',
    duration: '60 mins',
    meetingUrl: '#',
    status: 'Confirmed',
  },
  {
    id: 'sess_102',
    peerName: 'Priya Patel',
    peerAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=256',
    skillToLearn: 'Machine Learning Models',
    skillToTeach: 'Figma Auto-Layout',
    dateTime: 'Thursday at 4:30 PM',
    duration: '45 mins',
    meetingUrl: '#',
    status: 'Pending Approval',
  },
];

export const mockLearningGoals = [
  {
    skill: 'Python Basics',
    progress: 75,
    mentor: 'Rahul Sharma',
    target: 'Complete 4 peer sessions',
  },
  {
    skill: 'Machine Learning Basics',
    progress: 40,
    mentor: 'Priya Patel',
    target: 'Model evaluation concepts',
  },
];

export const mockReputationData = {
  avgRating: 4.8,
  totalReviews: 18,
  sessionsCompleted: 24,
  completionRate: 75,
  distribution: [
    { stars: 5, count: 14, percent: 78 },
    { stars: 4, count: 3, percent: 17 },
    { stars: 3, count: 1, percent: 5 },
    { stars: 2, count: 0, percent: 0 },
    { stars: 1, count: 0, percent: 0 },
  ],
  recentFeedback: [
    {
      id: 'fb_1',
      authorName: 'Sarah Jenkins',
      authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=256',
      date: 'Oct 12, 2023',
      rating: 5,
      skillTag: 'PYTHON DEBUGGING',
      comment: "Pratik was incredibly helpful! He didn't just fix the bug; he walked me through the logic so I actually understood what was going wrong. Highly recommend for any backend issues.",
    },
    {
      id: 'fb_2',
      authorName: 'Marcus T.',
      authorInitials: 'M',
      authorAvatar: null,
      date: 'Oct 05, 2023',
      rating: 4,
      skillTag: 'UX PORTFOLIO REVIEW',
      comment: "Great insights on my case studies. Pointed out some alignment issues I completely missed. Session ran slightly over but it was worth it.",
    },
  ],
};

export const mockUserAvailability = [
  { id: 'slot_1', day: 'Monday', startTime: '07:00 PM', endTime: '09:00 PM' },
  { id: 'slot_2', day: 'Wednesday', startTime: '06:00 PM', endTime: '08:00 PM' },
];

export const mockDiscoverPeers = [
  {
    id: 'usr_002',
    name: 'Rahul Sharma',
    college: 'GLA University',
    major: 'CS',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
    matchScore: 98,
    rating: 4.9,
    teachSkills: ['React', 'Node.js', 'JavaScript'],
    learnSkills: ['Java', 'Spring Boot'],
    bannerColor: 'from-indigo-600 to-brand-primary',
  },
  {
    id: 'usr_003',
    name: 'Priya Patel',
    college: 'Amity University',
    major: 'IT',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=256',
    matchScore: 92,
    rating: 4.7,
    teachSkills: ['Python', 'Machine Learning'],
    learnSkills: ['React Native'],
    bannerColor: 'from-purple-600 to-indigo-500',
  },
  {
    id: 'usr_005',
    name: 'Arjun Singh',
    college: 'Delhi University',
    major: 'CS',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=256',
    matchScore: 88,
    rating: 4.5,
    teachSkills: ['C++', 'Data Structures'],
    learnSkills: ['UI/UX Design', 'Figma'],
    bannerColor: 'from-blue-600 to-indigo-500',
  },
  {
    id: 'usr_006',
    name: 'Neha Gupta',
    college: 'NID',
    major: 'Design',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=256',
    matchScore: 85,
    rating: 5.0,
    teachSkills: ['UI/UX', 'Figma', 'Illustration'],
    learnSkills: ['HTML/CSS'],
    bannerColor: 'from-violet-600 to-purple-500',
  },
  {
    id: 'usr_007',
    name: 'Vikram Desai',
    college: 'VIT',
    major: 'CS',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800',
    matchScore: 81,
    rating: 4.2,
    teachSkills: ['Go', 'Docker'],
    learnSkills: ['Kubernetes', 'AWS'],
    bannerColor: 'from-cyan-600 to-blue-500',
  },
  {
    id: 'usr_008',
    name: 'Ananya Reddy',
    college: 'IIM',
    major: 'Business',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=256',
    matchScore: 78,
    rating: 4.8,
    teachSkills: ['Marketing', 'Strategy'],
    learnSkills: ['Data Analytics', 'SQL'],
    bannerColor: 'from-rose-500 to-pink-500',
  },
];

export const mockDashboardSessions = [
  {
    id: 'ds_1',
    month: 'AUG',
    day: '21',
    title: 'React Mastery with Rahul',
    time: '7:00 PM - 8:00 PM',
    venue: 'Virtual Room A',
    status: 'Confirmed',
    statusColor: 'emerald',
    action: 'Join',
  },
  {
    id: 'ds_2',
    month: 'AUG',
    day: '22',
    title: 'Advanced Java Patterns with Am...',
    time: '6:00 PM - 7:30 PM',
    venue: 'Library Annex',
    status: 'Pending',
    statusColor: 'amber',
    action: 'Details',
  },
];

export const mockLearningProgress = [
  { skill: 'Java', percent: 95, color: '#3525CD' },
  { skill: 'SQL', percent: 80, color: '#3525CD' },
  { skill: 'React', percent: 40, color: '#006C49' },
  { skill: 'Node.js', percent: 25, color: '#684000' },
];

export const mockTopMatches = [
  {
    id: 'usr_002',
    name: 'Rahul Sharma',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
    matchScore: 92,
    teachLabel: 'React',
    teachType: 'teach',
  },
  {
    id: 'usr_003',
    name: 'Sarah Lin',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=256',
    matchScore: 88,
    teachLabel: 'Java',
    teachType: 'learn',
  },
  {
    id: 'usr_005',
    name: 'Omar Farooq',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=256',
    matchScore: 85,
    teachLabel: 'SQL',
    teachType: 'teach',
  },
];

export const mockRahulProfile = {
  id: 'usr_002',
  name: 'Rahul Sharma',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
  rating: 4.8,
  reviewsCount: 42,
  sessionsCount: 24,
  verified: true,
  headline: 'Senior Frontend Developer with 4 years of experience building scalable web applications. Passionate about clean code, performance optimization, and teaching others. I believe in practical, project-based learning rather than just theory. When I\'m not coding, I\'m trying to improve my design skills—hence why I\'m looking for a peer to swap skills with! Let\'s build something awesome together.',
  teachSkills: ['React.js', 'Node.js', 'System Design', 'TypeScript'],
  learnSkills: ['UI/UX Design', 'Figma', 'Product Management'],
  matchScore: 92,
  availability: [
    { days: 'Mon, Wed, Fri', time: '6:00 PM - 9:00 PM' },
    { days: 'Saturday', time: '10:00 AM - 2:00 PM' },
    { days: 'Sunday', time: 'Unavailable' },
  ],
  reviews: [
    {
      id: 'r1',
      initials: 'AS',
      name: 'Anita S.',
      topic: 'Learned React',
      rating: 5,
      comment: '"Rahul is incredibly patient and breaks down complex React concepts into easily digestible pieces. Highly recommend him for anyone struggling with hooks!"',
      color: 'bg-indigo-500',
    },
    {
      id: 'r2',
      initials: 'MK',
      name: 'Michael K.',
      topic: 'Learned System Design',
      rating: 5,
      comment: '"Great insights into microservices architecture. He tailored the session to my specific background."',
      color: 'bg-emerald-500',
    },
  ],
};


