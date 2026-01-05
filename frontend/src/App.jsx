import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { ChevronDown, LogOut, Plus } from "lucide-react";
import { format, isToday, isYesterday, parseISO } from "date-fns";

// Components
import Heatmap from "./components/Heatmap";
import Stats from "./components/Stats";
import LogModal from "./components/LogModal";
import MonthlyOverview from "./components/MonthlyOverview";
import AuthScreen from "./components/AuthScreen";
import ErrorBoundary from "./components/ErrorBoundary";
import LoadingSkeleton from "./components/LoadingSkeleton";
import StreakFreeze from "./components/StreakFreeze";
import FreezeInfoModal from "./components/FreezeInfoModal";
import ManualFreezeActivator from "./components/ManualFreezeActivator";
import UtilityBar from "./components/UtilityBar";
import FeaturesHub from "./components/FeaturesHub";
import YearEndCountdown from "./components/YearEndCountdown";

// Logic & Utils
import api from "./utils/api";
import { calculateStats, shouldEarnFreezeCredit } from "./utils/analytics";
import { useToast } from "./contexts/ToastContext";

function App() {
  const { addToast } = useToast();
  
  /* ==============================
     STATE
  ============================== */
  const [user, setUser] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const [selectedDate, setSelectedDate] = useState(null);
  const [year, setYear] = useState(new Date().getFullYear());
  const [showFeaturesHub, setShowFeaturesHub] = useState(false);
  
  // Freeze system
  const [freezeData, setFreezeData] = useState(null);
  const [showFreezeInfo, setShowFreezeInfo] = useState(false);
  const [showManualFreeze, setShowManualFreeze] = useState(false);
  const [lastEarnedStreak, setLastEarnedStreak] = useState(0);
  const prevUsedCount = useRef(0);

  /* ==============================
     ONLINE/OFFLINE DETECTION
  ============================== */
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  /* ==============================
     INIT - Memoized fetchData
  ============================== */
  const fetchData = useCallback(async (retries = 3) => {
    try {
      const [daysRes, freezeRes] = await Promise.all([
        api.get("/days"),
        api.get("/freeze")
      ]);
      // Handle paginated or direct response
      const daysData = daysRes.data.data || daysRes.data;
      setData(daysData);
      setFreezeData(freezeRes.data);
      setUser(true);
    } catch (err) {
      // Retry logic for network errors
      if (retries > 0 && err.code === 'ERR_NETWORK') {
        setTimeout(() => fetchData(retries - 1), 2000);
        return;
      }
      
      localStorage.removeItem("token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchData();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ==============================
     INTELLIGENCE ENGINE
  ============================== */
  const dashboardStats = useMemo(() => {
    if (!data.length) {
      return {
        yearLogs: 0,
        yearActiveDays: 0,
        currentStreak: 0,
        maxStreak: 0,
        monthly: {
          activeDays: 0,
          totalLogs: 0,
          progress: 0,
          name: "",
        },
      };
    }

    // Global analytics (streaks + monthly)
    const analytics = calculateStats(data, year, freezeData);

    // Year-specific stats
    const yearStr = String(year);
    const yearRecords = data.filter((d) =>
      d.date.startsWith(yearStr)
    );

    const yearLogs = yearRecords.reduce(
      (acc, curr) => acc + (curr.logs?.length || 0),
      0
    );

    const yearActiveDays = yearRecords.length;

    return {
      ...analytics,
      yearLogs,
      yearActiveDays,
    };
  }, [data, year, freezeData]);

  /* ==============================
     AUTO-EARN FREEZE CREDITS
  ============================== */
  useEffect(() => {
    if (!dashboardStats.currentStreak || !freezeData) return;
    
    const { shouldEarn, milestone } = shouldEarnFreezeCredit(
      dashboardStats.currentStreak,
      lastEarnedStreak
    );
    
    if (shouldEarn && freezeData.credits < 5) {
      api.post('/freeze/earn', { currentStreak: dashboardStats.currentStreak })
        .then(res => {
          setFreezeData(res.data);
          setLastEarnedStreak(milestone);
          addToast(`🎉 Earned freeze credit! ${milestone}-day milestone reached`, 'freeze');
        })
        .catch(err => { /* Silent fail - not critical */ });
    }
  }, [dashboardStats.currentStreak, freezeData, lastEarnedStreak]);

  /* ==============================
     DETECT AUTO-CONSUMED FREEZES
  ============================== */
  useEffect(() => {
    if (!freezeData || !freezeData.usedDates) return;
    
    const currentUsedCount = freezeData.usedDates.length;
    
    if (prevUsedCount.current > 0 && currentUsedCount > prevUsedCount.current) {
      addToast('🛡️ Freeze credit auto-applied to protect your streak!', 'freeze');
    }
    
    prevUsedCount.current = currentUsedCount;
  }, [freezeData?.usedDates?.length]);

  /* ==============================
     MANUAL FREEZE ACTIVATION - Memoized
  ============================== */
  const handleManualFreeze = useCallback(async (date) => {
    try {
      const res = await api.post('/freeze/activate', { date });
      setFreezeData(res.data);
      await fetchData(); // Refresh data to reflect the freeze in calculations
    } catch (err) {
      throw err; // Let the component handle the error display
    }
  }, [fetchData]);

  /* ==============================
     DATA EXPORT - Memoized
  ============================== */
  const handleExport = useCallback(async () => {
    try {
      const res = await api.get('/export');
      const dataStr = JSON.stringify(res.data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `devtracker-backup-${format(new Date(), 'yyyy-MM-dd')}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to export data. Please try again.');
    }
  }, []);

  /* ==============================
     LOGOUT HANDLER - Memoized
  ============================== */
  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    setUser(null);
  }, []);

  /* ==============================
     STREAK WARNING CHECK
  ============================== */
  const streakWarning = useMemo(() => {
    if (!data.length || !dashboardStats.currentStreak) return false;
    
    // Check if user logged today
    const today = format(new Date(), 'yyyy-MM-dd');
    const hasLoggedToday = data.some(day => day.date === today && day.logs.length > 0);
    
    // Warn if haven't logged today and have active streak
    return !hasLoggedToday && dashboardStats.currentStreak > 0;
  }, [data, dashboardStats.currentStreak]);

  /* ==============================
     KEYBOARD SHORTCUTS
  ============================== */
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Ctrl/Cmd + K: Toggle log modal for today
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSelectedDate(format(new Date(), 'yyyy-MM-dd'));
      }
      // Ctrl/Cmd + E: Export data
      if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        handleExport();
      }
      // Escape: Close modals
      if (e.key === 'Escape') {
        setSelectedDate(null);
        setShowFreezeInfo(false);
        setShowManualFreeze(false);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  /* ==============================
     YEAR SELECTOR
  ============================== */
  const yearsList = Array.from({ length: 25 }, (_, i) => 2026 + i);
  const currentYear = new Date().getFullYear();
  if (!yearsList.includes(currentYear)) yearsList.unshift(currentYear);
  yearsList.sort((a, b) => a - b);

  /* ==============================
     AUTH VIEW
  ============================== */
  if (!user && !loading) {
    return <AuthScreen onLogin={fetchData} />;
  }

  /* ==============================
     LOADING STATE
  ============================== */
  if (loading) {
    return <LoadingSkeleton />;
  }

  /* ==============================
     DASHBOARD
  ============================== */
  return (
    <div className="min-h-screen text-zinc-100 p-4 sm:p-6 md:p-12 relative overflow-x-hidden selection:bg-cyan-500/30">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-violet-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-cyan-600/10 rounded-full blur-[120px]" />
      </div>

      {/* Utility Bar */}
      <UtilityBar 
        isOnline={isOnline}
        onExport={handleExport}
        streakWarning={streakWarning}
        onFeaturesClick={() => setShowFeaturesHub(true)}
      />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* HEADER */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 sm:mb-10 gap-4 sm:gap-6">
          <div className="w-full sm:w-auto">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter mb-1">
              Dev
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400 animate-pulse">
                Tracker
              </span>
            </h1>
            <p className="text-zinc-500 font-medium text-xs sm:text-sm">
              <span className="text-cyan-400">●</span> Logged {dashboardStats.yearLogs} Activities over {dashboardStats.yearActiveDays} days in {year}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
            {/* Year Selector */}
            <div className="relative w-full sm:w-auto sm:min-w-[120px]">
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full appearance-none bg-black/40 border border-white/10 hover:border-white/20 text-white px-3 sm:px-5 py-2.5 rounded-xl font-bold outline-none focus:ring-2 focus:ring-violet-500/50 transition-all cursor-pointer text-sm sm:text-base"
              >
                {yearsList.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
            </div>

            {/* Streak Freeze */}
            {freezeData && (
              <div className="w-full sm:w-auto">
                <StreakFreeze 
                  credits={freezeData.credits}
                  onInfoClick={() => setShowFreezeInfo(true)}
                  onManualActivateClick={() => setShowManualFreeze(true)}
                />
              </div>
            )}

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="p-2 sm:p-3 rounded-xl bg-white/5 hover:bg-red-500/10 hover:text-red-400 text-zinc-400 transition-colors border border-transparent hover:border-red-500/20"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>

        {/* STATS */}
        <Stats stats={dashboardStats} year={year} />

        {/* YEAR-END COUNTDOWN */}
        <YearEndCountdown />

        {/* MONTHLY OVERVIEW */}
        <MonthlyOverview stats={dashboardStats} year={year} />

        {/* HEATMAP */}
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="h-6 sm:h-8 w-1 bg-gradient-to-b from-cyan-500 to-violet-500 rounded-full" />
            <h2 className="text-lg sm:text-xl font-bold text-white">
              Yearly Activity
            </h2>
          </div>
          <Heatmap
            data={data}
            year={year}
            onDayClick={setSelectedDate}
          />
        </div>
      </div>

      {/* LOG MODAL */}
      <LogModal
        isOpen={!!selectedDate}
        onClose={() => setSelectedDate(null)}
        date={selectedDate}
        refreshData={fetchData}
        existingData={data.find((d) => d.date === selectedDate)}
      />

      {/* FREEZE INFO MODAL */}
      {freezeData && (
        <FreezeInfoModal
          isOpen={showFreezeInfo}
          onClose={() => setShowFreezeInfo(false)}
          credits={freezeData.credits}
          totalEarned={freezeData.totalEarned}
          totalUsed={freezeData.totalUsed}
        />
      )}

      {/* MANUAL FREEZE ACTIVATOR */}
      {freezeData && (
        <ManualFreezeActivator
          isOpen={showManualFreeze}
          onClose={() => setShowManualFreeze(false)}
          credits={freezeData.credits}
          onActivate={handleManualFreeze}
        />
      )}

      {/* FEATURES HUB */}
      {showFeaturesHub && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm">
          <div className="absolute top-4 right-4">
            <button
              onClick={() => setShowFeaturesHub(false)}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all"
            >
              ✕
            </button>
          </div>
          <div className="h-screen overflow-y-auto">
            <FeaturesHub />
          </div>
        </div>
      )}

      {/* MOBILE FAB - Log Today's Activity */}
      <motion.button
        onClick={() => setSelectedDate(format(new Date(), 'yyyy-MM-dd'))}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.1, boxShadow: '0 0 30px rgba(139, 92, 246, 0.6)' }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="md:hidden fixed bottom-6 right-6 z-30 p-4 rounded-full bg-gradient-to-r from-violet-600 to-cyan-600 
                 text-white shadow-2xl shadow-violet-500/40 flex items-center justify-center"
        aria-label="Log today's activity"
      >
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-400 to-cyan-400 opacity-0"
        />
        <motion.div
          animate={{ rotate: [0, -360] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          <Plus size={28} strokeWidth={3} />
        </motion.div>
      </motion.button>
    </div>
  );
}

export default function AppWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}
