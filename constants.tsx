
import { MoodConfig } from './types';

export const MOODS: MoodConfig[] = [
  { 
    type: 'happy', 
    icon: 'fa-face-laugh-beam', 
    label: 'Radiant', 
    color: 'text-yellow-600', 
    bgColor: 'bg-yellow-50',
    gradient: 'from-yellow-400 to-orange-400',
    shadowColor: 'shadow-yellow-200'
  },
  { 
    type: 'excited', 
    icon: 'fa-bolt-lightning', 
    label: 'Electric', 
    color: 'text-pink-600', 
    bgColor: 'bg-pink-50',
    gradient: 'from-pink-500 to-purple-500',
    shadowColor: 'shadow-pink-200'
  },
  { 
    type: 'calm', 
    icon: 'fa-leaf', 
    label: 'Zen', 
    color: 'text-emerald-600', 
    bgColor: 'bg-emerald-50',
    gradient: 'from-emerald-400 to-teal-500',
    shadowColor: 'shadow-emerald-200'
  },
  { 
    type: 'neutral', 
    icon: 'fa-face-meh', 
    label: 'Steady', 
    color: 'text-slate-600', 
    bgColor: 'bg-slate-50',
    gradient: 'from-slate-400 to-blue-400',
    shadowColor: 'shadow-slate-200'
  },
  { 
    type: 'tired', 
    icon: 'fa-moon', 
    label: 'Dreamy', 
    color: 'text-indigo-600', 
    bgColor: 'bg-indigo-50',
    gradient: 'from-indigo-400 to-blue-600',
    shadowColor: 'shadow-indigo-200'
  },
  { 
    type: 'sad', 
    icon: 'fa-cloud-showers-heavy', 
    label: 'Gloomy', 
    color: 'text-blue-700', 
    bgColor: 'bg-blue-50',
    gradient: 'from-blue-500 to-cyan-600',
    shadowColor: 'shadow-blue-200'
  },
  { 
    type: 'anxious', 
    icon: 'fa-hurricane', 
    label: 'Swirly', 
    color: 'text-violet-700', 
    bgColor: 'bg-violet-50',
    gradient: 'from-violet-500 to-fuchsia-600',
    shadowColor: 'shadow-violet-200'
  },
  { 
    type: 'angry', 
    icon: 'fa-fire-flame-curved', 
    label: 'Blazing', 
    color: 'text-red-600', 
    bgColor: 'bg-red-50',
    gradient: 'from-red-500 to-orange-600',
    shadowColor: 'shadow-red-200'
  },
];

export const APP_NAME = "MoodFlow";
