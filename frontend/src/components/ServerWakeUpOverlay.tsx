import React, { useEffect, useState } from 'react';
import { useShop } from '../context/ShopContext';
import { Sparkles } from 'lucide-react';

const BroochSpinner: React.FC<{ size?: number }> = ({ size = 80 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 100 100" 
    fill="none" 
    className="animate-[spin_20s_linear_infinite] drop-shadow-md"
  >
    <defs>
      <radialGradient id="goldPetalOverlay" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#FFF9D2" />
        <stop offset="50%" stopColor="#D4AF37" />
        <stop offset="100%" stopColor="#AA7C11" />
      </radialGradient>
      <radialGradient id="rubyCenterOverlay" cx="35%" cy="35%" r="65%">
        <stop offset="0%" stopColor="#FF4D6D" />
        <stop offset="40%" stopColor="#C2102C" />
        <stop offset="100%" stopColor="#4A0D17" />
      </radialGradient>
    </defs>
    {/* Outer Petals */}
    {[...Array(8)].map((_, i) => {
      const angle = (i * 360) / 8;
      return (
        <path
          key={i}
          d="M 50 15 C 38 2 28 2 28 25 C 28 42 42 48 50 50 C 58 48 72 42 72 25 C 72 2 62 2 50 15 Z"
          fill="url(#goldPetalOverlay)"
          transform={`rotate(${angle} 50 50)`}
          stroke="#AA7C11"
          strokeWidth="0.5"
        />
      );
    })}
    {/* Center Ruby */}
    <circle cx="50" cy="50" r="12" fill="url(#rubyCenterOverlay)" stroke="#4A0D17" strokeWidth="1" />
  </svg>
);

export const ServerWakeUpOverlay: React.FC = () => {
  const { isWakingUp, wakingProgress } = useShop();
  const [statusMessage, setStatusMessage] = useState('Polishing the jewelry...');

  useEffect(() => {
    if (wakingProgress < 25) {
      setStatusMessage('Stoking the furnace of the royal boutique...');
    } else if (wakingProgress < 50) {
      setStatusMessage('Waking up our Render servers (takes about 50 seconds)...');
    } else if (wakingProgress < 75) {
      setStatusMessage('Unlocking the vaults and polishing the gold...');
    } else if (wakingProgress < 95) {
      setStatusMessage('Almost there, preparing your royal experience...');
    } else if (wakingProgress >= 100) {
      setStatusMessage('Welcome! Entering the boutique...');
    }
  }, [wakingProgress]);

  if (!isWakingUp) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#FAF6EE]/95 backdrop-blur-md p-6 animate-fadeIn transition-all duration-500">
      {/* Decorative Traditional Border Frames */}
      <div className="absolute inset-4 border border-gold-400/20 pointer-events-none rounded-2xl"></div>
      <div className="absolute inset-5 border border-dashed border-gold-400/10 pointer-events-none rounded-2xl"></div>
      
      {/* Main Card */}
      <div className="max-w-md w-full text-center space-y-8 z-10 glass-premium rounded-3xl p-8 sm:p-10 shadow-xl border border-gold-300/30 flex flex-col items-center">
        {/* Animated Icon */}
        <div className="relative flex items-center justify-center w-24 h-24">
          <div className="absolute inset-0 rounded-full border-2 border-dashed border-gold-300/30 animate-[spin_40s_linear_infinite]"></div>
          <BroochSpinner size={80} />
          <div className="absolute -top-1 -right-1 bg-gold-400 text-crimson-950 p-1.5 rounded-full animate-bounce shadow-md">
            <Sparkles size={12} className="animate-pulse" />
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <span className="text-[10px] tracking-[0.3em] uppercase text-gold-600 font-bold font-sans">
            Render Free Server Cold Start
          </span>
          <h3 className="font-serif text-2xl sm:text-3xl font-extrabold text-crimson-950">
            Opening Treasury Vaults
          </h3>
          <div className="w-16 h-0.5 bg-gold-400 mx-auto mt-2"></div>
        </div>

        {/* Description */}
        <p className="text-sm text-obsidian-600 font-sans max-w-sm">
          Our servers are waking up from a deep slumber. This happens automatically when the site hasn't been visited for 15 minutes.
        </p>

        {/* Progress Section */}
        <div className="w-full space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="font-serif font-bold text-gold-600 uppercase tracking-wider animate-pulse min-h-[1.25rem] text-left block">
              {statusMessage}
            </span>
            <span className="font-sans font-bold text-crimson-950">{wakingProgress}%</span>
          </div>

          {/* Progress Track */}
          <div className="w-full h-2 bg-gold-100 rounded-full overflow-hidden border border-gold-200/20">
            <div 
              className="h-full bg-gradient-to-r from-gold-500 to-crimson-900 transition-all duration-300 ease-out rounded-full shadow-[0_0_8px_rgba(212,175,55,0.5)]"
              style={{ width: `${wakingProgress}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};
