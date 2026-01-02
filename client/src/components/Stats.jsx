import React from "react";
import { motion } from "framer-motion";

const StatCard = ({ label, value, delay, suffix = "" }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    className="glass-panel p-6 rounded-2xl relative overflow-hidden group border border-white/5"
  >
    {/* Glow Accent */}
    <div className="absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br from-primary/20 to-secondary/20 blur-2xl rounded-full group-hover:bg-primary/30 transition-all duration-500" />

    <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">
      {label}
    </p>

    <div className="flex items-baseline gap-1">
      <h3 className="text-4xl font-black text-white drop-shadow-sm tracking-tight">
        {value}
      </h3>
      {suffix && (
        <span className="text-sm font-medium text-zinc-500">
          {suffix}
        </span>
      )}
    </div>
  </motion.div>
);

const Stats = ({ stats, year }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* Yearly Stats */}
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

      {/* All-Time Streaks */}
      <StatCard
        label="Longest Streak"
        value={stats.maxStreak}
        suffix="days"
        delay={0.2}
      />
      <StatCard
        label="Current Streak"
        value={stats.currentStreak}
        suffix="days"
        delay={0.3}
      />
    </div>
  );
};

export default Stats;
