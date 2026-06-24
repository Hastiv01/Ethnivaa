import React from 'react';
import type { Product } from '../data/products';
import { useShop } from '../context/ShopContext';
import { Heart, Star, Eye } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onQuickView: (product: Product) => void;
}

// Helper function to optimize Cloudinary and Unsplash images on the fly
const getOptimizedImageUrl = (url: string, width: number = 500) => {
  if (!url) return '';
  
  // Cloudinary optimization
  if (url.includes('cloudinary.com') && url.includes('/upload/')) {
    // Inject auto-format, auto-quality, and width limit if not already present
    if (!url.includes('f_auto') && !url.includes('q_auto')) {
      return url.replace('/upload/', `/upload/f_auto,q_auto,w_${width},c_limit/`);
    }
  }
  
  return url;
};

export const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickView }) => {
  const { navigateTo, toggleWishlist, isInWishlist } = useShop();

  const handleCardClick = () => {
    navigateTo('details', product.id);
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigation
    toggleWishlist(product.id);
  };

  const handleQuickViewClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigation
    onQuickView(product);
  };

  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPercent = hasDiscount 
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100) 
    : 0;

  return (
    <div 
      onClick={handleCardClick}
      className="group relative bg-white border border-gold-200/50 rounded-2xl overflow-hidden cursor-pointer product-card-hover flex flex-col justify-between transform-gpu isolate"
    >
      {/* Product Image and Overlay Tools */}
      <div className="relative aspect-square overflow-hidden bg-ivory-100 image-zoom-container">
        
        {/* Wishlist Button */}
        <button
          onClick={handleWishlistClick}
          className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/80 hover:bg-white text-crimson-950 hover:text-crimson-600 transition-all duration-200 shadow-md focus:outline-none"
          aria-label="Add to wishlist"
        >
          <Heart 
            size={18} 
            className={`${isInWishlist(product.id) ? 'fill-crimson-600 text-crimson-600 animate-pulse' : 'text-crimson-950'}`} 
          />
        </button>

        {/* Badges */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
          {product.isBestSeller && (
            <span className="bg-crimson-950 text-gold-100 text-[9px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full shadow-md font-sans">
              Best Seller
            </span>
          )}
          {product.isNewArrival && (
            <span className="bg-gold-400 text-crimson-950 text-[9px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full shadow-md font-sans">
              New Arrival
            </span>
          )}
          {hasDiscount && (
            <span className="bg-emerald-600 text-white text-[9px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full shadow-md font-sans">
              {discountPercent}% Off
            </span>
          )}
        </div>

        {/* Product Image */}
        <img 
          src={getOptimizedImageUrl(product.images[0], 500)} 
          alt={product.name} 
          loading="lazy"
          className="w-full h-full object-contain bg-white object-center md:group-hover:scale-105 transition-transform duration-700 transform-gpu"
        />

        {/* Quick View Drawer Hover Overlay (Desktop only) */}
        <div className="absolute inset-0 bg-crimson-950/20 opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 hidden md:flex items-center justify-center pointer-events-none md:pointer-events-auto">
          <button
            onClick={handleQuickViewClick}
            className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-crimson-950 text-xs font-bold uppercase tracking-wider transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 shadow-lg hover:bg-crimson-950 hover:text-white"
          >
            <Eye size={14} />
            <span>Quick View</span>
          </button>
        </div>
      </div>

      {/* Product Information */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div className="space-y-1">

          
          {/* Product Name */}
          <h4 className="font-serif text-[15px] font-semibold text-obsidian-950 line-clamp-1 group-hover:text-crimson-900 transition-colors">
            {product.name}
          </h4>
          
          {/* Rating */}
          <div className="flex items-center gap-1.5">
            <div className="flex text-gold-400">
              <Star size={12} className="fill-gold-400 text-gold-400" />
            </div>
            <span className="text-xs text-obsidian-600 font-medium">{product.rating}</span>
            <span className="text-[10px] text-obsidian-400">({product.reviewsCount})</span>
          </div>
        </div>

        {/* Pricing & Mobile Action */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gold-100">
          <div className="flex items-baseline gap-2">
            <span className="font-serif font-bold text-crimson-950 text-base">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
            {hasDiscount && (
              <span className="font-sans line-through text-obsidian-400 text-xs font-light">
                ₹{product.originalPrice!.toLocaleString('en-IN')}
              </span>
            )}
          </div>
          
          {/* Mobile Quick View Trigger (visible only on tap/screens below MD) */}
          <button
            onClick={handleQuickViewClick}
            className="md:hidden p-2 rounded-full border border-gold-200 hover:bg-gold-50 text-crimson-950"
            aria-label="Quick view"
          >
            <Eye size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
