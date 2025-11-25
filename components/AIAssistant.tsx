import React, { useState } from 'react';
import { Sparkles, Coffee, Sun, Moon } from './Icons';
import { generateCozyRoutine } from '../services/geminiService';

interface AIAssistantProps {
  onAddTasks: (tasks: string[]) => void;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ onAddTasks }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async (mood: string) => {
    setLoading(true);
    const tasks = await generateCozyRoutine(mood);
    onAddTasks(tasks);
    setLoading(false);
    setIsOpen(false);
  };

  return (
    <div className="w-full mb-2">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="w-full group flex items-center justify-center gap-2 p-3 rounded-2xl border border-dashed border-cozy-accent/60 text-cozy-muted hover:text-cozy-clay hover:border-cozy-clay hover:bg-white transition-all duration-300"
        >
          <Sparkles size={16} className="transition-transform group-hover:rotate-12" />
          <span className="font-sans text-sm font-bold">Inspire me with a routine</span>
        </button>
      ) : (
        <div className="bg-white p-5 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-stone-100 animate-slide-up relative overflow-hidden">
          {/* Decor */}
          <div className="absolute -top-10 right-0 w-24 h-24 bg-amber-50 rounded-full blur-3xl -z-10 opacity-60"></div>

          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-stone-500 font-sans tracking-widest uppercase pl-1">Choose a vibe</h3>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-stone-300 hover:text-stone-500 p-1"
            >
              <span className="text-xs font-bold hover:underline">Cancel</span>
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
             <MoodButton 
                icon={<Sun size={20} />} 
                label="Morning" 
                onClick={() => handleGenerate("gentle productive morning")} 
                loading={loading}
             />
             <MoodButton 
                icon={<Coffee size={20} />} 
                label="Focus" 
                onClick={() => handleGenerate("focused work session")} 
                loading={loading}
             />
             <MoodButton 
                icon={<Sparkles size={20} />} 
                label="Self Care" 
                onClick={() => handleGenerate("self care and wellness")} 
                loading={loading}
             />
             <MoodButton 
                icon={<Moon size={20} />} 
                label="Evening" 
                onClick={() => handleGenerate("relaxing evening wind down")} 
                loading={loading}
             />
          </div>
          {loading && (
             <div className="mt-4 text-center">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-50 text-xs text-stone-400 animate-pulse border border-stone-100">
                    <Sparkles size={10} /> Consulting the cozy vibes...
                </span>
             </div>
          )}
        </div>
      )}
    </div>
  );
};

const MoodButton: React.FC<{ icon: React.ReactNode, label: string, onClick: () => void, loading: boolean }> = ({ icon, label, onClick, loading }) => (
    <button
        onClick={onClick}
        disabled={loading}
        className="flex flex-col items-center justify-center gap-3 p-4 rounded-2xl bg-stone-50 hover:bg-cozy-highlight hover:shadow-sm text-stone-600 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group border border-transparent hover:border-stone-200"
    >
        <div className="text-cozy-clay group-hover:scale-110 transition-transform duration-300">{icon}</div>
        <span className="text-xs font-bold text-stone-500 group-hover:text-stone-700">{label}</span>
    </button>
);