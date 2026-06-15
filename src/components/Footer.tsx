import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { Mail, Phone, MapPin, ShieldAlert, Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  const { navigateTo, setSelectedCategoryFilter, currentUserRole } = useShop();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  const selectCategory = (cat: string) => {
    setSelectedCategoryFilter(cat);
    navigateTo('shop');
  };

  return (
    <footer className="bg-obsidian-950 text-ivory-300 font-sans border-t border-gold-950 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Brand Info */}
          <div className="space-y-6">
            <div>
              <span className="font-serif text-3xl font-bold tracking-widest text-gold-400">
                ETHNIVAA
              </span>
              <p className="text-[10px] uppercase tracking-[0.3em] text-gold-200 mt-1">
                The Heritage of Jewelry
              </p>
            </div>
            <p className="text-sm text-ivory-400 font-light leading-relaxed">
              Ethnivaa celebrates the eternal grace of Indian heritage. Every ornament is handcrafted by master artisans, preserving the ancient jewelry techniques of Kundan, Jadhau, Kemp, and Oxidized Silver.
            </p>
            {/* Social Icons Mock */}
            <div className="flex space-x-4">
              {['Instagram', 'Pinterest', 'Facebook'].map(social => (
                <a 
                  key={social} 
                  href="#" 
                  className="text-xs tracking-wider uppercase text-gold-400 hover:text-gold-100 transition-colors duration-200 border border-gold-900 px-3 py-1 rounded-full hover:border-gold-400"
                  onClick={(e) => e.preventDefault()}
                >
                  {social}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h3 className="font-serif text-lg text-gold-400 font-semibold tracking-wider">Collections</h3>
            <ul className="space-y-3 text-sm font-light text-ivory-400">
              <li>
                <button onClick={() => selectCategory('Earrings')} className="hover:text-gold-300 transition-colors duration-200">
                  Earrings
                </button>
              </li>
              <li>
                <button onClick={() => selectCategory('Hair Accessories')} className="hover:text-gold-300 transition-colors duration-200">
                  Hair Accessories
                </button>
              </li>
              <li>
                <button onClick={() => selectCategory('Necklaces')} className="hover:text-gold-300 transition-colors duration-200">
                  Necklaces
                </button>
              </li>
              <li>
                <button onClick={() => selectCategory('Combo Sets')} className="hover:text-gold-300 transition-colors duration-200">
                  Combo Sets
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-6">
            <h3 className="font-serif text-lg text-gold-400 font-semibold tracking-wider">Heritage Lounge</h3>
            <ul className="space-y-4 text-sm font-light text-ivory-400">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-gold-400 shrink-0 mt-0.5" />
                <span>
                  Ethnivaa Heritage Lounge, 102 Waterfield Road, Bandra West, Mumbai, Maharashtra 400050
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={16} className="text-gold-400 shrink-0" />
                <span>+91 22 2640 4455</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={16} className="text-gold-400 shrink-0" />
                <span>care@ethnivaa.com</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-6">
            <h3 className="font-serif text-lg text-gold-400 font-semibold tracking-wider">Newsletter</h3>
            <p className="text-sm font-light text-ivory-400">
              Subscribe to receive updates on new arrivals, royal collection launches, and exclusive heritage stories.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-3">
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your royal email..."
                  className="w-full bg-obsidian-900 border border-gold-900 text-ivory-200 placeholder-ivory-600 text-xs rounded-full py-2.5 pl-4 pr-10 focus:outline-none focus:border-gold-400 font-sans"
                />
                <button type="submit" className="absolute right-3 top-2.5 text-gold-400 hover:text-gold-100">
                  <Mail size={16} />
                </button>
              </div>
              {subscribed && (
                <p className="text-[11px] text-gold-300 font-medium flex items-center gap-1.5 animate-fadeIn">
                  <Sparkles size={12} />
                  <span>Subscription confirmed. Thank you!</span>
                </p>
              )}
            </form>
          </div>
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
              <a href="#" className="hover:text-gold-400" onClick={(e) => e.preventDefault()}>Terms</a>
              <a href="#" className="hover:text-gold-400" onClick={(e) => e.preventDefault()}>Privacy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
