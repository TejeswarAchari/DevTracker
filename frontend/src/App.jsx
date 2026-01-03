import React, { useState, useEffect, useMemo, useRef } from "react";
import { ChevronDown, LogOut } from "lucide-react";
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
     INIT
  ============================== */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) fetchData();
    else setLoading(false);
  }, []);

  const fetchData = async (retries = 3) => {
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
      console.error(err);
      
      // Retry logic for network errors
      if (retries > 0 && err.code === 'ERR_NETWORK') {
        console.log(`Retrying... (${retries} attempts left)`);
        setTimeout(() => fetchData(retries - 1), 2000);
        return;
      }
      
      localStorage.removeItem("token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

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
        .catch(err => console.error('Failed to earn freeze credit:', err));
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
     MANUAL FREEZE ACTIVATION
  ============================== */
  const handleManualFreeze = async (date) => {
    try {
      const res = await api.post('/freeze/activate', { date });
      setFreezeData(res.data);
      await fetchData(); // Refresh data to reflect the freeze in calculations
    } catch (err) {
      throw err; // Let the component handle the error display
    }
  };

  /* ==============================
     DATA EXPORT
  ============================== */
  const handleExport = async () => {
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
      console.error('Export failed:', err);
      alert('Failed to export data. Please try again.');
    }
  };

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
    <div className="min-h-screen text-zinc-100 p-6 md:p-12 relative overflow-x-hidden selection:bg-cyan-500/30">
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
      />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
          <div>
            <h1 className="text-5xl font-black tracking-tighter mb-1">
              Dev
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400 animate-pulse">
                Tracker
              </span>
            </h1>
            <p className="text-zinc-500 font-medium text-sm">
              <span className="text-cyan-400">●</span> Logged {dashboardStats.yearLogs} Activities over {dashboardStats.yearActiveDays} days in {year}
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Year Selector */}
            <div className="relative">
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="appearance-none bg-black/40 border border-white/10 hover:border-white/20 text-white pl-5 pr-12 py-2.5 rounded-xl font-bold outline-none focus:ring-2 focus:ring-violet-500/50 transition-all cursor-pointer"
              >
                {yearsList.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
            </div>

            {/* Streak Freeze */}
            {freezeData && (
              <StreakFreeze 
                credits={freezeData.credits}
                onInfoClick={() => setShowFreezeInfo(true)}
                onManualActivateClick={() => setShowManualFreeze(true)}
              />
            )}

            {/* Logout */}
            <button
              onClick={() => {
                localStorage.removeItem("token");
                setUser(null);
              }}
              className="p-3 rounded-xl bg-white/5 hover:bg-red-500/10 hover:text-red-400 text-zinc-400 transition-colors border border-transparent hover:border-red-500/20"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>

        {/* STATS */}
        <Stats stats={dashboardStats} year={year} />

        {/* MONTHLY OVERVIEW */}
        <MonthlyOverview stats={dashboardStats} year={year} />

        {/* HEATMAP */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-1 bg-gradient-to-b from-cyan-500 to-violet-500 rounded-full" />
            <h2 className="text-xl font-bold text-white">
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
