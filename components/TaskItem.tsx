import React, { useState } from 'react';
import { Todo } from '../types';
import { Check, Trash2 } from './Icons';
import { generateEncouragement } from '../services/geminiService';

interface TaskItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEncouragement: (msg: string) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({ todo, onToggle, onDelete, onEncouragement }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleToggle = async () => {
    onToggle(todo.id);
    if (!todo.completed) {
        if (Math.random() > 0.7) {
            try {
               const msg = await generateEncouragement(todo.text);
               onEncouragement(msg);
            } catch (e) {
                // ignore
            }
        }
    }
  };

  const handleDelete = () => {
    setIsDeleting(true);
    setTimeout(() => onDelete(todo.id), 300); 
  };

  return (
    <div 
      className={`
        group flex items-center gap-3 p-4 rounded-2xl bg-white border border-transparent shadow-[0_1px_3px_rgba(0,0,0,0.03)] transition-all duration-300
        ${isDeleting ? 'opacity-0 -translate-x-4 h-0 py-0 overflow-hidden' : 'opacity-100 translate-x-0'}
        ${todo.completed 
            ? 'bg-stone-50/80 shadow-none' 
            : 'hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:border-stone-100'}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button
        onClick={handleToggle}
        className={`
          relative flex-shrink-0 w-6 h-6 rounded-full border-2 transition-all duration-300 flex items-center justify-center
          ${todo.completed 
            ? 'bg-cozy-leaf border-cozy-leaf' 
            : 'border-stone-200 hover:border-cozy-leaf bg-transparent'}
        `}
        aria-label={todo.completed ? "Mark as not done" : "Mark as done"}
      >
        <Check 
          size={14} 
          className={`
            text-white transition-all duration-300
            ${todo.completed ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}
          `} 
          strokeWidth={3}
        />
      </button>

      <span 
        className={`
          flex-grow font-serif text-lg transition-all duration-300 select-none break-words
          ${todo.completed ? 'text-stone-300 line-through decoration-stone-200' : 'text-stone-700'}
        `}
      >
        {todo.text}
      </span>

      <button
        onClick={handleDelete}
        className={`
          p-2 rounded-xl text-stone-300 hover:text-red-400 hover:bg-red-50 transition-all duration-200
          ${isHovered || isDeleting ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none md:opacity-0'}
        `}
        aria-label="Delete task"
      >
        <Trash2 size={18} />
      </button>
    </div>
  );
};