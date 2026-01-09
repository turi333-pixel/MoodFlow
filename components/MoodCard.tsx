
import React from 'react';
import { MoodEntry } from '../types';
import { MOODS } from '../constants';

interface MoodCardProps {
  entry: MoodEntry;
}

const MoodCard: React.FC<MoodCardProps> = ({ entry }) => {
  const config = MOODS.find(m => m.type === entry.mood) || MOODS[3];
  const dateStr = new Date(entry.date).toLocaleDateString(undefined, { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  });

  return (
    <div className={`p-5 rounded-[2rem] border-2 bg-white border-gray-50 flex items-center space-x-5 shadow-lg transition-transform hover:scale-[1.02]`}>
      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${config.gradient} flex items-center justify-center text-white text-2xl shadow-lg ${config.shadowColor}`}>
        <i className={`fas ${config.icon}`}></i>
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-center mb-1">
          <h4 className={`font-black text-lg tracking-tight ${config.color}`}>{config.label}</h4>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{dateStr}</span>
        </div>
        <p className="text-sm text-gray-500 font-medium italic line-clamp-2">
          {entry.note ? `"${entry.note}"` : "A quiet moment of reflection."}
        </p>
      </div>
    </div>
  );
};

export default MoodCard;
