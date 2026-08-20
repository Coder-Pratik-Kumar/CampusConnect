import User from '../models/User.js';
import { safeUser } from '../controllers/profileController.js';

/**
 * Convert time string "HH:MM" (e.g. "09:30") to total minutes from midnight.
 */
const timeToMinutes = (timeStr) => {
  if (!timeStr || typeof timeStr !== 'string') return null;
  const parts = timeStr.trim().split(':');
  if (parts.length !== 2) return null;
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  if (isNaN(hours) || isNaN(minutes)) return null;
  return hours * 60 + minutes;
};

/**
 * Check if two sets of availability slots overlap.
 * Format: { day: 'Monday', startTime: '09:00', endTime: '11:00' }
 */
export const checkAvailabilityOverlap = (slotsA = [], slotsB = []) => {
  const overlappingDays = [];

  for (const slotA of slotsA) {
    for (const slotB of slotsB) {
      if (slotA.day && slotB.day && slotA.day.toLowerCase() === slotB.day.toLowerCase()) {
        const startA = timeToMinutes(slotA.startTime);
        const endA = timeToMinutes(slotA.endTime);
        const startB = timeToMinutes(slotB.startTime);
        const endB = timeToMinutes(slotB.endTime);

        if (startA !== null && endA !== null && startB !== null && endB !== null) {
          // Interval overlap check
          if (startA < endB && startB < endA) {
            overlappingDays.push(slotA.day);
          }
        }
      }
    }
  }

  return overlappingDays;
};

/**
 * Calculate transparent rule-based match score between currentUser and candidate.
 * 
 * Rules:
 *  - +50 pts: Candidate teaches a skill current user wants to learn
 *  - +30 pts: Current user teaches a skill candidate wants to learn
 *  - +10 pts: Both students attend the same college
 *  - +10 pts: Schedule availability overlap
 * 
 * Max score: 100
 */
export const calculateMatchScore = (currentUser, candidate) => {
  let matchScore = 0;
  const reasons = [];

  const userLearn = (currentUser.learnSkills || []).map((s) => s.toLowerCase().trim());
  const userTeach = (currentUser.teachSkills || []).map((s) => s.toLowerCase().trim());
  const peerTeach = (candidate.teachSkills || []).map((s) => s.toLowerCase().trim());
  const peerLearn = (candidate.learnSkills || []).map((s) => s.toLowerCase().trim());

  // Rule 1: Candidate teaches a skill current user wants to learn (+50 pts)
  const peerTeachesUserWants = (candidate.teachSkills || []).filter((peerSkill) =>
    userLearn.includes(peerSkill.toLowerCase().trim())
  );

  if (peerTeachesUserWants.length > 0) {
    matchScore += 50;
    reasons.push(
      `${candidate.name} teaches ${peerTeachesUserWants.join(', ')} which you want to learn`
    );
  }

  // Rule 2: Current user teaches a skill candidate wants to learn (+30 pts)
  const userTeachesPeerWants = (currentUser.teachSkills || []).filter((userSkill) =>
    peerLearn.includes(userSkill.toLowerCase().trim())
  );

  if (userTeachesPeerWants.length > 0) {
    matchScore += 30;
    reasons.push(
      `You teach ${userTeachesPeerWants.join(', ')} which ${candidate.name} wants to learn`
    );
  }

  // Rule 3: Same college (+10 pts)
  if (
    currentUser.college &&
    candidate.college &&
    currentUser.college.trim() !== '' &&
    currentUser.college.trim().toLowerCase() === candidate.college.trim().toLowerCase()
  ) {
    matchScore += 10;
    reasons.push(`Both students attend ${candidate.college.trim()}`);
  }

  // Rule 4: Schedule availability overlap (+10 pts)
  const overlaps = checkAvailabilityOverlap(currentUser.availability, candidate.availability);
  if (overlaps.length > 0) {
    matchScore += 10;
    const uniqueDays = [...new Set(overlaps)];
    reasons.push(`Compatible schedule availability on ${uniqueDays.join(', ')}`);
  }

  // Cap score at 100
  const finalScore = Math.min(100, matchScore);

  if (reasons.length === 0) {
    reasons.push('No direct skill, college, or schedule overlap found yet');
  }

  return {
    user: safeUser(candidate),
    matchScore: finalScore,
    reasons,
  };
};

/**
 * Find all candidate matches for the authenticated user ID, sorted by score descending.
 */
export const findMatchesForUser = async (userId) => {
  const currentUser = await User.findById(userId);
  if (!currentUser) {
    throw new Error('User not found');
  }

  // Exclude the authenticated user (Self-match prevention)
  const candidates = await User.find({ _id: { $ne: userId } });

  const matches = candidates.map((candidate) => calculateMatchScore(currentUser, candidate));

  // Sort matches from highest matchScore to lowest matchScore
  matches.sort((a, b) => b.matchScore - a.matchScore);

  return {
    user: {
      id: currentUser._id,
      name: currentUser.name,
    },
    totalMatches: matches.length,
    matches,
  };
};
