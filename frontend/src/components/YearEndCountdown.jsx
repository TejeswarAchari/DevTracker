import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Sparkles } from 'lucide-react';
import api from '../utils/api';

const YearEndCountdown = () => {
  const [countdown, setCountdown] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCountdown = async () => {
      try {
        const response = await api.get('/countdown/year-end');
        setCountdown(response.data);
      } catch (err) {
        // Silent fail - countdown is non-critical
      } finally {
        setLoading(false);
      }
    };

    fetchCountdown();
    const interval = setInterval(fetchCountdown, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  if (loading || !countdown) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative p-6 rounded-2xl bg-gradient-to-br from-zinc-900/50 to-zinc-800/50 
                 border border-white/10 backdrop-blur-xl"
      >
        <div className="h-20 bg-gradient-to-r from-white/5 to-transparent rounded-lg animate-pulse" />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="relative p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 via-cyan-500/5 to-purple-500/10 
               border border-purple-500/20 backdrop-blur-xl overflow-hidden group hover:border-purple-500/40 transition-colors"
    >
      {/* Subtle Animated Background */}
      <motion.div
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%'],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          repeatType: 'reverse',
        }}
        className="absolute inset-0 opacity-10"
        style={{
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(6, 182, 212, 0.3), rgba(139, 92, 246, 0.3))',
          backgroundSize: '200% 200%',
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex items-center gap-4">
        {/* Icon */}
        <div className="flex-shrink-0 p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 
                      border border-purple-500/30">
          <Calendar className="w-6 h-6 text-purple-300" />
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <p className="text-xs font-semibold text-purple-300 uppercase tracking-wider">
              Time Remaining in {countdown.currentYear}
            </p>
          </div>

          <div className="flex items-baseline gap-3">
            <motion.h2 
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-4xl md:text-5xl font-black text-transparent bg-clip-text 
                       bg-gradient-to-r from-purple-300 via-cyan-300 to-purple-300"
            >
              {countdown.daysRemaining}
            </motion.h2>
            <p className="text-sm text-zinc-400 font-medium">
              {countdown.daysRemaining === 1 ? 'day left' : 'days left'}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mt-3">
            <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${((365 - countdown.daysRemaining) / 365) * 100}%` }}
                transition={{ duration: 2, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-purple-500 via-cyan-500 to-purple-500"
              />
            </div>
            <p className="text-xs text-zinc-500 mt-1.5">
              {Math.round(((365 - countdown.daysRemaining) / 365) * 100)}% of the year complete
            </p>
          </div>
        </div>

        {/* Decorative Element */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute -right-8 -top-8 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-cyan-500/10 
                   rounded-full blur-2xl"
        />
      </div>
    </motion.div>
  );
};

export default YearEndCountdown;

