
import React, { useState } from 'react';
import { MoodEntry } from '../types';
import { MOODS } from '../constants';
import { triggerHaptic } from '../utils/haptics';

interface CalendarProps {
  history: MoodEntry[];
}

const Calendar: React.FC<CalendarProps> = ({ history }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  
  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();

  const prevMonth = () => {
    triggerHaptic(5);
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    triggerHaptic(5);
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const getMoodForDay = (day: number) => {
    return history.find(entry => {
      const d = new Date(entry.date);
      return d.getDate() === day && 
             d.getMonth() === currentDate.getMonth() && 
             d.getFullYear() === currentDate.getFullYear();
    });
  };

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl border border-gray-50">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h3 className="text-2xl font-black text-gray-900 tracking-tight">{monthName}</h3>
          <p className="text-sm font-bold text-indigo-400 tracking-[0.2em] uppercase">{year}</p>
        </div>
        <div className="flex space-x-3">
          <button onClick={prevMonth} className="w-10 h-10 flex items-center justify-center bg-gray-50 hover:bg-indigo-50 hover:text-indigo-600 rounded-full transition-all text-gray-400">
            <i className="fas fa-arrow-left text-sm"></i>
          </button>
          <button onClick={nextMonth} className="w-10 h-10 flex items-center justify-center bg-gray-50 hover:bg-indigo-50 hover:text-indigo-600 rounded-full transition-all text-gray-400">
            <i className="fas fa-arrow-right text-sm"></i>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-3">
        {dayLabels.map(label => (
          <div key={label} className="text-center text-[10px] font-black text-gray-300 uppercase tracking-widest py-2">
            {label}
          </div>
        ))}
        
        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const entry = getMoodForDay(day);
          const moodConfig = entry ? MOODS.find(m => m.type === entry.mood) : null;
          const isToday = day === new Date().getDate() && 
                          currentDate.getMonth() === new Date().getMonth() && 
                          currentDate.getFullYear() === new Date().getFullYear();

          return (
            <div 
              key={day} 
              className={`aspect-square relative flex flex-col items-center justify-center rounded-2xl transition-all
                ${entry ? `bg-gradient-to-br ${moodConfig?.gradient} text-white shadow-lg ${moodConfig?.shadowColor}` : 'bg-gray-50 text-gray-300 hover:bg-gray-100'} 
                ${isToday && !entry ? 'ring-2 ring-indigo-500 ring-offset-2' : ''}`}
            >
              <span className={`text-[10px] font-black mb-1 ${entry ? 'text-white/80' : 'text-gray-300'}`}>{day}</span>
              {entry && moodConfig && (
                <i className={`fas ${moodConfig.icon} text-sm`}></i>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;
