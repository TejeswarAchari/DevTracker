import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

const RESOURCE_TYPES = ['article', 'video', 'tutorial', 'documentation', 'tool', 'code', 'book', 'course', 'podcast', 'other'];
const PRIORITIES = ['high', 'medium', 'low'];
const STATUSES = ['unread', 'reading', 'completed', 'reviewed', 'archived'];

const ResourceForm = ({ resource, onSubmit, onClose }) => {
  const [formData, setFormData] = useState(resource || {
    title: '',
    description: '',
    resourceType: 'article',
    url: '',
    category: '',
    subcategory: '',
    tags: [],
    priority: 'medium',
    status: 'unread',
    notes: '',
    sourceDate: '',
    rating: 0
  });

  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      setFormData(prev => ({
        ...prev,
        tags: [...new Set([...prev.tags, tagInput.trim()])]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (formData.title.length > 200) newErrors.title = 'Title must be less than 200 characters';
    if (formData.description.length > 1000) newErrors.description = 'Description must be less than 1000 characters';
    if (formData.notes.length > 2000) newErrors.notes = 'Notes must be less than 2000 characters';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    onSubmit(formData);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div className="w-full max-w-2xl max-h-[90vh] bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden">
          
          {/* Header */}
          <div className="sticky top-0 z-10 bg-white p-6 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-2xl font-black text-slate-900">
              {resource ? '✏️ Edit Resource' : '📚 Add Resource'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-500 hover:text-slate-900"
            >
              <X size={24} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-4" style={{ maxHeight: 'calc(90vh - 180px)' }}>
            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., React Best Practices Guide"
                className="w-full px-4 py-2 rounded-lg bg-slate-50 border border-slate-200 focus:border-indigo-400 
                         text-slate-900 placeholder-slate-400 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
              {errors.title && <p className="text-rose-600 text-xs mt-1">{errors.title}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Brief description of the resource..."
                rows="3"
                className="w-full px-4 py-2 rounded-lg bg-slate-50 border border-slate-200 focus:border-indigo-400 
                         text-slate-900 placeholder-slate-400 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-100 resize-none"
              />
              {errors.description && <p className="text-rose-600 text-xs mt-1">{errors.description}</p>}
            </div>

            {/* Resource Type & Priority */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Type</label>
                <select
                  name="resourceType"
                  value={formData.resourceType}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg bg-slate-50 border border-slate-200 focus:border-indigo-400 
                           text-slate-900 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-100"
                >
                  {RESOURCE_TYPES.map(type => (
                    <option key={type} value={type} className="bg-white">
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Priority</label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg bg-slate-50 border border-slate-200 focus:border-indigo-400 
                           text-slate-900 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-100"
                >
                  {PRIORITIES.map(p => (
                    <option key={p} value={p} className="bg-white">
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* URL */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                URL
              </label>
              <input
                type="url"
                name="url"
                value={formData.url}
                onChange={handleChange}
                placeholder="https://example.com"
                className="w-full px-4 py-2 rounded-lg bg-slate-50 border border-slate-200 focus:border-indigo-400 
                         text-slate-900 placeholder-slate-400 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            {/* Category & Subcategory */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Category
                </label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="e.g., Frontend"
                  className="w-full px-4 py-2 rounded-lg bg-slate-50 border border-slate-200 focus:border-indigo-400 
                           text-slate-900 placeholder-slate-400 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Subcategory
                </label>
                <input
                  type="text"
                  name="subcategory"
                  value={formData.subcategory}
                  onChange={handleChange}
                  placeholder="e.g., React"
                  className="w-full px-4 py-2 rounded-lg bg-slate-50 border border-slate-200 focus:border-indigo-400 
                           text-slate-900 placeholder-slate-400 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Tags (Press Enter to add)
              </label>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="Add tags..."
                className="w-full px-4 py-2 rounded-lg bg-slate-50 border border-slate-200 focus:border-indigo-400 
                         text-slate-900 placeholder-slate-400 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map(tag => (
                  <motion.div
                    key={tag}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold 
                             flex items-center gap-2"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-indigo-900 transition-colors"
                    >
                      ×
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg bg-slate-50 border border-slate-200 focus:border-indigo-400 
                         text-slate-900 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-100"
              >
                {STATUSES.map(status => (
                  <option key={status} value={status} className="bg-white">
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Your personal notes..."
                rows="3"
                className="w-full px-4 py-2 rounded-lg bg-slate-50 border border-slate-200 focus:border-indigo-400 
                         text-slate-900 placeholder-slate-400 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-100 resize-none"
              />
              {errors.notes && <p className="text-rose-600 text-xs mt-1">{errors.notes}</p>}
            </div>

            {/* Source Date */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Source Date
              </label>
              <input
                type="date"
                name="sourceDate"
                value={formData.sourceDate ? formData.sourceDate.split('T')[0] : ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  sourceDate: e.target.value ? new Date(e.target.value).toISOString() : ''
                }))}
                className="w-full px-4 py-2 rounded-lg bg-slate-50 border border-slate-200 focus:border-indigo-400 
                         text-slate-900 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          </form>

          {/* Footer */}
          <div className="sticky bottom-0 z-10 bg-white p-6 border-t border-slate-200 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 
                       text-slate-700 font-semibold text-sm transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 
                       text-white font-semibold text-sm transition-all shadow-md"
            >
              {resource ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default ResourceForm;
