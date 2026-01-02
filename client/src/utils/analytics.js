import {
  subDays,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  parseISO,
  differenceInDays,
  startOfDay,
  isValid,
} from "date-fns";

export const calculateStats = (
  data,
  selectedYear = new Date().getFullYear(),
  freezeData = { credits: 0, usedDates: [] } // NEW: Accept freeze data
) => {
  /* ==============================
     SORT & FILTER
  ============================== */
  const sortedDays = [...data].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  // Create a Set of all dates for efficient lookup (year-agnostic for streaks)
  const allDateSet = new Set(sortedDays.map(d => d.date));
  
  // Create a set of freeze dates for O(1) lookup
  const freezeDateSet = new Set(freezeData.usedDates || []);

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
     STREAKS (GLOBAL - WITH FREEZE SUPPORT) 🧊
  ============================== */
  let currentStreak = 0;
  let maxStreak = 0;
  let freezesUsedInCurrentStreak = 0;

  // ---- CURRENT STREAK (WITH FREEZE PROTECTION) ----
  if (sortedDays.length > 0) {
    const today = format(startOfDay(new Date()), "yyyy-MM-dd");
    const yesterday = format(subDays(startOfDay(new Date()), 1), "yyyy-MM-dd");
    const lastActiveDate = sortedDays[sortedDays.length - 1].date;

    // Check if streak is active (logged today, yesterday, OR freeze protects it)
    let isStreakActive = 
      lastActiveDate === today || 
      lastActiveDate === yesterday;

    // If not active, check if we can use freeze to protect
    if (!isStreakActive) {
      const daysSinceLastLog = differenceInDays(
        parseISO(today),
        parseISO(lastActiveDate)
      );

      // If gap is 2-7 days, check if freezes cover the missing days
      if (daysSinceLastLog >= 2 && daysSinceLastLog <= 7) {
        let allGapsCovered = true;
        
        for (let i = 1; i < daysSinceLastLog; i++) {
          const gapDate = format(
            subDays(parseISO(today), i),
            "yyyy-MM-dd"
          );
          
          // If this date is not logged AND not frozen, gap is not covered
          if (!allDateSet.has(gapDate) && !freezeDateSet.has(gapDate)) {
            allGapsCovered = false;
            break;
          }
        }

        if (allGapsCovered) {
          isStreakActive = true;
        }
      }
    }

    // Only count streak if active
    if (isStreakActive) {
      let streakDate = parseISO(today);
      let consecutiveMisses = 0;

      while (true) {
        const dStr = format(streakDate, "yyyy-MM-dd");
        
        if (allDateSet.has(dStr)) {
          // Day has activity - continue streak
          currentStreak++;
          consecutiveMisses = 0;
        } else if (freezeDateSet.has(dStr)) {
          // Day is frozen - continues streak but count as protected
          currentStreak++;
          freezesUsedInCurrentStreak++;
          consecutiveMisses = 0;
        } else {
          // No activity and no freeze - check if we can tolerate
          consecutiveMisses++;
          
          // Allow 1 day grace (yesterday rule)
          if (consecutiveMisses > 1) {
            break; // Streak ends
          }
        }

        streakDate = subDays(streakDate, 1);

        // Safety: don't go back more than 2 years
        if (currentStreak > 730) break;
      }
    }
  }

  // ---- LONGEST STREAK (WITH FREEZE SUPPORT) ----
  let tempStreak = 0;
  let prevDate = null;

  sortedDays.forEach(day => {
    const currentDate = parseISO(day.date);

    if (prevDate) {
      const diff = differenceInDays(currentDate, prevDate);

      if (diff === 1) {
        // Consecutive day
        tempStreak++;
      } else if (diff > 1) {
        // Gap detected - check if freezes fill it
        let gapFilled = true;

        for (let i = 1; i < diff; i++) {
          const gapDate = format(
            subDays(currentDate, diff - i),
            "yyyy-MM-dd"
          );
          
          if (!freezeDateSet.has(gapDate)) {
            gapFilled = false;
            break;
          }
        }

        if (gapFilled) {
          tempStreak++; // Gap covered by freezes
        } else {
          tempStreak = 1; // Streak broken, restart
        }
      }
    } else {
      tempStreak = 1;
    }

    maxStreak = Math.max(maxStreak, tempStreak);
    prevDate = currentDate;
  });

  /* ==============================
     MONTHLY STATS (FIXED: Show current month for selected year)
  ============================== */
  const now = new Date();
  const isCurrentYear = selectedYear === now.getFullYear();
  
  // For current year, show current month. For past years, show last active month.
  const monthBaseDate = isCurrentYear
    ? new Date(selectedYear, now.getMonth(), 1)
    : yearDays.length > 0
    ? new Date(yearDays[yearDays.length - 1].date)
    : new Date(selectedYear, 0, 1);

  const monthStr = format(monthBaseDate, "yyyy-MM");

  const monthDays = sortedDays.filter(d =>
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
    freezesUsedInCurrentStreak, // NEW
    monthly: {
      totalLogs: monthlyTotalLogs,
      activeDays: monthlyActiveDays,
      progress: monthProgress,
      name: format(monthBaseDate, "MMMM"),
    },
  };
};

// NEW: Helper to check if user should earn freeze credit
export const shouldEarnFreezeCredit = (currentStreak, lastEarnedStreak = 0) => {
  // Earn every 7 days
  const milestones = [7, 14, 21, 28, 35, 42, 49, 56, 63, 70];
  
  for (const milestone of milestones) {
    if (currentStreak >= milestone && lastEarnedStreak < milestone) {
      return { shouldEarn: true, milestone };
    }
  }
  
  return { shouldEarn: false, milestone: null };
};
