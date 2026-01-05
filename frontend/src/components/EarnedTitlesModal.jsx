import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { STREAK_MILESTONES } from '../utils/streakMilestones';

const EarnedTitlesModal = ({ isOpen, onClose, currentStreak }) => {
  // Calculate which milestones have been earned
  const earnedMilestones = STREAK_MILESTONES.filter(
    milestone => currentStreak >= milestone.days
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4"
          >
            <div className="relative w-full max-w-2xl max-h-[85vh] bg-[#09090b] rounded-2xl sm:rounded-2xl border border-white/10 shadow-2xl shadow-violet-500/10 overflow-hidden">
              
              {/* Header */}
              <div className="sticky top-0 z-10 bg-[#09090b] p-4 sm:p-6 border-b border-white/5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-white mb-1">
                      🏆 Titles Earned
                    </h2>
                    <p className="text-xs sm:text-sm text-zinc-400">
                      {earnedMilestones.length} of {STREAK_MILESTONES.length} titles unlocked
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors text-zinc-400 hover:text-white flex-shrink-0"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="overflow-y-auto p-4 sm:p-6 space-y-3" style={{ maxHeight: 'calc(85vh - 150px)' }}>
                {earnedMilestones.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-zinc-400 text-sm">
                      Keep building your streak to earn titles! 🌟
                    </p>
                  </div>
                ) : (
                  <>
                    {earnedMilestones.map((milestone, index) => {
                      const IconComponent = milestone.icon;
                      return (
                        <motion.div
                          key={milestone.days}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-violet-400/30 hover:bg-violet-500/5 transition-all group"
                        >
                          <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-violet-500/20 to-cyan-500/20 
                                        flex items-center justify-center border border-violet-500/30 group-hover:border-violet-400/50 transition-colors">
                            <IconComponent className="text-violet-400 group-hover:scale-110 transition-transform" size={20} />
                          </div>

                          <div className="flex-grow">
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-white text-sm">
                                {milestone.title}
                              </p>
                              {index === earnedMilestones.length - 1 && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/20 border border-violet-500/30 text-violet-300 font-semibold">
                                  LATEST
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-zinc-500">
                              {milestone.days} day streak
                            </p>
                          </div>

                          {index === earnedMilestones.length - 1 && (
                            <div className="flex-shrink-0">
                              <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="text-violet-400 text-xl"
                              >
                                ✨
                              </motion.div>
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                    
                    {/* Remaining Locked Titles */}
                    <div className="mt-6 pt-6 border-t border-white/5">
                      <p className="text-xs text-zinc-500 font-semibold mb-3">LOCKED TITLES ({STREAK_MILESTONES.length - earnedMilestones.length} remaining)</p>
                      <div className="space-y-2">
                        {STREAK_MILESTONES.filter(m => currentStreak < m.days).slice(0, 5).map((milestone, index) => {
                          const IconComponent = milestone.icon;
                          return (
                            <div
                              key={milestone.days}
                              className="flex items-center gap-4 p-3 rounded-xl bg-white/3 border border-white/5 opacity-50"
                            >
                              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
                                <IconComponent className="text-zinc-600" size={18} />
                              </div>
                              <div className="flex-grow">
                                <p className="font-semibold text-zinc-300 text-xs">
                                  {milestone.title}
                                </p>
                                <p className="text-[10px] text-zinc-600">
                                  Unlock at {milestone.days} days
                                </p>
                              </div>
                              <div className="text-xs text-zinc-600 font-mono">🔒</div>
                            </div>
                          );
                        })}
                        {STREAK_MILESTONES.length - earnedMilestones.length > 5 && (
                          <p className="text-center text-xs text-zinc-600 pt-2">
                            +{STREAK_MILESTONES.length - earnedMilestones.length - 5} more titles to unlock
                          </p>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 z-10 bg-[#09090b] p-4 sm:p-6 border-t border-white/5">
                <button
                  onClick={onClose}
                  className="w-full px-4 py-2.5 sm:py-3 rounded-lg bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 
                           text-white font-semibold text-sm transition-all shadow-lg shadow-violet-500/20"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default EarnedTitlesModal;
