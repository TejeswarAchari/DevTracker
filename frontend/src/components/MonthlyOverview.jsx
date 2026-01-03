import React from "react";
import { motion } from "framer-motion";
import { Calendar, Activity } from "lucide-react";

const MonthlyOverview = ({ stats }) => {
  const { monthly } = stats;

  return (
    <div className="relative overflow-hidden rounded-3xl glass-panel p-1 border border-white/10 mt-8 mb-8">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 blur-[80px] rounded-full pointer-events-none" />

      <div className="relative z-10 bg-[#09090b]/80 backdrop-blur-xl rounded-[20px] p-6 md:p-8">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6">
          
          {/* Text Info */}
          <div className="space-y-2">
            <h3 className="text-zinc-400 font-medium text-sm uppercase tracking-widest flex items-center gap-2">
              <Calendar size={14} className="text-cyan-400" />
              {monthly.name} Overview
            </h3>

            <div className="text-3xl md:text-4xl font-black text-white leading-tight">
              You were active on <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                {monthly.activeDays} days
              </span>{" "}
              this month.
            </div>
          </div>

          {/* Stats Badge */}
          <div className="flex gap-4">
            <div className="text-right">
              <p className="text-xs text-zinc-500 font-bold uppercase">
                Total Activities
              </p>
              <div className="text-2xl font-bold text-white flex items-center justify-end gap-2">
                <Activity size={18} className="text-emerald-400" />
                {monthly.totalLogs}
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-8 relative pt-4">
          <div className="flex justify-between text-xs font-medium text-zinc-500 mb-2">
            <span>Consistency Meter</span>
            <span>{monthly.progress}% of month active</span>
          </div>

          <div className="h-4 bg-zinc-800 rounded-full overflow-hidden relative">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${monthly.progress}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-violet-500"
            />
            {/* Subtle Scanline Texture */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthlyOverview;
