import React from "react";
import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";
import CategoryBadge from "./ui/CategoryBadge";

const LogItem = ({ log, onDelete, index = 0 }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 20, scale: 0.95 }}
      whileHover={{ scale: 1.02, backgroundColor: "rgba(255, 255, 255, 0.08)" }}
      transition={{ duration: 0.3, delay: index * 0.05, type: "spring", stiffness: 300, damping: 25 }}
      className="group relative flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 cursor-pointer transition-all duration-300"
    >
      {/* Animated Hover Gradient Effect */}
      <motion.div 
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-violet-500/10 to-transparent pointer-events-none" 
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col gap-1 flex-grow">
        <motion.h4 
          className="text-white font-medium text-sm"
          whileHover={{ color: "#22d3ee" }}
          transition={{ duration: 0.2 }}
        >
          {log.title}
        </motion.h4>

        <div className="flex items-center gap-2">
          {/* ✅ Only category is passed */}
          <motion.div
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.2 }}
          >
            <CategoryBadge category={log.category} />
          </motion.div>

          {log.description && (
            <span className="text-xs text-zinc-500 truncate max-w-[150px]">
              — {log.description}
            </span>
          )}
        </div>
      </div>

      {/* Delete Button with Animation */}
      <motion.button
        onClick={() => onDelete(log._id)}
        whileHover={{ scale: 1.1, color: "#ef4444", opacity: 1 }}
        whileTap={{ scale: 0.9 }}
        initial={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="relative z-10 p-2 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
        title="Delete Log"
      >
        <Trash2 size={16} />
      </motion.button>
    </motion.div>
  );
};

export default LogItem;
