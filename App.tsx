import React, { useState, useEffect } from 'react';
import { Todo, FilterType, TodoMap } from './types';
import { TaskItem } from './components/TaskItem';
import { Plus, Sparkles, CalendarIcon, Clock, X, Download } from './components/Icons';
import { Calendar } from './components/Calendar';
import { TimeWidget } from './components/TimeWidget';

// Helper to get consistent "YYYY-MM-DD" key in local time
const getDateKey = (date: Date) => {
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - (offset * 60 * 1000));
  return localDate.toISOString().split('T')[0];
};

function App() {
  // State
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  
  const [todosByDate, setTodosByDate] = useState<TodoMap>(() => {
    try {
      const saved = localStorage.getItem('cozy-todos');
      if (!saved) return {};
      
      const parsed = JSON.parse(saved);
      
      // Migration: If old format (array), convert to today's list
      if (Array.isArray(parsed)) {
        const todayKey = getDateKey(new Date());
        return { [todayKey]: parsed };
      }
      
      return parsed;
    } catch (e) {
      console.error("Failed to load todos", e);
      return {};
    }
  });

  const [inputValue, setInputValue] = useState('');
  const [filter, setFilter] = useState<FilterType>(FilterType.ALL);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Persistence
  useEffect(() => {
    localStorage.setItem('cozy-todos', JSON.stringify(todosByDate));
  }, [todosByDate]);

  // Toast Timer
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Install Prompt Listener
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Get current list
  const selectedDateKey = getDateKey(selectedDate);
  const currentTodos = todosByDate[selectedDateKey] || [];

  // Handlers
  const updateTodosForDate = (dateKey: string, newTodos: Todo[]) => {
    setTodosByDate(prev => ({
      ...prev,
      [dateKey]: newTodos
    }));
  };

  const addTodo = (text: string) => {
    if (!text.trim()) return;
    const newTodo: Todo = {
      id: crypto.randomUUID(),
      text: text.trim(),
      completed: false,
      createdAt: Date.now(),
    };
    updateTodosForDate(selectedDateKey, [newTodo, ...currentTodos]);
  };

  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    addTodo(inputValue);
    setInputValue('');
  };

  const toggleTodo = (id: string) => {
    const newTodos = currentTodos.map(t => 
      t.id === id ? { ...t, completed: !t.completed } : t
    );
    updateTodosForDate(selectedDateKey, newTodos);
  };

  const deleteTodo = (id: string) => {
    const newTodos = currentTodos.filter(t => t.id !== id);
    updateTodosForDate(selectedDateKey, newTodos);
  };

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  // Derived state
  const filteredTodos = currentTodos.filter(t => {
    if (filter === FilterType.ACTIVE) return !t.completed;
    if (filter === FilterType.COMPLETED) return t.completed;
    return true;
  });

  const activeCount = currentTodos.filter(t => !t.completed).length;

  // Date formatting for display
  const isToday = getDateKey(new Date()) === selectedDateKey;
  const isTomorrow = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return getDateKey(d) === selectedDateKey;
  })();

  const displayDate = selectedDate.toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  });

  const relativeDateLabel = isToday ? "Today" : isTomorrow ? "Tomorrow" : displayDate.split(',')[0];

  const handleToggleCalendar = () => {
    setShowCalendar(!showCalendar);
    if (showTimer) setShowTimer(false);
  };

  const handleToggleTimer = () => {
    setShowTimer(!showTimer);
    if (showCalendar) setShowCalendar(false);
  };

  return (
    <div className="min-h-screen bg-[#f5f5f4] text-stone-800 flex justify-center py-10 px-4 font-sans selection:bg-cozy-accent selection:text-white">
      <div className="w-full max-w-lg flex flex-col gap-6">
        
        {/* Header */}
        <header className="flex items-end justify-between pb-2 border-b border-transparent">
          <div>
            <p className="text-cozy-clay font-bold uppercase tracking-widest text-[10px] sm:text-xs mb-1">
              {relativeDateLabel}'s Plan
            </p>
            <h1 className="text-3xl sm:text-4xl font-serif text-stone-800 tracking-tight">
              {isToday || isTomorrow ? (isToday ? "Today" : "Tomorrow") : <span className="text-2xl">{displayDate}</span>}
            </h1>
            <p className="text-stone-400 font-serif italic text-sm mt-1">
              {isToday || isTomorrow ? displayDate : "Focus on this day"}
            </p>
          </div>
          
          <div className="flex gap-2 mb-1">
            <button 
              onClick={handleToggleTimer}
              className={`
                p-2.5 rounded-xl transition-all duration-300
                ${showTimer 
                  ? 'bg-cozy-clay text-white shadow-md rotate-0' 
                  : 'bg-white text-stone-400 hover:text-cozy-clay hover:bg-stone-50 shadow-sm'}
              `}
              aria-label="Toggle timer"
              title="Focus Timer"
            >
              {showTimer ? <X size={20} /> : <Clock size={20} />}
            </button>
            
            <button 
              onClick={handleToggleCalendar}
              className={`
                p-2.5 rounded-xl transition-all duration-300
                ${showCalendar 
                  ? 'bg-cozy-clay text-white shadow-md rotate-0' 
                  : 'bg-white text-stone-400 hover:text-cozy-clay hover:bg-stone-50 shadow-sm'}
              `}
              aria-label="Toggle calendar"
              title="Calendar"
            >
              {showCalendar ? <X size={20} /> : <CalendarIcon size={20} />}
            </button>
          </div>
        </header>

        {/* Widgets Area */}
        <div className={`transition-all duration-500 ease-in-out ${showCalendar || showTimer ? 'opacity-100 translate-y-0' : 'h-0 opacity-0 -translate-y-4 overflow-hidden'}`}>
           {showCalendar && (
             <Calendar 
               selectedDate={selectedDate}
               onSelectDate={(date) => {
                 setSelectedDate(date);
               }}
               todosByDate={todosByDate}
               getDateKey={getDateKey}
             />
           )}

           {showTimer && <TimeWidget />}
        </div>

        {/* Input Area */}
        <form onSubmit={handleManualAdd} className="relative group z-10">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={`Add a task for ${relativeDateLabel}...`}
            className="w-full p-4 pr-14 rounded-2xl bg-white text-stone-700 placeholder:text-stone-300 focus:ring-2 focus:ring-cozy-clay/20 focus:outline-none shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all hover:shadow-[0_4px_12px_rgba(0,0,0,0.04)]"
          />
          <button 
            type="submit"
            disabled={!inputValue.trim()}
            className="absolute right-2 top-2 bottom-2 aspect-square rounded-xl bg-cozy-clay text-white flex items-center justify-center hover:bg-[#b08e6b] disabled:opacity-0 disabled:scale-75 transition-all duration-300 shadow-sm"
            aria-label="Add task"
          >
            <Plus size={20} />
          </button>
        </form>

        {/* Filters */}
        <div className="flex items-center justify-between px-1 mt-2">
          <div className="flex gap-1 bg-white/60 p-1 rounded-xl shadow-sm border border-white">
             {[FilterType.ALL, FilterType.ACTIVE, FilterType.COMPLETED].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`
                    px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-300
                    ${filter === f 
                        ? 'bg-cozy-warm text-stone-800 shadow-sm' 
                        : 'text-stone-400 hover:text-stone-600 hover:bg-stone-100/50'}
                  `}
                >
                  {f === FilterType.ALL ? 'All' : f === FilterType.ACTIVE ? 'To Do' : 'Done'}
                </button>
             ))}
          </div>
          <span className="text-xs text-stone-400 font-medium px-2">
            {activeCount} remaining
          </span>
        </div>

        {/* List */}
        <div className="flex flex-col min-h-[200px] gap-3">
          {filteredTodos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 text-stone-200 animate-pulse">
                {filter === FilterType.COMPLETED ? (
                   <Sparkles size={48} strokeWidth={1} />
                ) : (
                   <div className="text-4xl">🌱</div>
                )}
              </div>
              <p className="font-serif text-lg text-stone-400">
                {filter === FilterType.COMPLETED 
                  ? "No completed tasks yet." 
                  : `No tasks for ${relativeDateLabel}.`}
              </p>
              {filter !== FilterType.COMPLETED && (
                  <p className="text-xs text-stone-300 mt-2">Type above to begin.</p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTodos.map(todo => (
                <TaskItem 
                  key={todo.id} 
                  todo={todo} 
                  onToggle={toggleTodo} 
                  onDelete={deleteTodo}
                  onEncouragement={(msg) => setToastMessage(msg)}
                />
              ))}
            </div>
          )}
        </div>
        
        {/* Footer info */}
        <div className="text-center mt-auto py-8 flex flex-col items-center gap-4">
           {!isToday && (
             <button 
               onClick={() => {
                  setSelectedDate(new Date());
                  setShowCalendar(false);
                  setShowTimer(false);
               }}
               className="text-xs text-stone-400 hover:text-cozy-clay underline decoration-dotted underline-offset-4 transition-all duration-300 animate-fade-in"
             >
               Return to Today
             </button>
           )}

           {deferredPrompt && (
              <button
                onClick={handleInstallClick}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 border border-stone-200 text-stone-500 hover:bg-white hover:text-cozy-clay hover:border-cozy-clay transition-all shadow-sm text-xs font-bold uppercase tracking-wider animate-slide-up"
              >
                 <Download size={14} /> Install App
              </button>
           )}
        </div>

      </div>

      {/* Toast Notification */}
      <div 
        className={`
          fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 rounded-2xl bg-stone-800 text-stone-50 shadow-2xl z-50 transition-all duration-500 flex items-center gap-3 border border-stone-700
          ${toastMessage ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-8 opacity-0 scale-95 pointer-events-none'}
        `}
      >
        <Sparkles size={16} className="text-amber-200" />
        <span className="font-medium text-sm">{toastMessage}</span>
      </div>

    </div>
  );
}

export default App;