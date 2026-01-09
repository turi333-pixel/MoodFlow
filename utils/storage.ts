
import { MoodEntry, ReminderSettings } from '../types';

const STORAGE_KEY = 'moodflow_history';
const SETTINGS_KEY = 'moodflow_settings';

export const saveMoodEntry = (entry: MoodEntry) => {
  const history = getMoodHistory();
  const todayStr = new Date(entry.date).toDateString();
  const updated = [
    ...history.filter(h => new Date(h.date).toDateString() !== todayStr),
    entry
  ];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
};

export const getMoodHistory = (): MoodEntry[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const clearHistory = () => {
  localStorage.removeItem(STORAGE_KEY);
};

export const saveReminderSettings = (settings: ReminderSettings) => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};

export const getReminderSettings = (): ReminderSettings => {
  const data = localStorage.getItem(SETTINGS_KEY);
  if (!data) {
    return {
      enabled: false,
      time: '09:00',
      message: "Time for a quick mood check-in! How are you feeling?",
      lastDismissedDate: null
    };
  }
  return JSON.parse(data);
};
