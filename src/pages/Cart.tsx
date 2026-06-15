import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { Trash2, ArrowRight, ShoppingBag, Gift, ArrowLeft } from 'lucide-react';

export const Cart: React.FC = () => {
  const { 
    cartItems, 
    updateCartQuantity, 
    removeFromCart, 
    cartSubtotal, 
    cartShippingCost, 
    cartTotal,
    navigateTo 
  } = useShop();

  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const code = promoCode.trim().toUpperCase();
    if (code === 'FESTIVE10') {
      setPromoApplied(true);
      setPromoError(false);
      setDiscountAmount(Math.round(cartSubtotal * 0.1)); // 10% off
    } else {
      setPromoError(true);
      setPromoApplied(false);
      setDiscountAmount(0);
    }
  };

  const handleRemovePromo = () => {
    setPromoApplied(false);
    setPromoCode('');
    setDiscountAmount(0);
  };

  const finalTotal = cartTotal - discountAmount;

  if (cartItems.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-6 animate-fadeIn min-h-[60vh] flex flex-col justify-center items-center">
        <div className="p-5 rounded-full bg-gold-50 border border-gold-200 text-gold-500">
          <ShoppingBag size={40} />
        </div>
        <div className="space-y-2">
          <h2 className="font-serif text-2xl font-bold text-crimson-950">Your Cart is Empty</h2>
          <p className="text-xs text-obsidian-500 font-sans max-w-sm mx-auto">
            You haven't added any luxury jewelry to your cart yet. Explore our royal collections to find your perfect ornament.
          </p>
        </div>
        <button
          onClick={() => navigateTo('shop')}
          className="bg-crimson-950 hover:bg-crimson-900 text-gold-100 font-bold uppercase tracking-wider text-xs px-8 py-3.5 rounded-full transition-colors shadow-md"
        >
          Discover Collections
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fadeIn min-h-screen">
      {/* Title */}
      <div className="text-center space-y-2 mb-10">
        <h1 className="font-serif text-3xl font-extrabold text-crimson-950 uppercase tracking-wide">
          Your Shopping Cart
        </h1>
        <p className="text-xs text-obsidian-600 font-sans font-light">
          Review your treasures before checking out
        </p>
        <div className="w-16 h-0.5 bg-gold-400 mx-auto mt-2"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Column: Cart Items list */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <div 
              key={item.product.id}
              className="bg-white border border-gold-200/50 rounded-2xl p-4 sm:p-5 shadow-gold shadow-sm flex gap-4 sm:gap-6 items-center"
            >
              {/* Product Thumbnail */}
              <div 
                onClick={() => navigateTo('details', item.product.id)}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-ivory-50 border border-gold-100 flex-shrink-0 cursor-pointer"
              >
                <img 
                  src={item.product.images[0]} 
                  alt={item.product.name} 
                  className="w-full h-full object-contain bg-white"
                />
              </div>

              {/* Product Info */}
              <div className="flex-1 min-w-0 space-y-1">
                <span className="text-[9px] uppercase tracking-widest text-gold-600 font-bold font-sans">
                  {item.product.category}
                </span>
                
                <h3 
                  onClick={() => navigateTo('details', item.product.id)}
                  className="font-serif text-sm sm:text-base font-bold text-obsidian-950 truncate hover:text-crimson-900 cursor-pointer"
                >
                  {item.product.name}
                </h3>
                
                <span className="text-xs text-obsidian-500 font-sans block">
                  Material: {item.product.material}
                </span>

                {/* Subtotal on Mobile */}
                <div className="flex items-center justify-between sm:hidden pt-2">
                  <span className="font-serif font-bold text-crimson-950 text-sm">
                    ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                  </span>
                  <div className="flex items-center border border-gold-300 rounded-full bg-ivory-50 px-2 py-0.5">
                    <button 
                      onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                      className="p-1 text-crimson-950"
                    >
                      -
                    </button>
                    <span className="w-6 text-center text-xs font-bold text-obsidian-950 font-sans">{item.quantity}</span>
                    <button 
                      onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                      className="p-1 text-crimson-950"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Actions & Price - Desktop Only */}
              <div className="hidden sm:flex flex-col items-end justify-between h-20 pl-4">
                <span className="font-serif font-bold text-crimson-950 text-base">
                  ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                </span>
                
                <div className="flex items-center gap-3">
                  {/* Quantity steppers */}
                  <div className="flex items-center border border-gold-300 rounded-full bg-ivory-50 px-2 py-0.5">
                    <button 
                      onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                      className="p-1 text-crimson-950 hover:text-gold-500 text-xs"
                    >
                      -
                    </button>
                    <span className="w-6 text-center text-xs font-bold text-obsidian-950 font-sans">{item.quantity}</span>
                    <button 
                      onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                      className="p-1 text-crimson-950 hover:text-gold-500 text-xs"
                    >
                      +
                    </button>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="p-2 rounded-full hover:bg-crimson-50 text-obsidian-400 hover:text-crimson-600 transition-colors"
                    title="Remove item"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Mobile Trash Action */}
              <button
                onClick={() => removeFromCart(item.product.id)}
                className="sm:hidden p-2 rounded-full hover:bg-crimson-50 text-obsidian-400 hover:text-crimson-600 transition-colors"
                aria-label="Remove item"
              >
                <Trash2 size={16} />
              </button>

            </div>
          ))}

          {/* Continue Shopping button */}
          <button
            onClick={() => navigateTo('shop')}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-crimson-950 hover:text-gold-600 transition-colors font-sans py-2"
          >
            <ArrowLeft size={14} />
            <span>Continue Shopping</span>
          </button>
        </div>

        {/* Right Column: Order Summary & Coupon */}
        <div className="space-y-6">
          {/* Coupon Code section */}
          <div className="bg-white border border-gold-200/50 p-6 rounded-2xl shadow-gold shadow-sm font-sans space-y-4">
            <h3 className="font-serif text-base font-bold text-crimson-950 flex items-center gap-2">
              <Gift size={16} className="text-gold-500" />
              <span>Promo Code</span>
            </h3>
            
            {!promoApplied ? (
              <form onSubmit={handleApplyPromo} className="flex gap-2">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="Enter code (e.g. FESTIVE10)"
                  className="flex-1 bg-ivory-50 border border-gold-200 rounded-xl px-3 py-2 text-xs uppercase focus:outline-none focus:border-gold-400"
                />
                <button
                  type="submit"
                  className="bg-crimson-950 text-gold-100 hover:bg-crimson-900 px-4 py-2 rounded-xl text-xs font-bold uppercase transition-colors"
                >
                  Apply
                </button>
              </form>
            ) : (
              <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl text-xs font-semibold text-emerald-800 animate-fadeIn">
                <span>Code "FESTIVE10" applied! (10% Off)</span>
                <button onClick={handleRemovePromo} className="text-crimson-700 hover:text-crimson-950 font-bold uppercase text-[10px]">
                  Remove
                </button>
              </div>
            )}

            {promoError && (
              <p className="text-[10px] text-crimson-600 font-bold animate-fadeIn">Invalid coupon code. Try "FESTIVE10".</p>
            )}
            
            <p className="text-[10px] text-obsidian-400 font-light leading-relaxed">
              * Apply the discount coupon "FESTIVE10" to save 10% on your cart items subtotal.
            </p>
          </div>

          {/* Checkout Summary Card */}
          <div className="bg-white border border-gold-300 p-6 rounded-3xl shadow-gold-md font-sans space-y-4">
            <h3 className="font-serif text-lg font-bold text-crimson-950 border-b border-gold-100 pb-3">
              Order Summary
            </h3>
            
            <div className="space-y-2.5 text-xs text-obsidian-700">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-obsidian-950">₹{cartSubtotal.toLocaleString('en-IN')}</span>
              </div>
              
              {promoApplied && (
                <div className="flex justify-between text-emerald-700">
                  <span>Coupon Discount</span>
                  <span>- ₹{discountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Estimated Delivery / Shipping</span>
                <span className="font-semibold text-obsidian-950">
                  {cartShippingCost === 0 ? (
                    <span className="text-emerald-700 uppercase font-bold text-[10px]">Free</span>
                  ) : (
                    `₹${cartShippingCost}`
                  )}
                </span>
              </div>

              <div className="border-t border-gold-100 pt-3 flex justify-between text-sm font-bold text-crimson-950">
                <span>Total Amount</span>
                <span className="font-serif text-lg font-extrabold">₹{finalTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Proceed to Checkout Button */}
            <button
              onClick={() => navigateTo('checkout')}
              className="w-full bg-crimson-950 hover:bg-crimson-900 text-gold-100 font-bold uppercase tracking-wider text-xs py-3.5 rounded-full transition-all duration-300 shadow-md flex items-center justify-center gap-2 group mt-2"
            >
              <span>Secure Checkout</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
