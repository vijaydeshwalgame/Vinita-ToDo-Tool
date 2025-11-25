import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from './Icons';
import { TodoMap } from '../types';

interface CalendarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  todosByDate: TodoMap;
  getDateKey: (date: Date) => string;
}

export const Calendar: React.FC<CalendarProps> = ({ 
  selectedDate, 
  onSelectDate, 
  todosByDate,
  getDateKey 
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate));

  // Reset calendar view to selected date when it changes externally
  useEffect(() => {
    setCurrentMonth(new Date(selectedDate));
  }, [selectedDate]);

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const renderDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    
    const days = [];

    // Empty cells for days before the 1st
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="w-full aspect-square" />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateKey = getDateKey(date);
      const isSelected = getDateKey(selectedDate) === dateKey;
      const isToday = getDateKey(new Date()) === dateKey;
      
      const dayTodos = todosByDate[dateKey] || [];
      const hasTodos = dayTodos.length > 0;
      const allCompleted = hasTodos && dayTodos.every(t => t.completed);

      days.push(
        <button
          key={day}
          onClick={() => onSelectDate(date)}
          className={`
            w-full aspect-square rounded-xl flex flex-col items-center justify-center relative transition-all duration-200 group
            ${isSelected 
              ? 'bg-cozy-clay text-white shadow-md scale-105 z-10' 
              : 'hover:bg-stone-50 text-stone-600'}
            ${isToday && !isSelected ? 'text-cozy-clay font-bold ring-1 ring-cozy-clay/30' : ''}
          `}
        >
          <span className={`text-sm ${isSelected ? 'font-bold' : ''}`}>{day}</span>
          
          {/* Status Dots */}
          <div className="flex gap-0.5 mt-1 h-1.5 items-center justify-center">
             {hasTodos && !isSelected && (
                <span className={`
                  w-1.5 h-1.5 rounded-full
                  ${allCompleted ? 'bg-cozy-leaf' : 'bg-cozy-accent'}
                `} />
             )}
             {hasTodos && isSelected && (
                 <span className="w-1.5 h-1.5 rounded-full bg-white/70" />
             )}
          </div>
        </button>
      );
    }
    return days;
  };

  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="bg-white p-5 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-stone-100 animate-slide-up mb-6 select-none relative overflow-hidden">
       {/* Decor */}
       <div className="absolute top-0 left-0 w-24 h-24 bg-stone-50 rounded-full blur-3xl -z-10 opacity-60 -translate-x-5 -translate-y-5"></div>

      <div className="flex items-center justify-between mb-6 px-1">
        <button 
          onClick={prevMonth}
          className="p-2 rounded-xl hover:bg-stone-50 text-stone-400 hover:text-stone-600 transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <h2 className="font-serif font-bold text-stone-700 text-lg tracking-wide">{monthName}</h2>
        <button 
          onClick={nextMonth}
          className="p-2 rounded-xl hover:bg-stone-50 text-stone-400 hover:text-stone-600 transition-colors"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-2 px-1">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
          <div key={day} className="h-8 flex items-center justify-center text-[10px] font-extrabold text-stone-300 uppercase tracking-widest">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 place-items-center">
        {renderDays()}
      </div>
    </div>
  );
};