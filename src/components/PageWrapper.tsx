import { motion } from 'motion/react';
import { ReactNode, useEffect } from 'react';

export default function PageWrapper({ children, className = "" }: { children: ReactNode, className?: string }) {
  useEffect(() => {
    // Only scroll to top if we aren't already there to prevent visual jumps
    if (window.scrollY > 10) {
      window.scrollTo(0, 0);
    }
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className={`w-full ${className}`}
    >
      {children}
    </motion.div>
  );
}
