import React, { useState, useEffect, useMemo } from "react";
import { ChevronDown, LogOut } from "lucide-react";

// Components
import Heatmap from "./components/Heatmap";
import Stats from "./components/Stats";
import LogModal from "./components/LogModal";
import MonthlyOverview from "./components/MonthlyOverview";
import AuthScreen from "./components/AuthScreen";

// Logic & Utils
import api from "./utils/api";
import { calculateStats } from "./utils/analytics";

function App() {
  /* ==============================
     STATE
  ============================== */
  const [user, setUser] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedDate, setSelectedDate] = useState(null);
  const [year, setYear] = useState(new Date().getFullYear());

  /* ==============================
     INIT
  ============================== */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) fetchData();
    else setLoading(false);
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get("/days");
      setData(res.data);
      setUser(true);
    } catch (err) {
      console.error(err);
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
    const analytics = calculateStats(data);

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
  }, [data, year]);

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
     DASHBOARD
  ============================== */
  return (
    <div className="min-h-screen text-zinc-100 p-6 md:p-12 relative overflow-x-hidden selection:bg-cyan-500/30">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-violet-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-cyan-600/10 rounded-full blur-[120px]" />
      </div>

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
              <span className="text-cyan-400">●</span> Production Ready System
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
        <MonthlyOverview stats={dashboardStats} />

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
    </div>
  );
}

export default App;
