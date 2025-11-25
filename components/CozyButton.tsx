import React from 'react';

interface CozyButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'icon';
  loading?: boolean;
}

export const CozyButton: React.FC<CozyButtonProps> = ({ 
  children, 
  variant = 'primary', 
  loading = false,
  className = '', 
  disabled,
  ...props 
}) => {
  
  const baseStyles = "transition-all duration-300 rounded-xl font-sans font-medium flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-cozy-clay disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-cozy-clay text-white hover:bg-[#b08e6b] shadow-sm py-2 px-4 active:scale-95",
    secondary: "bg-cozy-warm text-cozy-text hover:bg-cozy-highlight border border-cozy-highlight py-2 px-4 active:scale-95",
    ghost: "bg-transparent text-cozy-muted hover:text-cozy-text hover:bg-cozy-warm py-2 px-3",
    icon: "p-2 rounded-full hover:bg-cozy-warm text-cozy-muted hover:text-cozy-text transition-colors",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="animate-pulse flex items-center gap-2">
           Wait...
        </span>
      ) : children}
    </button>
  );
};