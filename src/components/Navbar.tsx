import { Link } from 'react-router-dom';
import { ShoppingBag, Menu, X } from 'lucide-react';
import { useStore } from '../store';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import MagneticButton from './MagneticButton';

export default function Navbar() {
  const { cart, toggleCart } = useStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const cartItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed w-full z-40 transition-all duration-500 ${scrolled ? 'glass py-3' : 'bg-transparent py-[18px]'}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <MagneticButton>
              <button onClick={() => setIsMobileMenuOpen(true)} className="text-text hover:text-accent transition-colors p-1.5">
                <Menu size={22} />
              </button>
            </MagneticButton>
          </div>

          {/* Logo */}
          <div className="flex-shrink-0 flex items-center justify-center md:justify-start flex-1 md:flex-none">
            <Link to="/" className="font-display font-medium text-[1.7rem] tracking-[0.08em] uppercase text-text hover:text-accent transition-colors duration-300">
              Al-Attar
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/shop" className="text-[11px] uppercase tracking-[0.26em] text-text/75 hover:text-accent transition-colors duration-300">Shop</Link>
            <Link to="/about" className="text-[11px] uppercase tracking-[0.26em] text-text/75 hover:text-accent transition-colors duration-300">O nama</Link>
            <Link to="/contact" className="text-[11px] uppercase tracking-[0.26em] text-text/75 hover:text-accent transition-colors duration-300">Kontakt</Link>
          </div>

          {/* Cart Icon */}
          <div className="flex items-center">
            <MagneticButton>
              <button onClick={toggleCart} className="relative p-1.5 text-text hover:text-accent transition-colors duration-300">
                <ShoppingBag size={20} strokeWidth={1.5} />
                {cartItemsCount > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-bg bg-accent rounded-full">
                    {cartItemsCount}
                  </span>
                )}
              </button>
            </MagneticButton>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, backdropFilter: 'blur(20px)' }}
            exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-50 bg-bg/95 flex flex-col"
          >
            <div className="flex justify-between items-center px-5 py-4 border-b border-white/5">
              <span className="font-display font-medium text-xl tracking-[0.12em] uppercase text-accent">Al-Attar</span>
              <MagneticButton>
                <button onClick={() => setIsMobileMenuOpen(false)} className="text-text hover:text-accent transition-colors p-1.5">
                  <X size={28} strokeWidth={1.5} />
                </button>
              </MagneticButton>
            </div>
            <div className="flex flex-col items-center justify-center flex-1 space-y-8">
              <Link onClick={() => setIsMobileMenuOpen(false)} to="/" className="text-3xl font-display uppercase tracking-[0.14em] hover:text-accent transition-colors">Početna</Link>
              <Link onClick={() => setIsMobileMenuOpen(false)} to="/shop" className="text-3xl font-display uppercase tracking-[0.14em] hover:text-accent transition-colors">Shop</Link>
              <Link onClick={() => setIsMobileMenuOpen(false)} to="/about" className="text-3xl font-display uppercase tracking-[0.14em] hover:text-accent transition-colors">O nama</Link>
              <Link onClick={() => setIsMobileMenuOpen(false)} to="/contact" className="text-3xl font-display uppercase tracking-[0.14em] hover:text-accent transition-colors">Kontakt</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
