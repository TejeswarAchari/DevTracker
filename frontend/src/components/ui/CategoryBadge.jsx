import React from 'react';
import clsx from 'clsx';

const VARIANTS = {
  Coding: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  Study: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  Health: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  Personal: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
};

// 'points' prop is removed
const CategoryBadge = ({ category }) => {
  const styles = VARIANTS[category] || VARIANTS.Personal;

  return (
    <span className={clsx(
      "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border backdrop-blur-md flex items-center gap-2",
      styles
    )}>
      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
      {category}
      {/* Points display removed */}
    </span>
  );
};

export default CategoryBadge;