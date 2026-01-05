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
              <motion.div 
                className="grid grid-cols-3 gap-2"
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
                <motion.div 
                  variants={{
                    hidden: { opacity: 0, y: 20, scale: 0.95 },
                    visible: { opacity: 1, y: 0, scale: 1 }
                  }}
                  whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(34, 211, 238, 0.3)' }}
                  className="bg-cyan-500/5 border border-cyan-500/20 rounded-lg p-3 text-center cursor-pointer transition-all"
                >
                  <motion.div 
                    className="text-xl font-bold text-cyan-400"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {credits}
                  </motion.div>
                  <div className="text-[10px] text-zinc-500 mt-0.5">Available</div>
                </motion.div>
                <motion.div 
                  variants={{
                    hidden: { opacity: 0, y: 20, scale: 0.95 },
                    visible: { opacity: 1, y: 0, scale: 1 }
                  }}
                  whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(34, 211, 238, 0.3)' }}
                  className="bg-violet-500/5 border border-violet-500/20 rounded-lg p-3 text-center cursor-pointer transition-all"
                >
                  <motion.div 
                    className="text-xl font-bold text-violet-400"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.1 }}
                  >
                    {totalEarned}
                  </motion.div>
                  <div className="text-[10px] text-zinc-500 mt-0.5">Earned</div>
                </motion.div>
                <motion.div 
                  variants={{
                    hidden: { opacity: 0, y: 20, scale: 0.95 },
                    visible: { opacity: 1, y: 0, scale: 1 }
                  }}
                  whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(139, 92, 246, 0.3)' }}
                  className="bg-purple-500/5 border border-purple-500/20 rounded-lg p-3 text-center cursor-pointer transition-all"
                >
                  <motion.div 
                    className="text-xl font-bold text-purple-400"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}
                  >
                    {totalUsed}
                  </motion.div>
                  <div className="text-[10px] text-zinc-500 mt-0.5">Used</div>
                </motion.div>
              </motion.div>

              {/* How It Works */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <Info size={16} className="text-cyan-400" />
                  How It Works
                </h3>
                <motion.div 
                  className="space-y-3"
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
                  <motion.div 
                    variants={{
                      hidden: { opacity: 0, x: -20, scale: 0.95 },
                      visible: { opacity: 1, x: 0, scale: 1 }
                    }}
                    whileHover={{ x: 5, scale: 1.02 }}
                    className="flex gap-2 cursor-pointer transition-all"
                  >
                    <motion.div 
                      className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center flex-shrink-0"
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Award className="text-violet-400" size={16} />
                    </motion.div>
                    <div>
                      <h4 className="text-sm font-semibold text-white mb-0.5">Earn Credits</h4>
                      <p className="text-xs text-zinc-400">
                        Earn 1 freeze credit for every 7-day streak milestone (7, 14, 21, 28...). 
                        Max 5 credits can be stored.
                      </p>
                    </div>
                  </motion.div>

                  <motion.div 
                    variants={{
                      hidden: { opacity: 0, x: -20, scale: 0.95 },
                      visible: { opacity: 1, x: 0, scale: 1 }
                    }}
                    whileHover={{ x: 5, scale: 1.02 }}
                    className="flex gap-2 cursor-pointer transition-all"
                  >
                    <motion.div 
                      className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center flex-shrink-0"
                      whileHover={{ rotate: -360, scale: 1.1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Shield className="text-cyan-400" size={16} />
                    </motion.div>
                    <div>
                      <h4 className="text-sm font-semibold text-white mb-0.5">Auto-Protection</h4>
                      <p className="text-xs text-zinc-400">
                        If you miss a day, a freeze credit will automatically protect your streak. 
                        No action needed - we've got your back!
                      </p>
                    </div>
                  </motion.div>

                  <motion.div 
                    variants={{
                      hidden: { opacity: 0, x: -20, scale: 0.95 },
                      visible: { opacity: 1, x: 0, scale: 1 }
                    }}
                    whileHover={{ x: 5, scale: 1.02 }}
                    className="flex gap-2 cursor-pointer transition-all"
                  >
                    <motion.div 
                      className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0"
                      whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <TrendingUp className="text-purple-400" size={16} />
                    </motion.div>
                    <div>
                      <h4 className="text-sm font-semibold text-white mb-0.5">Keep Going</h4>
                      <p className="text-xs text-zinc-400">
                        Your streak continues! Frozen days count toward your total. 
                        Get back on track to keep earning more credits.
                      </p>
                    </div>
                  </motion.div>
                </motion.div>
              </motion.div>

              {/* Pro Tip */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(34, 211, 238, 0.2)' }}
                className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/30 rounded-lg p-3 transition-all"
              >
                <div className="flex items-start gap-2">
                  <motion.div
                    animate={{ rotate: [0, 20, -20, 0], scale: [1, 1.15, 1.15, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Zap className="text-cyan-400 flex-shrink-0 mt-0.5" size={14} />
                  </motion.div>
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-0.5">Pro Tip</h4>
                    <p className="text-xs text-zinc-400">
                      Build up your freeze credits during strong streaks. They'll protect you during 
                      busy periods, vacations, or unexpected breaks!
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Footer */}
            <motion.div 
              className="sticky bottom-0 bg-zinc-900/95 backdrop-blur-sm border-t border-zinc-800 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <motion.button
                onClick={onClose}
                whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(34, 211, 238, 0.4)' }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 font-semibold text-white transition-all text-sm"
              >
                Got it!
              </motion.button>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default FreezeInfoModal;
