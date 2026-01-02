import React, { useMemo } from "react";
import { motion } from "framer-motion";
import {
  startOfYear,
  endOfYear,
  startOfWeek,
  eachDayOfInterval,
  format,
  isSameYear,
} from "date-fns";
import clsx from "clsx";

const DAYS = ["Mon", "", "Wed", "", "Fri", "", ""];

const Heatmap = ({ data, year, onDayClick }) => {
  /* ==============================
     PREPARE DATA MAP (O(1) lookup)
  ============================== */
  const dataMap = useMemo(() => {
    const map = {};
    data.forEach((d) => {
      map[d.date] = d.logs?.length || 0;
    });
    return map;
  }, [data]);

  /* ==============================
     GENERATE DAYS (GitHub Style)
  ============================== */
  const { weeks, monthLabels } = useMemo(() => {
    const yearStart = startOfYear(new Date(year, 0, 1));
    const yearEnd = endOfYear(new Date(year, 0, 1));

    // GitHub starts from the Monday before Jan 1
    const gridStart = startOfWeek(yearStart, { weekStartsOn: 1 });

    const days = eachDayOfInterval({
      start: gridStart,
      end: yearEnd,
    });

    const weeks = [];
    const labels = [];
    let currentMonth = null;

    days.forEach((day, index) => {
      const weekIndex = Math.floor(index / 7);

      if (!weeks[weekIndex]) weeks[weekIndex] = [];

      weeks[weekIndex].push(day);

      const month = format(day, "MMM");
      if (day.getDate() === 1 && month !== currentMonth) {
        labels[weekIndex] = month;
        currentMonth = month;
      }
    });

    return { weeks, monthLabels: labels };
  }, [year]);

  /* ==============================
     COLOR SCALE (GitHub Accurate)
  ============================== */
const getColor = (count) => {
  if (count === 0) return "bg-[#161b22]";   // Dark gray
  if (count === 1) return "bg-[#006d32]";   // Medium green
  if (count <= 3) return "bg-[#26a641]";   // Bright green (2–3)
  return "bg-[#39d353]";                    // Neon green (4+)
};


  return (
    <div className="w-full overflow-x-auto custom-scrollbar pb-4">
      <div className="min-w-[900px] bg-[#0d1117] border border-white/10 rounded-xl p-6">
        {/* GRID */}
        <div
          className="grid gap-x-[3px] gap-y-1"
          style={{ gridTemplateColumns: `30px repeat(${weeks.length}, 12px)` }}
        >
          {/* MONTH LABELS */}
          <div />
          {weeks.map((_, i) => (
            <div key={i} className="h-4 text-[10px] text-zinc-500 font-medium">
              {monthLabels[i]}
            </div>
          ))}

          {/* DAYS */}
          {DAYS.map((label, rowIndex) => (
            <React.Fragment key={rowIndex}>
              {/* DAY LABEL */}
              <div className="text-[10px] text-zinc-500 pr-2 text-right leading-[12px]">
                {label}
              </div>

              {/* CELLS */}
              {weeks.map((week, colIndex) => {
                const day = week[rowIndex];
                if (!day) return <div key={colIndex} />;

                const dateStr = format(day, "yyyy-MM-dd");
                const isCurrentYear = isSameYear(
                  day,
                  new Date(year, 0, 1)
                );
                const count = dataMap[dateStr] || 0;

                return (
                  <motion.div
                    key={colIndex}
                    whileHover={{ scale: 1.25 }}
                    onClick={() =>
                      isCurrentYear && onDayClick(dateStr)
                    }
                    title={`${dateStr} — ${count} activities`}
                    className={clsx(
                      "w-[12px] h-[12px] rounded-[2px] transition cursor-pointer border border-black/20",
                      isCurrentYear
                        ? getColor(count)
                        : "opacity-0 pointer-events-none"
                    )}
                  />
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Heatmap;
