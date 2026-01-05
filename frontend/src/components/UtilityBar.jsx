import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, WifiOff, Download, AlertTriangle, Sparkles } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const UtilityBar = ({ isOnline, onExport, streakWarning, onFeaturesClick }) => {
  const { theme, toggleTheme } = useTheme();
  const [hoveredButton, setHoveredButton] = useState(null);

  const buttonVariants = {
    rest: { scale: 1, boxShadow: '0 0 0px rgba(139, 92, 246, 0)' },
    hover: { scale: 1.1, boxShadow: '0 0 20px rgba(139, 92, 246, 0.4)' },
    tap: { scale: 0.95 }
  };

  const warningVariants = {
    initial: { opacity: 0, x: 20, scale: 0.95 },
    animate: { opacity: 1, x: 0, scale: 1 },
    exit: { opacity: 0, x: 20, scale: 0.95 }
  };

  return (
    <motion.div 
      className="fixed top-4 right-4 z-30 flex items-center gap-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
    >
      {/* Offline Indicator */}
      {!isOnline && (
        <motion.div
          variants={warningVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold"
        >
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            <WifiOff size={14} />
          </motion.div>
          Offline
        </motion.div>
      )}

      {/* Streak Warning with Pulse Animation */}
      {streakWarning && (
        <motion.div
          variants={warningVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold overflow-hidden"
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1], rotate: [0, -5, 5, -5, 0] }}
            transition={{ duration: 0.6, repeat: Infinity }}
          >
            <AlertTriangle size={14} />
          </motion.div>
          <span className="hidden sm:inline">Log today or streak breaks!</span>
          <span className="sm:hidden">Log today!</span>
        </motion.div>
      )}

      {/* Features Hub Button */}
      <motion.button
        onMouseEnter={() => setHoveredButton('features')}
        onMouseLeave={() => setHoveredButton(null)}
        onClick={onFeaturesClick}
        variants={buttonVariants}
        initial="rest"
        whileHover="hover"
        whileTap="tap"
        className="p-2 rounded-lg bg-white/5 border border-white/10 text-zinc-400 hover:text-purple-400 transition-colors relative group"
        title="Open Features Hub"
      >
        <motion.div
          animate={hoveredButton === 'features' ? { rotate: 180 } : { rotate: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Sparkles size={18} />
        </motion.div>
        <motion.div
          className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-500/30 to-cyan-500/30"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
      </motion.button>

      {/* Export Button */}
      <motion.button
        onMouseEnter={() => setHoveredButton('export')}
        onMouseLeave={() => setHoveredButton(null)}
        onClick={onExport}
        variants={buttonVariants}
        initial="rest"
        whileHover="hover"
        whileTap="tap"
        className="p-2 rounded-lg bg-white/5 border border-white/10 text-zinc-400 transition-colors relative group"
        title="Export Data"
      >
        <motion.div
          animate={hoveredButton === 'export' ? { y: -3 } : { y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Download size={18} />
        </motion.div>
        <motion.div
          className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/20 to-cyan-500/20"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
      </motion.button>

      {/* Theme Toggle */}
      <motion.button
        onMouseEnter={() => setHoveredButton('theme')}
        onMouseLeave={() => setHoveredButton(null)}
        onClick={toggleTheme}
        variants={buttonVariants}
        initial="rest"
        whileHover="hover"
        whileTap="tap"
        className="p-2 rounded-lg bg-white/5 border border-white/10 text-zinc-400 transition-colors relative group"
        title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      >
        <motion.div
          animate={{ rotate: hoveredButton === 'theme' ? 180 : 0 }}
          transition={{ duration: 0.5 }}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </motion.div>
        <motion.div
          className="absolute inset-0 rounded-lg bg-gradient-to-r from-yellow-500/20 to-orange-500/20"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
      </motion.button>
    </motion.div>
  );
};

export default UtilityBar;
