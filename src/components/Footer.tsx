import { motion } from 'motion/react';
import { ArrowRight, ArrowUpRight, Instagram, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/6 bg-black text-text px-4 sm:px-6 lg:px-8 pt-18 pb-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(197,160,89,0.16),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.05),transparent_22%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent_30%,rgba(255,255,255,0.01))]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="grid gap-8 rounded-[2rem] border border-white/8 bg-white/[0.03] p-6 md:p-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end"
        >
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-3 uppercase tracking-[0.32em] text-[10px] text-accent/80 mb-5">
              <span className="h-px w-10 bg-accent/50" />
              Fragrance house
            </span>
            <h2 className="font-display text-4xl md:text-6xl lg:text-[4.8rem] leading-[0.92]">
              Završetak stranice koji djeluje kao posljednji kadar kampanje.
            </h2>
            <p className="mt-6 max-w-xl text-sm md:text-base leading-7 text-text/62 font-light">
              Al-Attar spaja spor ritam parfumerije, tamnu eleganciju i urednički pristup dizajnu.
              Footer sada radi kao luksuzni outro, a ne kao običan spisak linkova.
            </p>
          </div>

          <div className="grid gap-4 md:justify-self-end md:min-w-[20rem]">
            <Link
              to="/shop"
              className="group inline-flex items-center justify-between rounded-full border border-accent/35 bg-accent/8 px-5 py-4 text-sm text-text hover:border-accent/60 hover:bg-accent/12 transition-all"
            >
              <div>
                <p className="text-[10px] uppercase tracking-[0.28em] text-accent mb-1">Glavna kolekcija</p>
                <p className="font-display text-2xl">Otkrijte butik</p>
              </div>
              <ArrowUpRight size={18} className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-[1.25rem] border border-white/8 bg-white/[0.03] px-4 py-4">
                <p className="text-[10px] uppercase tracking-[0.26em] text-text/42 mb-2">Baza</p>
                <div className="inline-flex items-center gap-2 text-sm text-text/75">
                  <MapPin size={15} className="text-accent" />
                  Tuzla
                </div>
              </div>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="group rounded-[1.25rem] border border-white/8 bg-white/[0.03] px-4 py-4 transition-colors hover:border-accent/30 hover:text-accent"
              >
                <p className="text-[10px] uppercase tracking-[0.26em] text-text/42 mb-2">Pratite</p>
                <div className="inline-flex items-center gap-2 text-sm text-text/75 group-hover:text-accent transition-colors">
                  <Instagram size={15} />
                  Instagram
                </div>
              </a>
            </div>
          </div>
        </motion.div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.65fr_0.65fr_0.85fr]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.05 }}
            className="rounded-[1.6rem] border border-white/8 bg-white/[0.02] p-6 md:p-7"
          >
            <p className="text-[10px] uppercase tracking-[0.3em] text-accent/75 mb-4">Al-Attar</p>
            <p className="font-display text-[2.3rem] leading-[0.94] max-w-sm">
              Mirisni potpisi za one koji vole tihu raskoš.
            </p>
            <p className="mt-5 max-w-sm text-sm leading-7 text-text/58 font-light">
              Ekskluzivna parfimerija posvećena kompozicijama koje ostavljaju prisustvo, ne buku.
            </p>
          </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="rounded-[1.6rem] border border-white/8 bg-white/[0.02] p-6"
        >
          <h4 className="uppercase tracking-[0.24em] text-[11px] mb-5 text-text/40">Istražite</h4>
          <ul className="space-y-4 text-sm font-light">
            <li><Link to="/shop" className="inline-flex items-center gap-2 hover:text-accent transition-colors">Kolekcija <ArrowRight size={14} /></Link></li>
            <li><Link to="/about" className="inline-flex items-center gap-2 hover:text-accent transition-colors">Naše Nasljeđe <ArrowRight size={14} /></Link></li>
            <li><a href="https://instagram.com" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:text-accent transition-colors">Instagram <ArrowRight size={14} /></a></li>
          </ul>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.45 }}
          className="rounded-[1.6rem] border border-white/8 bg-white/[0.02] p-6"
        >
          <h4 className="uppercase tracking-[0.24em] text-[11px] mb-5 text-text/40">Pravila</h4>
          <ul className="space-y-4 text-sm font-light text-text/70">
            <li><Link to="/terms" className="hover:text-accent transition-colors">Uslovi Korištenja</Link></li>
            <li><Link to="/privacy" className="hover:text-accent transition-colors">Politika Privatnosti</Link></li>
            <li><Link to="/shipping" className="hover:text-accent transition-colors">Dostava i Povrat</Link></li>
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.55 }}
          className="rounded-[1.6rem] border border-white/8 bg-white/[0.02] p-6"
        >
          <h4 className="uppercase tracking-[0.24em] text-[11px] mb-5 text-text/40">Kontakt</h4>
          <div className="space-y-4">
            <p className="font-display text-[1.8rem] leading-none">Tuzla</p>
            <p className="text-sm leading-7 text-text/58">Dizajnirano za spor ritam, profinjene note i digitalno iskustvo koje djeluje skupo.</p>
            <a href="mailto:hello@al-attar.ba" className="inline-flex items-center gap-2 text-sm hover:text-accent transition-colors">
              hello@al-attar.ba <ArrowUpRight size={14} />
            </a>
          </div>
        </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.6 }}
          className="mt-8 pt-6 border-t border-white/10 text-[11px] text-text/40 flex flex-col md:flex-row justify-between items-center gap-3"
        >
          <p>&copy; {new Date().getFullYear()} Al-Attar. Sva prava zadržana.</p>
          <p className="uppercase tracking-[0.24em] text-center">Tuzla, Bosna i Hercegovina</p>
        </motion.div>
      </div>
    </footer>
  );
}
