import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Snowflake, Shield, Award, TrendingUp, Zap, Info } from 'lucide-react';

const FreezeInfoModal = ({ isOpen, onClose, credits, totalEarned, totalUsed }) => {
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
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed top-[5%] left-1/2 -translate-x-1/2 w-full max-w-md mx-4 bg-zinc-900 rounded-xl border border-zinc-800 shadow-2xl z-50 max-h-[85vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-zinc-900/95 backdrop-blur-sm border-b border-zinc-800 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                  <Snowflake className="text-cyan-400" size={18} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Streak Freeze</h2>
                  <p className="text-xs text-zinc-500">Protect your progress</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center transition-colors"
              >
                <X size={18} className="text-zinc-400" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
              {/* Current Stats */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-lg p-3 text-center">
                  <div className="text-xl font-bold text-cyan-400">{credits}</div>
                  <div className="text-[10px] text-zinc-500 mt-0.5">Available</div>
                </div>
                <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-3 text-center">
                  <div className="text-xl font-bold text-green-400">{totalEarned}</div>
                  <div className="text-[10px] text-zinc-500 mt-0.5">Earned</div>
                </div>
                <div className="bg-purple-500/5 border border-purple-500/20 rounded-lg p-3 text-center">
                  <div className="text-xl font-bold text-purple-400">{totalUsed}</div>
                  <div className="text-[10px] text-zinc-500 mt-0.5">Used</div>
                </div>
              </div>

              {/* How It Works */}
              <div>
                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <Info size={16} className="text-cyan-400" />
                  How It Works
                </h3>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                      <Award className="text-green-400" size={16} />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white mb-0.5">Earn Credits</h4>
                      <p className="text-xs text-zinc-400">
                        Earn 1 freeze credit for every 7-day streak milestone (7, 14, 21, 28...). 
                        Max 5 credits can be stored.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center flex-shrink-0">
                      <Shield className="text-cyan-400" size={16} />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white mb-0.5">Auto-Protection</h4>
                      <p className="text-xs text-zinc-400">
                        If you miss a day, a freeze credit will automatically protect your streak. 
                        No action needed - we've got your back!
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="text-purple-400" size={16} />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white mb-0.5">Keep Going</h4>
                      <p className="text-xs text-zinc-400">
                        Your streak continues! Frozen days count toward your total. 
                        Get back on track to keep earning more credits.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pro Tip */}
              <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/30 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <Zap className="text-cyan-400 flex-shrink-0 mt-0.5" size={14} />
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-0.5">Pro Tip</h4>
                    <p className="text-xs text-zinc-400">
                      Build up your freeze credits during strong streaks. They'll protect you during 
                      busy periods, vacations, or unexpected breaks!
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-zinc-900/95 backdrop-blur-sm border-t border-zinc-800 p-4">
              <button
                onClick={onClose}
                className="w-full py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 font-semibold text-white transition-all text-sm"
              >
                Got it!
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default FreezeInfoModal;
