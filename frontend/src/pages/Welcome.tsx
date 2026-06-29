import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { Sparkles, ArrowRight, Gift, Gem, Compass, Crown } from 'lucide-react';

// Reusable detailed SVG Golden Flower Brooch with Ruby Center
const Brooch: React.FC<{ size?: number; className?: string }> = ({ size = 64, className }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 100 100" 
    fill="none" 
    className={className}
    style={{ filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.12))' }}
  >
    <defs>
      <radialGradient id="goldPetal" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#FFF9D2" />
        <stop offset="50%" stopColor="#D4AF37" />
        <stop offset="100%" stopColor="#AA7C11" />
      </radialGradient>
      <radialGradient id="rubyCenter" cx="35%" cy="35%" r="65%">
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
          fill="url(#goldPetal)"
          transform={`rotate(${angle} 50 50)`}
          stroke="#AA7C11"
          strokeWidth="0.5"
        />
      );
    })}
    {/* Inner Petals */}
    {[...Array(8)].map((_, i) => {
      const angle = (i * 360) / 8 + 22.5;
      return (
        <path
          key={i}
          d="M 50 22 C 42 10 34 10 34 28 C 34 40 44 45 50 46 C 56 45 66 40 66 28 C 66 10 58 10 50 22 Z"
          fill="url(#goldPetal)"
          transform={`rotate(${angle} 50 50)`}
          opacity="0.85"
          stroke="#815C1B"
          strokeWidth="0.5"
        />
      );
    })}
    {/* Small Golden beads ring */}
    <circle cx="50" cy="50" r="16" stroke="#AA7C11" strokeWidth="1.5" strokeDasharray="3,3" />
    {/* Center Ruby Cabochon */}
    <circle cx="50" cy="50" r="13" fill="url(#rubyCenter)" stroke="#4A0D17" strokeWidth="1" />
    <circle cx="47" cy="47" r="10" fill="none" stroke="white" strokeWidth="0.5" opacity="0.25" />
  </svg>
);

// Reusable rotating SVG Mandala background silhouette
const MandalaBackground: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    viewBox="0 0 200 200" 
    fill="none" 
    stroke="#D4AF37" 
    strokeWidth="0.4" 
    className={className}
  >
    <circle cx="100" cy="100" r="90" strokeDasharray="1,5" />
    <circle cx="100" cy="100" r="80" />
    <circle cx="100" cy="100" r="70" strokeDasharray="3,3" />
    {[...Array(12)].map((_, i) => {
      const angle = (i * 360) / 12;
      return (
        <g key={i} transform={`rotate(${angle} 100 100)`}>
          <path d="M 100 20 C 90 40 85 60 100 100 C 115 60 110 40 100 20 Z" />
          <path d="M 100 40 C 95 55 90 70 100 100 C 110 70 105 55 100 40 Z" opacity="0.5" />
          <circle cx="100" cy="30" r="2" fill="#D4AF37" />
        </g>
      );
    })}
    <circle cx="100" cy="100" r="40" />
    <circle cx="100" cy="100" r="25" strokeDasharray="2,2" />
  </svg>
);

export const Welcome: React.FC = () => {
  const { recordVisit, isWakingUp, wakingProgress } = useShop();
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // If this browser session already entered, skip the splash screen
    if (sessionStorage.getItem('ethnivaa_session_entered')) {
      navigate('/home', { replace: true });
      return;
    }
    // Trigger entry animations
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, [navigate]);

  const handleEnter = () => {
    // Mark session as entered so Welcome won't show again until tab is closed
    sessionStorage.setItem('ethnivaa_session_entered', 'true');
    setIsExiting(true);
    recordVisit(); // Increment visitor count when user enters the boutique
    setTimeout(() => {
      navigate('/home');
    }, 600); // Wait for fade-out animation to complete
  };

  return (
    <div
      className={`min-h-screen w-full bg-[#FAF6EE] relative flex flex-col justify-between items-center overflow-hidden transition-all duration-700 ${
        isExiting ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
      }`}
    >
      {/* Background Ornaments / Decorative Graphics */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
        
        {/* Soft fabric draping / gradient overlays */}
        <div className="absolute -top-10 -right-10 w-[40rem] h-[40rem] bg-gradient-to-br from-gold-100/10 to-transparent rounded-full filter blur-3xl"></div>
        <div className="absolute -bottom-10 -left-10 w-[40rem] h-[40rem] bg-gradient-to-tr from-gold-100/10 to-transparent rounded-full filter blur-3xl"></div>

        {/* Mandalas */}
        <MandalaBackground className="absolute -left-24 top-[15%] w-96 h-96 opacity-[0.06] animate-[spin_120s_linear_infinite]" />
        <MandalaBackground className="absolute -right-24 bottom-[20%] w-96 h-96 opacity-[0.06] animate-[spin_180s_linear_infinite]" />

        {/* Scattered Pearls (3D styled circle elements) */}
        {/* Left Pearls */}
        <div 
          className="absolute left-[12%] top-[18%] w-4 h-4 rounded-full"
          style={{
            background: 'radial-gradient(circle at 30% 30%, #ffffff 0%, #fcf9f2 50%, #e1d2be 100%)',
            boxShadow: '1px 2px 4px rgba(0, 0, 0, 0.12), inset -1px -1px 2px rgba(0,0,0,0.05)'
          }}
        ></div>
        <div 
          className="absolute left-[5%] top-[55%] w-3.5 h-3.5 rounded-full"
          style={{
            background: 'radial-gradient(circle at 30% 30%, #ffffff 0%, #fcf9f2 50%, #e1d2be 100%)',
            boxShadow: '1px 2px 4px rgba(0, 0, 0, 0.12), inset -1px -1px 2px rgba(0,0,0,0.05)'
          }}
        ></div>
        <div 
          className="absolute left-[15%] top-[72%] w-4.5 h-4.5 rounded-full"
          style={{
            background: 'radial-gradient(circle at 30% 30%, #ffffff 0%, #fcf9f2 50%, #e1d2be 100%)',
            boxShadow: '1px 2px 4px rgba(0, 0, 0, 0.12), inset -1px -1px 2px rgba(0,0,0,0.05)'
          }}
        ></div>
        
        {/* Right Pearls */}
        <div 
          className="absolute right-[6%] top-[22%] w-4 h-4 rounded-full"
          style={{
            background: 'radial-gradient(circle at 30% 30%, #ffffff 0%, #fcf9f2 50%, #e1d2be 100%)',
            boxShadow: '1px 2px 4px rgba(0, 0, 0, 0.12), inset -1px -1px 2px rgba(0,0,0,0.05)'
          }}
        ></div>
        <div 
          className="absolute right-[12%] top-[50%] w-3 h-3 rounded-full"
          style={{
            background: 'radial-gradient(circle at 30% 30%, #ffffff 0%, #fcf9f2 50%, #e1d2be 100%)',
            boxShadow: '1px 2px 4px rgba(0, 0, 0, 0.12), inset -1px -1px 2px rgba(0,0,0,0.05)'
          }}
        ></div>
        <div 
          className="absolute right-[16%] top-[76%] w-4.5 h-4.5 rounded-full"
          style={{
            background: 'radial-gradient(circle at 30% 30%, #ffffff 0%, #fcf9f2 50%, #e1d2be 100%)',
            boxShadow: '1px 2px 4px rgba(0, 0, 0, 0.12), inset -1px -1px 2px rgba(0,0,0,0.05)'
          }}
        ></div>

        {/* Scattered Brooches */}
        <Brooch size={72} className="absolute left-[6%] top-[60%] animate-pulseGold" />
        <Brooch size={64} className="absolute right-[8%] top-[14%] animate-pulseGold" />
        <Brooch size={56} className="absolute right-[10%] top-[62%] animate-pulseGold" />

        {/* Traditional Royal Border Frames */}
        <div className="absolute inset-4 sm:inset-6 border border-gold-400/15 pointer-events-none rounded-2xl"></div>
        <div className="absolute inset-5 sm:inset-7 border border-dashed border-gold-400/10 pointer-events-none rounded-2xl"></div>
      </div>

      {/* Top Header Section */}
      <div 
        className={`w-full max-w-xl text-center z-10 transition-all duration-1000 transform pt-12 ${
          isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
        }`}
      >
        <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-crimson-950/5 text-crimson-900 text-[10px] sm:text-xs font-bold tracking-[0.3em] uppercase border border-gold-400/20 font-sans">
          <Sparkles size={12} className="text-gold-500 animate-pulse" />
          The Heritage of Fine Jewellery
          <Sparkles size={12} className="text-gold-500 animate-pulse" />
        </span>
      </div>

      {/* Main Layout Row (Left list, Center card, Right list) */}
      <div className="w-full max-w-7xl px-4 flex flex-row items-center justify-center gap-8 lg:gap-16 xl:gap-24 my-auto z-10">
        
        {/* Left Column (Desktop Only) */}
        <div 
          className={`hidden xl:flex flex-col items-center text-center space-y-4 w-60 transition-all duration-1000 delay-300 transform ${
            isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
          }`}
        >
          <div className="space-y-1">
            <h3 className="font-serif text-gold-600 font-bold tracking-[0.25em] text-[13px] uppercase">Handcrafted</h3>
            <h3 className="font-serif text-gold-600 font-bold tracking-[0.25em] text-[13px] uppercase">With Love</h3>
          </div>
          <div className="w-10 h-0.5 bg-gold-400/30"></div>
          <ul className="space-y-3.5 font-sans text-[10px] text-crimson-950 font-bold tracking-[0.3em] uppercase opacity-75">
            <li>Celebrating</li>
            <li>Tradition</li>
            <li>Embracing</li>
            <li>Elegance</li>
          </ul>
        </div>

        {/* Centerpiece Container (Card & Button) */}
        <div className="flex flex-col items-center space-y-8 max-w-[350px] sm:max-w-[400px] md:max-w-[460px] w-full">
          {/* Centerpiece Logo Card with Neon Gold Glow */}
          <div 
            className={`w-full transition-all duration-1000 delay-200 transform ${
              isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}
          >
            <div className="relative group p-2 sm:p-2.5 rounded-2xl bg-white border border-gold-400/20 shadow-[0_0_30px_rgba(212,175,55,0.35)] hover:shadow-[0_0_40px_rgba(212,175,55,0.5)] transition-all duration-500">
              {/* Top arch / border overlay decoration */}
              <div className="absolute inset-1.5 border border-gold-400/12 rounded-xl pointer-events-none group-hover:border-gold-400/25 transition-colors duration-500"></div>
              
              {/* Logo Image */}
              <div className="relative overflow-hidden rounded-lg border border-gold-200/40">
                <img 
                  src="/logo.jpg" 
                  alt="Ethnivaa Handcrafted Ethnic Jewellery" 
                  className="w-full h-auto object-cover max-h-[400px] sm:max-h-[480px] transition-transform duration-700 group-hover:scale-103"
                />
                {/* Shimmer Overlay on image */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:animate-shimmer pointer-events-none"></div>
              </div>
            </div>
          </div>

          {/* Enter Button / Simulated Progress */}
          <div 
            className={`transition-all duration-1000 delay-400 transform w-full flex justify-center min-h-[4.5rem] items-center ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            {isWakingUp ? (
              <div className="w-full max-w-[280px] sm:max-w-[320px] space-y-3 animate-fadeIn bg-white/70 backdrop-blur-sm p-4 rounded-2xl border border-gold-200/50 shadow-gold shadow-sm">
                <div className="flex justify-between items-center text-[10px] sm:text-xs">
                  <span className="font-serif font-bold text-gold-600 uppercase tracking-wider animate-pulse min-h-[1.25rem] text-left block">
                    {wakingProgress < 25 ? 'Stoking the boutique furnace...' :
                     wakingProgress < 50 ? 'Opening the royal boutique...' :
                     wakingProgress < 75 ? 'Polishing ornaments...' :
                     'Preparing your royal experience...'}
                  </span>
                  <span className="font-sans font-bold text-crimson-950">{wakingProgress}%</span>
                </div>
                {/* Progress Track */}
                <div className="w-full h-1.5 bg-gold-100 rounded-full overflow-hidden border border-gold-200/20">
                  <div 
                    className="h-full bg-gradient-to-r from-gold-500 to-crimson-900 transition-all duration-300 ease-out rounded-full shadow-[0_0_6px_rgba(212,175,55,0.4)]"
                    style={{ width: `${wakingProgress}%` }}
                  ></div>
                </div>
              </div>
            ) : (
              <button
                onClick={handleEnter}
                className="bg-gold-gradient hover:opacity-95 text-crimson-950 font-bold uppercase tracking-[0.2em] text-xs px-12 py-4 rounded-full transition-all duration-300 shadow-[0_4px_15px_rgba(212,175,55,0.25)] hover:shadow-[0_0_20px_rgba(212,175,55,0.55)] flex items-center gap-2.5 group hover:scale-105 active:scale-98 animate-fadeIn"
              >
                <span>Enter the Boutique</span>
                <ArrowRight size={14} className="group-hover:translate-x-1.5 transition-transform duration-300" />
              </button>
            )}
          </div>
        </div>

        {/* Right Column (Desktop Only) */}
        <div 
          className={`hidden xl:flex flex-col items-center text-center space-y-4 w-60 transition-all duration-1000 delay-300 transform ${
            isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
          }`}
        >
          <div className="space-y-1">
            <h3 className="font-serif text-gold-600 font-bold tracking-[0.25em] text-[13px] uppercase">Rooted in Heritage</h3>
            <h3 className="font-serif text-gold-600 font-bold tracking-[0.25em] text-[13px] uppercase">Made For You</h3>
          </div>
          <div className="w-10 h-0.5 bg-gold-400/30"></div>
          <ul className="space-y-3.5 font-sans text-[10px] text-crimson-950 font-bold tracking-[0.3em] uppercase opacity-75">
            <li>Authentic Designs</li>
            <li>Timeless Beauty</li>
            <li>Uniquely Yours</li>
          </ul>
        </div>
      </div>

      {/* Bottom Value Props Bar (Hidden on Mobile/Tablet, Visible on Large Screens) */}
      <div 
        className={`w-full border-t border-gold-400/15 bg-white/40 backdrop-blur-sm py-8 z-10 hidden lg:block transition-all duration-1000 delay-500 transform ${
          isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-4 gap-4">
          {/* Prop 1 */}
          <div className="flex items-start gap-3.5 px-4">
            <span className="text-gold-600 bg-gold-50/50 p-2.5 rounded-xl border border-gold-200/50 shadow-sm shrink-0">
              <Crown size={18} />
            </span>
            <div className="space-y-0.5">
              <h4 className="font-serif text-[12px] font-bold text-crimson-950 uppercase tracking-wider">Artisan Made</h4>
              <p className="font-sans text-[11px] text-obsidian-600 font-light leading-relaxed">Each piece is crafted by skilled artisans</p>
            </div>
          </div>
          
          {/* Prop 2 */}
          <div className="flex items-start gap-3.5 px-4 border-l border-gold-400/10">
            <span className="text-gold-600 bg-gold-50/50 p-2.5 rounded-xl border border-gold-200/50 shadow-sm shrink-0">
              <Compass size={18} />
            </span>
            <div className="space-y-0.5">
              <h4 className="font-serif text-[12px] font-bold text-crimson-950 uppercase tracking-wider">Ethnic & Authentic</h4>
              <p className="font-sans text-[11px] text-obsidian-600 font-light leading-relaxed">Inspired by traditions, designed for today</p>
            </div>
          </div>

          {/* Prop 3 */}
          <div className="flex items-start gap-3.5 px-4 border-l border-gold-400/10">
            <span className="text-gold-600 bg-gold-50/50 p-2.5 rounded-xl border border-gold-200/50 shadow-sm shrink-0">
              <Gem size={18} />
            </span>
            <div className="space-y-0.5">
              <h4 className="font-serif text-[12px] font-bold text-crimson-950 uppercase tracking-wider">Fine Quality</h4>
              <p className="font-sans text-[11px] text-obsidian-600 font-light leading-relaxed">Premium materials for timeless elegance</p>
            </div>
          </div>

          {/* Prop 4 */}
          <div className="flex items-start gap-3.5 px-4 border-l border-gold-400/10">
            <span className="text-gold-600 bg-gold-50/50 p-2.5 rounded-xl border border-gold-200/50 shadow-sm shrink-0">
              <Gift size={18} />
            </span>
            <div className="space-y-0.5">
              <h4 className="font-serif text-[12px] font-bold text-crimson-950 uppercase tracking-wider">Perfect Gift</h4>
              <p className="font-sans text-[11px] text-obsidian-600 font-light leading-relaxed">Treasured pieces for every celebration</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
