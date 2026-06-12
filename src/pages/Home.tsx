import React, { useState, useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import { ProductCard } from '../components/ProductCard';
import { QuickViewModal } from '../components/QuickViewModal';
import type { Product } from '../data/products';
import { Sparkles, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

const HERO_SLIDES = [
  {
    image: 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=1600&auto=format&fit=crop&q=80',
    title: 'The Royal Kundan Collection',
    subtitle: 'Crafted for modern queens, inspired by Mughal heritage.',
    tagline: 'FEEL ROYAL • ETHNIVAA WEDDINGS',
    cta: 'Explore Royal Combos',
    category: 'Combo Sets'
  },
  {
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1600&auto=format&fit=crop&q=80',
    title: 'Navratri Oxidized Masterpieces',
    subtitle: 'Rustic silver ornaments detailed with handcarved peacock motifs.',
    tagline: 'FESTIVE RHYTHM • GARBA EXCLUSIVES',
    cta: 'Shop Statement Earrings',
    category: 'Earrings'
  }
];

const COLLECTIONS = [
  {
    name: 'Bangles',
    category: 'Bangles',
    image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&auto=format&fit=crop&q=80',
    tag: 'Bangles & Kada Sets'
  },
  {
    name: 'Earrings',
    category: 'Earrings',
    image: 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=600&auto=format&fit=crop&q=80',
    tag: 'Stunning Chandbalis & Jhumkas'
  },
  {
    name: 'Hair Accessories',
    category: 'Hair Accessories',
    image: 'https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?w=600&auto=format&fit=crop&q=80',
    tag: 'Tikkas & Hair Ornaments'
  },
  {
    name: 'Necklaces',
    category: 'Necklaces',
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&auto=format&fit=crop&q=80',
    tag: 'Royal Chokers & Long Haars'
  },
  {
    name: 'Combo Sets',
    category: 'Combo Sets',
    image: 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=600&auto=format&fit=crop&q=80',
    tag: 'Complete Matching Jewelry Sets'
  }
];

export const Home: React.FC = () => {
  const { products, navigateTo, setSelectedCategoryFilter } = useShop();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Auto slider for hero
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const handlePrevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  };

  const handleNextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % HERO_SLIDES.length);
  };

  const handleCollectionClick = (category: string) => {
    setSelectedCategoryFilter(category);
    navigateTo('shop');
  };

  const bestSellers = products.filter(p => p.isBestSeller).slice(0, 4);
  const newArrivals = products.filter(p => p.isNewArrival).slice(0, 4);

  return (
    <div className="space-y-16 pb-16 animate-fadeIn">
      {/* 1. Hero Banner Section */}
      <section className="relative h-[65vh] sm:h-[80vh] w-full overflow-hidden bg-obsidian-950">
        {HERO_SLIDES.map((slide, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
              idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            {/* Background Image */}
            <div className="absolute inset-0 bg-gradient-to-r from-obsidian-950/90 via-obsidian-950/40 to-transparent z-1"></div>
            <img 
              src={slide.image} 
              alt={slide.title} 
              className="w-full h-full object-cover object-center transform scale-105 transition-transform duration-[6000ms]"
            />
            
            {/* Text Overlay */}
            <div className="absolute inset-0 z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center text-white h-full space-y-6">
              <span className="text-gold-400 text-xs sm:text-sm font-bold tracking-[0.4em] font-sans flex items-center gap-2">
                <Sparkles size={16} className="text-gold-400" />
                {slide.tagline}
              </span>
              
              <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-extrabold max-w-2xl leading-tight">
                {slide.title}
              </h1>
              
              <p className="font-sans text-sm sm:text-lg text-ivory-300 max-w-lg font-light">
                {slide.subtitle}
              </p>
              
              <div className="pt-4">
                <button
                  onClick={() => handleCollectionClick(slide.category)}
                  className="bg-gold-400 hover:bg-gold-500 text-crimson-950 font-bold uppercase tracking-wider text-xs px-8 py-3.5 rounded-full transition-all duration-300 shadow-gold hover:shadow-gold-lg flex items-center gap-2 group"
                >
                  <span>{slide.cta}</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1.5 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Hero Slider Controls */}
        <button
          onClick={handlePrevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-3 rounded-full border border-white/20 bg-black/30 hover:bg-white/10 text-white transition-colors"
          aria-label="Previous slide"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={handleNextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-3 rounded-full border border-white/20 bg-black/30 hover:bg-white/10 text-white transition-colors"
          aria-label="Next slide"
        >
          <ChevronRight size={20} />
        </button>

        {/* Slide Indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2.5">
          {HERO_SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                idx === currentSlide ? 'bg-gold-400 w-6' : 'bg-white/40'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            ></button>
          ))}
        </div>
      </section>

      {/* 2. Featured Collections Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2 mb-10">
          <span className="text-[10px] tracking-[0.3em] uppercase text-gold-600 font-bold font-sans">
            Heritage Selections
          </span>
          <h2 className="font-serif text-3xl font-extrabold text-crimson-950">
            Featured Collections
          </h2>
          <div className="w-16 h-0.5 bg-gold-400 mx-auto mt-2"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {COLLECTIONS.map((col, idx) => (
            <div
              key={idx}
              onClick={() => handleCollectionClick(col.category)}
              className="group relative h-80 rounded-2xl overflow-hidden cursor-pointer border border-gold-200/50 shadow-gold shadow-sm hover:shadow-gold-md transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-crimson-950/90 via-crimson-950/20 to-transparent z-10 transition-colors duration-300 group-hover:from-crimson-950"></div>
              <img
                src={col.image}
                alt={col.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              
              <div className="absolute inset-0 z-20 p-6 flex flex-col justify-end text-white">
                <span className="text-[9px] uppercase tracking-[0.2em] text-gold-300 font-semibold mb-1 block">
                  {col.tag}
                </span>
                <h3 className="font-serif text-lg font-bold group-hover:text-gold-300 transition-colors">
                  {col.name}
                </h3>
                <span className="mt-2 text-xs font-semibold text-gold-400 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                  <span>View Treasures</span>
                  <ArrowRight size={12} />
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
