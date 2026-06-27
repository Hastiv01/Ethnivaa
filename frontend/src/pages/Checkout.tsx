import React, { useState, useRef } from 'react';
import { useShop } from '../context/ShopContext';
import type { ShippingAddress } from '../context/ShopContext';
import {
  ShieldCheck, ArrowRight, ArrowLeft,
  Loader, CheckCircle, AlertCircle,
} from 'lucide-react';

// ─── Load Razorpay Checkout script dynamically ────────────────────────────────
function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry"
];

// ─── Stage machine ────────────────────────────────────────────────────────────
type Stage =
  | 'idle'             // Default — form active
  | 'creating'         // Calling placeOrder() API
  | 'script_loading'   // Loading Razorpay JS
  | 'rzp_open'         // Razorpay popup is visible
  | 'confirming'       // Calling confirmPayment() API
  | 'success'          // All done
  | 'dismissed'        // User closed Razorpay without paying
  | 'error';           // Something went wrong

export const Checkout: React.FC = () => {
  const {
    cartItems,
    cartSubtotal,
    cartShippingCost,
    cartTotal,
    profile,
    addresses,
    placeOrder,
    confirmPayment,
    navigateTo,
    fetchAddresses,
  } = useShop();

  React.useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  // ── Address form state ─────────────────────────────────────────────────────
  const [formData, setFormData] = useState<ShippingAddress>({
    fullName: profile.name,
    mobileNumber: profile.mobile.replace(/\s+/g, ''),
    address: profile.savedAddresses[0]?.address || '',
    city: profile.savedAddresses[0]?.city || '',
    state: profile.savedAddresses[0]?.state || '',
    pincode: profile.savedAddresses[0]?.pincode || '',
  });

  const [agreeTerms, setAgreeTerms] = useState(false);
  const [saveAddress, setSaveAddress] = useState(false);
  const paymentMethod = 'Prepaid / Online';
  const [stage, setStage] = useState<Stage>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const rzpRef = useRef<any>(null);

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'pincode') {
      const cleanVal = value.replace(/\D/g, '').slice(0, 6);
      setFormData(prev => ({ ...prev, pincode: cleanVal }));
      
      if (cleanVal.length === 6) {
        try {
          const res = await fetch(`https://api.postalpincode.in/pincode/${cleanVal}`);
          if (res.ok) {
            const data = await res.json();
            if (data && data[0] && data[0].Status === 'Success' && data[0].PostOffice && data[0].PostOffice.length > 0) {
              const po = data[0].PostOffice[0];
              const district = po.District;
              const stateName = po.State;
              
              const matchedState = INDIAN_STATES.find(
                s => s.toLowerCase() === stateName.toLowerCase()
              );
              
              setFormData(prev => ({
                ...prev,
                city: district || prev.city,
                state: matchedState || prev.state
              }));
            }
          }
        } catch (err) {
          console.error('Failed to look up pincode:', err);
        }
      }
      return;
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const selectSavedAddress = (addr: any) => {
    setFormData({
      fullName: addr.recipientName || addr.fullName || '',
      mobileNumber: addr.phone || addr.mobileNumber || '',
      address: addr.line1 || addr.address || '',
      city: addr.city || '',
      state: addr.state || '',
      pincode: addr.postalCode || addr.pincode || '',
    });
  };

  // ── Main flow ──────────────────────────────────────────────────────────────
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms) {
      setStage('error');
      setErrorMessage('You must agree to the Terms & Conditions and Privacy Policy to proceed.');
      return;
    }
    setStage('creating');
    setErrorMessage(null);

    try {
      // Step 1: Create order in DB + Razorpay order via backend
      const result = await placeOrder(formData, paymentMethod, saveAddress);
      const { order, razorpayOrderId, razorpayKeyId, amount, currency } = result;

      // Step 2: Load Razorpay script
      setStage('script_loading');
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Could not load Razorpay checkout. Please check your internet connection.');
      }

      // Step 3: Open Razorpay Checkout
      setStage('rzp_open');

      const options = {
        key: razorpayKeyId,
        amount,
        currency,
        name: 'Ethnivaa',
        description: `Order #${order.id}`,
        image: 'https://res.cloudinary.com/dujdgboyb/image/upload/v1781935583/new_logo_he9q1o.png',
        order_id: razorpayOrderId,

        // Called by Razorpay on successful payment
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          setStage('confirming');
          try {
            // Step 4: Verify signature on backend → mark order SUCCESS
            await confirmPayment(order.id, {
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
            });
            setStage('success');
            setTimeout(() => navigateTo('success'), 1200);
          } catch (err: any) {
            console.error('Payment confirmation failed:', err);
            navigateTo('failed');
          }
        },

        prefill: {
          name: formData.fullName,
          contact: `+91${formData.mobileNumber}`,
          email: profile.email || '',
        },

        notes: {
          shipping_address: `${formData.address}, ${formData.city}, ${formData.state} - ${formData.pincode}`,
        },

        theme: {
          color: '#7B1C1C',
        },

        modal: {
          // Called when user presses the close/back button on Razorpay
          ondismiss: () => {
            navigateTo('failed');
          },
        },
        config: {
          display: {
            hide: [
              { method: 'paylater' }
            ]
          }
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzpRef.current = rzp;

      rzp.on('payment.failed', (response: any) => {
        console.error('Payment failed response:', response);
        navigateTo('failed');
      });

      rzp.open();
    } catch (err: any) {
      setStage('error');
      setErrorMessage(err.message || 'Something went wrong. Please try again.');
    }
  };

  // ── Empty cart guard ───────────────────────────────────────────────────────
  if (cartItems.length === 0 && stage !== 'confirming' && stage !== 'success') {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <h2 className="font-serif text-xl font-bold text-crimson-950">No items in checkout</h2>
        <button
          onClick={() => navigateTo('shop')}
          className="bg-crimson-950 text-gold-100 px-6 py-2.5 rounded-full font-bold"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  // ── Full-screen overlay for terminal states ────────────────────────────────
  if (stage === 'confirming' || stage === 'success') {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/95 backdrop-blur-sm animate-fadeIn">
        {stage === 'confirming' ? (
          <div className="text-center space-y-5">
            <div className="w-20 h-20 rounded-full bg-blue-50 border-2 border-blue-200 flex items-center justify-center mx-auto">
              <Loader size={36} className="text-blue-500 animate-spin" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold text-crimson-950">Verifying Payment</h3>
              <p className="text-xs text-obsidian-500 font-sans mt-1">Please wait while we confirm your transaction…</p>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-5">
            <div className="w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-300 flex items-center justify-center mx-auto">
              <CheckCircle size={40} className="text-emerald-500" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold text-emerald-700">Payment Confirmed!</h3>
              <p className="text-xs text-obsidian-500 font-sans mt-1">Redirecting to your order…</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Main checkout page ─────────────────────────────────────────────────────
  const isBusy = stage === 'creating' || stage === 'script_loading' || stage === 'rzp_open';

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
        <div className="w-16 h-0.5 bg-gold-400 mx-auto mt-2" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* ── Left: Shipping form ─────────────────────────────────────────── */}
        <div className="lg:col-span-7 space-y-6">

          {/* Saved address autofill */}
          {addresses.length > 0 && (
            <div className="bg-white border border-gold-200/50 p-5 rounded-2xl shadow-gold shadow-sm font-sans space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-gold-600">
                Autofill Saved Address
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {addresses.map((addr, idx) => (
                  <button
                    key={addr.id || idx}
                    type="button"
                    disabled={isBusy}
                    onClick={() => selectSavedAddress(addr)}
                    className="text-left p-3 rounded-xl border border-gold-100 hover:border-gold-400 hover:bg-gold-50/20 text-xs transition-all space-y-1.5 focus:outline-none disabled:opacity-50"
                  >
                    <div className="font-bold text-crimson-950">{addr.recipientName} ({addr.label})</div>
                    <div className="text-obsidian-600 line-clamp-2">{addr.line1}, {addr.city}</div>
                    <div className="text-[10px] text-obsidian-400 font-medium">{addr.phone}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Core address form */}
          <div className="bg-white border border-gold-200/50 p-6 sm:p-8 rounded-3xl shadow-gold shadow-sm">
            <h3 className="font-serif text-lg font-bold text-crimson-950 mb-6 border-b border-gold-100 pb-3">
              Delivery Destination
            </h3>

            <form id="shipping-form" onSubmit={handleFormSubmit} className="space-y-4 font-sans text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-obsidian-800">Recipient Full Name</label>
                  <input
                    type="text" name="fullName" required
                    value={formData.fullName} onChange={handleInputChange}
                    placeholder="Enter full name..."
                    disabled={isBusy}
                    className="w-full bg-ivory-50 border border-gold-200 rounded-xl p-3 focus:outline-none focus:border-gold-400 disabled:opacity-60"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-obsidian-800">10-Digit Mobile Number</label>
                  <input
                    type="tel" name="mobileNumber" required pattern="[0-9]{10}"
                    value={formData.mobileNumber} onChange={handleInputChange}
                    placeholder="e.g. 9876543210"
                    disabled={isBusy}
                    className="w-full bg-ivory-50 border border-gold-200 rounded-xl p-3 focus:outline-none focus:border-gold-400 disabled:opacity-60"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-obsidian-800">Street Address & Landmark</label>
                <textarea
                  name="address" required rows={3}
                  value={formData.address} onChange={handleInputChange}
                  placeholder="Flat No, Wing, Building Name, Street..."
                  disabled={isBusy}
                  className="w-full bg-ivory-50 border border-gold-200 rounded-xl p-3 focus:outline-none focus:border-gold-400 resize-none disabled:opacity-60"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-obsidian-800">City</label>
                  <input
                    type="text" name="city" required
                    value={formData.city} onChange={handleInputChange}
                    placeholder="Mumbai" disabled={isBusy}
                    className="w-full bg-ivory-50 border border-gold-200 rounded-xl p-3 focus:outline-none focus:border-gold-400 disabled:opacity-60"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-obsidian-800">State</label>
                  <select
                    name="state" required
                    value={formData.state} onChange={handleInputChange as any}
                    disabled={isBusy}
                    className="w-full bg-ivory-50 border border-gold-200 rounded-xl p-3 focus:outline-none focus:border-gold-400 disabled:opacity-60 font-sans text-xs"
                  >
                    <option value="" disabled>Select State</option>
                    {INDIAN_STATES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-obsidian-800">Pincode</label>
                  <input
                    type="text" name="pincode" required pattern="[0-9]{6}"
                    value={formData.pincode} onChange={handleInputChange}
                    placeholder="400054" disabled={isBusy}
                    className="w-full bg-ivory-50 border border-gold-200 rounded-xl p-3 focus:outline-none focus:border-gold-400 disabled:opacity-60"
                  />
                </div>
              </div>

              {/* Save Address Option */}
              {addresses.length < 5 ? (
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="saveAddress"
                    checked={saveAddress}
                    onChange={(e) => setSaveAddress(e.target.checked)}
                    disabled={isBusy}
                    className="h-4 w-4 rounded border-gold-200 text-crimson-850 focus:ring-crimson-850 accent-crimson-950 cursor-pointer"
                  />
                  <label htmlFor="saveAddress" className="font-semibold text-obsidian-850 cursor-pointer select-none">
                    Save this address to my profile
                  </label>
                </div>
              ) : (
                <div className="text-[10px] text-obsidian-400 italic pt-2">
                  Note: Saved address limit reached (5/5). You can still place this order, but the address won't be saved to your profile.
                </div>
              )}
            </form>
          </div>

          <button
            onClick={() => navigateTo('cart')}
            disabled={isBusy}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-crimson-950 hover:text-gold-600 transition-colors font-sans py-2 disabled:opacity-40"
          >
            <ArrowLeft size={14} />
            <span>Return to Cart</span>
          </button>
        </div>

        {/* ── Right: Summary + CTA ────────────────────────────────────────── */}
        <div className="lg:col-span-5 space-y-6">

          {/* Order summary */}
          <div className="bg-white border border-gold-200/50 p-6 rounded-3xl shadow-gold shadow-sm font-sans space-y-4">
            <h3 className="font-serif text-base font-bold text-crimson-950 border-b border-gold-100 pb-3">
              Treasures Summary
            </h3>

            <div className="space-y-3 max-h-48 overflow-y-auto custom-scrollbar pr-1">
              {cartItems.map((item) => (
                <div key={item.product.id} className="flex gap-3 items-center text-xs">
                  <img
                    src={item.product.images[0]} alt={item.product.name}
                    className="w-10 h-10 rounded-lg object-cover border border-gold-100 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-obsidian-950 truncate">{item.product.name}</div>
                    <div className="text-obsidian-400 text-[10px]">
                      Qty: {item.quantity} • ₹{item.product.price.toLocaleString('en-IN')}
                    </div>
                  </div>
                  <div className="font-serif font-bold text-crimson-950">
                    ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                  </div>
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
                  {cartShippingCost === 0
                    ? <span className="text-emerald-700 font-bold uppercase text-[9px]">Free</span>
                    : `₹${cartShippingCost}`}
                </span>
              </div>
              <div className="border-t border-gold-100 pt-2 flex justify-between text-sm font-bold text-crimson-950">
                <span>Total Amount Payable</span>
                <span className="font-serif text-base font-extrabold">₹{cartTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>


          {/* Trust badge + CTA */}
          <div className="bg-white border border-gold-300 p-6 rounded-3xl shadow-gold-md font-sans space-y-4">
            <h3 className="font-serif text-base font-bold text-crimson-950 flex items-center gap-2 border-b border-gold-100 pb-3">
              <ShieldCheck size={18} className="text-emerald-600" />
              <span>Secure Payment via Razorpay</span>
            </h3>

            <div className="flex items-center gap-3 text-xs text-obsidian-500 font-light leading-relaxed">
              <img
                src="https://razorpay.com/favicon.png"
                alt="Razorpay"
                className="w-5 h-5 rounded flex-shrink-0"
              />
              <span>
                256-bit SSL encrypted. Your card data never touches our servers.
                Razorpay is RBI-compliant and PCI-DSS certified.
              </span>
            </div>


            {stage === 'error' && (
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-xs">
                <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                <div className="space-y-2 flex-1">
                  <p className="font-semibold text-red-800">Checkout Error</p>
                  <p className="text-red-600 leading-relaxed">{errorMessage}</p>
                  <div className="flex items-center gap-3 pt-1">
                    <button
                      onClick={() => { setStage('idle'); setErrorMessage(null); }}
                      className="text-[10px] font-bold text-red-700 underline underline-offset-2"
                    >
                      Clear Error
                    </button>
                  </div>
                </div>
              </div>
            )}

            {stage === 'rzp_open' && (
              <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-700">
                <Loader size={13} className="animate-spin flex-shrink-0" />
                <span className="font-medium">Razorpay payment window is open — do not refresh this page.</span>
              </div>
            )}

            <div className="flex items-start gap-2.5 py-1">
              <input
                id="agree-checkout-terms"
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-1 h-3.5 w-3.5 rounded border-gold-300 text-crimson-950 focus:ring-crimson-900 cursor-pointer"
              />
              <label htmlFor="agree-checkout-terms" className="text-[11px] text-obsidian-600 font-light leading-normal cursor-pointer select-none">
                I agree to the{' '}
                <a href="/terms" target="_blank" rel="noopener noreferrer" className="font-bold text-crimson-900 hover:text-gold-600 underline">
                  Terms & Conditions
                </a>{' '}
                and{' '}
                <a href="/privacy" target="_blank" rel="noopener noreferrer" className="font-bold text-crimson-900 hover:text-gold-600 underline">
                  Privacy Policy
                </a>.
              </label>
            </div>

            {/* ── Proceed to Pay button ── */}
            <button
              type="submit"
              form="shipping-form"
              disabled={isBusy}
              className="w-full bg-crimson-950 hover:bg-crimson-900 disabled:opacity-60 disabled:cursor-not-allowed
                         text-gold-100 font-bold uppercase tracking-wider text-xs py-4 rounded-full
                         transition-all duration-300 shadow-md flex items-center justify-center gap-2 group"
            >
              {stage === 'creating' ? (
                <><Loader size={14} className="animate-spin" /><span>Creating Order…</span></>
              ) : stage === 'script_loading' ? (
                <><Loader size={14} className="animate-spin" /><span>Loading Razorpay…</span></>
              ) : stage === 'rzp_open' ? (
                <><Loader size={14} className="animate-spin" /><span>Payment in Progress…</span></>
              ) : (
                <>
                  <span>Proceed to Pay · ₹{cartTotal.toLocaleString('en-IN')}</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            <p className="text-[9px] text-obsidian-400 text-center font-sans">
              By proceeding, you agree to Ethnivaa's Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
