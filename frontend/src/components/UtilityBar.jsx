import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, WifiOff, Download, AlertTriangle } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const UtilityBar = ({ isOnline, onExport, streakWarning }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="fixed top-4 right-4 z-30 flex items-center gap-2">
      {/* Offline Indicator */}
      {!isOnline && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold"
        >
          <WifiOff size={14} />
          Offline
        </motion.div>
      )}

      {/* Streak Warning */}
      {streakWarning && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold"
        >
          <AlertTriangle size={14} />
          Log today or streak breaks!
        </motion.div>
      )}

      {/* Export Button */}
      <button
        onClick={onExport}
        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-zinc-400 hover:text-white transition-all"
        title="Export Data"
      >
        <Download size={18} />
      </button>

      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-zinc-400 hover:text-white transition-all"
        title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      >
        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
      </button>
    </div>
  );
};

export default UtilityBar;
