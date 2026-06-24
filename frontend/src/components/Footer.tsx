import React from 'react';
import { useShop } from '../context/ShopContext';
import { Mail, Phone, MapPin, ShieldAlert, Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  const { navigateTo, currentUserRole, visitorCount } = useShop();

  return (
    <footer className="bg-obsidian-950 text-ivory-300 font-sans border-t border-gold-950 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
          
          {/* Brand Info */}
          <div className="space-y-6">
            <div>
              <span className="font-serif text-3xl font-bold tracking-widest text-gold-400">
                ETHNIVAA
              </span>
              <p className="text-[10px] uppercase tracking-[0.3em] text-gold-200 mt-1">
                Where Tradition Meets Timeless Beauty
              </p>
            </div>
            <p className="text-sm text-ivory-400 font-light leading-relaxed">
              Ethnivaa celebrates the timeless beauty of Indian heritage through handcrafted jewellery inspired by traditional artistry. From Navratri collections to elegant wedding sets, every piece reflects culture, craftsmanship, and elegance.
            </p>
          </div>

          {/* Contact Details */}
          <div className="space-y-6">
            <h3 className="font-serif text-lg text-gold-400 font-semibold tracking-wider">Heritage Lounge</h3>
            <ul className="space-y-4 text-sm font-light text-ivory-400">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-gold-400 shrink-0 mt-0.5" />
                <span>
                  PLOT NO 1919, "NIRNAD" FLAT, G1, A WING, BETWEEN RUPANI CIRCLE TO SANSKAR MANDAL AND OPP. VALIYA HOSPITAL BHAVNAGAR-364002.
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={16} className="text-gold-400 shrink-0" />
                <span>+91 78748 60077</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={16} className="text-gold-400 shrink-0" />
                <span>ethnivaa.help@gmail.com</span>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-6">
            <h3 className="font-serif text-lg text-gold-400 font-semibold tracking-wider">Legal</h3>
            <ul className="space-y-3 text-sm font-light text-ivory-400">
              <li>
                <button onClick={() => navigateTo('terms')} className="hover:text-gold-300 transition-colors duration-200">
                  Terms & Conditions
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('privacy')} className="hover:text-gold-300 transition-colors duration-200">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('returns')} className="hover:text-gold-300 transition-colors duration-200">
                  Return & Refund Policy
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Patrons Welcome Counter Banner */}
        <div className="border-t border-gold-950/20 pt-12 pb-8 text-center font-serif">
          <p className="text-[10px] uppercase tracking-[0.3em] text-gold-500/80 mb-2">
            Royal Boutique Connoisseurs
          </p>
          <h2 className="text-5xl sm:text-6xl font-black text-gold-gradient tracking-widest leading-none my-4 drop-shadow-md select-none">
            {visitorCount.toLocaleString()}
          </h2>
          <p className="text-xs uppercase tracking-[0.15em] text-ivory-400/80 font-sans font-light flex items-center justify-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-gold-500"></span>
            </span>
            <span>Patrons welcomed to our digital boutique</span>
          </p>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gold-950/40 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-ivory-600 font-light">
            &copy; {new Date().getFullYear()} Ethnivaa Jewelry. Handcrafted with pride in India. All Rights Reserved.
          </p>
          
          <div className="flex items-center gap-6">
            {currentUserRole === 'ADMIN' && (
              <button
                onClick={() => navigateTo('admin')}
                className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gold-400 hover:text-gold-200 transition-colors duration-200"
              >
                <ShieldAlert size={14} />
                <span>Admin Panel</span>
              </button>
            )}
            
            <div className="flex gap-4 text-xs text-ivory-600">
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
