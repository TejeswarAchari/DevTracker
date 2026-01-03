import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Snowflake, Shield, Info, Plus } from 'lucide-react';
import clsx from 'clsx';

const StreakFreeze = ({ credits, onInfoClick, onManualActivateClick }) => {
  return (
    <div className="relative">
      {/* Freeze Credits Display */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 backdrop-blur-sm"
      >
        <div className="relative">
          <Snowflake 
            className={clsx(
              "transition-all duration-300",
              credits > 0 ? "text-cyan-400" : "text-zinc-600"
            )} 
            size={20} 
          />
          {credits > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-cyan-500 flex items-center justify-center text-[10px] font-bold text-white"
            >
              {credits}
            </motion.div>
          )}
        </div>

        <div>
          <div className="flex items-center gap-1">
            <span className="text-sm font-bold text-white">Freeze Credits</span>
            <button
              onClick={onInfoClick}
              className="text-zinc-500 hover:text-cyan-400 transition-colors"
            >
              <Info size={14} />
            </button>
          </div>
          <p className="text-[10px] text-zinc-500">
            {credits > 0 
              ? `${credits} protection${credits > 1 ? 's' : ''} available`
              : 'Earn via 7-day streaks'}
          </p>
        </div>

        {/* Manual Activate Button */}
        {credits > 0 && onManualActivateClick && (
          <button
            onClick={onManualActivateClick}
            className="ml-2 p-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 
                     hover:border-cyan-500/50 transition-all group"
            title="Manually activate freeze"
          >
            <Plus size={16} className="text-cyan-400 group-hover:scale-110 transition-transform" />
          </button>
        )}
      </motion.div>

      {/* Freeze Shield Indicator (when active) */}
      <AnimatePresence>
        {credits > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute -top-2 -right-2"
          >
            <Shield className="text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]" size={16} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StreakFreeze;
