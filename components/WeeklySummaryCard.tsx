
import React from 'react';
import { WeeklySummary, MoodConfig } from '../types';
import { MOODS } from '../constants';

interface WeeklySummaryCardProps {
  summary: WeeklySummary | null;
  loading: boolean;
}

const WeeklySummaryCard: React.FC<WeeklySummaryCardProps> = ({ summary, loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-gray-100 animate-pulse space-y-4">
        <div className="h-4 bg-gray-100 rounded-full w-1/4"></div>
        <div className="flex space-x-4">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-100 rounded-full w-3/4"></div>
            <div className="h-4 bg-gray-100 rounded-full w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!summary) return null;

  const config = MOODS.find(m => m.type === summary.mostFrequentMood) || MOODS[3];

  return (
    <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl border border-gray-50 relative overflow-hidden group">
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-50 rounded-full opacity-20 blur-3xl pointer-events-none group-hover:bg-indigo-100 transition-colors duration-700"></div>
      
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8">
        <div className="shrink-0 flex flex-col items-center space-y-3">
          <div className={`w-20 h-20 rounded-[2rem] bg-gradient-to-br ${config.gradient} flex items-center justify-center text-white text-3xl shadow-2xl rotate-3`}>
            <i className={`fas ${config.icon}`}></i>
          </div>
          <div className="text-center">
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Dominant</p>
             <p className={`font-black text-sm uppercase ${config.color}`}>{config.label}</p>
          </div>
        </div>

        <div className="flex-1 space-y-3">
          <h3 className="text-xs font-black text-indigo-600 uppercase tracking-[0.3em]">Weekly Pulse Report</h3>
          <p className="text-lg text-gray-800 font-bold leading-snug">
            {summary.overview}
          </p>
          <div className="flex items-center space-x-2">
            <div className="h-1 flex-1 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className={`h-full bg-gradient-to-r ${config.gradient} transition-all duration-1000`} 
                style={{ width: `${Math.min((summary.moodCount / 7) * 100, 100)}%` }}
              ></div>
            </div>
            <span className="text-[10px] font-black text-gray-400 uppercase">{summary.moodCount} Active Days</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeeklySummaryCard;
