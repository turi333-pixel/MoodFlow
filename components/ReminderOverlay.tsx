
import React from 'react';

interface ReminderOverlayProps {
  message: string;
  onDismiss: () => void;
  onSnooze: () => void;
  onGoToCheckin: () => void;
}

const ReminderOverlay: React.FC<ReminderOverlayProps> = ({ message, onDismiss, onSnooze, onGoToCheckin }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-indigo-900/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-[2rem] w-full max-w-md p-8 shadow-2xl border border-indigo-100 flex flex-col items-center text-center space-y-6 animate-in zoom-in-95 duration-300">
        <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-3xl animate-bounce">
          <i className="fas fa-bell"></i>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-2xl font-black text-gray-900 leading-tight">Mood Check-in!</h3>
          <p className="text-gray-600 font-medium">{message}</p>
        </div>

        <div className="w-full flex flex-col space-y-3 pt-4">
          <button
            onClick={onGoToCheckin}
            className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg hover:bg-indigo-700 transition-all active:scale-95"
          >
            Start Check-in
          </button>
          
          <div className="flex space-x-3">
            <button
              onClick={onSnooze}
              className="flex-1 py-3 bg-gray-50 text-gray-600 font-bold rounded-xl hover:bg-gray-100 transition-all text-sm"
            >
              Snooze (10m)
            </button>
            <button
              onClick={onDismiss}
              className="flex-1 py-3 bg-gray-50 text-gray-400 font-bold rounded-xl hover:bg-gray-100 transition-all text-sm"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReminderOverlay;
