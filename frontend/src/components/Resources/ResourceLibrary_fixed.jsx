import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Grid3X3, List, Download, Sparkles } from 'lucide-react';
import api from '../../utils/api';
import { useToast } from '../../contexts/ToastContext';
import ResourceForm from './ResourceForm';
import ResourceCard from './ResourceCard';

const normalizeResourceResponse = (response) => {
  const payload = response?.data;

  if (Array.isArray(payload)) {
    return { data: payload, pagination: {} };
  }

  const data = payload?.data || payload?.resources || [];
  const pagination = payload?.pagination || {};

  return { data, pagination };
};

const ResourceLibrary = () => {
  const { addToast } = useToast();

  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [showForm, setShowForm] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery.trim()), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch resources when debounced search changes
  useEffect(() => {
    const fetchResources = async () => {
      if (!isMountedRef.current) return;
      
      setLoading(true);
      
      try {
        const endpoint = debouncedSearch
          ? `/resources/search/${encodeURIComponent(debouncedSearch)}`
          : '/resources';

        const response = await api.get(endpoint, { params: { page: 1 } });
        
        if (!isMountedRef.current) return;
        
        const { data, pagination } = normalizeResourceResponse(response);
        
        setResources(data);
        setHasMore((pagination.page || 1) < (pagination.pages || 1));
        setPage(1);
      } catch (err) {
        if (!isMountedRef.current) return;
        console.error('Fetch resources failed', err);
        addToast('Failed to load resources', 'error');
        setHasMore(false);
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    };

    fetchResources();
  }, [debouncedSearch, addToast]);

  const handleLoadMore = async () => {
    if (!isMountedRef.current) return;
    
    setLoading(true);
    try {
      const endpoint = debouncedSearch
        ? `/resources/search/${encodeURIComponent(debouncedSearch)}`
        : '/resources';

      const response = await api.get(endpoint, { params: { page: page + 1 } });
      
      if (!isMountedRef.current) return;
      
      const { data, pagination } = normalizeResourceResponse(response);

      setResources(prev => [...prev, ...data]);
      setHasMore((pagination.page || 1) < (pagination.pages || 1));
      setPage(page + 1);
    } catch (err) {
      if (!isMountedRef.current) return;
      console.error('Load more failed', err);
      addToast('Failed to load more resources', 'error');
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  const handleAddResource = () => {
    setEditingResource(null);
    setEditingId(null);
    setShowForm(true);
  };

  const handleEditResource = (resource) => {
    setEditingResource(resource);
    setEditingId(resource._id);
    setShowForm(true);
  };

  const handleDeleteResource = async (id) => {
    const confirmed = window.confirm('Delete this resource permanently?');
    if (!confirmed) return;

    try {
      await api.delete(`/resources/${id}`);
      setResources(prev => prev.filter(r => r._id !== id));
      addToast('Resource deleted', 'success');
    } catch (err) {
      console.error('Delete failed', err);
      addToast('Failed to delete resource', 'error');
    }
  };

  const handlePinResource = async (id, isPinned) => {
    try {
      await api.post(`/resources/${id}/toggle-pin`);
      addToast(isPinned ? 'Resource unpinned' : 'Resource pinned', 'success');
      setResources(prev => prev.map(r => 
        r._id === id ? { ...r, isPinned: !r.isPinned } : r
      ));
    } catch (err) {
      console.error('Pin toggle failed', err);
      addToast('Failed to update resource', 'error');
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(resources, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `resources-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    addToast('Resources exported', 'success');
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editingId) {
        await api.put(`/resources/${editingId}`, formData);
        addToast('Resource updated', 'success');
      } else {
        await api.post('/resources', formData);
        addToast('Resource added', 'success');
      }

      setShowForm(false);
      setEditingId(null);
      setEditingResource(null);
      
      // Refetch by clearing search
      setSearchQuery('');
    } catch (err) {
      console.error('Save failed', err);
      addToast('Failed to save resource', 'error');
    }
  };

  return (
    <div className="w-full bg-[#f6f7fb] text-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div className="space-y-1">
            <p className="text-sm font-semibold text-slate-500">Resources</p>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Resource Library</h1>
            <p className="text-slate-500">Curate, pin, and manage your learning stack.</p>
          </div>
          <div className="flex items-center gap-3">
            <motion.button
              onClick={handleAddResource}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-semibold shadow-md hover:shadow-lg transition-transform"
            >
              <div className="flex items-center gap-2">
                <Plus size={18} />
                Add Resource
              </div>
            </motion.button>
            <motion.button
              onClick={handleExport}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-3 rounded-xl bg-white text-slate-700 border border-slate-200 shadow-sm hover:shadow-md transition-transform"
              title="Export as JSON"
            >
              <Download size={18} />
            </motion.button>
          </div>
        </motion.div>

        {/* Search & View Controls */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-slate-200 shadow-sm rounded-2xl p-4"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-grow relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search your resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-indigo-400 text-slate-800 placeholder-slate-400 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 overflow-hidden">
              <motion.button
                onClick={() => setViewMode('grid')}
                whileHover={{ backgroundColor: '#f8fafc' }}
                className={`px-3 py-2 text-sm font-semibold transition-all ${
                  viewMode === 'grid'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-slate-500 hover:text-indigo-600'
                }`}
              >
                <div className="flex items-center gap-2"><Grid3X3 size={16} />Grid</div>
              </motion.button>
              <div className="w-px h-6 bg-slate-200" />
              <motion.button
                onClick={() => setViewMode('list')}
                whileHover={{ backgroundColor: '#f8fafc' }}
                className={`px-3 py-2 text-sm font-semibold transition-all ${
                  viewMode === 'list'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-slate-500 hover:text-indigo-600'
                }`}
              >
                <div className="flex items-center gap-2"><List size={16} />List</div>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Resources Grid/List */}
        <motion.div 
          initial={{ opacity: 0, y: 8 }} 
          animate={{ opacity: 1, y: 0 }}
        >
          {loading && resources.length === 0 ? (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 auto-rows-max"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.08 }
                }
              }}
            >
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  className="h-60 rounded-2xl bg-white border border-slate-200 shadow-sm animate-pulse"
                />
              ))}
            </motion.div>
          ) : !loading && resources.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16 bg-white border border-slate-200 shadow-sm rounded-2xl"
            >
              <motion.div
                animate={{ rotate: [0, -10, 10, -5, 0], scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="mx-auto mb-4 inline-block"
              >
                <Sparkles className="text-indigo-400" size={44} />
              </motion.div>
              <p className="text-slate-600 text-lg mb-5">No resources yet. Start building your collection.</p>
              <motion.button
                onClick={handleAddResource}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-semibold shadow-md hover:shadow-lg transition-transform"
              >
                <div className="flex items-center gap-2">
                  <Plus size={18} />
                  Add First Resource
                </div>
              </motion.button>
            </motion.div>
          ) : (
            <motion.div 
              className={viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 auto-rows-max'
                : 'space-y-4'}
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
                {resources.map((resource, index) => (
                  <motion.div
                    key={resource._id}
                    variants={{
                      hidden: { opacity: 0, y: 20, scale: 0.95 },
                      visible: { opacity: 1, y: 0, scale: 1 }
                    }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  >
                    <ResourceCard
                      resource={resource}
                      index={index}
                      viewMode={viewMode}
                      onEdit={() => handleEditResource(resource)}
                      onDelete={() => handleDeleteResource(resource._id)}
                      onPin={() => handlePinResource(resource._id, resource.isPinned)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}

          {hasMore && resources.length > 0 && (
            <motion.div 
              className="mt-8 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <motion.button
                onClick={handleLoadMore}
                disabled={loading}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 rounded-xl bg-white border border-slate-200 shadow-sm hover:shadow-md text-indigo-600 font-semibold transition-transform disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Load More'}
              </motion.button>
            </motion.div>
          )}
        </motion.div>

        <AnimatePresence>
          {showForm && (
            <ResourceForm
              resource={editingResource}
              onSubmit={handleFormSubmit}
              onClose={() => {
                setShowForm(false);
                setEditingId(null);
                setEditingResource(null);
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ResourceLibrary;
