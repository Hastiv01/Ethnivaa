import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { Product } from '../data/products';
import { useShop } from '../context/ShopContext';
import { X, Heart, ShoppingBag, ArrowRight, Minus, Plus } from 'lucide-react';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({ product, onClose }) => {
  const { addToCart, toggleWishlist, isInWishlist, navigateTo } = useShop();
  const [quantity, setQuantity] = useState(1);
  const [addedMessage, setAddedMessage] = useState(false);

  useEffect(() => {
    if (product) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [product]);

  if (!product) return null;

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAddedMessage(true);
    setTimeout(() => {
      setAddedMessage(false);
      onClose();
    }, 1500);
  };

  const handleViewDetails = () => {
    navigateTo('details', product.id);
    onClose();
  };

  const hasDiscount = product.originalPrice && product.originalPrice > product.price;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/60 backdrop-blur-sm animate-fadeIn">
      {/* Modal Card */}
      <div className="relative w-full max-w-4xl bg-white border border-gold-300 rounded-3xl overflow-hidden shadow-gold-xl animate-scaleIn max-h-[90vh] overflow-y-auto custom-scrollbar">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-ivory-100 hover:bg-gold-100 text-crimson-950 transition-colors"
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 md:p-8">
          
          {/* Left: Image display */}
          <div className="relative aspect-square md:h-full overflow-hidden rounded-2xl bg-ivory-50 border border-gold-100 flex items-center justify-center">
            <img 
              src={product.images[0]} 
              alt={product.name} 
              className="w-full h-full object-cover"
            />
            {product.isBestSeller && (
              <span className="absolute top-4 left-4 bg-crimson-950 text-gold-100 text-[9px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full shadow-md font-sans">
                Best Seller
              </span>
            )}
          </div>

          {/* Right: Product Details */}
          <div className="flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              {/* Collection and Category */}
              <div>
                <span className="text-xs uppercase tracking-widest text-gold-600 font-bold font-sans">
                  {product.category} Collection
                </span>
                <h3 className="font-serif text-2xl font-bold text-obsidian-950 mt-1">
                  {product.name}
                </h3>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span className="font-serif text-2xl font-bold text-crimson-950">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
                {hasDiscount && (
                  <span className="font-sans line-through text-obsidian-400 text-sm font-light">
                    ₹{product.originalPrice!.toLocaleString('en-IN')}
                  </span>
                )}
              </div>

              {/* Short details */}
              <div className="grid grid-cols-2 gap-4 py-3 border-y border-gold-100 text-xs font-sans text-obsidian-800">
                <div>
                  <span className="text-obsidian-400 block mb-0.5">Material</span>
                  <span className="font-semibold">{product.material}</span>
                </div>
                <div>
                  <span className="text-obsidian-400 block mb-0.5">Occasion</span>
                  <span className="font-semibold">{product.occasion}</span>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-obsidian-600 font-light leading-relaxed font-sans line-clamp-3">
                {product.description}
              </p>

              {/* Stock Status */}
              <div className="text-xs font-sans">
                {product.stock === 0 ? (
                  <span className="text-crimson-600 font-bold">Out of Stock</span>
                ) : product.stock < 10 ? (
                  <span className="text-amber-600 font-bold">Hurry! Only {product.stock} left in stock</span>
                ) : (
                  <span className="text-emerald-700 font-medium">In Stock</span>
                )}
              </div>
            </div>

            {/* Actions Panel */}
            {product.stock > 0 && (
              <div className="space-y-4 pt-4 border-t border-gold-100">
                <div className="flex items-center gap-4">
                  {/* Quantity Stepper */}
                  <div className="flex items-center border border-gold-300 rounded-full bg-ivory-50 px-2 py-1 shadow-gold-sm">
                    <button
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      className="p-1 text-crimson-950 hover:text-gold-600"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-8 text-center text-xs font-bold text-obsidian-950 font-sans">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                      className="p-1 text-crimson-950 hover:text-gold-600"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  {/* Add to Cart button */}
                  <button
                    onClick={handleAddToCart}
                    disabled={addedMessage}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-md ${
                      addedMessage 
                        ? 'bg-emerald-600 text-white shadow-emerald-200' 
                        : 'bg-crimson-950 text-gold-100 hover:bg-crimson-900 shadow-crimson-900/10'
                    }`}
                  >
                    <ShoppingBag size={14} />
                    <span>{addedMessage ? 'Added to Cart' : 'Add to Cart'}</span>
                  </button>

                  {/* Wishlist button */}
                  <button
                    onClick={() => toggleWishlist(product.id)}
                    className="p-3 rounded-full border border-gold-300 hover:bg-gold-50 text-crimson-950 transition-colors shadow-gold-sm"
                    aria-label="Wishlist"
                  >
                    <Heart 
                      size={16} 
                      className={isInWishlist(product.id) ? "fill-crimson-600 text-crimson-600" : ""} 
                    />
                  </button>
                </div>

                {/* View Details Page Trigger */}
                <button
                  onClick={handleViewDetails}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-full border border-crimson-950 hover:bg-crimson-50 text-crimson-950 text-xs font-bold uppercase tracking-wider transition-colors"
                >
                  <span>View Full Details</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
