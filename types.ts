
export type MoodType = 'happy' | 'calm' | 'sad' | 'anxious' | 'angry' | 'tired' | 'excited' | 'neutral';

export interface MoodConfig {
  type: MoodType;
  icon: string; // Font Awesome class
  label: string;
  color: string;
  bgColor: string;
  gradient: string; // Tailwind gradient classes
  shadowColor: string;
}

export interface MoodEntry {
  id: string;
  date: string; // ISO String
  mood: MoodType;
  note: string;
}

export interface Tip {
  title: string;
  description: string;
  category: 'activity' | 'reflection' | 'social' | 'wellness';
}

export interface MoodInsights {
  summary: string;
  tips: Tip[];
}

export interface WeeklySummary {
  overview: string;
  mostFrequentMood: MoodType;
  moodCount: number;
}

export interface ReminderSettings {
  enabled: boolean;
  time: string; // HH:mm format
  message: string;
  lastDismissedDate: string | null; // Date string to prevent multiple triggers same day
}
