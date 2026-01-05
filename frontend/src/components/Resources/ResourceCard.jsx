import React from 'react';
import { motion } from 'framer-motion';
import { Trash2, Edit2, Pin, ExternalLink } from 'lucide-react';
import { formatDistanceToNow, parseISO, isValid } from 'date-fns';

const RESOURCE_ICONS = {
  article: '📄',
  video: '🎥',
  tutorial: '🎓',
  documentation: '📚',
  tool: '🛠️',
  code: '💻',
  book: '📖',
  course: '🎯',
  podcast: '🎙️',
  other: '📌'
};

const STATUS_COLORS = {
  unread: 'bg-indigo-50 text-indigo-700 border-indigo-100',
  reading: 'bg-amber-50 text-amber-700 border-amber-100',
  completed: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  reviewed: 'bg-cyan-50 text-cyan-700 border-cyan-100'
};

const PRIORITY_COLORS = {
  high: 'bg-rose-50 text-rose-700 border-rose-100',
  medium: 'bg-amber-50 text-amber-700 border-amber-100',
  low: 'bg-slate-50 text-slate-600 border-slate-100'
};

const ResourceCard = ({ resource, index, viewMode, onEdit, onDelete, onPin }) => {
  console.log('🎴 ResourceCard rendering:', { 
    title: resource?.title, 
    id: resource?._id, 
    index,
    viewMode 
  });
  
  const tags = Array.isArray(resource?.tags) ? resource.tags : [];
  const status = resource?.status || 'unread';
  const priority = resource?.priority || 'medium';
  const createdAt = resource?.createdAt;
  const resourceType = resource?.resourceType || 'other';
  const title = resource?.title || 'Untitled resource';

  const Wrapper = viewMode === 'list' ? motion.div : motion.div;
  const wrapperProps = viewMode === 'list'
    ? { initial: { opacity: 0, x: -12 }, animate: { opacity: 1, x: 0 } }
    : { initial: { opacity: 0, scale: 0.97 }, animate: { opacity: 1, scale: 1 } };

  return (
    <Wrapper
      {...wrapperProps}
      whileHover={{ scale: 1.02, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
      transition={{ type: 'spring', stiffness: 300, damping: 25, delay: index * 0.04 }}
      className={`group ${viewMode === 'list' ? 'p-4' : 'p-5'} min-h-60 rounded-2xl bg-white border border-slate-200 shadow-md transition-all cursor-pointer hover:shadow-lg`}
    >
      <motion.div 
        className="flex items-start justify-between gap-3 mb-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.04 + 0.1 }}
      >
        <div className="flex items-center gap-3">
          <motion.div 
            className="h-11 w-11 rounded-xl bg-slate-100 flex items-center justify-center text-2xl"
            whileHover={{ rotate: 360, scale: 1.15 }}
            transition={{ duration: 0.6 }}
          >
            {RESOURCE_ICONS[resourceType] || RESOURCE_ICONS.other}
          </motion.div>
          <div className="space-y-1 min-w-0">
            <motion.a
              href={resource?.url || '#'}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ color: '#4f46e5' }}
              className="text-base font-semibold text-slate-900 flex items-center gap-2 truncate transition-colors"
            >
              {title}
              {resource?.url && <ExternalLink size={14} className="text-slate-400" />}
            </motion.a>
            {resource?.description && (
              <p className="text-sm text-slate-500 line-clamp-2">{resource.description}</p>
            )}
            {resource?.category && (
              <p className="text-xs text-slate-400">
                {resource.category} {resource.subcategory ? `• ${resource.subcategory}` : ''}
              </p>
            )}
          </div>
        </div>
        <motion.button
          onClick={onPin}
          whileHover={{ scale: 1.15, rotate: 15 }}
          whileTap={{ scale: 0.9 }}
          className={`p-2 rounded-xl border transition-all ${
            resource?.isPinned
              ? 'bg-indigo-50 border-indigo-200 text-indigo-600'
              : 'bg-white border-slate-200 text-slate-400 hover:text-indigo-600'
          }`}
          title={resource?.isPinned ? 'Unpin' : 'Pin'}
        >
          <Pin size={16} className={resource?.isPinned ? 'fill-indigo-500' : ''} />
        </motion.button>
      </motion.div>

      {tags.length > 0 && (
        <motion.div 
          className="flex flex-wrap gap-2 mb-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * 0.04 + 0.15 }}
        >
          {tags.slice(0, 3).map((tag, i) => (
            <motion.span 
              key={tag} 
              className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200"
              whileHover={{ scale: 1.1, backgroundColor: '#eef2ff', color: '#4f46e5' }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.04 + 0.15 + i * 0.05 }}
            >
              {tag}
            </motion.span>
          ))}
          {tags.length > 3 && (
            <motion.span 
              className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.04 + 0.15 + 3 * 0.05 }}
            >
              +{tags.length - 3}
            </motion.span>
          )}
        </motion.div>
      )}

      <motion.div 
        className="flex flex-wrap items-center gap-2 mb-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: index * 0.04 + 0.2 }}
      >
        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${STATUS_COLORS[status] || 'bg-slate-50 text-slate-600 border-slate-200'}`}>
          {status}
        </span>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${PRIORITY_COLORS[priority] || 'bg-slate-50 text-slate-600 border-slate-200'}`}>
          {priority}
        </span>
        <span className="text-xs text-slate-400 ml-auto">
          {(() => {
            if (!createdAt) return '';
            const parsed = parseISO(createdAt);
            if (!isValid(parsed)) return '';
            return `Added ${formatDistanceToNow(parsed, { addSuffix: true })}`;
          })()}
        </span>
      </motion.div>

      <motion.div 
        className="flex gap-2 pt-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.04 + 0.25 }}
      >
        <motion.button
          onClick={onEdit}
          whileHover={{ scale: 1.05, backgroundColor: '#eef2ff' }}
          whileTap={{ scale: 0.95 }}
          className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold bg-white hover:border-indigo-200 hover:text-indigo-700 transition-colors"
        >
          <div className="flex items-center justify-center gap-2"><Edit2 size={14} />Edit</div>
        </motion.button>
        <motion.button
          onClick={onDelete}
          whileHover={{ scale: 1.05, backgroundColor: '#fee2e2' }}
          whileTap={{ scale: 0.95 }}
          className="flex-1 px-3 py-2 rounded-xl border border-rose-200 text-rose-700 font-semibold bg-rose-50 hover:bg-rose-100 transition-colors"
        >
          <div className="flex items-center justify-center gap-2"><Trash2 size={14} />Delete</div>
        </motion.button>
      </motion.div>
    </Wrapper>
  );
};

export default ResourceCard;
