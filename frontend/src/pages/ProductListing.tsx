import React, { useState, useMemo } from 'react';
import { useShop } from '../context/ShopContext';
import { ProductCard } from '../components/ProductCard';
import { QuickViewModal } from '../components/QuickViewModal';
import type { Product } from '../data/products';
import { SlidersHorizontal, ArrowUpDown, RotateCcw, X, Search } from 'lucide-react';


const PRICE_RANGES = [
  { label: 'All Prices', min: 0, max: 999999 },
  { label: 'Under ₹2,000', min: 0, max: 2000 },
  { label: '₹2,000 - ₹5,000', min: 2000, max: 5000 },
  { label: '₹5,000 - ₹10,000', min: 5000, max: 10000 },
  { label: 'Above ₹10,000', min: 10000, max: 999999 },
];

export const ProductListing: React.FC = () => {
  const { 
    products, 
    categories,
    searchQuery, 
    setSearchQuery,
    selectedCategoryFilter, 
    setSelectedCategoryFilter 
  } = useShop();

  const [selectedPriceRange, setSelectedPriceRange] = useState<number>(0); // Index of range
  const [sortBy, setSortBy] = useState<string>('popular');
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Memoized Filtered and Sorted Products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (selectedCategoryFilter) {
      result = result.filter(p => p.category === selectedCategoryFilter);
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
  }, [products, searchQuery, selectedCategoryFilter, selectedPriceRange, sortBy]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategoryFilter(null);
    setSelectedPriceRange(0);
    setSortBy('popular');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fadeIn min-h-screen">
      {/* Page Title & Breadcrumbs */}
      <div className="text-center space-y-2 mb-10">
        <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-crimson-950 uppercase tracking-wide">
          {selectedCategoryFilter ? `${selectedCategoryFilter} Collection` : 'All Treasures'}
        </h1>
        <p className="text-xs text-obsidian-600 font-sans font-light">
          {filteredProducts.length} unique masterpieces discovered
        </p>
        <div className="w-16 h-0.5 bg-gold-400 mx-auto mt-2"></div>
      </div>

      {/* Grid: Filters Sidebar + Listing */}
      <div className="lg:grid lg:grid-cols-4 lg:gap-8 items-start">
        
        {/* Left column: Desktop Sidebar Filters */}
        <aside className="hidden lg:block space-y-6 bg-white p-6 border border-gold-200/50 rounded-2xl shadow-gold shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-gold-100">
            <h3 className="font-serif font-bold text-crimson-950 text-base flex items-center gap-2">
              <SlidersHorizontal size={16} />
              <span>Filters</span>
            </h3>
            <button
              onClick={handleResetFilters}
              className="text-[11px] font-bold tracking-wider text-crimson-800 hover:text-gold-600 transition-colors uppercase flex items-center gap-1"
            >
              <RotateCcw size={10} />
              <span>Reset</span>
            </button>
          </div>

          {/* Filter: Category */}
          <div className="space-y-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-gold-600 font-sans block">
              Collection
            </span>
            <div className="flex flex-col space-y-1.5 font-sans text-xs">
              <button
                onClick={() => setSelectedCategoryFilter(null)}
                className={`text-left py-1 hover:text-crimson-900 transition-colors ${
                  !selectedCategoryFilter ? 'font-bold text-crimson-900 pl-2 border-l-2 border-gold-400' : 'text-obsidian-700'
                }`}
              >
                All Collections
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategoryFilter(cat.name)}
                  className={`text-left py-1 hover:text-crimson-900 transition-colors ${
                    selectedCategoryFilter === cat.name ? 'font-bold text-crimson-900 pl-2 border-l-2 border-gold-400' : 'text-obsidian-700'
                  }`}
                >
                  {cat.name} Collection
                </button>
              ))}
            </div>
          </div>

          {/* Filter: Price Range */}
          <div className="space-y-2.5 pt-4 border-t border-gold-100">
            <span className="text-xs font-bold uppercase tracking-wider text-gold-600 font-sans block">
              Price Range
            </span>
            <div className="flex flex-col space-y-1.5 font-sans text-xs">
              {PRICE_RANGES.map((rng, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedPriceRange(idx)}
                  className={`text-left py-1 hover:text-crimson-900 transition-colors ${
                    selectedPriceRange === idx ? 'font-bold text-crimson-900 pl-2 border-l-2 border-gold-400' : 'text-obsidian-700'
                  }`}
                >
                  {rng.label}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Right column: Toolbar + Product Grid */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Top Toolbar */}
          <div className="bg-white border border-gold-200/50 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-gold shadow-sm">
            {/* Search Term Tag (if any) */}
            <div className="flex flex-wrap items-center gap-2">
              {searchQuery && (
                <span className="bg-gold-50 text-crimson-950 text-xs px-3.5 py-1.5 rounded-full border border-gold-200 flex items-center gap-1.5 font-sans font-medium">
                  <span>Search: "{searchQuery}"</span>
                  <button onClick={() => setSearchQuery('')} className="hover:text-crimson-600">
                    <X size={12} />
                  </button>
                </span>
              )}
              {selectedCategoryFilter && (
                <span className="bg-gold-50 text-crimson-950 text-xs px-3.5 py-1.5 rounded-full border border-gold-200 flex items-center gap-1.5 font-sans font-medium">
                  <span>Collection: {selectedCategoryFilter}</span>
                  <button onClick={() => setSelectedCategoryFilter(null)} className="hover:text-crimson-600">
                    <X size={12} />
                  </button>
                </span>
              )}
            </div>

            {/* Mobile Filters and Sorting Control */}
            <div className="flex w-full sm:w-auto items-center justify-between sm:justify-end gap-3 font-sans text-xs">
              {/* Mobile Filter Button */}
              <button
                onClick={() => setIsMobileFiltersOpen(true)}
                className="lg:hidden flex items-center gap-1.5 border border-gold-300 rounded-full px-4 py-2 bg-white text-crimson-950 font-bold hover:bg-gold-50"
              >
                <SlidersHorizontal size={14} />
                <span>Filters</span>
              </button>

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
                  We couldn't find any jewelry pieces matching your search or filters. Try adjusting your selections.
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
      </div>

      {/* Mobile Filters Drawer Modal */}
      {isMobileFiltersOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-obsidian-950/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-80 bg-white h-full p-6 flex flex-col justify-between shadow-2xl animate-slideLeft">
            
            {/* Header */}
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-gold-100">
                <h3 className="font-serif font-bold text-crimson-950 text-lg flex items-center gap-2">
                  <SlidersHorizontal size={18} />
                  <span>Refine Treasures</span>
                </h3>
                <button
                  onClick={() => setIsMobileFiltersOpen(false)}
                  className="p-1.5 rounded-full bg-ivory-100 text-crimson-950 hover:bg-gold-100"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Scrollable Filters Content */}
              <div className="space-y-6 py-6 overflow-y-auto max-h-[75vh] custom-scrollbar">
                
                {/* Collection filter */}
                <div className="space-y-2.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-gold-600 font-sans block">
                    Collection
                  </span>
                  <div className="flex flex-wrap gap-2 text-xs font-sans">
                    <button
                      onClick={() => setSelectedCategoryFilter(null)}
                      className={`px-3 py-1.5 rounded-full border transition-all ${
                        !selectedCategoryFilter 
                          ? 'bg-crimson-950 text-gold-100 border-crimson-950' 
                          : 'bg-white border-gold-300 text-obsidian-800'
                      }`}
                    >
                      All
                    </button>
                    {categories.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategoryFilter(cat.name)}
                        className={`px-3 py-1.5 rounded-full border transition-all ${
                          selectedCategoryFilter === cat.name 
                            ? 'bg-crimson-950 text-gold-100 border-crimson-950' 
                            : 'bg-white border-gold-300 text-obsidian-800'
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Filter */}
                <div className="space-y-2.5 border-t border-gold-100 pt-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-gold-600 font-sans block">
                    Price Range
                  </span>
                  <div className="flex flex-col space-y-2 text-xs font-sans">
                    {PRICE_RANGES.map((rng, idx) => (
                      <label key={idx} className="flex items-center gap-2 cursor-pointer font-medium text-obsidian-800">
                        <input
                          type="radio"
                          name="price-range"
                          checked={selectedPriceRange === idx}
                          onChange={() => setSelectedPriceRange(idx)}
                          className="accent-crimson-800 h-4 w-4"
                        />
                        <span>{rng.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                {/* End of Filters */}
              </div>
            </div>

            {/* Footer buttons */}
            <div className="flex items-center gap-3 border-t border-gold-100 pt-4 font-sans text-xs">
              <button
                onClick={handleResetFilters}
                className="flex-1 py-3 rounded-full border border-gold-300 font-bold hover:bg-gold-50 text-crimson-950 uppercase text-center"
              >
                Reset
              </button>
              <button
                onClick={() => setIsMobileFiltersOpen(false)}
                className="flex-1 py-3 rounded-full bg-crimson-950 text-gold-100 hover:bg-crimson-900 font-bold uppercase text-center shadow-md"
              >
                Apply
              </button>
            </div>
            
          </div>
        </div>
      )}

      {/* Quick View Modal Hook */}
      <QuickViewModal 
        product={quickViewProduct} 
        onClose={() => setQuickViewProduct(null)} 
      />
    </div>
  );
};
