import React from 'react';

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 animate-fadeIn">
      <div className="relative w-16 h-16">
        {/* Outer Elegant Golden Ring */}
        <div className="absolute inset-0 rounded-full border-2 border-gold-200 opacity-30"></div>
        {/* Spinning Golden Arch */}
        <div className="absolute inset-0 rounded-full border-2 border-t-gold-500 border-r-gold-500 animate-spin"></div>
        {/* Inner Pulsing Crimson Dot */}
        <div className="absolute inset-4 rounded-full bg-gradient-to-br from-crimson-900 to-crimson-950 animate-pulse opacity-90 flex items-center justify-center shadow-md">
          <span className="text-[7px] text-gold-200 font-serif tracking-widest font-bold scale-90 uppercase">E</span>
        </div>
      </div>
      <p className="font-serif text-[10px] text-gold-600 font-bold uppercase tracking-[0.3em] animate-pulse">
        Loading Ethnivaa...
      </p>
    </div>
  );
};
