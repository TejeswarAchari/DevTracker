import React from "react";
import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";
import CategoryBadge from "./ui/CategoryBadge";

const LogItem = ({ log, onDelete }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="group relative flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/10 transition-all duration-300"
    >
      {/* Hover Gradient Effect */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 flex flex-col gap-1">
        <h4 className="text-white font-medium text-sm">
          {log.title}
        </h4>

        <div className="flex items-center gap-2">
          {/* ✅ Only category is passed */}
          <CategoryBadge category={log.category} />

          {log.description && (
            <span className="text-xs text-zinc-500 truncate max-w-[150px]">
              — {log.description}
            </span>
          )}
        </div>
      </div>

      {/* Delete Button */}
      <button
        onClick={() => onDelete(log._id)}
        className="relative z-10 p-2 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
        title="Delete Log"
      >
        <Trash2 size={16} />
      </button>
    </motion.div>
  );
};

export default LogItem;
