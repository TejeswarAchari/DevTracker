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
     DATA MAP (O(1))
  ============================== */
  const dataMap = useMemo(() => {
    const map = {};
    data.forEach((d) => {
      map[d.date] = d.logs?.length || 0;
    });
    return map;
  }, [data]);

  /* ==============================
     GENERATE WEEKS
  ============================== */
  const { weeks, monthLabels } = useMemo(() => {
    const yearStart = startOfYear(new Date(year, 0, 1));
    const yearEnd = endOfYear(new Date(year, 0, 1));
    const gridStart = startOfWeek(yearStart, { weekStartsOn: 1 });

    const days = eachDayOfInterval({
      start: gridStart,
      end: yearEnd,
    });

    const weeks = [];
    const labels = [];
    let lastMonth = null;

    days.forEach((day, index) => {
      const weekIndex = Math.floor(index / 7);
      if (!weeks[weekIndex]) weeks[weekIndex] = [];
      weeks[weekIndex].push(day);

      const month = format(day, "MMM");
      if (day.getDate() === 1 && month !== lastMonth) {
        labels[weekIndex] = month;
        lastMonth = month;
      }
    });

    return { weeks, monthLabels: labels };
  }, [year]);

  /* ==============================
     COLOR SCALE (SOFT)
  ============================== */
  const getColor = (count) => {
    if (count === 0) return "bg-[#161b22]";
    if (count === 1) return "bg-[#0e4429]";
    if (count <= 3) return "bg-[#006d32]";
    if (count <= 5) return "bg-[#26a641]";
    return "bg-[#39d353]";
  };

  return (
    <div className="w-full overflow-x-hidden pb-4">
      <div className="w-full bg-[#0d1117] border border-white/10 rounded-xl p-6">
        {/* GRID */}
        <div
          className="grid gap-x-1 gap-y-1 items-center"
          style={{
            gridTemplateColumns: `40px repeat(${weeks.length}, minmax(0, 1fr))`,
          }}
        >
          {/* MONTH LABELS */}
          <div />
          {weeks.map((_, i) => (
            <div
              key={i}
              className="text-[10px] text-zinc-500 font-medium text-left"
            >
              {monthLabels[i]}
            </div>
          ))}

          {/* DAYS */}
          {DAYS.map((label, rowIndex) => (
            <React.Fragment key={rowIndex}>
              {/* Day label */}
              <div className="text-[10px] text-zinc-500 text-right pr-2">
                {label}
              </div>

              {/* Cells */}
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
                    whileHover={{ scale: 1.15 }}
                    onClick={() =>
                      isCurrentYear && onDayClick(dateStr)
                    }
                    title={`${dateStr} — ${count} activities`}
                    className={clsx(
                      "aspect-square rounded-[3px] transition cursor-pointer border border-black/20",
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
