import React, { memo } from "react";
import { motion } from "framer-motion";
import { Calendar, Activity } from "lucide-react";

const MonthlyOverview = memo(({ stats }) => {
  const { monthly } = stats;

  return (
    <motion.div 
      className="relative overflow-hidden rounded-3xl glass-panel p-1 border border-white/10 mt-8 mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Background Decor */}
      <motion.div 
        className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 blur-[80px] rounded-full pointer-events-none"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.15, 0.1]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <div className="relative z-10 bg-[#09090b]/80 backdrop-blur-xl rounded-[20px] p-4 sm:p-6 md:p-8">
        <motion.div 
          className="flex flex-col gap-4 sm:gap-6"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.1 }
            }
          }}
        >
          
          {/* Text Info */}
          <motion.div 
            className="space-y-2"
            variants={{
              hidden: { opacity: 0, x: -20 },
              visible: { opacity: 1, x: 0 }
            }}
          >
            <motion.h3 
              className="text-zinc-400 font-medium text-xs sm:text-sm uppercase tracking-widest flex items-center gap-2"
              whileHover={{ x: 5, color: 'rgba(34, 211, 238, 1)' }}
            >
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              >
                <Calendar size={14} className="text-cyan-400" />
              </motion.div>
              {monthly.name} Overview
            </motion.h3>

            <motion.div 
              className="text-2xl sm:text-3xl md:text-4xl font-black text-white leading-tight"
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0 }
              }}
            >
              You were active on <br />
              <motion.span 
                className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500"
                animate={{ 
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              >
                {monthly.activeDays} days
              </motion.span>{" "}
              this month.
            </motion.div>
          </motion.div>

          {/* Stats Badge */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-between"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.1 }
              }
            }}
          >
            <motion.div 
              className="text-left sm:text-right p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/20 cursor-pointer"
              whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(34, 211, 238, 0.2)' }}
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0 }
              }}
            >
              <p className="text-xs text-zinc-500 font-bold uppercase">
                Total Activities
              </p>
              <motion.div 
                className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 mt-2"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                >
                  <Activity size={18} className="text-violet-400" />
                </motion.div>
                {monthly.totalLogs}
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Progress Bar */}
        <motion.div 
          className="mt-8 relative pt-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex justify-between text-xs font-medium text-zinc-500 mb-2">
            <span>Consistency Meter</span>
            <motion.span
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              {monthly.progress}% of month active
            </motion.span>
          </div>

          <div className="h-4 bg-zinc-800 rounded-full overflow-hidden relative">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${monthly.progress}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-violet-500"
            />
            {/* Subtle Scanline Texture */}
            <motion.div 
              className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"
              animate={{ opacity: [0.2, 0.3, 0.2] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
});

MonthlyOverview.displayName = 'MonthlyOverview';

export default MonthlyOverview;
