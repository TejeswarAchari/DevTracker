import {
  subDays,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  isToday,
} from "date-fns";

export const calculateStats = (data) => {
  // 1. Sort days by date (ascending)
  const sortedDays = [...data].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  const dateSet = new Set(sortedDays.map((d) => d.date));

  /* ==============================
     TOTAL STATS (LOG-BASED)
  ============================== */
  const totalLogs = sortedDays.reduce(
    (acc, curr) => acc + (curr.logs?.length || 0),
    0
  );

  const totalActiveDays = sortedDays.length;

  /* ==============================
     STREAK CALCULATION
  ============================== */
  let currentStreak = 0;
  let maxStreak = 0;

  const today = new Date();
  const todayStr = format(today, "yyyy-MM-dd");

  // If today has no log, allow yesterday to keep streak alive
  let streakDate =
    isToday(today) && !dateSet.has(todayStr)
      ? subDays(today, 1)
      : today;

  // Calculate current streak (walk backwards)
  while (true) {
    const dStr = format(streakDate, "yyyy-MM-dd");
    if (dateSet.has(dStr)) {
      currentStreak++;
      streakDate = subDays(streakDate, 1);
    } else {
      if (dStr === todayStr) {
        streakDate = subDays(streakDate, 1);
        continue;
      }
      break;
    }
  }

  // Calculate max streak from history
  let tempStreak = 0;
  let prevDate = null;

  sortedDays.forEach((day) => {
    const currentDate = new Date(day.date);

    if (prevDate) {
      const diff =
        (currentDate - prevDate) / (1000 * 60 * 60 * 24);
      tempStreak = diff === 1 ? tempStreak + 1 : 1;
    } else {
      tempStreak = 1;
    }

    maxStreak = Math.max(maxStreak, tempStreak);
    prevDate = currentDate;
  });

  // Safety fallback
  if (currentStreak > maxStreak) maxStreak = currentStreak;

  /* ==============================
     MONTHLY STATS
  ============================== */
  const now = new Date();
  const currentMonthStr = format(now, "yyyy-MM");

  const monthDays = sortedDays.filter((d) =>
    d.date.startsWith(currentMonthStr)
  );

  const monthlyTotalLogs = monthDays.reduce(
    (acc, curr) => acc + (curr.logs?.length || 0),
    0
  );

  const monthlyActiveDays = monthDays.length;

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(now),
    end: endOfMonth(now),
  }).length;

  const monthProgress =
    Math.round((monthlyActiveDays / daysInMonth) * 100) || 0;

  /* ==============================
     FINAL RETURN
  ============================== */
  return {
    totalLogs,
    totalActiveDays,
    currentStreak,
    maxStreak,
    monthly: {
      totalLogs: monthlyTotalLogs,
      activeDays: monthlyActiveDays,
      progress: monthProgress,
      name: format(now, "MMMM"),
    },
  };
};
