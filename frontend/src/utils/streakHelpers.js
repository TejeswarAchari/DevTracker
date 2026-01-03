import { STREAK_MILESTONES } from "./streakMilestones";

export const getCurrentMilestone = (streak) => {
  return [...STREAK_MILESTONES]
    .reverse()
    .find((m) => streak >= m.days);
};

export const getNextMilestone = (streak) => {
  return STREAK_MILESTONES.find((m) => streak < m.days);
};
