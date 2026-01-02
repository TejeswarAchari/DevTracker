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
              {/* Credits Display */}
              <div className="flex items-center justify-between p-4 bg-cyan-500/5 border border-cyan-500/20 rounded-xl">
                <div className="flex items-center gap-2">
                  <Snowflake className="text-cyan-400" size={18} />
                  <span className="text-sm font-semibold text-white">Available Credits</span>
                </div>
                <span className="text-2xl font-bold text-cyan-400">{credits}</span>
              </div>

              {/* Date Picker */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-zinc-300 mb-2">
                  <Calendar size={16} />
                  Select Date to Freeze
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setError('');
                  }}
                  min={minDate}
                  max={today}
                  disabled={credits === 0}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white 
                           focus:outline-none focus:ring-2 focus:ring-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <p className="text-xs text-zinc-500 mt-2">
                  Can only freeze past dates (within last 7 days)
                </p>
              </div>

              {/* Error Message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl"
                  >
                    <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={16} />
                    <p className="text-sm text-red-400">{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Info */}
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-white mb-2">How it works:</h4>
                <ul className="text-xs text-zinc-400 space-y-1">
                  <li>• Select a past date you want to protect</li>
                  <li>• One freeze credit will be consumed</li>
                  <li>• Your streak will be maintained as if you logged that day</li>
                  <li>• Cannot freeze dates more than 7 days ago</li>
                  <li>• Cannot freeze dates with existing logs</li>
                </ul>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-zinc-800 p-6 flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 font-semibold text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleActivate}
                disabled={loading || credits === 0 || !selectedDate}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 
                         font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Activating...' : 'Activate Freeze'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ManualFreezeActivator;
