
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MoodType, MoodEntry, MoodInsights, ReminderSettings } from './types';
import { MOODS, APP_NAME } from './constants';
import { saveMoodEntry, getMoodHistory, getReminderSettings, saveReminderSettings } from './utils/storage';
import { triggerHaptic } from './utils/haptics';
import { getMoodInsights } from './services/geminiService';
import Calendar from './components/Calendar';
import MoodCard from './components/MoodCard';
import ReminderOverlay from './components/ReminderOverlay';

type Tab = 'checkin' | 'history' | 'insights' | 'settings';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('checkin');
  const [history, setHistory] = useState<MoodEntry[]>([]);
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const [note, setNote] = useState('');
  const [insights, setInsights] = useState<MoodInsights | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [checkedInToday, setCheckedInToday] = useState(false);
  const [isEditingToday, setIsEditingToday] = useState(false);
  
  // Reminder State
  const [reminderSettings, setReminderSettings] = useState<ReminderSettings>(getReminderSettings());
  const [showReminderTrigger, setShowReminderTrigger] = useState(false);
  const snoozeTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const loadedHistory = getMoodHistory();
    setHistory(loadedHistory);
    
    const today = new Date().toDateString();
    const hasToday = loadedHistory.some(h => new Date(h.date).toDateString() === today);
    setCheckedInToday(hasToday);
  }, []);

  // Reminder Check Logic
  useEffect(() => {
    const checkReminder = () => {
      if (!reminderSettings.enabled || checkedInToday) return;

      const now = new Date();
      const [hours, minutes] = reminderSettings.time.split(':').map(Number);
      const scheduledTime = new Date();
      scheduledTime.setHours(hours, minutes, 0, 0);

      const todayStr = now.toDateString();
      if (
        now.getHours() === hours && 
        now.getMinutes() === minutes && 
        reminderSettings.lastDismissedDate !== todayStr &&
        !showReminderTrigger
      ) {
        setShowReminderTrigger(true);
      }
    };

    const interval = setInterval(checkReminder, 30000);
    checkReminder();
    return () => clearInterval(interval);
  }, [reminderSettings, checkedInToday, showReminderTrigger]);

  const handleTabChange = (tab: Tab) => {
    triggerHaptic(10);
    setActiveTab(tab);
  };

  const handleMoodSelect = (mood: MoodType) => {
    triggerHaptic(15);
    setSelectedMood(mood);
  };

  const handleReminderDismiss = () => {
    triggerHaptic(5);
    setShowReminderTrigger(false);
    const updated = { ...reminderSettings, lastDismissedDate: new Date().toDateString() };
    setReminderSettings(updated);
    saveReminderSettings(updated);
  };

  const handleReminderSnooze = () => {
    triggerHaptic(10);
    setShowReminderTrigger(false);
    if (snoozeTimeoutRef.current) window.clearTimeout(snoozeTimeoutRef.current);
    snoozeTimeoutRef.current = window.setTimeout(() => {
      setShowReminderTrigger(true);
    }, 10 * 60 * 1000);
  };

  const handleGoToCheckinFromReminder = () => {
    triggerHaptic(20);
    setShowReminderTrigger(false);
    setActiveTab('checkin');
  };

  const handleEditToday = () => {
    triggerHaptic(15);
    const today = new Date().toDateString();
    const todayEntry = history.find(h => new Date(h.date).toDateString() === today);
    if (todayEntry) {
      setSelectedMood(todayEntry.mood);
      setNote(todayEntry.note);
    }
    setIsEditingToday(true);
  };

  const handleSubmit = async () => {
    if (!selectedMood) return;

    triggerHaptic([20, 50, 20]);
    setIsLoading(true);
    const newEntry: MoodEntry = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      mood: selectedMood,
      note: note.trim(),
    };

    saveMoodEntry(newEntry);
    const updatedHistory = getMoodHistory();
    setHistory(updatedHistory);
    setCheckedInToday(true);
    setIsEditingToday(false);

    try {
      const moodInsights = await getMoodInsights(selectedMood, note);
      setInsights(moodInsights);
      setActiveTab('insights');
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    triggerHaptic(5);
    setSelectedMood(null);
    setNote('');
    setIsEditingToday(false);
    setActiveTab('checkin');
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic(20);
    saveReminderSettings(reminderSettings);
    alert('Settings saved!');
  };

  const toggleReminder = () => {
    triggerHaptic(15);
    const updated = { ...reminderSettings, enabled: !reminderSettings.enabled };
    setReminderSettings(updated);
    saveReminderSettings(updated);
    
    if (updated.enabled && "Notification" in window) {
      Notification.requestPermission();
    }
  };

  return (
    <div className="min-h-screen pb-24 md:pb-6 bg-[#f8fbff]">
      {showReminderTrigger && (
        <ReminderOverlay 
          message={reminderSettings.message}
          onDismiss={handleReminderDismiss}
          onSnooze={handleReminderSnooze}
          onGoToCheckin={handleGoToCheckinFromReminder}
        />
      )}

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50 px-8 py-5 flex justify-between items-center shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 bg-gradient-to-tr from-indigo-600 to-fuchsia-500 rounded-2xl flex items-center justify-center text-white shadow-xl rotate-3">
            <i className="fas fa-bolt-lightning"></i>
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 leading-none">
              {APP_NAME}
            </h1>
            <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.2em] mt-1">Mental Pulse</p>
          </div>
        </div>
        <div className="hidden md:flex items-center space-x-3 text-gray-400 bg-gray-50 px-4 py-2 rounded-2xl border border-gray-100">
          <i className="far fa-calendar-alt text-xs"></i>
          <span className="text-xs font-black uppercase tracking-widest">{new Date().toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })}</span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6 md:p-12">
        {activeTab === 'checkin' && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="text-center space-y-4 max-w-2xl mx-auto">
              <h2 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tighter leading-tight">
                {isEditingToday ? "Switch it up!" : "Vibe check time."}
              </h2>
              <p className="text-lg text-gray-500 font-medium">
                {isEditingToday 
                  ? "Your feelings are fluid. Update your pulse for the day." 
                  : "Tap into your rhythm. What's the frequency right now?"}
              </p>
            </div>

            {checkedInToday && !isEditingToday ? (
              <div className="bg-white border-2 border-indigo-50 p-12 rounded-[3rem] text-center space-y-8 shadow-2xl animate-in zoom-in-95 duration-500">
                <div className="w-24 h-24 bg-gradient-to-tr from-indigo-600 to-fuchsia-500 rounded-[2rem] flex items-center justify-center text-white text-4xl shadow-2xl mx-auto rotate-12">
                  <i className="fas fa-star"></i>
                </div>
                <div className="space-y-2">
                  <h3 className="text-3xl font-black text-gray-900">Locked in!</h3>
                  <p className="text-gray-500 font-medium max-w-md mx-auto">
                    You've already tuned in today. Take a moment to see your growth or dive into fresh insights.
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-4">
                  <button 
                    onClick={handleEditToday}
                    className="px-8 py-4 bg-white text-indigo-600 font-black rounded-2xl shadow-lg border-2 border-indigo-50 hover:bg-indigo-50 transition-all flex items-center space-x-3 active:scale-95"
                  >
                    <i className="fas fa-rotate text-sm"></i>
                    <span>Tweak Mood</span>
                  </button>
                  <button 
                    onClick={() => handleTabChange('history')}
                    className="px-8 py-4 bg-white text-gray-600 font-black rounded-2xl shadow-lg border-2 border-gray-50 hover:bg-gray-50 transition-all active:scale-95"
                  >
                    Journey
                  </button>
                  <button 
                    onClick={() => handleTabChange('insights')}
                    className="px-8 py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl hover:bg-indigo-700 transition-all flex items-center space-x-3 active:scale-95"
                  >
                    <i className="fas fa-flask-vial"></i>
                    <span>Insights</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-12 animate-in fade-in duration-500">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {MOODS.map((m) => (
                    <button
                      key={m.type}
                      onClick={() => handleMoodSelect(m.type)}
                      className={`group relative p-8 rounded-[2.5rem] border-4 transition-all flex flex-col items-center justify-center space-y-4 overflow-hidden
                        ${selectedMood === m.type 
                          ? `border-indigo-500 bg-white shadow-2xl scale-[1.05]` 
                          : 'border-white bg-white hover:border-indigo-100 hover:shadow-xl'}`}
                    >
                      <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${m.gradient} flex items-center justify-center text-white text-3xl shadow-xl transition-all duration-500 group-hover:rotate-12 group-hover:scale-110 ${selectedMood === m.type ? 'rotate-12 scale-110' : ''}`}>
                        <i className={`fas ${m.icon}`}></i>
                      </div>
                      <span className={`font-black text-sm uppercase tracking-widest ${selectedMood === m.type ? 'text-indigo-600' : 'text-gray-400'}`}>
                        {m.label}
                      </span>
                      {selectedMood === m.type && (
                         <div className="absolute top-2 right-4 text-indigo-500 animate-pulse">
                            <i className="fas fa-check-circle text-lg"></i>
                         </div>
                      )}
                    </button>
                  ))}
                </div>

                <div className="bg-white rounded-[3rem] p-10 shadow-2xl border border-gray-50 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 opacity-50 blur-3xl"></div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-4 px-1">
                    Context (The "Why")
                  </label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Pour your thoughts here..."
                    className="w-full h-40 p-6 bg-gray-50 border-none rounded-3xl focus:ring-4 focus:ring-indigo-100 transition-all resize-none text-lg text-gray-800 font-medium placeholder:text-gray-300"
                  />
                  <div className="mt-8 flex flex-col sm:flex-row justify-end items-center gap-6">
                    {isEditingToday && (
                      <button
                        onClick={() => setIsEditingToday(false)}
                        className="text-gray-400 font-black hover:text-gray-600 transition-all uppercase tracking-widest text-xs"
                      >
                        Nevermind
                      </button>
                    )}
                    <button
                      disabled={!selectedMood || isLoading}
                      onClick={handleSubmit}
                      className={`w-full sm:w-auto px-12 py-5 rounded-2xl font-black text-xl shadow-2xl transition-all flex items-center justify-center space-x-4
                        ${!selectedMood || isLoading 
                          ? 'bg-gray-100 text-gray-300 cursor-not-allowed shadow-none' 
                          : 'bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white hover:scale-105 active:scale-95'}`}
                    >
                      {isLoading ? (
                        <>
                          <i className="fas fa-spinner fa-spin"></i>
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <span>{isEditingToday ? "Re-sync Journey" : "Log it"}</span>
                          <i className="fas fa-arrow-right text-sm"></i>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-12 animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h2 className="text-4xl font-black text-gray-900 tracking-tight">Your Timeline</h2>
                <p className="text-gray-500 font-medium mt-1">Tracing the peaks and valleys.</p>
              </div>
              <div className="flex bg-white p-2 rounded-2xl shadow-lg border border-gray-50">
                <button className="px-6 py-2 bg-indigo-600 text-white font-black rounded-xl shadow-md text-xs uppercase tracking-widest">Grid</button>
                <button className="px-6 py-2 text-gray-400 font-black rounded-xl text-xs uppercase tracking-widest hover:text-gray-600 transition-all">List</button>
              </div>
            </div>

            <Calendar history={history} />

            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-black text-gray-900 tracking-tight">Latest Pulses</h3>
                <button className="text-indigo-600 text-xs font-black uppercase tracking-widest">See all</button>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                {[...history].reverse().slice(0, 4).map(entry => (
                  <MoodCard key={entry.id} entry={entry} />
                ))}
              </div>
              {history.length === 0 && (
                <div className="text-center py-24 bg-white rounded-[3rem] border-4 border-dashed border-gray-100 flex flex-col items-center">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-200 text-3xl mb-4">
                    <i className="fas fa-seedling"></i>
                  </div>
                  <p className="text-gray-400 font-black uppercase tracking-widest text-sm">Beginning of the loop</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'insights' && (
          <div className="space-y-12 animate-in fade-in slide-in-from-left-8 duration-500">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-600 via-purple-600 to-fuchsia-500 rounded-[2rem] mx-auto flex items-center justify-center text-white text-3xl shadow-2xl rotate-3">
                <i className="fas fa-flask-vial"></i>
              </div>
              <h2 className="text-4xl font-black text-gray-900 tracking-tight">The Lab</h2>
              <p className="text-gray-500 font-medium">AI-synthesized perspective for your state of mind.</p>
            </div>

            {insights ? (
              <>
                <div className="bg-white rounded-[3rem] p-10 shadow-2xl border-l-8 border-indigo-600 relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-8 text-indigo-50/50 pointer-events-none">
                      <i className="fas fa-quote-right text-8xl"></i>
                   </div>
                  <div className="flex justify-between items-start mb-6">
                    <h3 className="text-xs font-black text-indigo-600 uppercase tracking-[0.2em]">Synthesized Summary</h3>
                    <button onClick={handleEditToday} className="text-[10px] font-black text-gray-400 hover:text-indigo-600 uppercase tracking-widest transition-all">
                       Recalibrate?
                    </button>
                  </div>
                  <p className="text-2xl text-gray-800 leading-snug font-bold tracking-tight">
                    {insights.summary}
                  </p>
                </div>

                <div className="grid gap-8 md:grid-cols-3">
                  {insights.tips.map((tip, idx) => (
                    <div key={idx} className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-50 hover:shadow-2xl transition-all group relative overflow-hidden">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-8 shadow-xl transition-transform group-hover:scale-110 group-hover:-rotate-3
                        ${tip.category === 'activity' ? 'bg-gradient-to-br from-blue-500 to-cyan-400' : 
                          tip.category === 'reflection' ? 'bg-gradient-to-br from-purple-500 to-indigo-400' : 
                          tip.category === 'social' ? 'bg-gradient-to-br from-pink-500 to-rose-400' : 'bg-gradient-to-br from-emerald-500 to-teal-400'}`}>
                        <i className={`fas ${
                          tip.category === 'activity' ? 'fa-bolt' : 
                          tip.category === 'reflection' ? 'fa-brain' : 
                          tip.category === 'social' ? 'fa-comments' : 'fa-hand-holding-heart'
                        }`}></i>
                      </div>
                      <h4 className="font-black text-xl text-gray-900 mb-3 tracking-tight">{tip.title}</h4>
                      <p className="text-sm text-gray-500 font-medium leading-relaxed">{tip.description}</p>
                    </div>
                  ))}
                </div>
                
                <div className="text-center pt-8">
                  <button 
                    onClick={handleReset}
                    className="text-gray-400 hover:text-indigo-600 text-xs font-black uppercase tracking-[0.3em] transition-all"
                  >
                    Close Session
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-24 bg-white rounded-[3rem] shadow-2xl border border-gray-50 space-y-8">
                <div className="w-24 h-24 bg-gray-50 rounded-full mx-auto flex items-center justify-center text-gray-200 text-5xl animate-pulse">
                  <i className="fas fa-robot"></i>
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-gray-900">Lab is empty</h3>
                  <p className="text-gray-500 font-medium max-w-xs mx-auto">Sync your current vibe on the check-in screen to generate insights.</p>
                </div>
                <button 
                  onClick={() => handleTabChange('checkin')}
                  className="px-10 py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all shadow-xl active:scale-95"
                >
                  Go to Check-in
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-12 animate-in fade-in slide-in-from-top-8 duration-500">
             <div>
                <h2 className="text-4xl font-black text-gray-900 tracking-tight">Configuration</h2>
                <p className="text-gray-500 font-medium mt-1">Tailor the pulse frequency.</p>
              </div>
            
            <div className="bg-white rounded-[3rem] p-10 shadow-2xl border border-gray-50 space-y-10">
              <div className="flex items-center justify-between p-6 bg-gray-50/50 rounded-3xl border border-gray-100">
                <div className="flex items-center space-x-5">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-xl transition-all ${reminderSettings.enabled ? 'bg-indigo-600 rotate-3' : 'bg-gray-300'}`}>
                    <i className="fas fa-bell"></i>
                  </div>
                  <div>
                    <h3 className="font-black text-gray-900 text-lg">Push Reminders</h3>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{reminderSettings.enabled ? 'Live' : 'Silent'}</p>
                  </div>
                </div>
                <button 
                  onClick={toggleReminder}
                  className={`w-16 h-9 rounded-full transition-colors relative border-2 ${reminderSettings.enabled ? 'bg-indigo-600 border-indigo-700' : 'bg-gray-200 border-gray-300'}`}
                >
                  <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-md transition-transform ${reminderSettings.enabled ? 'translate-x-7' : 'translate-x-0'}`} />
                </button>
              </div>

              {reminderSettings.enabled && (
                <form onSubmit={handleSaveSettings} className="space-y-8 animate-in slide-in-from-top-4 duration-500">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">Check-in Time</label>
                    <input 
                      type="time" 
                      value={reminderSettings.time}
                      onChange={(e) => setReminderSettings({...reminderSettings, time: e.target.value})}
                      className="w-full p-6 bg-gray-50 border-none rounded-3xl focus:ring-4 focus:ring-indigo-100 transition-all text-2xl font-black text-gray-800"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">Custom Ping Message</label>
                    <input 
                      type="text" 
                      placeholder="e.g., Yo, how's life?"
                      value={reminderSettings.message}
                      onChange={(e) => setReminderSettings({...reminderSettings, message: e.target.value})}
                      className="w-full p-6 bg-gray-50 border-none rounded-3xl focus:ring-4 focus:ring-indigo-100 transition-all text-gray-800 font-bold"
                    />
                  </div>

                  <div className="pt-4">
                    <button 
                      type="submit"
                      className="w-full py-5 bg-gray-900 text-white font-black rounded-3xl hover:bg-black transition-all shadow-2xl active:scale-[0.98]"
                    >
                      Save Pulse Config
                    </button>
                  </div>
                </form>
              )}
            </div>

            <div className="p-8 bg-indigo-600 rounded-[2.5rem] shadow-xl text-white flex items-center space-x-6 relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-4 opacity-10 scale-150 transition-transform group-hover:rotate-12">
                  <i className="fas fa-lock text-9xl"></i>
               </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                <i className="fas fa-shield-halved text-xl"></i>
              </div>
              <div>
                <h4 className="font-black uppercase tracking-widest text-xs mb-1">Privacy First</h4>
                <p className="text-sm font-medium text-indigo-100 leading-relaxed">
                  Your emotional data is local. No servers, no tracking, just you and your rhythm.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Mobile Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-gray-100 px-8 py-5 flex justify-between items-center z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] md:static md:bg-transparent md:border-none md:shadow-none md:justify-center md:space-x-12 md:pb-12">
        <button 
          onClick={() => handleTabChange('checkin')}
          className={`flex flex-col items-center space-y-1 group transition-all ${activeTab === 'checkin' ? 'text-indigo-600 scale-110' : 'text-gray-300 hover:text-gray-400'}`}
        >
          <div className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${activeTab === 'checkin' ? 'bg-indigo-50 shadow-sm' : 'group-hover:bg-gray-50'}`}>
            <i className="fas fa-heart-pulse text-xl"></i>
          </div>
          <span className="text-[8px] font-black uppercase tracking-widest">Pulse</span>
        </button>
        
        <button 
          onClick={() => handleTabChange('history')}
          className={`flex flex-col items-center space-y-1 group transition-all ${activeTab === 'history' ? 'text-indigo-600 scale-110' : 'text-gray-300 hover:text-gray-400'}`}
        >
          <div className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${activeTab === 'history' ? 'bg-indigo-50 shadow-sm' : 'group-hover:bg-gray-50'}`}>
            <i className="fas fa-stream text-xl"></i>
          </div>
          <span className="text-[8px] font-black uppercase tracking-widest">History</span>
        </button>

        <button 
          onClick={() => handleTabChange('insights')}
          className={`flex flex-col items-center space-y-1 group transition-all ${activeTab === 'insights' ? 'text-indigo-600 scale-110' : 'text-gray-300 hover:text-gray-400'}`}
        >
          <div className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${activeTab === 'insights' ? 'bg-indigo-50 shadow-sm' : 'group-hover:bg-gray-50'}`}>
            <i className="fas fa-flask-vial text-xl"></i>
          </div>
          <span className="text-[8px] font-black uppercase tracking-widest">Lab</span>
        </button>

        <button 
          onClick={() => handleTabChange('settings')}
          className={`flex flex-col items-center space-y-1 group transition-all ${activeTab === 'settings' ? 'text-indigo-600 scale-110' : 'text-gray-300 hover:text-gray-400'}`}
        >
          <div className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${activeTab === 'settings' ? 'bg-indigo-50 shadow-sm' : 'group-hover:bg-gray-50'}`}>
            <i className="fas fa-sliders text-xl"></i>
          </div>
          <span className="text-[8px] font-black uppercase tracking-widest">Config</span>
        </button>
      </nav>
    </div>
  );
};

export default App;
