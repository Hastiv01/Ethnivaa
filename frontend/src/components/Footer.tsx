import React from 'react';
import { useShop } from '../context/ShopContext';
import { Mail, Phone, MapPin, ShieldAlert } from 'lucide-react';

export const Footer: React.FC = () => {
  const { navigateTo, currentUserRole, visitorCount } = useShop();

  return (
    <footer className="bg-obsidian-950 text-ivory-300 font-sans border-t border-gold-950 pt-10 pb-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <div>
              <span className="font-serif text-3xl font-bold tracking-widest text-gold-400">
                ETHNIVAA
              </span>
              <p className="text-[10px] uppercase tracking-[0.3em] text-gold-200 mt-1">
                Where Tradition Meets Timeless Beauty
              </p>
            </div>
            <p className="text-xs text-ivory-400 font-light leading-relaxed">
              Ethnivaa celebrates the timeless beauty of Indian heritage through handcrafted jewellery inspired by traditional artistry. From Navratri collections to elegant wedding sets, every piece reflects culture, craftsmanship, and elegance.
            </p>
          </div>

          {/* Contact Details */}
          <div className="space-y-4">
            <h3 className="font-serif text-base text-gold-400 font-semibold tracking-wider">Heritage Lounge</h3>
            <ul className="space-y-3 text-xs font-light text-ivory-400">
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
          <div className="space-y-4">
            <h3 className="font-serif text-base text-gold-400 font-semibold tracking-wider">Legal</h3>
            <ul className="space-y-2.5 text-xs font-light text-ivory-400">
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

        {/* Bottom Bar */}
        <div className="border-t border-gold-950/40 pt-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <p className="text-[10px] text-ivory-600 font-light">
              &copy; {new Date().getFullYear()} Ethnivaa Jewelry. All Rights Reserved.
            </p>
            
            {/* Elegant Patron Counter Badge */}
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-obsidian-900 border border-gold-900/40 shadow-inner">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-gold-500"></span>
              </span>
              <span className="text-[9px] uppercase tracking-[0.15em] text-gold-500/80 font-sans font-medium">
                {visitorCount.toLocaleString()} Patrons
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            {currentUserRole === 'ADMIN' && (
              <button
                onClick={() => navigateTo('admin')}
                className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-gold-400 hover:text-gold-200 transition-colors duration-200"
              >
                <ShieldAlert size={12} />
                <span>Admin Panel</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};
