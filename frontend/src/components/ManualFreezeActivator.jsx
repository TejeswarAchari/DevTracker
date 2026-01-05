import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Snowflake, Calendar, Shield, AlertCircle } from 'lucide-react';
import { format, subDays, startOfToday } from 'date-fns';

const ManualFreezeActivator = ({ isOpen, onClose, credits, onActivate }) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleActivate = async () => {
    if (!selectedDate) {
      setError('Please select a date');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onActivate(selectedDate);
      setSelectedDate('');
      setError('');
      onClose();
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to activate freeze');
    } finally {
      setLoading(false);
    }
  };

  // Calculate date limits: can only freeze past dates (up to 7 days ago)
  const today = format(startOfToday(), 'yyyy-MM-dd');
  const minDate = format(subDays(startOfToday(), 7), 'yyyy-MM-dd');

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
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-zinc-900 rounded-2xl border border-zinc-800 shadow-2xl z-50"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border-b border-zinc-800 p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                  <Shield className="text-cyan-400" size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Manual Freeze</h2>
                  <p className="text-sm text-zinc-500">Protect a missed day</p>
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
            <div className="p-6 space-y-6">
              {/* Credits Display with Animation */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(34, 211, 238, 0.2)' }}
                className="flex items-center justify-between p-4 bg-cyan-500/5 border border-cyan-500/20 rounded-xl transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  >
                    <Snowflake className="text-cyan-400" size={18} />
                  </motion.div>
                  <span className="text-sm font-semibold text-white">Available Credits</span>
                </div>
                <motion.span 
                  className="text-2xl font-bold text-cyan-400"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {credits}
                </motion.span>
              </motion.div>

              {/* Date Picker */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <label className="flex items-center gap-2 text-sm font-semibold text-zinc-300 mb-2">
                  <motion.div
                    animate={{ y: [0, -3, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Calendar size={16} />
                  </motion.div>
                  Select Date to Freeze
                </label>
                <motion.input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setError('');
                  }}
                  min={minDate}
                  max={today}
                  disabled={credits === 0}
                  whileFocus={{ boxShadow: '0 0 0 3px rgba(34, 211, 238, 0.2)' }}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white 
                           focus:outline-none focus:ring-2 focus:ring-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                />
                <p className="text-xs text-zinc-500 mt-2">
                  Can only freeze past dates (within last 7 days)
                </p>
              </motion.div>

              {/* Error Message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl"
                  >
                    <motion.div
                      animate={{ rotate: [0, -10, 10, -5, 0] }}
                      transition={{ duration: 0.5 }}
                    >
                      <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={16} />
                    </motion.div>
                    <p className="text-sm text-red-400">{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Info */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4"
              >
                <h4 className="text-sm font-semibold text-white mb-2">How it works:</h4>
                <motion.ul 
                  className="text-xs text-zinc-400 space-y-1"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: { staggerChildren: 0.05 }
                    }
                  }}
                >
                  {[
                    '• Select a past date you want to protect',
                    '• One freeze credit will be consumed',
                    '• Your streak will be maintained as if you logged that day',
                    '• Cannot freeze dates more than 7 days ago',
                    '• Cannot freeze dates with existing logs'
                  ].map((item, idx) => (
                    <motion.li
                      key={idx}
                      variants={{
                        hidden: { opacity: 0, x: -10 },
                        visible: { opacity: 1, x: 0 }
                      }}
                    >
                      {item}
                    </motion.li>
                  ))}
                </motion.ul>
              </motion.div>
            </div>

            {/* Footer */}
            <motion.div 
              className="border-t border-zinc-800 p-6 flex gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <motion.button
                onClick={onClose}
                whileHover={{ scale: 1.02, boxShadow: '0 0 15px rgba(113, 113, 122, 0.3)' }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 font-semibold text-white transition-colors"
              >
                Cancel
              </motion.button>
              <motion.button
                onClick={handleActivate}
                disabled={loading || credits === 0 || !selectedDate}
                whileHover={!loading && credits > 0 && selectedDate ? { scale: 1.02, boxShadow: '0 0 30px rgba(34, 211, 238, 0.4)' } : {}}
                whileTap={!loading && credits > 0 && selectedDate ? { scale: 0.98 } : {}}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 
                         font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <motion.span
                  animate={loading ? { opacity: [1, 0.5, 1] } : {}}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  {loading ? 'Activating...' : 'Activate Freeze'}
                </motion.span>
              </motion.button>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ManualFreezeActivator;
