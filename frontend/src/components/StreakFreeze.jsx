import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Snowflake, Shield, Info, Plus } from 'lucide-react';
import clsx from 'clsx';

const StreakFreeze = ({ credits, onInfoClick, onManualActivateClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div 
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Freeze Credits Display */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.05, boxShadow: '0 0 25px rgba(34, 211, 238, 0.3)' }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 backdrop-blur-sm transition-all cursor-pointer"
        onClick={onInfoClick}
      >
        <motion.div 
          className="relative"
          animate={isHovered ? { rotate: [0, -15, 15, -10, 0] } : { rotate: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Snowflake 
              className={clsx(
                "transition-all duration-300",
                credits > 0 ? "text-cyan-400" : "text-zinc-600"
              )} 
              size={20} 
            />
          </motion.div>
          
          <AnimatePresence>
            {credits > 0 && (
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 180 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-[10px] font-bold text-white shadow-lg"
              >
                {credits}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <div className="flex-1">
          <motion.div 
            className="flex items-center gap-1"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <span className="text-sm font-bold text-white">Freeze Credits</span>
            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                onInfoClick();
              }}
              whileHover={{ scale: 1.2, rotate: 180 }}
              whileTap={{ scale: 0.95 }}
              className="text-zinc-500 hover:text-cyan-400 transition-colors"
            >
              <Info size={14} />
            </motion.button>
          </motion.div>
          <motion.p 
            className="text-[10px] text-zinc-500"
            animate={isHovered ? { color: 'rgba(34, 211, 238, 0.7)' } : { color: 'rgba(113, 113, 122, 1)' }}
          >
            {credits > 0 
              ? `${credits} protection${credits > 1 ? 's' : ''} available`
              : 'Earn via 7-day streaks'}
          </motion.p>
        </div>

        {/* Manual Activate Button */}
        <AnimatePresence>
          {credits > 0 && onManualActivateClick && (
            <motion.button
              initial={{ opacity: 0, x: 10, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 10, scale: 0.8 }}
              onClick={(e) => {
                e.stopPropagation();
                onManualActivateClick();
              }}
              whileHover={{ scale: 1.15, boxShadow: '0 0 15px rgba(34, 211, 238, 0.5)' }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              className="ml-2 p-2 rounded-lg bg-cyan-500/20 border border-cyan-500/30 transition-all"
              title="Manually activate freeze"
            >
              <motion.div
                animate={{ rotate: isHovered ? 360 : 0 }}
                transition={{ duration: 0.6 }}
              >
                <Plus size={16} className="text-cyan-400" />
              </motion.div>
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Freeze Shield Indicator (when active) */}
      <AnimatePresence>
        {credits > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            className="absolute -top-2 -right-2"
          >
            <motion.div
              animate={{ rotate: 360, y: [0, -2, 0] }}
              transition={{ rotate: { duration: 8, repeat: Infinity, ease: 'linear' }, y: { duration: 2, repeat: Infinity } }}
            >
              <Shield className="text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]" size={16} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default StreakFreeze;
