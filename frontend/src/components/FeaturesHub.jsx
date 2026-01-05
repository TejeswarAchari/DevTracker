import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Calendar } from 'lucide-react';
import ResourceLibrary from './Resources/ResourceLibrary';
import PersonalDiary from './PersonalDiary';

const FEATURES = [
  { id: 'resources', name: '📚 Resources', icon: BookOpen },
  { id: 'diary', name: '📓 Diary', icon: Calendar },
];

const FeaturesHub = () => {
  const [activeFeature, setActiveFeature] = useState('resources');
  const [year] = useState(new Date().getFullYear());
  const [month] = useState(new Date().getMonth() + 1);

  const renderFeature = () => {
    switch (activeFeature) {
      case 'resources':
        return <ResourceLibrary />;
      case 'diary':
        return <PersonalDiary />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#f2f4f8] p-5 md:p-8 text-slate-900">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto space-y-6"
      >
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold text-slate-500">Workspace</p>
          <h1 className="text-4xl font-black tracking-tight">DevTracker</h1>
          <p className="text-slate-500">Switch between your key workflows effortlessly.</p>
        </div>

        <div className="flex gap-3">
          {FEATURES.map((feature) => (
            <motion.button
              key={feature.id}
              onClick={() => setActiveFeature(feature.id)}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-semibold transition-all shadow-sm ${
                activeFeature === feature.id
                  ? 'bg-white border-indigo-200 text-indigo-700 shadow-md'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-200 hover:text-indigo-700'
              }`}
            >
              <feature.icon size={18} />
              {feature.name}
            </motion.button>
          ))}
        </div>

        <motion.div
          key={activeFeature}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-slate-200 shadow-sm rounded-2xl p-2"
        >
          {renderFeature()}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default FeaturesHub;
