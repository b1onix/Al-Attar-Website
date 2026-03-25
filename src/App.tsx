/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import React, { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import CartDrawer from './components/CartDrawer';
import Footer from './components/Footer';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetails from './pages/ProductDetails';
import About from './pages/About';
import Checkout from './pages/Checkout';
import Admin from './pages/Admin';
import Loader from './components/Loader';
import Contact from './pages/Contact';

function AnimatedRoutes() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <AnimatePresence mode="wait">
      <motion.div key={location.pathname} className="w-full h-full">
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/checkout" element={<Checkout />} />
        </Routes>
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
          <Route path="/admin/*" element={<Admin />} />
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
