import React, { useState, useCallback, memo, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Calendar } from "lucide-react";
import LogItem from "./LogItem";
import api from "../utils/api";
import clsx from "clsx";

const CATEGORIES = ["Coding", "Study", "Health", "Personal"];

const LogModal = memo(({ isOpen, onClose, date, refreshData, existingData }) => {
  const [formData, setFormData] = useState({
    title: "",
    category: "Coding",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const logs = useMemo(() => existingData?.logs || [], [existingData?.logs]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setError("");
    
    // Client-side validation
    if (!formData.title.trim()) {
      setError("Title is required");
      return;
    }
    
    if (formData.title.length > 200) {
      setError("Title must be less than 200 characters");
      return;
    }
    
    setLoading(true);
    try {
      await api.post("/log", { ...formData, date, description: "" });
      setFormData({ title: "", category: "Coding" });
      await refreshData();
    } catch (err) {
      const errorMsg = err.response?.data?.msg || err.response?.data?.errors?.[0]?.msg || "Failed to create log. Please try again.";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [formData, date, refreshData]);

  const handleDelete = useCallback(async (logId) => {
    try {
      await api.delete(`/log/${date}/${logId}`);
      await refreshData();
    } catch (err) {
      const errorMsg = err.response?.data?.msg || "Failed to delete log. Please try again.";
      setError(errorMsg);
    }
  }, [date, refreshData]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Panel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg overflow-hidden rounded-2xl sm:rounded-3xl bg-[#09090b] border border-white/10 shadow-2xl shadow-violet-500/10"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/5 bg-white/[0.02]">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10 text-primary">
                <Calendar size={18} />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  Daily Log
                </h2>
                <p className="text-xs text-zinc-500 font-mono mt-0.5">
                  {date}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-full transition-colors flex-shrink-0"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-4 sm:p-6">
            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold text-center"
              >
                {error}
              </motion.div>
            )}
            
            {/* Log List */}
            <div className="mb-6 sm:mb-8 max-h-[200px] sm:max-h-[280px] overflow-y-auto pr-2 custom-scrollbar space-y-2">
              {logs.length > 0 ? (
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: { staggerChildren: 0.05 }
                    }
                  }}
                  className="space-y-2"
                >
                  {logs.map((log, idx) => (
                    <LogItem
                      key={log._id}
                      log={log}
                      onDelete={handleDelete}
                      index={idx}
                    />
                  ))}
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-8 sm:py-10 border-2 border-dashed border-white/5 rounded-2xl"
                >
                  <p className="text-zinc-500 text-sm">
                    No activity recorded yet.
                  </p>
                  <p className="text-zinc-600 text-xs mt-1">
                    Be the 1% who shows up.
                  </p>
                </motion.div>
              )}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              <div className="space-y-2 sm:space-y-3">
                <input
                  autoFocus
                  className="w-full bg-transparent border-b border-zinc-800 py-2 text-base sm:text-lg text-white placeholder-zinc-600 focus:border-primary focus:outline-none transition-colors"
                  placeholder="What did you achieve today?"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                />

                {/* Category Selector */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, category: cat })
                      }
                      className={clsx(
                        "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200",
                        formData.category === cat
                          ? "bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.3)] scale-105"
                          : "bg-white/5 text-zinc-400 border-transparent hover:bg-white/10"
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <button
                disabled={loading}
                type="submit"
                className="w-full mt-3 sm:mt-4 bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white font-bold py-2.5 sm:py-3 rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-all transform active:scale-95 text-sm sm:text-base"
              >
                {loading ? (
                  <span className="animate-spin">⏳</span>
                ) : (
                  <Plus size={18} />
                )}
                Add Entry
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
});

LogModal.displayName = 'LogModal';

export default LogModal;
