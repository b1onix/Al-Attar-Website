import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, ShoppingBag } from 'lucide-react';
import PageWrapper from '../components/PageWrapper';
import { useStore, Product } from '../store';
import { supabase } from '../lib/supabase';

export default function Shop() {
  const [products, setProducts] = useState<Product[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('Sve');
  const [loading, setLoading] = useState(true);
  const { addToCart, toggleCart } = useStore();

  useEffect(() => {
    async function fetchProducts() {
      try {
        const { data, error } = await supabase.from('products').select('*');
        if (error) throw error;
        
        // Map Supabase schema to our frontend Product interface
        const formattedProducts: Product[] = (data || []).map(p => ({
          id: p.id,
          name: p.name,
          description: p.description || '',
          price: p.price,
          imageUrl: p.image_url && p.image_url.startsWith('http') ? p.image_url : `https://picsum.photos/seed/${p.id}/800/800`,
          profile: p.category || 'Attar',
          // Fallback values for properties that might not be in our DB yet
          notes: p.notes || 'Sandalwood, Rose, Musk',
          intensity: p.intensity || 'Srednje',
          occasion: p.occasion || 'Svaki dan',
          stock: p.stock !== undefined ? p.stock : 10
        }));
        
        setProducts(formattedProducts);
      } catch (error) {
        console.error('Error fetching products from Supabase:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  const profiles = ['Sve', ...new Set(products.map(p => p.profile))];
  const filteredProducts = activeFilter === 'Sve' ? products : products.filter(p => p.profile === activeFilter);
  const featuredProduct = filteredProducts[0];

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    toggleCart();
  };

  return (
    <PageWrapper>
      <div className="min-h-screen bg-bg pt-28 pb-20">
        <div className="px-4 md:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.section
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="relative overflow-hidden rounded-[2rem] border border-white/8 bg-white/[0.03] px-6 py-10 md:px-12 md:py-16 mb-10"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(197,160,89,0.14),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.04),transparent_30%)]" />
              <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-10">
                <div className="max-w-2xl">
                  <span className="inline-flex items-center gap-3 uppercase tracking-[0.32em] text-[10px] text-accent/80 mb-6">
                    <span className="h-px w-10 bg-accent/50" />
                    Kolekcija
                  </span>
                  <h1 className="font-display text-4xl md:text-5xl lg:text-6xl leading-[1.1] mb-6">
                    Naši Mirisi
                  </h1>
                  <p className="text-sm md:text-base leading-relaxed text-text/60 font-light max-w-lg">
                    Istražite našu pažljivo odabranu kolekciju premium parfema, 
                    dizajniranih da ostave neizbrisiv trag.
                  </p>
                </div>

                <div className="flex flex-wrap gap-4 md:justify-end">
                  <div className="rounded-2xl border border-white/8 bg-black/20 px-6 py-4 backdrop-blur-sm">
                    <p className="text-[9px] uppercase tracking-[0.3em] text-text/40 mb-2">Broj mirisa</p>
                    <p className="font-display text-3xl">{products.length.toString().padStart(2, '0')}</p>
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-black/20 px-6 py-4 backdrop-blur-sm">
                    <p className="text-[9px] uppercase tracking-[0.3em] text-text/40 mb-2">Estetika</p>
                    <p className="font-display text-3xl text-accent">Luxury</p>
                  </div>
                </div>
              </div>
            </motion.section>

            <div className="mb-12 flex flex-col md:flex-row items-center justify-between gap-6 rounded-[1.7rem] border border-white/8 bg-white/[0.02] p-4 md:p-6">
              <div className="flex items-center gap-4 w-full md:w-auto">
                <p className="hidden md:block text-[10px] uppercase tracking-[0.3em] text-text/50">Filter</p>
                <div className="flex flex-wrap gap-2 w-full md:w-auto">
                  {profiles.map((profile) => (
                    <button
                      key={profile}
                      onClick={() => setActiveFilter(profile)}
                      className={`flex-1 md:flex-none uppercase tracking-[0.24em] text-[10px] px-5 py-2.5 rounded-full border transition-all duration-300 ${
                        activeFilter === profile
                          ? 'bg-accent text-bg border-accent shadow-[0_0_20px_rgba(197,160,89,0.2)]'
                          : 'bg-transparent text-text/70 border-white/10 hover:border-white/30 hover:text-text'
                      }`}
                    >
                      {profile}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="hidden md:flex items-center gap-3">
                <span className="text-[10px] uppercase tracking-[0.2em] text-text/40">Prikaz</span>
                <div className="flex gap-1">
                   <div className="w-2 h-2 rounded-full bg-accent/80"></div>
                   <div className="w-2 h-2 rounded-full bg-white/20"></div>
                   <div className="w-2 h-2 rounded-full bg-white/20"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="w-8 h-8 border-t-2 border-accent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="px-4 md:px-8">
            <div className="max-w-7xl mx-auto">
              <motion.div layout className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                  {filteredProducts.map((product, index) => (
                    <motion.div
                      layout
                      key={product.id}
                      initial={{ opacity: 0, scale: 0.94, y: 32 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.94, y: 32 }}
                      transition={{ duration: 0.6, type: 'spring', bounce: 0.22 }}
                      className="group h-full"
                    >
                      <Link
                        to={`/product/${product.id}`}
                        className="relative flex h-full flex-col overflow-hidden rounded-[1.8rem] border border-white/8 bg-white/[0.03] p-3 transition-transform duration-500 hover:-translate-y-1"
                      >
                        <div className="flex items-center justify-between px-2 pt-1 pb-3">
                          <span className="text-[10px] uppercase tracking-[0.24em] text-text/45">{product.profile}</span>
                          <span className="font-display text-3xl text-white/16">{String(index + 1).padStart(2, '0')}</span>
                        </div>

                        <div className="relative aspect-[4/5] overflow-hidden rounded-[1.35rem] bg-surface">
                          <motion.img
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
                            src={product.imageUrl}
                            alt={product.name}
                            loading="lazy"
                            className={`w-full h-full object-cover ${product.stock <= 0 ? 'opacity-40 grayscale' : 'opacity-82 group-hover:opacity-100'}`}
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,5,5,0.04),rgba(5,5,5,0.28)_48%,rgba(5,5,5,0.95))]" />
                          
                          {product.stock <= 0 && (
                            <div className="absolute inset-0 flex items-center justify-center backdrop-blur-[2px]">
                              <span className="bg-red-500/80 text-white text-xs uppercase tracking-[0.3em] px-4 py-2 rounded-full font-bold shadow-lg">
                                Rasprodano
                              </span>
                            </div>
                          )}

                          <div className="absolute inset-x-0 bottom-0 p-4">
                            <div className="rounded-[1.15rem] border border-white/10 bg-black/28 p-4 backdrop-blur-md">
                              <div className="flex items-end justify-between gap-3">
                                <div>
                                  <h3 className="font-display text-[1.9rem] leading-none text-white mb-2">{product.name}</h3>
                                  <p className="text-[11px] uppercase tracking-[0.22em] text-text/56">{product.profile}</p>
                                </div>
                                <p className="font-medium text-sm text-accent whitespace-nowrap">{product.price.toFixed(2)} KM</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-1 flex-col justify-between px-2 pt-4 pb-2">
                          <div className="grid grid-cols-2 gap-3 text-[11px] uppercase tracking-[0.2em] text-text/42 mb-5">
                            <span>{product.intensity}</span>
                            <span className="text-right">{product.occasion}</span>
                          </div>

                          <div className="flex items-center justify-between gap-4">
                            <span className="inline-flex items-center gap-2 uppercase tracking-[0.22em] text-[11px] text-text/78 group-hover:text-accent transition-colors">
                              Istraži miris <ArrowRight size={15} />
                            </span>
                            <button
                              onClick={(e) => handleAddToCart(e, product)}
                              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/12 bg-white/[0.04] text-text hover:border-accent/40 hover:text-accent transition-colors"
                            >
                              <ShoppingBag size={16} />
                            </button>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
