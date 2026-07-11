import React, { useState, useMemo } from 'react';
import { useShop } from '../context/ShopContext';
import { ProductCard } from '../components/ProductCard';
import { QuickViewModal } from '../components/QuickViewModal';
import type { Product } from '../data/products';
import { ArrowRight } from 'lucide-react';
import { SEO } from '../components/SEO';

const COLLECTIONS = [
  {
    name: 'All Collections',
    category: null,
    image: 'https://res.cloudinary.com/dujdgboyb/image/upload/v1781512978/ChatGPT_Image_Jun_15_2026_11_41_57_AM_hff2td.png',
    tag: 'Explore All Jewels'
  }
];

export const Home: React.FC = () => {
  const { products, navigateTo, setSpecialFilter } = useShop();
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  const handleCollectionClick = () => {
    setSpecialFilter(null);
    navigateTo('shop');
  };

  const bestSellers = products.filter(p => p.isBestSeller).slice(0, 4);
  const newArrivals = products.filter(p => p.isNewArrival).slice(0, 4);

  const homeSchema = useMemo(() => ({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': 'https://ethnivaa.com/#website',
        'url': 'https://ethnivaa.com',
        'name': 'Ethnivaa',
        'description': 'Premium traditional Indian jewellery brand. Explore Navratri collection, Kundan, Temple jewellery, and antique oxidized ornaments designed with modern elegance.',
        'potentialAction': {
          '@type': 'SearchAction',
          'target': 'https://ethnivaa.com/shop?search={search_term_string}',
          'query-input': 'required name=search_term_string'
        }
      },
      {
        '@type': 'Organization',
        '@id': 'https://ethnivaa.com/#organization',
        'name': 'Ethnivaa',
        'url': 'https://ethnivaa.com',
        'logo': 'https://ethnivaa.com/logo.jpg',
        'sameAs': [
          'https://instagram.com/ethnivaa',
          'https://facebook.com/ethnivaa'
        ]
      }
    ]
  }), []);

  return (
    <div className="space-y-16 pt-8 pb-16 animate-fadeIn">
      <SEO 
        title="Ethnivaa | Traditional Indian Jewellery | Festive Luxury"
        description="Discover Ethnivaa, a premium traditional Indian jewellery brand. Explore our Navratri collection, Kundan, Temple jewellery, and antique oxidized ornaments."
        schema={homeSchema}
      />
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
              onClick={handleCollectionClick}
              className="group relative h-80 sm:h-96 md:h-[28rem] rounded-2xl overflow-hidden cursor-pointer border border-gold-200/50 shadow-gold shadow-sm hover:shadow-gold-md transition-all duration-300"
            >
              <div className="absolute inset-0 bg-obsidian-950/40 z-10 transition-colors duration-300 group-hover:bg-obsidian-950/60"></div>
              <img
                src={col.image}
                alt={col.name}
                loading="eager"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
              />

              <div className="absolute inset-0 z-20 p-6 sm:p-10 flex flex-col justify-center text-center items-center">
                <span className="text-[10px] sm:text-xs uppercase tracking-[0.4em] text-gold-300 font-bold mb-3 block drop-shadow-md">
                  {col.tag}
                </span>
                <h3 className="font-serif text-4xl sm:text-7xl font-extrabold text-white drop-shadow-2xl tracking-wider">
                  {col.name}
                </h3>
                <span className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-full border border-gold-300 bg-crimson-950/80 text-xs font-bold uppercase tracking-widest text-gold-100 shadow-lg backdrop-blur-md group-hover:bg-gold-500 group-hover:text-crimson-950 group-hover:border-gold-500 transition-all duration-300 active:scale-95">
                  <span>View All Treasures</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
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
              setSpecialFilter('best-sellers');
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
              setSpecialFilter('new-arrivals');
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
