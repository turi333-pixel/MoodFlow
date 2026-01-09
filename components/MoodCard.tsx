
import React, { useState } from 'react';
import { MoodEntry } from '../types';
import { MOODS } from '../constants';
import { triggerHaptic } from '../utils/haptics';

interface MoodCardProps {
  entry: MoodEntry;
}

const MoodCard: React.FC<MoodCardProps> = ({ entry }) => {
  const config = MOODS.find(m => m.type === entry.mood) || MOODS[3];
  const [copied, setCopied] = useState(false);

  const dateStr = new Date(entry.date).toLocaleDateString(undefined, { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  });

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic(15);
    const shareText = `My mood today on MoodFlow: ${config.label}. "${entry.note || "A quiet moment of reflection."}" #MoodFlow #Wellness`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My MoodFlow Pulse',
          text: shareText,
          url: window.location.origin,
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Error sharing:', err);
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Clipboard error:', err);
      }
    }
  };

  return (
    <div className="group p-5 rounded-[2rem] border-2 bg-white border-gray-50 flex items-center space-x-5 shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl relative overflow-hidden">
      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${config.gradient} flex items-center justify-center text-white text-2xl shadow-lg ${config.shadowColor} shrink-0`}>
        <i className={`fas ${config.icon}`}></i>
      </div>
      
      <div className="flex-1 min-w-0 pr-8">
        <div className="flex justify-between items-center mb-1">
          <h4 className={`font-black text-lg tracking-tight ${config.color} truncate`}>{config.label}</h4>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest shrink-0">{dateStr}</span>
        </div>
        <p className="text-sm text-gray-500 font-medium italic line-clamp-2 pr-2">
          {entry.note ? `"${entry.note}"` : "A quiet moment of reflection."}
        </p>
      </div>

      <button 
        onClick={handleShare}
        className={`absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-all 
          ${copied ? 'bg-emerald-500 text-white' : 'bg-gray-50 text-gray-400 hover:bg-indigo-50 hover:text-indigo-600'} 
          shadow-sm active:scale-90`}
        title="Share this mood"
      >
        <i className={`fas ${copied ? 'fa-check' : 'fa-share-nodes'} text-xs`}></i>
        {copied && (
          <span className="absolute -top-8 right-0 bg-gray-900 text-white text-[10px] px-2 py-1 rounded font-bold animate-in fade-in slide-in-from-bottom-1">
            Copied!
          </span>
        )}
      </button>
    </div>
  );
};

export default MoodCard;
