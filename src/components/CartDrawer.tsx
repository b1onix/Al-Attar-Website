import { useStore } from '../store';
import { X, Plus, Minus, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';

export default function CartDrawer() {
  const { cart, isCartOpen, toggleCart, updateQuantity, removeFromCart } = useStore();
  const navigate = useNavigate();

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleCheckout = () => {
    toggleCart();
    navigate('/checkout');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: 20 },
    show: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleCart}
            className="fixed inset-0 bg-bg/80 backdrop-blur-sm z-50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full md:w-[420px] bg-surface shadow-2xl z-50 flex flex-col border-l border-white/5"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
              <h2 className="font-display text-[1.65rem] uppercase tracking-[0.18em] text-accent">Vaša Korpa</h2>
              <button onClick={toggleCart} className="p-1.5 text-text/60 hover:text-accent transition-colors">
                <X size={22} strokeWidth={1.5} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 custom-scrollbar">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-50">
                  <p className="text-lg font-display italic">Vaša korpa je prazna.</p>
                  <button onClick={toggleCart} className="uppercase text-xs tracking-[0.2em] border-b border-text/30 pb-1 hover:text-accent hover:border-accent transition-colors">
                    Nastavite kupovinu
                  </button>
                </div>
              ) : (
                <motion.div 
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                  className="space-y-6"
                >
                  {cart.map((item) => (
                    <motion.div key={item.id} variants={itemVariants} className="flex gap-4 group">
                      <div className="w-20 h-28 bg-bg overflow-hidden border border-white/5 relative rounded-[0.9rem]">
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-700" />
                        <div className="absolute inset-0 bg-gradient-to-t from-bg/50 to-transparent"></div>
                      </div>
                      <div className="flex-1 flex flex-col justify-between py-1">
                        <div>
                          <div className="flex justify-between items-start">
                            <h3 className="font-display text-lg uppercase tracking-[0.08em] text-text/90">{item.name}</h3>
                            <button onClick={() => removeFromCart(item.id)} className="text-text/40 hover:text-red-400 transition-colors">
                              <Trash2 size={16} strokeWidth={1.5} />
                            </button>
                          </div>
                          <p className="text-[13px] text-accent mt-1">{item.price.toFixed(2)} KM</p>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center border border-white/10 rounded-full px-2 py-1">
                            <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1 hover:text-accent transition-colors">
                              <Minus size={14} />
                            </button>
                            <span className="w-7 text-center text-sm font-medium">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 hover:text-accent transition-colors">
                              <Plus size={14} />
                            </button>
                          </div>
                          <p className="font-medium text-text/90">{(item.price * item.quantity).toFixed(2)} KM</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="px-5 py-4 border-t border-white/5 bg-surface">
                <div className="flex justify-between items-center mb-4">
                  <span className="uppercase tracking-[0.2em] text-[11px] text-text/60">Ukupno</span>
                  <span className="font-display text-[1.9rem] text-accent">{total.toFixed(2)} KM</span>
                </div>
                <button
                  onClick={handleCheckout}
                  className="w-full bg-accent text-bg py-3 uppercase tracking-[0.22em] text-[11px] font-bold hover:bg-accent-hover transition-colors rounded-full"
                >
                  Završi kupovinu
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
