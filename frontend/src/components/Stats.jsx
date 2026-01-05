import React, { useEffect, useRef, useState, memo, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Shield, Trophy } from "lucide-react";
import {
  getCurrentMilestone,
  getNextMilestone,
} from "../utils/streakHelpers";
import EarnedTitlesModal from "./EarnedTitlesModal";

// Memoized StatCard component to prevent unnecessary re-renders
const StatCard = memo(({ label, value, delay, suffix = "", children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    whileHover={{ y: -8, scale: 1.02 }}
    transition={{ delay, duration: 0.5, ease: "easeOut" }}
    className="glass-panel p-4 sm:p-6 rounded-2xl relative overflow-hidden group border border-white/5 cursor-default"
  >
    {/* Animated background gradient on hover */}
    <motion.div
      initial={{ opacity: 0 }}
      whileHover={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-cyan-500/10 pointer-events-none"
    />
    
    <div className="relative z-10">
      <p className="text-zinc-500 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] mb-1">
        {label}
      </p>

      <div className="flex items-baseline gap-1">
        <motion.h3 
          className="text-2xl sm:text-3xl md:text-4xl font-black text-white"
          whileHover={{ scale: 1.05, color: "#22d3ee" }}
          transition={{ duration: 0.2 }}
        >
          {value}
        </motion.h3>
        {suffix && (
          <motion.span 
            className="text-xs sm:text-sm text-zinc-500"
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.2 }}
          >
            {suffix}
          </motion.span>
        )}
      </div>

      {children}
    </div>
  </motion.div>
));

StatCard.displayName = 'StatCard';

const Stats = memo(({ stats, year }) => {
  const prevMilestoneRef = useRef(null);
  const celebratedMilestonesRef = useRef(new Set());
  const [showEarnedTitles, setShowEarnedTitles] = useState(false);

  // Memoize milestone calculations to avoid unnecessary recalculations
  const currentMilestone = useMemo(() => {
    return stats.currentStreak > 0
      ? getCurrentMilestone(stats.currentStreak)
      : null;
  }, [stats.currentStreak]);

  const nextMilestone = useMemo(() => {
    return stats.currentStreak > 0
      ? getNextMilestone(stats.currentStreak)
      : null;
  }, [stats.currentStreak]);

  // Memoize callback to prevent re-creating on every render
  const handleShowTitles = useCallback(() => {
    setShowEarnedTitles(true);
  }, []);

  const handleCloseTitles = useCallback(() => {
    setShowEarnedTitles(false);
  }, []);

  /* 🎉 CONFETTI ON MILESTONE UNLOCK (FIXED: No spam on year change) */
  useEffect(() => {
    if (
      currentMilestone &&
      prevMilestoneRef.current !== currentMilestone.title &&
      !celebratedMilestonesRef.current.has(currentMilestone.title)
    ) {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#22c55e", "#06b6d4", "#a855f7"],
      });

      // Mark this milestone as celebrated
      celebratedMilestonesRef.current.add(currentMilestone.title);
      prevMilestoneRef.current = currentMilestone.title;
    }
  }, [currentMilestone]);

  return (
    <>
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

          {/* 🛡️ FREEZE INDICATOR */}
          {stats.freezesUsedInCurrentStreak > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-2 flex items-center gap-1.5 text-[10px] text-cyan-600 font-semibold
                         bg-cyan-50 border border-cyan-200 rounded-lg px-2 py-1"
            >
              <Shield size={12} />
              {stats.freezesUsedInCurrentStreak} freeze{stats.freezesUsedInCurrentStreak > 1 ? 's' : ''} active
            </motion.div>
          )}

          {/* 🎯 NEXT MILESTONE & FREEZE CREDIT INFO */}
          {nextMilestone && (
            <div className="mt-2 space-y-1.5">
              <div className="text-[10px] text-zinc-500">
                {nextMilestone.days - stats.currentStreak} days to{" "}
                <span className="text-zinc-700 font-semibold">
                  {nextMilestone.title}
                </span>
              </div>

              {/* FREEZE CREDIT PROGRESS */}
              {stats.currentStreak < 7 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-[10px] text-cyan-300 font-semibold bg-cyan-500/15 border border-cyan-500/30 rounded-lg px-2 py-1 inline-flex items-center gap-1"
                >
                  <span>❄️</span>
                  <span>Earn freeze credit in {7 - stats.currentStreak} day{7 - stats.currentStreak > 1 ? 's' : ''}</span>
                </motion.div>
              )}
              {stats.currentStreak >= 7 && stats.currentStreak < 14 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 border border-emerald-200 rounded-lg px-2 py-1 inline-flex items-center gap-1"
                >
                  <span>✓</span>
                  <span>Next freeze in {14 - stats.currentStreak} day{14 - stats.currentStreak > 1 ? 's' : ''}</span>
                </motion.div>
              )}
            </div>
          )}
        </StatCard>
      </div>

      {/* VIEW EARNED TITLES BUTTON */}
      <motion.button
        initial={{ opacity: 0, y: 10, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        whileHover={{ scale: 1.08, boxShadow: "0 0 30px rgba(139, 92, 246, 0.6)" }}
        whileTap={{ scale: 0.95 }}
        transition={{ delay: 0.4, type: "spring", stiffness: 300, damping: 20 }}
        onClick={handleShowTitles}
        className="mb-8 w-full md:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 
                 hover:from-indigo-600 hover:to-cyan-600 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-300
                 shadow-md"
      >
        <motion.div
          animate={{ rotate: [0, -10, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Trophy size={16} />
        </motion.div>
        View Earned Titles ({React.useMemo(() => {
          const STREAK_MILESTONES = [
            { days: 1 }, { days: 3 }, { days: 5 }, { days: 7 }, { days: 10 }, { days: 14 }, { days: 21 },
            { days: 30 }, { days: 45 }, { days: 60 }, { days: 75 }, { days: 90 }, { days: 100 },
            { days: 120 }, { days: 150 }, { days: 180 }, { days: 200 }, { days: 250 }, { days: 300 },
            { days: 365 }, { days: 500 }, { days: 1000 }
          ];
          return STREAK_MILESTONES.filter(m => stats.currentStreak >= m.days).length;
        }, [stats.currentStreak])})
      </motion.button>

      {/* EARNED TITLES MODAL */}
      <EarnedTitlesModal
        isOpen={showEarnedTitles}
        onClose={handleCloseTitles}
        currentStreak={stats.currentStreak}
      />
    </>
  );
});

Stats.displayName = 'Stats';

export default Stats;
