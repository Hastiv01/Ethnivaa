import React from 'react';
import { useShop } from '../context/ShopContext';
import { CheckCircle2, ShoppingBag, Sparkles, MapPin } from 'lucide-react';

export const OrderSuccess: React.FC = () => {
  const { latestOrder, navigateTo } = useShop();

  // Fallback if accessed directly
  const order = latestOrder || {
    id: 'ETH-589624',
    date: new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }),
    items: [
      {
        productId: 'eth-001',
        name: 'Mayur Pankh Oxidized Choker Set',
        price: 1899,
        image: '/placeholder.png',
        quantity: 1
      }
    ],
    shippingAddress: {
      fullName: 'Aditi Sharma',
      mobileNumber: '9876543210',
      address: '402, Royal Residency, Linking Road, Santacruz West',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400054'
    },
    paymentMethod: 'UPI',
    paymentStatus: 'Success' as const,
    subtotal: 1899,
    shipping: 150,
    total: 2049
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-16 animate-fadeIn min-h-screen">
      
      {/* Success Animation & Header */}
      <div className="text-center space-y-4 mb-10">
        <div className="inline-flex relative">
          <CheckCircle2 size={64} className="text-emerald-600 animate-pulse relative z-10" />
          <Sparkles size={24} className="text-gold-400 absolute -top-2 -right-2 animate-bounce" />
          <Sparkles size={18} className="text-gold-400 absolute -bottom-1 -left-2 animate-bounce delay-150" />
        </div>
        
        <div className="space-y-1">
          <span className="text-[10px] tracking-[0.3em] uppercase text-emerald-700 font-bold font-sans">
            Transaction Completed
          </span>
          <h1 className="font-serif text-3xl font-extrabold text-crimson-950">
            Order Placed Successfully!
          </h1>
          <p className="text-xs text-obsidian-600 font-sans font-light">
            Thank you for purchasing from Ethnivaa. Your order has been registered.<br />
            <span className="mt-2 block">You can view the status of your order at any time by logging into your account and visiting the Order History section.</span>
          </p>
        </div>
        <div className="w-16 h-0.5 bg-gold-400 mx-auto mt-2"></div>
      </div>

      {/* Details Card */}
      <div className="bg-white border border-gold-300 rounded-3xl p-6 sm:p-8 shadow-gold-md font-sans space-y-6">
        
        {/* Order Meta */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-6 border-b border-gold-100 text-xs">
          <div>
            <span className="text-obsidian-400 block mb-0.5">Order Reference</span>
            <span className="font-bold text-crimson-950 bg-gold-50 border border-gold-200 px-2 py-0.5 rounded text-[11px] inline-block font-mono">
              {order.id}
            </span>
          </div>
          <div>
            <span className="text-obsidian-400 block mb-0.5">Payment Method</span>
            <span className="font-semibold text-obsidian-900">{order.paymentMethod}</span>
          </div>
          <div>
            <span className="text-obsidian-400 block mb-0.5">Payment Status</span>
            <span className="font-bold text-emerald-700 uppercase text-[10px] tracking-wider">{order.paymentStatus}</span>
          </div>
          <div>
            <span className="text-obsidian-400 block mb-0.5">Estimated Delivery</span>
            <span className="font-semibold text-obsidian-950">5 - 10 Business Days</span>
          </div>
        </div>

        {/* Shipping Destination */}
        <div className="space-y-3 pb-6 border-b border-gold-100 text-xs">
          <h3 className="font-serif font-bold text-crimson-950 text-sm flex items-center gap-1.5">
            <MapPin size={14} className="text-gold-500" />
            <span>Shipping Destination</span>
          </h3>
          <div className="bg-ivory-50 border border-gold-100/30 p-4 rounded-xl space-y-1 font-light text-obsidian-700 leading-normal">
            <div className="font-semibold text-obsidian-950">{order.shippingAddress.fullName}</div>
            <div>{order.shippingAddress.address}</div>
            <div>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</div>
            <div className="text-[10px] font-medium text-obsidian-400 mt-1">Mobile: {order.shippingAddress.mobileNumber}</div>
          </div>
        </div>

        {/* Ordered Items Summary */}
        <div className="space-y-3 pb-4 text-xs">
          <h3 className="font-serif font-bold text-crimson-950 text-sm flex items-center gap-1.5">
            <ShoppingBag size={14} className="text-gold-500" />
            <span>Items Purchased</span>
          </h3>
          <div className="space-y-3">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex gap-4 items-center justify-between">
                <div className="flex gap-3 items-center">
                  <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover border border-gold-100 flex-shrink-0" />
                  <div>
                    <span className="font-semibold text-obsidian-950 line-clamp-1">{item.name}</span>
                    <span className="text-obsidian-400 text-[10px]">Quantity: {item.quantity}</span>
                  </div>
                </div>
                <span className="font-bold text-obsidian-900">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Totals */}
        <div className="border-t border-gold-100 pt-4 text-xs space-y-2 text-obsidian-600">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>₹{order.subtotal.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping / Insurance</span>
            <span>{order.shipping === 0 ? 'Free' : `₹${order.shipping}`}</span>
          </div>
          <div className="border-t border-gold-100 pt-3 flex justify-between text-sm font-bold text-crimson-950">
            <span>Total Paid</span>
            <span className="font-serif text-base font-extrabold text-crimson-950">₹{order.total.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* Navigation CTA Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10 font-sans text-xs">
        <button
          onClick={() => navigateTo('shop')}
          className="w-full sm:w-auto bg-crimson-950 hover:bg-crimson-900 text-gold-100 font-bold uppercase tracking-wider px-8 py-3.5 rounded-full transition-colors shadow-md text-center"
        >
          Continue Shopping
        </button>
        <button
          onClick={() => navigateTo('account')}
          className="w-full sm:w-auto bg-white hover:bg-gold-50 border border-crimson-950 text-crimson-950 font-bold uppercase tracking-wider px-8 py-3.5 rounded-full transition-colors shadow-md text-center"
        >
          View Order History
        </button>
      </div>

    </div>
  );
};
