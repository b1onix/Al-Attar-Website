import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const cards = [
  {
    id: 1,
    title: 'Crni Oud',
    subtitle: 'Večernji potpis',
    description: 'Dubok, dimljen i gotovo filmski. Kompozicija koja ostavlja trag bez viška teatralnosti.',
    notes: ['Oud', 'Tamjan', 'Koža'],
    url: 'https://picsum.photos/seed/oud/1200/1400?grayscale',
    link: '/product/1',
    accent: 'Atelier izbor',
  },
  {
    id: 2,
    title: 'Bijeli Mošus',
    subtitle: 'Čistoća sa karakterom',
    description: 'Minimalistički i svilenkast miris za svakodnevni luksuz koji ne djeluje predvidljivo.',
    notes: ['Mošus', 'Ruža'],
    url: 'https://picsum.photos/seed/musk/1000/1200?grayscale',
    link: '/product/2',
    accent: 'Tihi potpis',
  },
  {
    id: 3,
    title: 'Ponoćna Ruža',
    subtitle: 'Baršunasta dramatičnost',
    description: 'Cvjetna kompozicija sa tamnom dubinom koja ostaje elegantna i precizna.',
    notes: ['Damask Ruža', 'Pačuli'],
    url: 'https://picsum.photos/seed/rose/1000/1200?grayscale',
    link: '/product/3',
    accent: 'Noćna edicija',
  },
];

export default function HorizontalScrollCarousel() {
  return (
    <section className="relative px-4 md:px-8 py-[5.5rem] md:py-24 overflow-hidden transform-gpu">
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute left-1/2 top-16 h-64 w-64 -translate-x-1/2 rounded-full bg-accent/15 blur-[60px]"
        />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      <div className="relative max-w-6xl mx-auto">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] items-end mb-8 md:mb-10 will-change-transform">
          <div className="max-w-md">
            <span className="inline-flex items-center gap-3 uppercase tracking-[0.28em] text-[10px] text-accent/80 mb-4">
              <span className="h-px w-8 bg-accent/50" />
              Kolekcija ekskluziva
            </span>
            <h2 className="font-display text-3xl md:text-5xl lg:text-[3.6rem] leading-[0.95]">
              Tri mirisa predstavljena kao luksuzna selekcija, ne kao običan katalog.
            </h2>
          </div>

          <div className="lg:pl-10">
            <p className="text-sm md:text-base leading-7 text-text/62 max-w-xl">
              Umjesto generičnog horizontalnog slidera, ova sekcija sada radi kao urednički raspored:
              jedan hero miris i dva prateća izbora sa jasnim karakterom, boljim proporcijama i mnogo
              jačim vizuelnim identitetom.
            </p>
            <Link
              to="/shop"
              className="group mt-5 inline-flex items-center gap-3 uppercase tracking-[0.24em] text-[11px] text-text/80 hover:text-accent transition-colors"
            >
              Pogledajte cijelu kolekciju
              <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.12fr_0.88fr] lg:grid-rows-2 items-stretch">
          <div className="lg:row-span-2">
            <FeatureCard card={cards[0]} delay={0} variant="primary" />
          </div>
          {cards.slice(1).map((card, index) => (
            <div key={card.id} className="h-full">
              <FeatureCard card={card} delay={0.12 + index * 0.12} variant="secondary" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({
  card,
  delay,
  variant,
}: {
  card: (typeof cards)[number];
  delay: number;
  variant: 'primary' | 'secondary';
}) {
  const isPrimary = variant === 'primary';

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-120px' }}
      transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        to={card.link}
        className={`group relative block h-full overflow-hidden rounded-[1.6rem] border border-white/8 bg-white/[0.03] ${
          isPrimary ? 'min-h-[640px]' : 'min-h-[307px]'
        }`}
      >
        <div
          className="absolute inset-0 scale-[1.02]"
        >
          <div
            style={{
              backgroundImage: `url(${card.url})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
            className="absolute inset-0 transition-transform duration-1000 group-hover:scale-105"
          />
        </div>

        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,5,5,0.08),rgba(5,5,5,0.65)_55%,rgba(5,5,5,0.96))]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(197,160,89,0.18),transparent_35%)] opacity-90" />

        <div className="relative z-10 flex h-full flex-col justify-between p-6 md:p-7">
          <div className="flex items-start justify-between gap-4">
            <span className="rounded-full border border-white/15 bg-black/60 px-3 py-1.5 text-[10px] uppercase tracking-[0.24em] text-text/72">
              {card.accent}
            </span>
            <span className="font-display text-4xl text-white/20">{`0${card.id}`}</span>
          </div>

          <div className="max-w-lg">
            <p className="text-[10px] uppercase tracking-[0.28em] text-accent mb-3">{card.subtitle}</p>
            <h3 className={`font-display leading-[0.94] text-white mb-3 ${isPrimary ? 'text-4xl md:text-5xl' : 'text-3xl'}`}>
              {card.title}
            </h3>
            <p className={`text-text/68 font-light ${isPrimary ? 'text-sm md:text-base leading-7 max-w-md' : 'text-sm leading-6 max-w-sm'}`}>
              {card.description}
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              {card.notes.map((note) => (
                <span
                  key={note}
                  className="rounded-full border border-white/12 bg-white/[0.05] px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-text/72"
                >
                  {note}
                </span>
              ))}
            </div>

            <div className="mt-6 inline-flex items-center gap-3 uppercase tracking-[0.24em] text-[11px] text-text/88">
              Otkrij kompoziciju
              <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
