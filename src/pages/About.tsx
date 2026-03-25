import { motion, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';
import PageWrapper from '../components/PageWrapper';
import SplitText from '../components/SplitText';

export default function About() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end']
  });

  const y1 = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
  const y2 = useTransform(scrollYProgress, [0, 1], ['0%', '-20%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.5]);

  return (
    <PageWrapper>
      <div ref={containerRef} className="bg-bg min-h-screen relative overflow-hidden">
        
        {/* Hero Section */}
        <section className="relative min-h-[90vh] flex items-center justify-center px-6 pt-32 pb-20">
          <motion.div style={{ y: y1, opacity }} className="absolute inset-0 pointer-events-none">
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(197,160,89,0.08),transparent_50%)]" />
          </motion.div>
          
          <div className="relative z-10 max-w-4xl mx-auto text-center">
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-[10px] uppercase tracking-[0.4em] text-accent mb-8"
            >
              Naša Priča
            </motion.p>
            
            <SplitText 
              text="Umjetnost" 
              className="font-display text-6xl md:text-8xl lg:text-[8rem] leading-[0.9] mb-4 justify-center" 
              delay={0.1}
            />
            <SplitText 
              text="Parfimerije" 
              className="font-display text-6xl md:text-8xl lg:text-[8rem] leading-[0.9] mb-12 justify-center text-white/50" 
              delay={0.3}
            />
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-lg md:text-xl font-light text-white/60 leading-relaxed max-w-2xl mx-auto"
            >
              U srcu Tuzle, gdje se susreću istok i zapad, rođena je ideja o parfimeriji koja ne prati prolazne trendove, već stvara trajne uspomene kroz najfinije esencije.
            </motion.p>
          </div>
        </section>

        {/* Story Sections */}
        <section className="px-6 py-32 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center mb-40">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="relative aspect-[4/5] rounded-[2rem] overflow-hidden bg-white/5"
            >
              <img
                src="https://picsum.photos/seed/atelier-perfume/1000/1200?grayscale"
                alt="Proces kreacije"
                className="w-full h-full object-cover opacity-80"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-bg via-transparent to-transparent opacity-80" />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1, delay: 0.2 }}
              className="max-w-xl"
            >
              <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 mb-6">01 / Filozofija</p>
              <h2 className="font-display text-4xl md:text-5xl leading-tight mb-8">Spori proces, apsolutna posvećenost detaljima.</h2>
              <p className="text-base text-white/60 leading-relaxed font-light mb-6">
                Svaki Al-Attar miris je rezultat stotina sati pažljivog miješanja, maceracije i sazrijevanja. 
                Ne vjerujemo u masovnu produkciju. Vjerujemo u strpljenje potrebno da bi sirovine razvile svoj puni potencijal.
              </p>
              <p className="text-base text-white/60 leading-relaxed font-light">
                Koristimo isključivo najfinije sirovine iz cijelog svijeta - od rijetkog ouda iz Kambodže, senzualnog mošusa, do najčišće ruže iz Taifa. Naš proces duboko poštuje viševjekovnu tradiciju orijentalne parfumerije.
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1 }}
              className="max-w-xl order-2 lg:order-1"
            >
              <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 mb-6">02 / Estetika</p>
              <h2 className="font-display text-4xl md:text-5xl leading-tight mb-8">Dizajn koji prepušta glavnu riječ mirisu.</h2>
              <p className="text-base text-white/60 leading-relaxed font-light mb-6">
                Vjerujemo u snagu apsolutnog minimalizma. Naše bočice su lišene suvišnih ukrasa, teške i hladne na dodir, dizajnirane kao trezori koji čuvaju dragocjenu esenciju unutar njih.
              </p>
              <p className="text-base text-white/60 leading-relaxed font-light">
                Fokus je isključivo na mirisu - nevidljivom, ali najmoćnijem dodatku koji nosite. Kad zatvorite oči, jedino što ostaje je karakter.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
              className="relative aspect-[4/5] rounded-[2rem] overflow-hidden bg-white/5 order-1 lg:order-2"
            >
              <motion.img
                style={{ y: y2 }}
                src="https://picsum.photos/seed/minimal-bottle/1000/1500?grayscale"
                alt="Minimalizam bočice"
                className="w-full h-[120%] object-cover opacity-80"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-bg via-transparent to-transparent opacity-80" />
            </motion.div>
          </div>
        </section>

        {/* Location Footer */}
        <section className="border-t border-white/5 bg-white/[0.02]">
          <div className="max-w-7xl mx-auto px-6 py-24 md:py-32 text-center">
            <p className="text-[10px] uppercase tracking-[0.4em] text-accent mb-6">Sjedište</p>
            <h2 className="font-display text-3xl md:text-5xl text-white/90 mb-4">Tuzla, Bosna i Hercegovina</h2>
            <p className="text-white/40 font-light max-w-md mx-auto">
              Naš atelje se nalazi u srcu Tuzle, gdje pažljivo dizajniramo, miješamo i pakujemo svaki miris prije nego što krene na put do vas.
            </p>
          </div>
        </section>
      </div>
    </PageWrapper>
  );
}
