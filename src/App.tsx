/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import React, { useEffect, useState, Suspense, lazy } from 'react';
import Navbar from './components/Navbar';
import CartDrawer from './components/CartDrawer';
import Footer from './components/Footer';
import Loader from './components/Loader';

// Lazy load pages for code splitting
const Home = lazy(() => import('./pages/Home'));
const Shop = lazy(() => import('./pages/Shop'));
const ProductDetails = lazy(() => import('./pages/ProductDetails'));
const About = lazy(() => import('./pages/About'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Admin = lazy(() => import('./pages/Admin'));
const Contact = lazy(() => import('./pages/Contact'));

function AnimatedRoutes() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <AnimatePresence mode="wait">
      <motion.div key={location.pathname} className="w-full h-full">
        <Suspense fallback={<div className="min-h-screen bg-bg" />}>
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/checkout" element={<Checkout />} />
          </Routes>
        </Suspense>
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  const [loading, setLoading] = useState(true);

  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-bg text-text font-sans selection:bg-accent selection:text-bg">
        <AnimatePresence>
          {loading && <Loader key="loader" onComplete={() => setLoading(false)} />}
        </AnimatePresence>
        
        <Routes>
          <Route path="/admin/*" element={
            <Suspense fallback={<div className="min-h-screen bg-[#050505]" />}>
              <Admin />
            </Suspense>
          } />
          <Route path="*" element={
            <>
              <Navbar />
              <CartDrawer />
              <main className="flex-grow">
                <AnimatedRoutes />
              </main>
              <Footer />
            </>
          } />
        </Routes>
      </div>
    </Router>
  );
}
