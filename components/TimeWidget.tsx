import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Clock, Timer } from './Icons';

type Mode = 'timer' | 'stopwatch';

export const TimeWidget: React.FC = () => {
  const [mode, setMode] = useState<Mode>(() => {
    return (localStorage.getItem('cozy-time-mode') as Mode) || 'timer';
  });

  useEffect(() => {
    localStorage.setItem('cozy-time-mode', mode);
  }, [mode]);

  return (
    <div className="bg-white p-6 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-stone-100 animate-fade-in mb-6 relative overflow-hidden">
      
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-cozy-warm rounded-full blur-3xl -z-10 opacity-50 translate-x-10 -translate-y-10"></div>

      <div className="flex justify-center mb-8">
        <div className="bg-stone-100/80 p-1 rounded-2xl flex relative">
          <button
            onClick={() => setMode('timer')}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all duration-300 z-10 ${
              mode === 'timer' 
                ? 'bg-white text-stone-800 shadow-sm' 
                : 'text-stone-400 hover:text-stone-600'
            }`}
          >
            <Timer size={14} className={mode === 'timer' ? 'text-cozy-clay' : ''} /> Timer
          </button>
          <button
            onClick={() => setMode('stopwatch')}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all duration-300 z-10 ${
              mode === 'stopwatch' 
                ? 'bg-white text-stone-800 shadow-sm' 
                : 'text-stone-400 hover:text-stone-600'
            }`}
          >
            <Clock size={14} className={mode === 'stopwatch' ? 'text-cozy-clay' : ''} /> Stopwatch
          </button>
        </div>
      </div>

      <div className="min-h-[300px] flex flex-col justify-center">
        {mode === 'timer' ? <CountdownTimer /> : <Stopwatch />}
      </div>
    </div>
  );
};

const Stopwatch = () => {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    const loadState = () => {
      const saved = localStorage.getItem('cozy-stopwatch');
      if (saved) {
        const { isRunning: wasRunning, startTime, accumulated } = JSON.parse(saved);
        if (wasRunning) {
          const now = Date.now();
          const elapsedSinceStart = now - startTime;
          setTime(accumulated + elapsedSinceStart);
          setIsRunning(true);
        } else {
          setTime(accumulated);
          setIsRunning(false);
        }
      }
    };
    loadState();
  }, []);

  useEffect(() => {
    if (isRunning) {
      const startTime = Date.now() - time;
      localStorage.setItem('cozy-stopwatch', JSON.stringify({
        isRunning: true,
        startTime: Date.now(), 
        accumulated: time
      }));

      intervalRef.current = window.setInterval(() => {
        setTime(Date.now() - startTime);
      }, 10);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      localStorage.setItem('cozy-stopwatch', JSON.stringify({
        isRunning: false,
        startTime: 0,
        accumulated: time
      }));
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  const toggle = () => setIsRunning(!isRunning);
  
  const reset = () => {
    setIsRunning(false);
    setTime(0);
    localStorage.removeItem('cozy-stopwatch');
  };

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const centiseconds = Math.floor((ms % 1000) / 10);
    return {
        main: `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`,
        sub: `.${centiseconds.toString().padStart(2, '0')}`
    };
  };

  const display = formatTime(time);

  return (
    <div className="flex flex-col items-center animate-fade-in">
      <div className="flex items-baseline mb-12">
          <span className="text-7xl font-serif font-medium text-stone-700 tabular-nums tracking-wide">
            {display.main}
          </span>
          <span className="text-4xl font-serif font-medium text-stone-400 tabular-nums w-16">
            {display.sub}
          </span>
      </div>
      
      <div className="flex gap-6 items-center">
        <button
          onClick={reset}
          className="h-12 w-12 rounded-full flex items-center justify-center bg-stone-100 text-stone-400 hover:bg-stone-200 hover:text-stone-600 transition-all active:scale-95"
          aria-label="Reset stopwatch"
        >
          <RotateCcw size={18} />
        </button>

        <button
          onClick={toggle}
          className={`h-20 w-20 rounded-full flex items-center justify-center transition-all active:scale-95 shadow-lg ${
            isRunning 
                ? 'bg-stone-100 text-stone-600 ring-2 ring-stone-200 ring-offset-2' 
                : 'bg-cozy-clay text-white hover:bg-[#b08e6b] shadow-cozy-clay/30'
          }`}
          aria-label={isRunning ? "Pause stopwatch" : "Start stopwatch"}
        >
          {isRunning ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
        </button>
      </div>
    </div>
  );
};

const CountdownTimer = () => {
  const [duration, setDuration] = useState(25 * 60 * 1000); 
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('cozy-timer');
    if (saved) {
      const data = JSON.parse(saved);
      setDuration(data.duration || 25 * 60 * 1000);
      
      if (data.isRunning) {
        const remaining = data.targetTime - Date.now();
        if (remaining > 0) {
          setTimeLeft(remaining);
          setIsRunning(true);
        } else {
          setTimeLeft(0);
          setIsRunning(false);
        }
      } else {
        setTimeLeft(data.remaining);
      }
    }
  }, []);

  useEffect(() => {
    if (isRunning) {
      const targetTime = Date.now() + timeLeft;
      
      localStorage.setItem('cozy-timer', JSON.stringify({
        isRunning: true,
        targetTime,
        duration,
        remaining: timeLeft
      }));

      intervalRef.current = window.setInterval(() => {
        const newLeft = targetTime - Date.now();
        if (newLeft <= 0) {
            setTimeLeft(0);
            setIsRunning(false);
            localStorage.setItem('cozy-timer', JSON.stringify({
                isRunning: false,
                targetTime: 0,
                duration,
                remaining: 0
            }));
        } else {
            setTimeLeft(newLeft);
        }
      }, 100);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      localStorage.setItem('cozy-timer', JSON.stringify({
        isRunning: false,
        targetTime: 0,
        duration,
        remaining: timeLeft
      }));
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, duration]);

  const toggle = () => setIsRunning(!isRunning);
  
  const reset = () => {
    setIsRunning(false);
    setTimeLeft(duration);
  };

  const setPreset = (mins: number) => {
    const newDuration = mins * 60 * 1000;
    setDuration(newDuration);
    setTimeLeft(newDuration);
    setIsRunning(false);
  };

  const formatTime = (ms: number) => {
    if (ms < 0) ms = 0;
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center animate-fade-in">
      <div className="flex items-baseline mb-8 mt-4">
        <span className="text-7xl font-serif font-medium text-stone-700 tabular-nums tracking-wide">
            {formatTime(timeLeft)}
        </span>
      </div>

      <div className="flex gap-2 mb-12 bg-stone-50 p-1.5 rounded-xl">
        {[5, 15, 25, 45].map(m => (
             <button
                key={m}
                onClick={() => setPreset(m)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    duration === m * 60 * 1000 
                        ? 'bg-white text-stone-800 shadow-sm scale-105' 
                        : 'text-stone-400 hover:text-stone-600 hover:bg-stone-100'
                }`}
             >
                {m}m
             </button>
        ))}
      </div>

      <div className="flex gap-6 items-center">
        <button
          onClick={reset}
          className="h-12 w-12 rounded-full flex items-center justify-center bg-stone-100 text-stone-400 hover:bg-stone-200 hover:text-stone-600 transition-all active:scale-95"
          aria-label="Reset timer"
        >
          <RotateCcw size={18} />
        </button>

        <button
          onClick={toggle}
          disabled={timeLeft <= 0}
          className={`h-20 w-20 rounded-full flex items-center justify-center transition-all active:scale-95 shadow-lg ${
            isRunning 
                ? 'bg-stone-100 text-stone-600 ring-2 ring-stone-200 ring-offset-2' 
                : timeLeft <= 0 
                    ? 'bg-stone-100 text-stone-300 cursor-not-allowed'
                    : 'bg-cozy-clay text-white hover:bg-[#b08e6b] shadow-cozy-clay/30'
          }`}
          aria-label={isRunning ? "Pause timer" : "Start timer"}
        >
          {isRunning ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
        </button>
      </div>
    </div>
  );
};
