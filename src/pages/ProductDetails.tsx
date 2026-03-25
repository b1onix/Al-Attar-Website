import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStore } from '../store';
import { supabase } from '../lib/supabase';
import { motion, useScroll, useTransform } from 'motion/react';
import { ArrowLeft, Plus, Minus } from 'lucide-react';
import PageWrapper from '../components/PageWrapper';
import SplitText from '../components/SplitText';
import MagneticButton from '../components/MagneticButton';

interface Product {
  id: string;
  name: string;
  description: string;
  notes: string;
  price: number;
  imageUrl: string;
  profile: string;
  intensity: string;
  occasion: string;
}

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const { addToCart, toggleCart } = useStore();
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '15%']);

  useEffect(() => {
    async function fetchProduct() {
      if (!id) return;
      
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();
          
        if (error) throw error;
        
        if (data) {
          setProduct({
            id: data.id,
            name: data.name,
            description: data.description || '',
            price: data.price,
            imageUrl: data.image_url && data.image_url.startsWith('http') ? data.image_url : `https://picsum.photos/seed/${data.id}/800/800`,
            profile: data.category || 'Attar',
            notes: data.notes || 'Sandalwood, Rose, Musk',
            intensity: data.intensity || 'Srednje',
            occasion: data.occasion || 'Svaki dan',
            stock: data.stock !== undefined ? data.stock : 10
          });
        }
      } catch (error) {
        console.error('Error fetching product from Supabase:', error);
      }
    }

    fetchProduct();
  }, [id]);

  if (!product) return (
    <div className="min-h-screen flex items-center justify-center bg-bg">
      <div className="w-8 h-8 border-t-2 border-accent rounded-full animate-spin"></div>
    </div>
  );

  const handleAddToCart = () => {
    if (product.stock <= 0) return;
    addToCart({ ...product, quantity });
    toggleCart();
  };

  const isOutOfStock = product.stock <= 0;

  const atmosphereCopy =
    product.profile === 'Oud'
      ? 'Tamna dubina, dim i luksuzna toplina.'
      : product.profile === 'Mošus'
        ? 'Čist, svilenkast i precizno suzdržan karakter.'
        : 'Baršunasta tekstura sa snažnim elegantnim tragom.';

  return (
    <PageWrapper>
      <div className="min-h-screen bg-bg">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Left Column - Sticky Image */}
          <div className="relative h-[65vh] lg:h-screen lg:sticky lg:top-0 overflow-hidden bg-black">
            <motion.div
              style={{ y, scale: 1.05 }}
              className="absolute inset-0 w-full h-full"
            >
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover opacity-80"
                referrerPolicy="no-referrer"
              />
            </motion.div>
            
            {/* Elegant Gradients */}
            <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/20 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-bg/10 lg:to-bg" />
            
            <div className="absolute top-24 left-6 lg:left-12 z-20">
               <Link to="/shop" className="inline-flex items-center text-[10px] uppercase tracking-[0.24em] text-white/60 hover:text-accent transition-colors mix-blend-difference">
                 <ArrowLeft size={16} className="mr-3" /> Nazad u butik
               </Link>
            </div>

            <div className="absolute bottom-10 left-6 right-6 lg:bottom-16 lg:left-12 lg:right-12 z-20">
              <div className="max-w-md">
                <p className="text-[9px] uppercase tracking-[0.3em] text-accent mb-4">Atmosfera</p>
                <p className="font-display text-3xl lg:text-4xl leading-[1.1] text-white/90">{atmosphereCopy}</p>
              </div>
            </div>
          </div>

          {/* Right Column - Product Details */}
          <div className="flex flex-col justify-center px-6 py-16 lg:px-20 lg:py-32 xl:px-28 min-h-screen">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="max-w-xl w-full mx-auto lg:mx-0"
            >
              <div className="mb-12">
                <p className="text-accent uppercase tracking-[0.35em] text-[10px] mb-6">{product.profile}</p>
                <SplitText text={product.name} className="font-display text-6xl lg:text-[5.5rem] leading-[0.9] mb-6 justify-start" delay={0.05} />
                <p className="text-2xl font-light text-white/70">{product.price.toFixed(2)} KM</p>
              </div>

              <div className="w-full h-px bg-white/10 mb-12" />

              <p className="text-lg text-white/60 leading-relaxed font-light mb-16">
                {product.description}
              </p>

              <div className="space-y-6 mb-16">
                {[
                  { label: 'Mirisne note', value: product.notes },
                  { label: 'Intenzitet', value: product.intensity },
                  { label: 'Prilika', value: product.occasion },
                ].map((item) => (
                  <div key={item.label} className="flex flex-col sm:flex-row sm:items-baseline justify-between border-b border-white/10 pb-6 group">
                    <span className="text-[10px] uppercase tracking-[0.25em] text-white/40 mb-2 sm:mb-0 w-1/3">{item.label}</span>
                    <span className="text-sm text-white/80 w-2/3 sm:text-right leading-relaxed group-hover:text-white transition-colors">{item.value}</span>
                  </div>
                ))}
              </div>

              <div className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-8 backdrop-blur-sm">
                <div className="flex justify-between items-center mb-8">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-accent">Ritual kupovine</p>
                  {isOutOfStock && (
                    <span className="text-[10px] uppercase tracking-[0.3em] text-red-400 font-bold">Rasprodano</span>
                  )}
                </div>
                
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className={`flex items-center justify-between rounded-full border border-white/10 bg-black/40 px-4 py-3 w-full sm:w-auto min-w-[140px] ${isOutOfStock ? 'opacity-50 pointer-events-none' : ''}`}>
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={isOutOfStock} className="p-2 text-white/50 hover:text-accent transition-colors disabled:opacity-50">
                      <Minus size={14} />
                    </button>
                    <span className="text-sm uppercase tracking-[0.2em] text-white/90 font-medium">{quantity.toString().padStart(2, '0')}</span>
                    <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} disabled={isOutOfStock || quantity >= product.stock} className="p-2 text-white/50 hover:text-accent transition-colors disabled:opacity-50">
                      <Plus size={14} />
                    </button>
                  </div>

                  <MagneticButton className="w-full sm:flex-1">
                    <button
                      onClick={handleAddToCart}
                      disabled={isOutOfStock}
                      className={`w-full rounded-full py-4 text-[11px] font-bold uppercase tracking-[0.25em] transition-all ${
                        isOutOfStock 
                          ? 'bg-white/5 text-white/30 cursor-not-allowed' 
                          : 'bg-accent text-bg hover:bg-white hover:text-bg'
                      }`}
                    >
                      {isOutOfStock ? 'Trenutno nedostupno' : 'Dodaj u korpu'}
                    </button>
                  </MagneticButton>
                </div>
                {product.stock > 0 && product.stock <= 5 && (
                  <p className="text-center text-[10px] uppercase tracking-widest text-accent mt-4 opacity-70">
                    Samo još {product.stock} na stanju
                  </p>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
