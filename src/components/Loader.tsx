import { motion } from 'motion/react';
import React, { useEffect, useState } from 'react';

const Loader: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Only lock scroll briefly while loading
    document.body.style.overflow = 'hidden';
    
    // Give enough time for background images and data to fetch (~2 seconds)
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            document.body.style.overflow = 'auto'; // Reset overflow explicitly
            onComplete();
          }, 300); // Brief pause at 100%
          return 100;
        }
        return prev + Math.floor(Math.random() * 8) + 5; // Steady increment
      });
    }, 120); // 120ms * ~15 steps = ~1.8 seconds

    return () => {
      clearInterval(interval);
      document.body.style.overflow = 'auto';
    };
  }, [onComplete]);

  return (
    <motion.div
      initial={{ y: 0 }}
      exit={{ opacity: 0, transition: { duration: 0.3 } }} // Use simpler opacity fade instead of heavy slide
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-bg text-text"
    >
      <div className="relative w-full max-w-md px-8">
        <div className="flex justify-between items-end mb-4">
          <span className="font-display text-4xl uppercase tracking-tighter">Al-Attar</span>
          <span className="font-mono text-sm">{progress}%</span>
        </div>
        <div className="h-[1px] w-full bg-white/20 relative overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-accent transition-all duration-75"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default Loader;
