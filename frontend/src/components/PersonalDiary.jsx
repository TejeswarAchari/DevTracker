import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit2, Heart, Sparkles } from 'lucide-react';
import api from '../utils/api';
import { useToast } from '../contexts/ToastContext';
import { format } from 'date-fns';

const MOODS = [
  { value: 'very-happy', emoji: '😄', label: 'Very Happy', color: 'from-yellow-400 to-amber-400' },
  { value: 'happy', emoji: '😊', label: 'Happy', color: 'from-cyan-400 to-blue-400' },
  { value: 'neutral', emoji: '😐', label: 'Neutral', color: 'from-gray-400 to-zinc-400' },
  { value: 'sad', emoji: '😢', label: 'Sad', color: 'from-blue-500 to-indigo-500' },
  { value: 'very-sad', emoji: '😭', label: 'Very Sad', color: 'from-indigo-600 to-purple-600' },
  { value: 'excited', emoji: '🤩', label: 'Excited', color: 'from-pink-400 to-rose-400' },
  { value: 'stressed', emoji: '😰', label: 'Stressed', color: 'from-red-500 to-orange-500' },
  { value: 'tired', emoji: '😴', label: 'Tired', color: 'from-slate-500 to-gray-600' },
];

const PersonalDiary = () => {
  const { addToast } = useToast();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    title: '',
    content: '',
    mood: 'happy',
    moodIntensity: 5,
    people: [],
    gratitude: '',
    reflection: ''
  });

  // Generate year options (2 past years + current + 3 future years = 6 years total)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 6 }, (_, i) => currentYear - 2 + i);
  const monthOptions = [
    { value: 'all', label: 'All Months' },
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ];

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/diary/year/${selectedYear}`);
      setEntries(response.data);
    } catch (err) {
      addToast('Failed to fetch diary entries', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, [selectedYear]);

  // Filter entries by month
  const filteredEntries = selectedMonth === 'all' 
    ? entries 
    : entries.filter(entry => {
        const entryMonth = format(new Date(entry.date), 'MM');
        return entryMonth === selectedMonth;
      });

  const handleSaveEntry = async () => {
    try {
      if (editingId) {
        await api.put(`/diary/${editingId}`, formData);
        addToast('Entry updated successfully', 'success');
      } else {
        await api.post('/diary', formData);
        addToast('Entry saved successfully', 'success');
      }
      
      setShowForm(false);
      setEditingId(null);
      setFormData({
        date: format(new Date(), 'yyyy-MM-dd'),
        title: '',
        content: '',
        mood: 'happy',
        moodIntensity: 5,
        people: [],
        gratitude: '',
        reflection: ''
      });
      fetchEntries();
    } catch (err) {
      addToast(err.response?.data?.msg || 'Failed to save entry', 'error');
    }
  };

  const handleDeleteEntry = async (id) => {
    if (!confirm('Permanently delete this entry? This action cannot be undone.')) return;
    try {
      await api.delete(`/diary/${id}`);
      addToast('Entry deleted successfully', 'success');
      fetchEntries();
    } catch (err) {
      addToast('Failed to delete entry', 'error');
    }
  };

  const handleEditEntry = (entry) => {
    setEditingId(entry._id);
    setFormData(entry);
    setShowForm(true);
  };

  return (
    <div className="p-6 bg-white text-slate-900 rounded-2xl">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header with Filters */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Personal Diary
            </h1>
            <p className="text-slate-600 mt-1">
              {filteredEntries.length} {filteredEntries.length === 1 ? 'entry' : 'entries'} found
            </p>
          </div>

          <motion.div 
            className="flex flex-col sm:flex-row flex-wrap gap-3 items-stretch sm:items-center w-full sm:w-auto"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.1 }
              }
            }}
            initial="hidden"
            animate="visible"
          >
            {/* Year Filter */}
            <motion.select
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-900 font-medium
                       focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all cursor-pointer"
            >
              {yearOptions.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </motion.select>

            {/* Month Filter */}
            <motion.select
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-900 font-medium
                       focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all cursor-pointer"
            >
              {monthOptions.map(month => (
                <option key={month.value} value={month.value}>{month.label}</option>
              ))}
            </motion.select>

            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(168, 85, 247, 0.3)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowForm(true)}
              className="w-full sm:w-auto px-6 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 
                       hover:to-pink-600 text-white font-bold transition-all flex items-center justify-center gap-2 shadow-lg 
                       shadow-purple-500/30"
            >
              <motion.div animate={{ rotate: [0, 90, 180, 270, 360] }} transition={{ duration: 2, repeat: Infinity }}>
                <Plus size={18} />
              </motion.div>
              New Entry
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Entries Timeline */}
        {loading ? (
          <motion.div 
            className="space-y-4"
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
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="h-48 rounded-2xl bg-slate-100 border border-slate-200 animate-pulse" 
              />
            ))}
          </motion.div>
        ) : filteredEntries.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16 bg-slate-50 rounded-2xl border border-slate-200"
          >
            <motion.div
              animate={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="mx-auto mb-4"
            >
              <Sparkles className="text-indigo-400" size={48} />
            </motion.div>
            <p className="text-slate-600 text-lg mb-6">No entries yet. Start your diary journey today!</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowForm(true)}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-rose-500 text-white font-semibold text-sm 
                       inline-flex items-center gap-2 transition-transform shadow-md"
            >
              <Plus size={18} />
              Write First Entry
            </motion.button>
          </motion.div>
        ) : (
          <motion.div 
            className="space-y-4"
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
            <AnimatePresence mode="popLayout">
              {filteredEntries.slice().reverse().map((entry, index) => {
                const mood = MOODS.find(m => m.value === entry.mood);
                return (
                  <motion.div
                    key={entry._id}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="group p-6 rounded-2xl bg-white border border-slate-200 shadow-sm transition-all cursor-pointer"
                  >
                    <motion.div 
                      className="flex items-start justify-between gap-4 mb-4"
                      whileHover={{ x: 5 }}
                    >
                      <div className="flex items-center gap-3">
                        <motion.div 
                          className={`p-3 rounded-xl bg-gradient-to-br ${mood?.color} text-white text-2xl`}
                          whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                          transition={{ duration: 0.5 }}
                        >
                          {mood?.emoji}
                        </motion.div>
                        <div>
                          <p className="text-sm text-purple-400 font-bold">
                            {format(new Date(entry.date), 'EEEE, MMMM dd, yyyy')}
                          </p>
                          {entry.title && (
                            <motion.h3 
                              className="text-xl font-bold text-white mt-1"
                              whileHover={{ color: "#8b5cf6" }}
                            >
                              {entry.title}
                            </motion.h3>
                          )}
                        </div>
                      </div>
                      <motion.div 
                        className="flex items-center gap-2"
                        initial={{ opacity: 0.7, x: 0 }}
                        whileHover={{ opacity: 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        <motion.button
                          whileHover={{ scale: 1.15, backgroundColor: 'rgba(59, 130, 246, 0.2)' }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleEditEntry(entry)}
                          className="p-2.5 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 transition-all text-blue-400 hover:text-blue-300 border border-blue-400/20"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.15, backgroundColor: 'rgba(239, 68, 68, 0.2)' }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDeleteEntry(entry._id)}
                          className="p-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 transition-all text-red-400 hover:text-red-300 border border-red-400/20"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </motion.button>
                      </motion.div>
                    </motion.div>

                    {entry.content && (
                      <motion.p 
                        className="text-zinc-300 leading-relaxed mb-4 whitespace-pre-wrap"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                      >
                        {entry.content}
                      </motion.p>
                    )}

                    {entry.gratitude && (
                      <motion.div 
                        className="mb-3 p-3 rounded-xl bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/20"
                        whileHover={{ backgroundColor: "rgba(251, 191, 36, 0.15)" }}
                      >
                        <p className="text-xs font-bold text-amber-400 mb-1">✨ Gratitude</p>
                        <p className="text-sm text-zinc-300">{entry.gratitude}</p>
                      </motion.div>
                    )}

                    {entry.reflection && (
                      <motion.div 
                        className="p-3 rounded-xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.15 }}
                        whileHover={{ backgroundColor: "rgba(34, 211, 238, 0.15)" }}
                      >
                        <p className="text-xs font-bold text-cyan-400 mb-1">💭 Reflection</p>
                        <p className="text-sm text-zinc-300">{entry.reflection}</p>
                      </motion.div>
                    )}

                    <motion.div 
                      className="mt-4 pt-3 border-t border-purple-500/20"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <p className="text-xs text-zinc-500">
                        Mood Intensity: <span className="text-purple-400 font-bold">{entry.moodIntensity}/10</span>
                      </p>
                    </motion.div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Form Modal */}
        <AnimatePresence>
          {showForm && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
                className="fixed inset-0 bg-black/60 backdrop-blur-md z-40"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
              >
                <div className="w-full max-w-3xl bg-white rounded-2xl border border-slate-200 p-8 space-y-5 max-h-[90vh] overflow-y-auto shadow-2xl shadow-slate-200">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-3xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                      {editingId ? 'Edit Entry' : 'New Diary Entry'}
                    </h2>
                        <span className="text-sm text-slate-500">
                      {format(new Date(formData.date), 'MMM dd, yyyy')}
                    </span>
                  </div>

                  <div className="space-y-4">
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-indigo-400 
                               text-slate-900 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-100"
                    />

                    <input
                      type="text"
                      placeholder="Title (optional)"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-indigo-400 
                               text-slate-900 placeholder-slate-400 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-100"
                    />

                    <textarea
                      placeholder="How was your day? Share your thoughts..."
                      value={formData.content}
                      onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                      rows="6"
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-indigo-400 
                               text-slate-900 placeholder-slate-400 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-100 resize-none"
                    />

                    <div>
                      <p className="text-sm font-bold text-slate-700 mb-3">How are you feeling?</p>
                      <div className="grid grid-cols-4 gap-3">
                        {MOODS.map(mood => (
                          <button
                            key={mood.value}
                            onClick={() => setFormData(prev => ({ ...prev, mood: mood.value }))}
                            className={`p-4 rounded-xl text-3xl transition-all border-2 ${
                              formData.mood === mood.value
                                ? 'border-indigo-400 bg-indigo-50 shadow-sm'
                                : 'border-slate-200 bg-white hover:border-indigo-300'
                            }`}
                            title={mood.label}
                          >
                            {mood.emoji}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-bold text-slate-700 mb-2 block">
                        Mood Intensity: {formData.moodIntensity}/10
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={formData.moodIntensity}
                        onChange={(e) => setFormData(prev => ({ ...prev, moodIntensity: parseInt(e.target.value) }))}
                        className="w-full h-2 rounded-full bg-slate-100 appearance-none cursor-pointer accent-indigo-500"
                      />
                    </div>

                    <textarea
                      placeholder="✨ Things I'm grateful for..."
                      value={formData.gratitude}
                      onChange={(e) => setFormData(prev => ({ ...prev, gratitude: e.target.value }))}
                      rows="3"
                      className="w-full px-4 py-3 rounded-xl bg-amber-50 border border-amber-100 
                               focus:border-amber-300 text-amber-900 placeholder-amber-400 transition-all focus:outline-none focus:ring-2 
                               focus:ring-amber-200 resize-none"
                    />

                    <textarea
                      placeholder="💭 Reflections and insights..."
                      value={formData.reflection}
                      onChange={(e) => setFormData(prev => ({ ...prev, reflection: e.target.value }))}
                      rows="3"
                      className="w-full px-4 py-3 rounded-xl bg-cyan-50 border border-cyan-100 
                               focus:border-cyan-300 text-cyan-900 placeholder-cyan-400 transition-all focus:outline-none focus:ring-2 
                               focus:ring-cyan-200 resize-none"
                    />
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-purple-500/20">
                    <button
                      onClick={() => {
                        setShowForm(false);
                        setEditingId(null);
                      }}
                      className="flex-1 px-6 py-3 rounded-xl bg-zinc-800/50 hover:bg-zinc-700/50 border border-zinc-700 
                               text-white font-bold transition-all"
                    >
                      Cancel
                    </button>
                    {editingId && (
                      <button
                        onClick={() => {
                          handleDeleteEntry(editingId);
                          setShowForm(false);
                          setEditingId(null);
                        }}
                        className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-red-500/20 to-red-600/20 
                                 hover:from-red-500/30 hover:to-red-600/30 border border-red-500/40 
                                 text-red-300 font-bold transition-all transform hover:scale-105"
                      >
                        Delete
                      </button>
                    )}
                    <button
                      onClick={handleSaveEntry}
                      className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 
                               hover:from-purple-600 hover:to-pink-600 text-white font-bold transition-all 
                               transform hover:scale-105 shadow-lg shadow-purple-500/30"
                    >
                      Save Entry
                    </button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PersonalDiary;
