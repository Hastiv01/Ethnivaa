import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { ProductCard } from '../components/ProductCard';
import { QuickViewModal } from '../components/QuickViewModal';
import type { Product } from '../data/products';
import { Star, Truck, ShoppingBag, Heart, ArrowLeft, Plus, Minus, Send, ShieldCheck, Lock } from 'lucide-react';

export const ProductDetails: React.FC = () => {
  const { id: urlProductId } = useParams<{ id: string }>();
  const { 
    selectedProductId, 
    products, 
    addToCart, 
    toggleWishlist, 
    isInWishlist, 
    navigateTo,
    addReview
  } = useShop();

  // URL param takes priority; fall back to context selectedProductId
  const activeProductId = urlProductId || selectedProductId;

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [zoomStyle, setZoomStyle] = useState<React.CSSProperties>({ display: 'none' });
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Review Form state
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  // Retrieve current product
  const product = useMemo(() => {
    return products.find(p => p.id === activeProductId) || products[0];
  }, [products, activeProductId]);

  // Fallback if no product exists
  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="font-serif text-2xl font-bold text-crimson-950">Treasure Not Found</h2>
        <button onClick={() => navigateTo('shop')} className="bg-crimson-950 text-gold-100 px-6 py-2.5 rounded-full font-bold">
          Return to Shop
        </button>
      </div>
    );
  }

  const relatedProducts = useMemo(() => {
    return products
      .filter(p => p.id !== product.id)
      .slice(0, 4);
  }, [products, product]);

  const handleImageHover = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({
      display: 'block',
      backgroundImage: `url(${product.images[activeImageIdx]})`,
      backgroundPosition: `${x}% ${y}%`,
      backgroundSize: '200%'
    });
  };

  const handleImageLeave = () => {
    setZoomStyle({ display: 'none' });
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    navigateTo('checkout');
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName || !reviewComment) return;

    addReview(product.id, {
      userName: reviewName,
      rating: reviewRating,
      comment: reviewComment
    });

    setReviewSubmitted(true);
    setReviewName('');
    setReviewComment('');
    setReviewRating(5);
    setTimeout(() => setReviewSubmitted(false), 4000);
  };

  const hasDiscount = product.originalPrice && product.originalPrice > product.price;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn min-h-screen">
      {/* Back Button */}
      <button
        onClick={() => navigateTo('shop')}
        className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-crimson-950 hover:text-gold-600 mb-8 transition-colors font-sans"
      >
        <ArrowLeft size={14} />
        <span>Back to Collection</span>
      </button>

      {/* Main Grid: Gallery + Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start mb-16">
        
        {/* Gallery Column */}
        <div className="space-y-4">
          
          {/* Main Display Container with Zoom */}
          <div 
            className="relative aspect-square overflow-hidden rounded-2xl bg-white border border-gold-200/50 shadow-gold shadow-sm cursor-zoom-in flex items-center justify-center"
            onMouseMove={handleImageHover}
            onMouseLeave={handleImageLeave}
          >
            <img 
              src={product.images[activeImageIdx]} 
              alt={product.name} 
              className="w-full h-full object-contain bg-white"
            />
            {/* Zoom magnifier Overlay */}
            <div 
              className="absolute inset-0 pointer-events-none border border-gold-400 bg-no-repeat"
              style={zoomStyle}
            ></div>
            
            {product.isBestSeller && (
              <span className="absolute top-4 left-4 bg-crimson-950 text-gold-100 text-[10px] font-bold tracking-wider uppercase px-3 py-1 rounded-full shadow-md">
                Best Seller
              </span>
            )}
          </div>

          {/* Thumbnail strip */}
          <div className="flex gap-3 overflow-x-auto py-1 custom-scrollbar">
            {product.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImageIdx(idx)}
                className={`w-20 h-20 rounded-xl overflow-hidden border-2 bg-white flex-shrink-0 transition-colors ${
                  idx === activeImageIdx ? 'border-gold-400' : 'border-gold-100 hover:border-gold-300'
                }`}
              >
                <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-contain bg-white" />
              </button>
            ))}
          </div>
        </div>

        {/* Product Details Column */}
        <div className="space-y-6">
          
          {/* Title & Ratings */}
          <div className="space-y-2">
            <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-obsidian-950 leading-tight">
              {product.name}
            </h1>
            
            {/* Rating Stars Summary */}
            <div className="flex items-center gap-2 font-sans text-xs">
              <div className="flex text-gold-400">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    size={16} 
                    className={`${i < Math.round(product.rating) ? 'fill-gold-400 text-gold-400' : 'text-gold-200'}`} 
                  />
                ))}
              </div>
              <span className="font-bold text-obsidian-900">{product.rating} / 5.0</span>
              <span className="text-obsidian-400">({product.reviewsCount} customer reviews)</span>
            </div>
          </div>

          {/* Pricing */}
          <div className="flex items-baseline gap-4 pt-2">
            <span className="font-serif text-3xl font-extrabold text-crimson-950">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
            {hasDiscount && (
              <span className="font-sans line-through text-obsidian-400 text-base font-light">
                ₹{product.originalPrice!.toLocaleString('en-IN')}
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-sm font-sans font-light text-obsidian-700 leading-relaxed">
            {product.description}
          </p>

          {/* Quantity Stepper & Cart triggers */}
          <div className="space-y-4 pt-4 border-t border-gold-100">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                
                {/* Stepper */}
                <div className="flex items-center border border-gold-300 rounded-full bg-ivory-50 px-3 py-2 shadow-gold-sm w-full sm:w-auto justify-between">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="p-1.5 text-crimson-950 hover:text-gold-600"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-12 text-center text-sm font-bold text-obsidian-950 font-sans">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(q => q + 1)}
                    className="p-1.5 text-crimson-950 hover:text-gold-600"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                {/* Add To Cart */}
                <button
                  onClick={handleAddToCart}
                  className="w-full sm:flex-1 bg-white hover:bg-gold-50 border border-crimson-950 text-crimson-950 font-bold uppercase tracking-wider text-xs py-3.5 rounded-full transition-all duration-300 shadow-md hover:shadow-gold-sm flex items-center justify-center gap-2"
                >
                  <ShoppingBag size={16} />
                  <span>Add to Cart</span>
                </button>

                {/* Buy Now */}
                <button
                  onClick={handleBuyNow}
                  className="w-full sm:flex-1 bg-crimson-950 hover:bg-crimson-900 text-gold-100 font-bold uppercase tracking-wider text-xs py-3.5 rounded-full transition-all duration-300 shadow-md flex items-center justify-center gap-2"
                >
                  <span>Buy It Now</span>
                </button>

                {/* Wishlist Icon */}
                <button
                  onClick={() => toggleWishlist(product.id)}
                  className="p-3 rounded-full border border-gold-300 hover:bg-gold-50 text-crimson-950 transition-colors shadow-gold-sm w-full sm:w-auto flex items-center justify-center gap-2 sm:gap-0"
                  title="Add to wishlist"
                >
                  <Heart 
                    size={18} 
                    className={isInWishlist(product.id) ? "fill-crimson-600 text-crimson-600" : ""} 
                  />
                  <span className="sm:hidden text-xs uppercase tracking-wider font-bold">Wishlist</span>
                </button>

              </div>
            </div>


          {/* Trust badges */}
          <div className="py-5">
            <div className="flex flex-wrap sm:flex-nowrap items-center justify-around gap-2 py-3 px-2 sm:px-4 rounded-xl bg-ivory-50 border border-gold-200/50 shadow-gold-sm">
              <div className="flex items-center gap-2">
                <Truck size={18} className="text-gold-600 shrink-0" />
                <div className="flex flex-col text-left leading-tight">
                  <span className="text-[10px] font-bold text-obsidian-950 uppercase tracking-widest">Free Delivery</span>
                  <span className="text-[9px] text-obsidian-600 font-light">above ₹499</span>
                </div>
              </div>
              <div className="hidden sm:block w-px h-6 bg-gold-200/50 shrink-0"></div>
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-gold-600 shrink-0" />
                <div className="flex flex-col text-left leading-tight">
                  <span className="text-[10px] font-bold text-obsidian-950 uppercase tracking-widest">Quality</span>
                  <span className="text-[9px] text-obsidian-600 font-light">assured</span>
                </div>
              </div>
              <div className="hidden sm:block w-px h-6 bg-gold-200/50 shrink-0"></div>
              <div className="flex items-center gap-2">
                <Lock size={18} className="text-gold-600 shrink-0" />
                <div className="flex flex-col text-left leading-tight">
                  <span className="text-[10px] font-bold text-obsidian-950 uppercase tracking-widest">Secure</span>
                  <span className="text-[9px] text-obsidian-600 font-light">payments</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Reviews Section */}
      <section className="border-t border-gold-200/50 pt-12 mb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Column 1: Ratings overview & Add Review form */}
          <div className="space-y-6">
            <div className="bg-white border border-gold-200/50 p-6 rounded-2xl shadow-gold shadow-sm space-y-4">
              <h3 className="font-serif text-lg font-bold text-crimson-950">Customer Rating</h3>
              
              <div className="flex items-center gap-4">
                <span className="font-serif text-4xl font-extrabold text-crimson-950">{product.rating}</span>
                <div>
                  <div className="flex text-gold-400">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        size={14} 
                        className={`${i < Math.round(product.rating) ? 'fill-gold-400 text-gold-400' : 'text-gold-200'}`} 
                      />
                    ))}
                  </div>
                  <span className="text-[11px] font-sans text-obsidian-400">Based on {product.reviewsCount} reviews</span>
                </div>
              </div>
            </div>

            {/* Write a Review Form */}
            <div className="bg-white border border-gold-200/50 p-6 rounded-2xl shadow-gold shadow-sm">
              <h3 className="font-serif text-lg font-bold text-crimson-950 mb-4">Write a Review</h3>
              
              <form onSubmit={handleReviewSubmit} className="space-y-4 font-sans text-xs">
                <div className="space-y-1.5">
                  <label className="font-semibold text-obsidian-800">Your Royal Name</label>
                  <input
                    type="text"
                    required
                    value={reviewName}
                    onChange={(e) => setReviewName(e.target.value)}
                    placeholder="Enter your name..."
                    className="w-full bg-ivory-50 border border-gold-200 rounded-lg p-2.5 focus:outline-none focus:border-gold-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-obsidian-800 block">Rating</label>
                  <div className="flex gap-1 text-gold-400">
                    {[1, 2, 3, 4, 5].map((stars) => (
                      <button
                        key={stars}
                        type="button"
                        onClick={() => setReviewRating(stars)}
                        className="p-1 hover:scale-110 transition-transform focus:outline-none"
                      >
                        <Star 
                          size={18} 
                          className={`${stars <= reviewRating ? 'fill-gold-400 text-gold-400' : 'text-gold-200'}`} 
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-obsidian-800">Your Review</label>
                  <textarea
                    required
                    rows={4}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Share your experience with this ornament..."
                    className="w-full bg-ivory-50 border border-gold-200 rounded-lg p-2.5 focus:outline-none focus:border-gold-400 resize-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full bg-crimson-950 hover:bg-crimson-900 text-gold-100 font-bold uppercase tracking-wider text-xs py-3 rounded-full transition-colors flex items-center justify-center gap-1.5 shadow-md"
                >
                  <Send size={12} />
                  <span>Submit Review</span>
                </button>

                {reviewSubmitted && (
                  <p className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 p-2.5 rounded-lg font-medium text-center animate-fadeIn">
                    Review submitted successfully! Thank you for sharing.
                  </p>
                )}
              </form>
            </div>
          </div>

          {/* Column 2 & 3: Reviews list */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="font-serif text-xl font-bold text-crimson-950 border-b border-gold-100 pb-3">
              Client Reviews ({product.reviewsCount})
            </h3>
            
            {product.reviews.length === 0 ? (
              <p className="text-xs text-obsidian-400 font-sans italic py-4">No reviews yet. Be the first to review this treasure!</p>
            ) : (
              <div className="space-y-4">
                {product.reviews.map(rev => (
                  <div key={rev.id} className="bg-white border border-gold-100 p-5 rounded-2xl shadow-gold shadow-sm font-sans space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-crimson-950">{rev.userName}</span>
                      <span className="text-[10px] text-obsidian-400 font-light">{rev.date}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex text-gold-400">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            size={12} 
                            className={`${i < rev.rating ? 'fill-gold-400 text-gold-400' : 'text-gold-200'}`} 
                          />
                        ))}
                      </div>
                      {rev.verified && (
                        <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded uppercase tracking-wider scale-95">
                          Verified Buyer
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-obsidian-600 font-light leading-relaxed leading-normal">
                      {rev.comment}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Related Products Carousel */}
      {relatedProducts.length > 0 && (
        <section className="border-t border-gold-200/50 pt-12">
          <div className="space-y-6 mb-8">
            <span className="text-[10px] tracking-[0.3em] uppercase text-gold-600 font-bold font-sans block">
              Complete the Set
            </span>
            <h3 className="font-serif text-2xl font-bold text-crimson-950">
              Related Masterpieces
            </h3>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map(prod => (
              <ProductCard 
                key={prod.id} 
                product={prod} 
                onQuickView={(p) => setQuickViewProduct(p)} 
              />
            ))}
          </div>
        </section>
      )}

      {/* Quick View Modal Hook */}
      <QuickViewModal 
        product={quickViewProduct} 
        onClose={() => setQuickViewProduct(null)} 
      />
    </div>
  );
};
