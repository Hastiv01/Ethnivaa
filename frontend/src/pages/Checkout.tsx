import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import type { ShippingAddress } from '../context/ShopContext';
import { CreditCard, Smartphone, ShieldCheck, ArrowRight, ArrowLeft, Loader, CheckCircle } from 'lucide-react';

export const Checkout: React.FC = () => {
  const { 
    cartItems, 
    cartSubtotal, 
    cartShippingCost, 
    cartTotal,
    profile, 
    placeOrder, 
    navigateTo 
  } = useShop();

  // Address Form State
  const [formData, setFormData] = useState<ShippingAddress>({
    fullName: profile.name,
    mobileNumber: profile.mobile.replace(/\s+/g, ''),
    address: profile.savedAddresses[0]?.address || '',
    city: profile.savedAddresses[0]?.city || '',
    state: profile.savedAddresses[0]?.state || '',
    pincode: profile.savedAddresses[0]?.pincode || ''
  });

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Card' | 'Netbanking' | 'Wallet'>('UPI');
  const [showRazorpay, setShowRazorpay] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Card details mock
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const selectSavedAddress = (addr: ShippingAddress) => {
    setFormData({
      fullName: addr.fullName,
      mobileNumber: addr.mobileNumber,
      address: addr.address,
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode
    });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.mobileNumber || !formData.address || !formData.city || !formData.state || !formData.pincode) {
      alert('Please fill out all shipping details.');
      return;
    }
    // Open Razorpay Mock Modal
    setShowRazorpay(true);
  };

  const handlePayNow = () => {
    setIsProcessing(true);
    
    // Simulate transaction delay
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      
      // Simulate success delay
      setTimeout(() => {
        // Place order in global state context
        placeOrder(formData, paymentMethod);
        setShowRazorpay(false);
        setIsSuccess(false);
        navigateTo('success');
      }, 1500);
    }, 2500);
  };

  // Redirect if cart is empty and Razorpay modal is not showing
  if (cartItems.length === 0 && !showRazorpay) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <h2 className="font-serif text-xl font-bold text-crimson-950">No items in checkout</h2>
        <button onClick={() => navigateTo('shop')} className="bg-crimson-950 text-gold-100 px-6 py-2.5 rounded-full font-bold">
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fadeIn min-h-screen">
      {/* Title */}
      <div className="text-center space-y-2 mb-10">
        <h1 className="font-serif text-3xl font-extrabold text-crimson-950 uppercase tracking-wide">
          Checkout
        </h1>
        <p className="text-xs text-obsidian-600 font-sans font-light">
          Secure, single-page billing and delivery configuration
        </p>
        <div className="w-16 h-0.5 bg-gold-400 mx-auto mt-2"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Columns (1-7): Shipping Address Form */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Quick Select Saved Address (Premium detail) */}
          {profile.savedAddresses.length > 0 && (
            <div className="bg-white border border-gold-200/50 p-5 rounded-2xl shadow-gold shadow-sm font-sans space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-gold-600">
                Autofill Saved Address
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {profile.savedAddresses.map((addr, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => selectSavedAddress(addr)}
                    className="text-left p-3 rounded-xl border border-gold-100 hover:border-gold-400 hover:bg-gold-50/20 text-xs transition-all space-y-1.5 focus:outline-none"
                  >
                    <div className="font-bold text-crimson-950">{addr.fullName}</div>
                    <div className="text-obsidian-600 line-clamp-2">{addr.address}, {addr.city}</div>
                    <div className="text-[10px] text-obsidian-400 font-medium">{addr.mobileNumber}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Core Address Form */}
          <div className="bg-white border border-gold-200/50 p-6 sm:p-8 rounded-3xl shadow-gold shadow-sm">
            <h3 className="font-serif text-lg font-bold text-crimson-950 mb-6 border-b border-gold-100 pb-3">
              Delivery Destination
            </h3>
            
            <form id="shipping-form" onSubmit={handleFormSubmit} className="space-y-4 font-sans text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-obsidian-800">Recipient Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Enter full name..."
                    className="w-full bg-ivory-50 border border-gold-200 rounded-xl p-3 focus:outline-none focus:border-gold-400"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-obsidian-800">10-Digit Mobile Number</label>
                  <input
                    type="tel"
                    name="mobileNumber"
                    required
                    pattern="[0-9]{10}"
                    value={formData.mobileNumber}
                    onChange={handleInputChange}
                    placeholder="e.g. 9876543210"
                    className="w-full bg-ivory-50 border border-gold-200 rounded-xl p-3 focus:outline-none focus:border-gold-400"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-obsidian-800">Street Address & Landmark</label>
                <textarea
                  name="address"
                  required
                  rows={3}
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Flat No, Wing, Building Name, Street..."
                  className="w-full bg-ivory-50 border border-gold-200 rounded-xl p-3 focus:outline-none focus:border-gold-400 resize-none"
                ></textarea>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-obsidian-800">City</label>
                  <input
                    type="text"
                    name="city"
                    required
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="Mumbai"
                    className="w-full bg-ivory-50 border border-gold-200 rounded-xl p-3 focus:outline-none focus:border-gold-400"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-obsidian-800">State</label>
                  <input
                    type="text"
                    name="state"
                    required
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder="Maharashtra"
                    className="w-full bg-ivory-50 border border-gold-200 rounded-xl p-3 focus:outline-none focus:border-gold-400"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-obsidian-800">Pincode</label>
                  <input
                    type="text"
                    name="pincode"
                    required
                    pattern="[0-9]{6}"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    placeholder="400054"
                    className="w-full bg-ivory-50 border border-gold-200 rounded-xl p-3 focus:outline-none focus:border-gold-400"
                  />
                </div>
              </div>
            </form>
          </div>

          <button
            onClick={() => navigateTo('cart')}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-crimson-950 hover:text-gold-600 transition-colors font-sans py-2"
          >
            <ArrowLeft size={14} />
            <span>Return to Cart</span>
          </button>
        </div>

        {/* Right Columns (8-12): Order Summary & CTA */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Order Details Card */}
          <div className="bg-white border border-gold-200/50 p-6 rounded-3xl shadow-gold shadow-sm font-sans space-y-4">
            <h3 className="font-serif text-base font-bold text-crimson-950 border-b border-gold-100 pb-3">
              Treasures Summary
            </h3>
            
            {/* Short List */}
            <div className="space-y-3 max-h-48 overflow-y-auto custom-scrollbar pr-1">
              {cartItems.map((item) => (
                <div key={item.product.id} className="flex gap-3 items-center text-xs">
                  <img src={item.product.images[0]} alt={item.product.name} className="w-10 h-10 rounded-lg object-cover border border-gold-100 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-obsidian-950 truncate">{item.product.name}</div>
                    <div className="text-obsidian-400 text-[10px]">Qty: {item.quantity} • ₹{item.product.price.toLocaleString('en-IN')}</div>
                  </div>
                  <div className="font-serif font-bold text-crimson-950">₹{(item.product.price * item.quantity).toLocaleString('en-IN')}</div>
                </div>
              ))}
            </div>

            <div className="border-t border-gold-100 pt-3 space-y-2 text-xs text-obsidian-700">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-obsidian-950">₹{cartSubtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="font-semibold text-obsidian-950">
                  {cartShippingCost === 0 ? <span className="text-emerald-700 font-bold uppercase text-[9px]">Free</span> : `₹${cartShippingCost}`}
                </span>
              </div>
              <div className="border-t border-gold-100 pt-2 flex justify-between text-sm font-bold text-crimson-950">
                <span>Total Amount Payable</span>
                <span className="font-serif text-base font-extrabold">₹{cartTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Secure Trust badges */}
          <div className="bg-white border border-gold-300 p-6 rounded-3xl shadow-gold-md font-sans space-y-5">
            <h3 className="font-serif text-base font-bold text-crimson-950 flex items-center gap-2 border-b border-gold-100 pb-3">
              <ShieldCheck size={18} className="text-emerald-600" />
              <span>Secure Transactions</span>
            </h3>
            
            <p className="text-xs text-obsidian-500 font-light leading-relaxed">
              Ethnivaa partners with **Razorpay** to process payments. Click "Proceed to Pay" to launch the simulated Razorpay gateway panel.
            </p>

            <button
              type="submit"
              form="shipping-form"
              className="w-full bg-crimson-950 hover:bg-crimson-900 text-gold-100 font-bold uppercase tracking-wider text-xs py-3.5 rounded-full transition-all duration-300 shadow-md flex items-center justify-center gap-2 group"
            >
              <span>Proceed to Pay</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

      </div>

      {/* Razorpay Simulation Dialog */}
      {showRazorpay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-[#1D2232] text-white rounded-3xl overflow-hidden shadow-2xl animate-scaleIn border border-white/10 font-sans">
            
            {/* Top Branding (Razorpay Header) */}
            <div className="bg-[#181D2D] p-5 flex items-center justify-between border-b border-white/5">
              <div className="flex items-center gap-2">
                <span className="text-blue-500 font-black tracking-tighter text-xl">Razorpay</span>
                <span className="bg-blue-500/10 text-blue-400 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border border-blue-500/20">
                  Sandbox
                </span>
              </div>
              <button 
                onClick={() => setShowRazorpay(false)} 
                disabled={isProcessing}
                className="text-white/40 hover:text-white text-xs uppercase tracking-wider font-semibold focus:outline-none"
              >
                Cancel
              </button>
            </div>

            {/* Merchant info */}
            <div className="p-5 bg-[#1F2639] flex items-center justify-between text-xs border-b border-white/5">
              <div>
                <div className="font-semibold text-white">ETHNIVAA JEWELRY</div>
                <div className="text-white/50 text-[10px]">{formData.mobileNumber}</div>
              </div>
              <div className="text-right">
                <span className="text-white/40 block text-[9px] uppercase tracking-wider">Amount</span>
                <span className="font-serif font-black text-blue-400 text-lg">₹{cartTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Main Interactive Screen */}
            <div className="p-6 min-h-[260px] flex flex-col justify-between">
              {isProcessing ? (
                /* Processing State */
                <div className="flex-1 flex flex-col items-center justify-center py-8 space-y-4 animate-fadeIn">
                  <Loader size={44} className="text-blue-400 animate-spin" />
                  <div className="text-center space-y-1">
                    <h4 className="font-semibold text-sm">Processing Payment</h4>
                    <p className="text-[10px] text-white/50">Verifying credentials and security tokens. Please do not close this window.</p>
                  </div>
                </div>
              ) : isSuccess ? (
                /* Success State */
                <div className="flex-1 flex flex-col items-center justify-center py-8 space-y-4 animate-fadeIn">
                  <CheckCircle size={48} className="text-emerald-500 animate-bounce" />
                  <div className="text-center space-y-1">
                    <h4 className="font-semibold text-sm text-emerald-400">Payment Successful</h4>
                    <p className="text-[10px] text-white/50">Transaction ID: pay_LKnz982bXv90</p>
                  </div>
                </div>
              ) : (
                /* Interactive Selection Screen */
                <div className="space-y-6">
                  
                  {/* Category tabs */}
                  <div className="grid grid-cols-4 gap-1 text-[10px] font-bold text-center border-b border-white/5 pb-3">
                    {['UPI', 'Card', 'Netbanking', 'Wallet'].map((m) => (
                      <button
                        key={m}
                        onClick={() => setPaymentMethod(m as any)}
                        className={`py-2 rounded-lg transition-all ${
                          paymentMethod === m 
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-600/15' 
                            : 'bg-[#181D2D] text-white/40 hover:text-white/70'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>

                  {/* Tab Contents */}
                  <div className="text-xs space-y-4 font-sans animate-fadeIn">
                    {paymentMethod === 'UPI' && (
                      <div className="flex flex-col items-center space-y-3 py-2">
                        {/* Mock QR Code representation */}
                        <div className="w-32 h-32 bg-white rounded-2xl p-2.5 shadow-lg border border-white/5 flex flex-col items-center justify-center relative group">
                          {/* Simulated QR Code lines */}
                          <div className="w-full h-full bg-[#111] opacity-90 rounded flex flex-wrap p-1 gap-1 items-center justify-center">
                            {[...Array(64)].map((_, i) => (
                              <div key={i} className={`w-2 h-2 rounded-sm ${Math.random() > 0.45 ? 'bg-white' : 'bg-transparent'}`}></div>
                            ))}
                          </div>
                          <span className="absolute text-[8px] bg-blue-600 text-white font-bold px-2 py-0.5 rounded-full -bottom-2 font-sans tracking-wide">
                            UPI QR CODE
                          </span>
                        </div>
                        <p className="text-[10px] text-white/50 text-center max-w-[240px] leading-relaxed mt-2">
                          Scan this sandbox QR code using any UPI App (GPay, PhonePe, Paytm, BHIM) to simulate immediate payment confirmation.
                        </p>
                      </div>
                    )}

                    {paymentMethod === 'Card' && (
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-white/50 text-[10px] font-semibold uppercase tracking-wider block">Card Number</label>
                          <div className="relative">
                            <input
                              type="text"
                              maxLength={19}
                              value={cardNumber}
                              onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, '').replace(/(\d{4})/g, '$1 ').trim();
                                setCardNumber(val);
                              }}
                              placeholder="4111 2222 3333 4444"
                              className="w-full bg-[#181D2D] border border-white/10 rounded-xl p-3 focus:outline-none focus:border-blue-500 pl-10 text-white font-mono placeholder-white/20 text-xs"
                            />
                            <CreditCard size={14} className="absolute left-3.5 top-3.5 text-white/30" />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-white/50 text-[10px] font-semibold uppercase tracking-wider block">Expiry (MM/YY)</label>
                            <input
                              type="text"
                              maxLength={5}
                              value={cardExpiry}
                              onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, '').replace(/(\d{2})/, '$1/').trim();
                                setCardExpiry(val);
                              }}
                              placeholder="12/28"
                              className="w-full bg-[#181D2D] border border-white/10 rounded-xl p-3 focus:outline-none focus:border-blue-500 text-center font-mono placeholder-white/20 text-xs"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-white/50 text-[10px] font-semibold uppercase tracking-wider block">CVV</label>
                            <input
                              type="password"
                              maxLength={3}
                              value={cardCvv}
                              onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                              placeholder="•••"
                              className="w-full bg-[#181D2D] border border-white/10 rounded-xl p-3 focus:outline-none focus:border-blue-500 text-center font-mono placeholder-white/20 text-xs"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {paymentMethod === 'Netbanking' && (
                      <div className="grid grid-cols-2 gap-2 text-center text-[10px] font-bold">
                        {['SBI', 'HDFC', 'ICICI', 'Axis'].map(bank => (
                          <button 
                            key={bank} 
                            onClick={() => {}}
                            className="bg-[#181D2D] border border-white/5 p-3 rounded-xl hover:border-blue-500 text-white/80 hover:text-white"
                          >
                            {bank} Bank
                          </button>
                        ))}
                      </div>
                    )}

                    {paymentMethod === 'Wallet' && (
                      <div className="grid grid-cols-2 gap-2 text-center text-[10px] font-bold">
                        {['Paytm', 'PhonePe', 'Amazon Pay', 'Mobikwik'].map(wallet => (
                          <button 
                            key={wallet} 
                            onClick={() => {}}
                            className="bg-[#181D2D] border border-white/5 p-3 rounded-xl hover:border-blue-500 text-white/80 hover:text-white"
                          >
                            {wallet}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Trust Footer */}
                  <div className="flex items-center justify-center gap-1.5 text-[10px] text-white/40 pt-4 border-t border-white/5 font-sans">
                    <ShieldCheck size={12} className="text-emerald-500" />
                    <span>Razorpay Secure Encrypted Checkout</span>
                  </div>

                  {/* Primary CTA */}
                  <button
                    onClick={handlePayNow}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider py-3.5 rounded-xl transition-all duration-300 shadow-lg shadow-blue-600/10 flex items-center justify-center gap-1.5"
                  >
                    <Smartphone size={14} />
                    <span>Pay ₹{cartTotal.toLocaleString('en-IN')}</span>
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
