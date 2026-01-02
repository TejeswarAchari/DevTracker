import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import {
  getCurrentMilestone,
  getNextMilestone,
} from "../utils/streakHelpers";

const StatCard = ({ label, value, delay, suffix = "", children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    className="glass-panel p-6 rounded-2xl relative overflow-hidden group border border-white/5"
  >
    <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">
      {label}
    </p>

    <div className="flex items-baseline gap-1">
      <h3 className="text-4xl font-black text-white">
        {value}
      </h3>
      {suffix && (
        <span className="text-sm text-zinc-500">{suffix}</span>
      )}
    </div>

    {children}
  </motion.div>
);

const Stats = ({ stats, year }) => {
  const prevMilestoneRef = useRef(null);

  const currentMilestone =
    stats.currentStreak > 0
      ? getCurrentMilestone(stats.currentStreak)
      : null;

  const nextMilestone =
    stats.currentStreak > 0
      ? getNextMilestone(stats.currentStreak)
      : null;

  /* 🎉 CONFETTI ON MILESTONE UNLOCK */
  useEffect(() => {
    if (
      currentMilestone &&
      prevMilestoneRef.current !== currentMilestone.title
    ) {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#22c55e", "#06b6d4", "#a855f7"],
      });

      prevMilestoneRef.current = currentMilestone.title;
    }
  }, [currentMilestone]);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <StatCard
        label={`Activities in ${year}`}
        value={stats.yearLogs}
        delay={0}
      />

      <StatCard
        label="Active Days (Year)"
        value={stats.yearActiveDays}
        delay={0.1}
      />

      <StatCard
        label="Longest Streak"
        value={stats.maxStreak}
        suffix="days"
        delay={0.2}
      />

      {/* 🔥 CURRENT STREAK */}
      <StatCard
        label="Current Streak"
        value={stats.currentStreak}
        suffix="days"
        delay={0.3}
      >
        <AnimatePresence mode="wait">
          {currentMilestone && (
            <motion.div
              key={currentMilestone.title}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
              className="mt-1 flex items-center gap-2 text-xs font-semibold
                         text-transparent bg-clip-text
                         bg-gradient-to-r from-emerald-400 to-cyan-400"
            >
              <currentMilestone.icon size={14} />
              {currentMilestone.title}
            </motion.div>
          )}
        </AnimatePresence>

        {/* 🎯 NEXT MILESTONE */}
        {nextMilestone && (
          <div className="mt-1 text-[10px] text-zinc-500">
            {nextMilestone.days - stats.currentStreak} days to{" "}
            <span className="text-zinc-300 font-semibold">
              {nextMilestone.title}
            </span>
          </div>
        )}
      </StatCard>
    </div>
  );
};

export default Stats;
