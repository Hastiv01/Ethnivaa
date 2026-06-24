import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { ProductCard } from '../components/ProductCard';
import { QuickViewModal } from '../components/QuickViewModal';
import type { Product } from '../data/products';
import { ArrowRight } from 'lucide-react';

const COLLECTIONS = [
  {
    name: 'All Collections',
    category: null,
    image: '/placeholder.png',
    tag: 'Explore All Jewels'
  }
];

export const Home: React.FC = () => {
  const { products, navigateTo, setSelectedCategoryFilter } = useShop();
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  const handleCollectionClick = (category: string | null) => {
    setSelectedCategoryFilter(category);
    navigateTo('shop');
  };

  const bestSellers = products.filter(p => p.isBestSeller).slice(0, 4);
  const newArrivals = products.filter(p => p.isNewArrival).slice(0, 4);

  return (
    <div className="space-y-16 pt-8 pb-16 animate-fadeIn">
      {/* 1. All Collections Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2 mb-10">
          <span className="text-[10px] tracking-[0.3em] uppercase text-gold-600 font-bold font-sans">
            Heritage Selections
          </span>
          <h2 className="font-serif text-3xl font-extrabold text-crimson-950">
            Our Collections
          </h2>
          <div className="w-16 h-0.5 bg-gold-400 mx-auto mt-2"></div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {COLLECTIONS.map((col, idx) => (
            <div
              key={idx}
              onClick={() => handleCollectionClick(col.category)}
              className="group relative h-80 sm:h-96 md:h-[28rem] rounded-2xl overflow-hidden cursor-pointer border border-gold-200/50 shadow-gold shadow-sm hover:shadow-gold-md transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-crimson-950/90 via-crimson-950/20 to-transparent z-10 transition-colors duration-300 group-hover:from-crimson-950"></div>
              <img
                src={col.image}
                alt={col.name}
                loading="eager"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />

              <div className="absolute inset-0 z-20 p-6 sm:p-10 flex flex-col justify-end text-white text-center items-center">
                <span className="text-xs sm:text-sm uppercase tracking-[0.3em] text-gold-300 font-semibold mb-2 block">
                  {col.tag}
                </span>
                <h3 className="font-serif text-2xl sm:text-5xl font-bold group-hover:text-gold-300 transition-colors">
                  {col.name}
                </h3>
                <span className="mt-4 text-sm sm:text-base font-semibold text-gold-400 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                  <span>View All Treasures</span>
                  <ArrowRight size={18} />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Best Sellers Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-10">
          <div className="text-center sm:text-left space-y-1">
            <span className="text-[10px] tracking-[0.3em] uppercase text-gold-600 font-bold font-sans">
              Timeless Favorites
            </span>
            <h2 className="font-serif text-3xl font-extrabold text-crimson-950">
              Our Best Sellers
            </h2>
          </div>
          <button
            onClick={() => {
              setSelectedCategoryFilter(null);
              navigateTo('shop');
            }}
            className="text-xs uppercase tracking-wider font-bold text-crimson-900 hover:text-gold-600 flex items-center gap-1.5 transition-colors border-b border-crimson-950 pb-1"
          >
            <span>View All Products</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {bestSellers.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onQuickView={(p) => setQuickViewProduct(p)}
            />
          ))}
        </div>
      </section>

      {/* 4. New Arrivals Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-10">
          <div className="text-center sm:text-left space-y-1">
            <span className="text-[10px] tracking-[0.3em] uppercase text-gold-600 font-bold font-sans">
              Just Unveiled
            </span>
            <h2 className="font-serif text-3xl font-extrabold text-crimson-950">
              New Arrivals
            </h2>
          </div>
          <button
            onClick={() => {
              setSelectedCategoryFilter(null);
              navigateTo('shop');
            }}
            className="text-xs uppercase tracking-wider font-bold text-crimson-900 hover:text-gold-600 flex items-center gap-1.5 transition-colors border-b border-crimson-950 pb-1"
          >
            <span>View All Products</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {newArrivals.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onQuickView={(p) => setQuickViewProduct(p)}
            />
          ))}
        </div>
      </section>

      {/* Quick View Modal Hook */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
};
