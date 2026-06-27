import React from 'react';
import { useShop } from '../context/ShopContext';
import { XCircle, ShoppingCart, ArrowLeft, HelpCircle } from 'lucide-react';

export const PaymentFailed: React.FC = () => {
  const { navigateTo } = useShop();

  return (
    <div className="max-w-3xl mx-auto px-4 py-20 animate-fadeIn min-h-screen flex flex-col justify-center">
      
      {/* Failure Header */}
      <div className="text-center space-y-4 mb-10">
        <div className="inline-flex relative">
          <XCircle size={64} className="text-red-700 animate-pulse relative z-10" />
        </div>
        
        <div className="space-y-1">
          <span className="text-[10px] tracking-[0.3em] uppercase text-red-800 font-bold font-sans">
            Transaction Incomplete
          </span>
          <h1 className="font-serif text-3xl font-extrabold text-crimson-950">
            Payment Failed or Cancelled
          </h1>
          <p className="text-sm text-obsidian-600 font-sans font-light max-w-md mx-auto leading-relaxed">
            Your transaction could not be completed. Either the payment window was closed, or the bank rejected the transaction.
          </p>
        </div>
        <div className="w-16 h-0.5 bg-red-300 mx-auto mt-2"></div>
      </div>

      {/* Details Card */}
      <div className="bg-white border border-red-100 rounded-3xl p-6 sm:p-8 shadow-md font-sans space-y-6 text-center max-w-lg mx-auto">
        <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto text-red-600">
          <ShoppingCart size={24} />
        </div>
        
        <div className="space-y-2">
          <h3 className="font-serif font-bold text-crimson-950 text-base">
            Your items are safe in your cart!
          </h3>
          <p className="text-xs text-obsidian-500 font-light leading-relaxed">
            We haven't emptied your cart. All your selected jewelry pieces are preserved so you don't have to search and add them again.
          </p>
        </div>

        <div className="bg-red-50/50 border border-red-100/50 p-4 rounded-2xl text-left flex items-start gap-3">
          <HelpCircle size={16} className="text-red-700 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-crimson-950">What should you do next?</h4>
            <p className="text-[11px] text-obsidian-600 font-light leading-normal">
              Click the button below to return to your cart. You can review your items, make sure your delivery details are correct, and try the checkout again.
            </p>
          </div>
        </div>
      </div>

      {/* Navigation CTA Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10 font-sans text-xs w-full max-w-md mx-auto">
        <button
          onClick={() => navigateTo('cart')}
          className="w-full bg-crimson-950 hover:bg-crimson-900 text-gold-100 font-bold uppercase tracking-wider px-8 py-4 rounded-full transition-all duration-300 shadow-md flex items-center justify-center gap-2 group"
        >
          <span>Return to Cart</span>
          <ShoppingCart size={14} className="group-hover:translate-x-0.5 transition-transform" />
        </button>
        <button
          onClick={() => navigateTo('shop')}
          className="w-full bg-white hover:bg-gold-50 border border-crimson-950 text-crimson-950 font-bold uppercase tracking-wider px-8 py-4 rounded-full transition-all duration-300 shadow-md flex items-center justify-center gap-2"
        >
          <ArrowLeft size={14} />
          <span>Continue Shopping</span>
        </button>
      </div>

    </div>
  );
};
