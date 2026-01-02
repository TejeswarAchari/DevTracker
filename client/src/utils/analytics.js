import {
  subDays,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
} from "date-fns";

export const calculateStats = (
  data,
  selectedYear = new Date().getFullYear()
) => {
  /* ==============================
     SORT & FILTER
  ============================== */
  const sortedDays = [...data].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  const yearStr = String(selectedYear);
  const yearDays = sortedDays.filter(d =>
    d.date.startsWith(yearStr)
  );

  const yearDateSet = new Set(yearDays.map(d => d.date));

  /* ==============================
     TOTAL STATS (GLOBAL)
  ============================== */
  const totalLogs = sortedDays.reduce(
    (acc, d) => acc + (d.logs?.length || 0),
    0
  );

  const totalActiveDays = sortedDays.length;

  /* ==============================
     STREAKS (YEAR SCOPED)
  ============================== */
  let currentStreak = 0;
  let maxStreak = 0;

  // ---- CURRENT STREAK ----
  if (yearDays.length > 0) {
    // Start from LAST activity day (not today / Dec 31)
    let streakDate = new Date(yearDays[yearDays.length - 1].date);

    while (true) {
      const dStr = format(streakDate, "yyyy-MM-dd");
      if (yearDateSet.has(dStr)) {
        currentStreak++;
        streakDate = subDays(streakDate, 1);
      } else {
        break;
      }
    }
  }

  // ---- LONGEST STREAK ----
  let tempStreak = 0;
  let prevDate = null;

  yearDays.forEach(day => {
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

  /* ==============================
     MONTHLY STATS (YEAR SAFE)
  ============================== */
  const currentMonthIndex = new Date().getMonth();
  const monthBaseDate = new Date(selectedYear, currentMonthIndex, 1);
  const monthStr = format(monthBaseDate, "yyyy-MM");

  const monthDays = yearDays.filter(d =>
    d.date.startsWith(monthStr)
  );

  const monthlyTotalLogs = monthDays.reduce(
    (acc, d) => acc + (d.logs?.length || 0),
    0
  );

  const monthlyActiveDays = monthDays.length;

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(monthBaseDate),
    end: endOfMonth(monthBaseDate),
  }).length;

  const monthProgress =
    Math.round((monthlyActiveDays / daysInMonth) * 100) || 0;

  /* ==============================
     RETURN
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
      name: format(monthBaseDate, "MMMM"),
    },
  };
};
