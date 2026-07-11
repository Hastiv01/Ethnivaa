import React, { useState, useMemo } from 'react';
import { useShop } from '../context/ShopContext';
import { ProductCard } from '../components/ProductCard';
import { QuickViewModal } from '../components/QuickViewModal';
import type { Product } from '../data/products';
import { SlidersHorizontal, ArrowUpDown, RotateCcw, X, Search } from 'lucide-react';
import { SEO } from '../components/SEO';


const PRICE_RANGES = [
  { label: 'All Prices', min: 0, max: 999999 },
  { label: 'Under ₹250', min: 0, max: 250 },
  { label: '₹250 - ₹500', min: 250, max: 500 },
  { label: '₹500 - ₹700', min: 500, max: 700 },
  { label: 'Above ₹700', min: 700, max: 999999 },
];

export const ProductListing: React.FC = () => {
  const { 
    products, 
    searchQuery, 
    setSearchQuery,
    specialFilter,
    setSpecialFilter
  } = useShop();

  const [selectedPriceRange, setSelectedPriceRange] = useState<number>(0); // Index of range
  const [sortBy, setSortBy] = useState<string>('popular');
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Memoized Filtered and Sorted Products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.description.toLowerCase().includes(q)
      );
    }

    // Special Filter
    if (specialFilter === 'best-sellers') {
      result = result.filter(p => p.isBestSeller);
    } else if (specialFilter === 'new-arrivals') {
      result = result.filter(p => p.isNewArrival);
    }



    // Price range filter
    const range = PRICE_RANGES[selectedPriceRange];
    result = result.filter(p => p.price >= range.min && p.price <= range.max);

    // Sorting
    if (sortBy === 'price-low-high') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high-low') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'newest') {
      // Best matches isNewArrival first, else ID comparison
      result.sort((a, b) => (b.isNewArrival ? 1 : 0) - (a.isNewArrival ? 1 : 0));
    } else {
      // Popular: rating and review count
      result.sort((a, b) => b.rating - a.rating || b.reviewsCount - a.reviewsCount);
    }

    return result;
  }, [products, searchQuery, selectedPriceRange, sortBy, specialFilter]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSpecialFilter(null);

    setSelectedPriceRange(0);
    setSortBy('popular');
  };

  const seoTitle = useMemo(() => {
    if (specialFilter === 'best-sellers') return 'Best Sellers Collection | Traditional Indian Jewellery | Ethnivaa';
    if (specialFilter === 'new-arrivals') return 'New Arrivals | Latest Indian Jewellery Designs | Ethnivaa';
    return 'Shop Traditional Indian Jewellery | Kundan, Temple & Oxidized | Ethnivaa';
  }, [specialFilter]);

  const seoDescription = useMemo(() => {
    if (specialFilter === 'best-sellers') return 'Discover our most popular traditional Indian ornaments. Handcrafted Kundan choker sets, oxidized jhumkas, and premium heritage jewellery collections.';
    if (specialFilter === 'new-arrivals') return 'Explore the newly unveiled heritage jewellery at Ethnivaa. Modern elegance combined with classic Indian festive style.';
    return 'Browse the full Ethnivaa catalog. Hand-crafted luxury traditional Indian jewellery including Kundan choker sets, temple necklaces, oxidized chandbalis, and festive ornaments.';
  }, [specialFilter]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fadeIn min-h-screen">
      <SEO 
        title={seoTitle}
        description={seoDescription}
      />
      {/* Page Title & Breadcrumbs */}
      <div className="text-center space-y-2 mb-10">
        <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-crimson-950 uppercase tracking-wide">
          {specialFilter === 'best-sellers' ? 'Best Sellers' : specialFilter === 'new-arrivals' ? 'New Arrivals' : 'All Treasures'}
        </h1>
        <div className="w-16 h-0.5 bg-gold-400 mx-auto mt-2"></div>
      </div>

      {/* Product Listing Area */}
      <div className="space-y-6">
        
        {/* Top Toolbar */}
        <div className="bg-white border border-gold-200/50 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-gold shadow-sm">
          
          {/* Left Side: Product Count, Search Tag & Reset */}
            <div className="flex flex-wrap w-full sm:w-auto items-center gap-3">
              <span className="text-xs text-obsidian-600 font-sans font-semibold">
                Showing {filteredProducts.length} pieces
              </span>
              
              {(searchQuery || selectedPriceRange !== 0 || sortBy !== 'popular' || specialFilter !== null) && (
                <button
                  onClick={handleResetFilters}
                  className="text-[11px] font-bold tracking-wider text-crimson-800 hover:text-gold-600 transition-colors uppercase flex items-center gap-1 sm:border-l border-gold-200 sm:pl-3"
                >
                  <RotateCcw size={10} />
                  <span>Reset All</span>
                </button>
              )}

              {searchQuery && (
                <span className="bg-gold-50 text-crimson-950 text-xs px-3.5 py-1.5 rounded-full border border-gold-200 flex items-center gap-1.5 font-sans font-medium ml-1">
                  <span>Search: "{searchQuery}"</span>
                  <button onClick={() => setSearchQuery('')} className="hover:text-crimson-600">
                    <X size={12} />
                  </button>
                </span>
              )}
            </div>

            {/* Filters and Sorting Control */}
            <div className="flex flex-wrap w-full sm:w-auto items-center justify-between sm:justify-end gap-3 font-sans text-xs">
              
              {/* Price Range Dropdown */}
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={14} className="text-gold-600" />
                <select
                  value={selectedPriceRange}
                  onChange={(e) => setSelectedPriceRange(Number(e.target.value))}
                  className="bg-transparent border border-gold-300 rounded-full px-3.5 py-2 text-obsidian-950 font-semibold focus:outline-none focus:border-gold-500 cursor-pointer shadow-gold-sm"
                >
                  {PRICE_RANGES.map((rng, idx) => (
                    <option key={idx} value={idx}>{rng.label}</option>
                  ))}
                </select>
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-2">
                <ArrowUpDown size={14} className="text-gold-600" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent border border-gold-300 rounded-full px-3.5 py-2 text-obsidian-950 font-semibold focus:outline-none focus:border-gold-500 cursor-pointer shadow-gold-sm"
                >
                  <option value="popular">Popularity</option>
                  <option value="price-low-high">Price: Low to High</option>
                  <option value="price-high-low">Price: High to Low</option>
                  <option value="newest">Newest Arrivals</option>
                </select>
              </div>
            </div>
          </div>

          {/* Empty State */}
          {filteredProducts.length === 0 ? (
            <div className="bg-white border border-gold-200/50 rounded-3xl p-16 text-center space-y-6 shadow-gold shadow-sm flex flex-col items-center">
              <div className="p-4 rounded-full bg-gold-50 border border-gold-200 text-gold-600">
                <Search size={32} />
              </div>
              <div className="space-y-2">
                <h3 className="font-serif text-xl font-bold text-crimson-950">
                  No Treasures Discovered
                </h3>
                <p className="text-xs text-obsidian-500 max-w-md font-sans">
                  We couldn't find any jewellery pieces matching your search or filters. Try adjusting your selections.
                </p>
              </div>
              <button
                onClick={handleResetFilters}
                className="bg-crimson-950 text-gold-100 hover:bg-crimson-900 font-bold uppercase tracking-wider text-xs px-6 py-2.5 rounded-full transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            /* Product Grid */
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-6">
              {filteredProducts.map(product => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  onQuickView={(p) => setQuickViewProduct(p)} 
                />
              ))}
            </div>
          )}
      </div>

      {/* Quick View Modal Hook */}
      <QuickViewModal 
        product={quickViewProduct} 
        onClose={() => setQuickViewProduct(null)} 
      />
    </div>
  );
};
