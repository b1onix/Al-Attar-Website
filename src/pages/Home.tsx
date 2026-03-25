import { AnimatePresence, motion } from 'motion/react';
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageWrapper from '../components/PageWrapper';
import MagneticButton from '../components/MagneticButton';
import HorizontalScrollCarousel from '../components/HorizontalScrollCarousel';
import { supabase } from '../lib/supabase';

export default function Home() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [iconicScents, setIconicScents] = useState<any[]>([]);
  const [heroSlides, setHeroSlides] = useState<any[]>([]);
  const [narrativeContent, setNarrativeContent] = useState<any>(null);
  const [atelierDetails, setAtelierDetails] = useState<any[]>([]);
  const [scentJourney, setScentJourney] = useState<any[]>([]);

  useEffect(() => {
    async function fetchLandingContent() {
      try {
        const [slidesRes, contentRes] = await Promise.all([
          supabase.from('hero_slides').select('*').order('display_order', { ascending: true }),
          supabase.from('page_content').select('*')
        ]);

        if (slidesRes.data && slidesRes.data.length > 0) {
          setHeroSlides(slidesRes.data);
        } else {
          // Fallback to static if DB is empty
          setHeroSlides(defaultHeroSlides);
        }

        if (contentRes.data) {
          const contentMap: Record<string, any> = {};
          contentRes.data.forEach(item => {
            contentMap[item.id] = item.content;
          });
          
          if (contentMap['narrative_header']) setNarrativeContent(contentMap['narrative_header']);
          if (contentMap['atelier_details']) setAtelierDetails(contentMap['atelier_details']);
          if (contentMap['scent_journey']) setScentJourney(contentMap['scent_journey']);
        }
      } catch (error) {
        console.error('Error fetching landing content:', error);
        setHeroSlides(defaultHeroSlides);
      }
    }

    async function fetchFeaturedProducts() {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('is_featured', true)
          .limit(3);
          
        if (error) throw error;
        
        if (data && data.length > 0) {
          setIconicScents(data.map((p, index) => ({
            id: p.id,
            name: p.name,
            note: p.notes || `${p.category || 'Attar'} & ${index === 0 ? 'Tamjan' : 'Mošus'}`,
            ritual: index === 0 ? 'Večernji ritual' : index === 1 ? 'Dnevni potpis' : 'Noćna selekcija',
            description: p.description || 'Tamni, dimljeni karakter sa elegantnom dubinom koja djeluje ozbiljno i luksuzno.',
            img: p.image_url && p.image_url.startsWith('http') ? p.image_url : `https://picsum.photos/seed/${p.id}/800/800`,
            displayId: index + 1
          })));
        }
      } catch (err) {
        console.error('Error fetching featured products:', err);
      }
    }

    fetchLandingContent();
    fetchFeaturedProducts();
  }, []);

  const defaultHeroSlides = [
    {
      id: 1,
      eyebrow: 'Atelier collection',
      title: 'Mirisi sa prisustvom, oblikovani kao savremeni luksuz.',
      description: 'Slojevite kompozicije za one koji žele miris koji djeluje skupo, precizno i nezaboravno.',
      image: '/1.png',
      statLabel: 'Fokus kolekcije',
      statValue: 'Oud / Rose / Musk',
      cardTitle: 'Slojevita dubina',
      cardCopy: 'Dramatičan kadar inspirisan dimom, kožom i toplinom začina.',
      notes: ['Oud', 'Tamjan', 'Šafran'],
    },
    {
      id: 2,
      eyebrow: 'Signature rituals',
      title: 'Od dnevne elegancije do večernje dubine, bez ijedne banalne note.',
      description: 'Svaki kadar u slideru sada predstavlja jedan karakter mirisa i daje stranici ozbiljniji premium osjećaj.',
      image: '/2.png',
      statLabel: 'Nosivost',
      statValue: 'Dan i noć',
      cardTitle: 'Tihi luksuz',
      cardCopy: 'Čista, moderna kompozicija koja djeluje profinjeno bez previše buke.',
      notes: ['Mošus', 'Bijela ruža', 'Sandalovina'],
    },
    {
      id: 3,
      eyebrow: 'Curated atmosphere',
      title: 'Vizuelni identitet koji sada izgleda kao fragrance campaign, ne kao template landing page.',
      description: 'Pun ekran, uredniji layering, jača tipografija i elegantno kretanje daju hero sekciji mnogo više prisustva.',
      image: '/3.png',
      statLabel: 'Art direction',
      statValue: 'Editorial luxury',
      cardTitle: 'Baršunasti kontrast',
      cardCopy: 'Bogata noćna atmosfera sa tamnijim cvjetnim karakterom i filmskim završetkom.',
      notes: ['Damask ruža', 'Pačuli', 'Amber'],
    },
  ];

  const defaultAtelierDetails = [
    {
      label: 'Kurirana kompozicija',
      title: 'Slojevi koji se razvijaju postepeno',
      description: 'Svaka nota ulazi u kadar u svoje vrijeme, bez buke i bez prenaglašenih akorda.',
    },
    {
      label: 'Taktilni osjećaj',
      title: 'Miris kao produžetak stila',
      description: 'Teksture, tonovi i trag parfema oblikovani su da djeluju jednako luksuzno kao i izgled bočice.',
    },
    {
      label: 'Savremeni ritual',
      title: 'Diskretan, ali upečatljiv potpis',
      description: 'Umjesto generičnog statementa, kompozicija ostavlja precizan, elegantan utisak.',
    },
  ];

  const defaultScentJourney = [
    {
      phase: 'Otvaranje',
      notes: 'Šafran, bergamot, suho voće',
      description: 'Prvi utisak je čist i svjetlucav, sa toplinom koja dolazi postepeno.',
    },
    {
      phase: 'Srce',
      notes: 'Damask ruža, oud, tamjan',
      description: 'Sredina donosi dubinu i karakter, bez težine koja guši prostor.',
    },
    {
      phase: 'Trag',
      notes: 'Amber, mošus, sandalovina',
      description: 'Završnica ostaje blizu kože i stvara profinjen, dugotrajan potpis.',
    },
  ];

  const currentAtelierDetails = atelierDetails.length > 0 ? atelierDetails : defaultAtelierDetails;
  const currentScentJourney = scentJourney.length > 0 ? scentJourney : defaultScentJourney;

  useEffect(() => {
    if (!heroSlides || heroSlides.length === 0) return;
    
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [heroSlides]);

  const currentSlide = heroSlides.length > 0 ? heroSlides[activeSlide] : defaultHeroSlides[0];

  return (
    <PageWrapper>
      <div className="bg-bg min-h-screen">
        {/* Hero Section */}
        <section className="relative h-screen min-h-[760px] w-full overflow-hidden transform-gpu">
          <div className="absolute inset-0 z-0 will-change-transform">
            {heroSlides.map((slide, index) => (
              <div
                key={slide.id || index}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                  activeSlide === index ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                }`}
              >
                <img
                  src={slide.image_url || slide.image}
                  alt={slide.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  loading="eager"
                  fetchPriority={index === 0 ? "high" : "low"}
                />
              </div>
            ))}
            <div className="absolute inset-0 z-20 bg-[linear-gradient(90deg,rgba(5,5,5,0.78)_0%,rgba(5,5,5,0.42)_45%,rgba(5,5,5,0.58)_100%)] pointer-events-none" />
            <div className="absolute inset-0 z-20 bg-[linear-gradient(180deg,rgba(5,5,5,0.08)_0%,rgba(5,5,5,0.18)_35%,rgba(5,5,5,0.92)_100%)] pointer-events-none" />
            {/* Removed SVG noise filter for performance */}
          </div>

          <div className="relative z-10 h-full w-full">
            <div className="max-w-7xl mx-auto h-full px-4 md:px-8 pt-28 pb-8 md:pb-10">
              <div className="flex flex-col justify-between h-full lg:grid lg:grid-rows-[1fr_auto] gap-8">
                <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-8 items-center h-full">
                  <div className="max-w-4xl">
                    <div className="mb-6 flex items-center justify-between gap-4">
                      <p className="text-[10px] uppercase tracking-[0.3em] text-accent flex items-center gap-3">
                        <span className="w-8 h-px bg-accent/50" />
                        {currentSlide.eyebrow}
                      </p>
                      <span className="hidden md:block text-[10px] uppercase tracking-[0.34em] text-text/35">{`0${activeSlide + 1} / 0${heroSlides.length}`}</span>
                    </div>

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentSlide.id}
                      initial={{ opacity: 0, y: 28 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -18 }}
                      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <h1 className="font-display text-[2.8rem] leading-[1.05] tracking-tight md:text-[4.2rem] lg:text-[5.5rem] mb-6 md:mb-8 text-white drop-shadow-2xl">
                        {currentSlide.title}
                      </h1>
                      <p className="text-sm md:text-base leading-relaxed text-white/80 max-w-xl mb-8 md:mb-12 font-light tracking-wide drop-shadow-md">
                        {currentSlide.description}
                      </p>

                      <div className="mt-8 flex flex-wrap items-center gap-4">
                        <MagneticButton>
                          <Link
                            to="/shop"
                            className="group relative inline-flex items-center justify-center px-7 py-3 overflow-hidden rounded-full border border-accent/50 text-accent hover:text-bg transition-colors duration-500"
                          >
                            <span className="relative z-10 uppercase tracking-[0.24em] text-[11px] font-medium">
                              Otkrijte kolekciju
                            </span>
                            <div className="absolute inset-0 h-full w-full bg-accent -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out"></div>
                          </Link>
                        </MagneticButton>

                        <Link
                          to="/about"
                          className="group inline-flex items-center gap-3 uppercase tracking-[0.24em] text-[11px] text-text/82 hover:text-accent transition-colors"
                        >
                          Naše nasljeđe
                          <ArrowUpRight size={16} className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                        </Link>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                  </div>

                  <div className="hidden lg:flex justify-end">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={`hero-card-${currentSlide.id}`}
                        initial={{ opacity: 0, y: 26 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 16 }}
                        transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
                        className="w-full max-w-[30rem] rounded-[1.8rem] border border-white/10 bg-black/40 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.28)]"
                      >
                        <div className="flex items-start justify-between gap-4 mb-12">
                          <div>
                            <p className="text-[10px] uppercase tracking-[0.26em] text-text/45 mb-3">{currentSlide.stat_label || currentSlide.statLabel}</p>
                            <p className="font-display text-3xl text-white">{currentSlide.stat_value || currentSlide.statValue}</p>
                          </div>
                          <span className="font-display text-5xl text-white/12">{`0${activeSlide + 1}`}</span>
                        </div>

                        <div>
                          <p className="text-[10px] uppercase tracking-[0.28em] text-accent mb-3">{currentSlide.card_title || currentSlide.cardTitle}</p>
                          <p className="text-sm leading-7 text-text/65 max-w-md">{currentSlide.card_copy || currentSlide.cardCopy}</p>
                          <div className="mt-5 flex flex-wrap gap-2">
                            {currentSlide.notes.map((note, idx) => (
                              <span
                                key={`${currentSlide.id}-note-${idx}`}
                                className="rounded-full border border-white/12 bg-white/[0.05] px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-text/70"
                              >
                                {note}
                              </span>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>

                <div className="rounded-[1.7rem] border border-white/10 bg-black/40 overflow-hidden shrink-0 mt-auto">
                  <div className="flex flex-col lg:flex-row gap-4 px-4 py-4 md:px-5 md:py-5 lg:items-center">
                    <div className="min-w-0 pr-4 flex-1">
                      <p className="text-[10px] uppercase tracking-[0.26em] text-text/42 mb-2">Trenutni kadar</p>
                      <div className="flex items-center gap-4">
                        <div className="min-w-0 flex-1">
                          <p className="font-display text-2xl md:text-[2rem] text-white truncate leading-tight mb-1">{currentSlide.card_title || currentSlide.cardTitle}</p>
                          <p className="text-[13px] text-text/55 truncate">{currentSlide.stat_value || currentSlide.statValue}</p>
                        </div>
                        <span className="text-[10px] uppercase tracking-[0.28em] text-text/35 ml-auto flex-shrink-0">{`0${activeSlide + 1}`}</span>
                      </div>
                    </div>

                    <div className="hidden lg:flex gap-2 min-w-0 flex-shrink-0">
                      {heroSlides.map((slide, index) => (
                        <button
                          key={slide.id}
                          type="button"
                          onClick={() => setActiveSlide(index)}
                          className={`group rounded-[1.1rem] border px-4 py-3 text-left transition-all duration-400 w-[140px] max-w-[140px] flex-shrink-0 ${
                            activeSlide === index
                              ? 'border-accent/45 bg-accent/10'
                              : 'border-white/8 bg-white/[0.02] hover:border-white/18 hover:bg-white/[0.04]'
                          }`}
                          aria-label={`Go to slide ${index + 1}`}
                        >
                          <p className="text-[9px] uppercase tracking-[0.26em] text-text/45 mb-1">{`0${index + 1}`}</p>
                          <p className={`font-display text-[15px] leading-tight truncate transition-colors ${activeSlide === index ? 'text-white' : 'text-text/72 group-hover:text-white'}`}>
                            {slide.stat_value || slide.statValue}
                          </p>
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center justify-between gap-4 lg:justify-end flex-shrink-0 lg:pl-2">
                      <div className="flex items-center gap-2 md:hidden">
                        {heroSlides.map((slide, index) => (
                          <button
                            key={`mobile-dot-${slide.id}`}
                            type="button"
                            onClick={() => setActiveSlide(index)}
                            className={`h-2 rounded-full transition-all duration-500 ${
                              activeSlide === index ? 'w-9 bg-accent' : 'w-2 bg-white/35'
                            }`}
                            aria-label={`Go to slide ${index + 1}`}
                          />
                        ))}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setActiveSlide((activeSlide - 1 + heroSlides.length) % heroSlides.length)}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/12 text-text/80 hover:border-accent/60 hover:text-accent transition-colors"
                          aria-label="Previous slide"
                        >
                          <ArrowLeft size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveSlide((activeSlide + 1) % heroSlides.length)}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/12 text-text/80 hover:border-accent/60 hover:text-accent transition-colors"
                          aria-label="Next slide"
                        >
                          <ArrowRight size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="relative py-20 md:py-24 px-4 md:px-8 overflow-hidden transform-gpu">
          <div className="absolute inset-0 pointer-events-none">
            <div
              className="absolute left-1/2 top-20 h-52 w-52 -translate-x-1/2 rounded-full bg-accent/20 blur-[60px]"
            />
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          </div>

          <div
            className="relative max-w-7xl mx-auto will-change-transform"
          >
            <div className="relative overflow-hidden rounded-[2rem] border border-white/8 bg-black shadow-[0_40px_120px_rgba(0,0,0,0.5)]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_14%,rgba(197,160,89,0.18),transparent_32%),radial-gradient(circle_at_88%_80%,rgba(197,160,89,0.12),transparent_26%),linear-gradient(135deg,rgba(255,255,255,0.03),transparent_35%,rgba(255,255,255,0.01))]" />
              <div className="absolute inset-y-0 left-[56%] hidden lg:block w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />

              <div className="relative grid lg:grid-cols-[1.02fr_0.98fr]">
                <div className="p-7 md:p-10 lg:p-12">
                  <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-120px' }}
                    transition={{ duration: 0.8 }}
                    className="max-w-2xl"
                  >
                    <span className="inline-flex items-center gap-3 uppercase tracking-[0.34em] text-[10px] text-accent/80 mb-6">
                      <span className="h-px w-10 bg-accent/50" />
                      {narrativeContent?.eyebrow || "Mirisna kompozicija"}
                    </span>
                    <h2 className="font-display text-4xl md:text-6xl lg:text-[4.7rem] font-light leading-[0.92] max-w-3xl">
                      {narrativeContent?.title || "Parfem koji ne izgleda kao sekcija, nego kao scena."}
                    </h2>
                    <p className="mt-7 text-sm md:text-lg text-text/62 font-light leading-7 md:leading-8 max-w-xl">
                      {narrativeContent?.description || "Umjesto generičnog rasporeda sa nekoliko kartica, ovaj kadar sada radi kao editorial spread: jaka headline tipografija, različiti moduli, kontrolisan negativni prostor i slojevi koji se otkrivaju kao miris na koži."}
                    </p>
                  </motion.div>

                  <div className="mt-10 grid gap-4 md:grid-cols-[1.15fr_0.85fr]">
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: '-100px' }}
                      transition={{ duration: 0.8 }}
                      className="relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-6 min-h-[19rem]"
                    >
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(197,160,89,0.14),transparent_38%)]" />
                      <div className="relative flex h-full flex-col justify-between">
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.3em] text-accent/75 mb-5">{currentAtelierDetails[0].label}</p>
                          <h3 className="font-display text-[2.2rem] leading-[0.95] max-w-sm mb-4">
                            {currentAtelierDetails[0].title}
                          </h3>
                        </div>
                        <p className="text-[14px] leading-7 text-text/58 max-w-sm">{currentAtelierDetails[0].description}</p>
                      </div>
                    </motion.div>

                    <div className="grid gap-4">
                      {currentAtelierDetails.slice(1).map((item, index) => (
                        <motion.div
                          key={item.title}
                          initial={{ opacity: 0, y: 28 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true, margin: '-100px' }}
                          transition={{ duration: 0.7, delay: 0.08 + index * 0.1 }}
                          className="rounded-[1.35rem] border border-white/8 bg-white/[0.02] p-5 min-h-[9.2rem]"
                        >
                          <p className="text-[9px] uppercase tracking-[0.28em] text-accent/75 mb-3">{item.label}</p>
                          <h3 className="text-[1.55rem] leading-tight mb-2">{item.title}</h3>
                          <p className="text-[13px] leading-6 text-text/55">{item.description}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-100px' }}
                    transition={{ duration: 0.7, delay: 0.2 }}
                    className="mt-9 flex items-center justify-between gap-4 border-t border-white/8 pt-6"
                  >
                    <Link
                      to="/about"
                      className="group inline-flex items-center gap-3 uppercase tracking-[0.24em] text-[11px] text-text/80 hover:text-accent transition-colors"
                    >
                      Upoznajte naš pristup
                      <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>
                    <span className="hidden md:block font-display text-4xl text-white/12">Essence</span>
                  </motion.div>
                </div>

                <div className="relative min-h-[42rem] lg:min-h-[48rem] p-7 md:p-10 lg:p-12">
                  <div
                    className="relative h-full"
                  >
                    <div className="absolute inset-0 rounded-[1.7rem] bg-[radial-gradient(circle_at_50%_24%,rgba(197,160,89,0.15),transparent_28%),radial-gradient(circle_at_50%_76%,rgba(255,255,255,0.05),transparent_24%)]" />
                    <div className="absolute left-1/2 top-12 bottom-12 hidden md:block w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-white/10 to-transparent" />
                    <p className="absolute right-0 top-0 font-display text-[5rem] leading-none text-white/6 hidden md:block">
                      ATTAR
                    </p>

                    <div className="relative h-full flex flex-col justify-center gap-5 md:block">
                      {currentScentJourney.map((step, index) => (
                        <motion.div
                          key={step.phase}
                          initial={{ opacity: 0, x: index % 2 === 0 ? 50 : -50, y: 30 }}
                          whileInView={{ opacity: 1, x: 0, y: 0 }}
                          viewport={{ once: true, margin: '-120px' }}
                          transition={{ duration: 0.9, delay: index * 0.14, ease: [0.22, 1, 0.36, 1] }}
                          className={`relative overflow-hidden rounded-[1.45rem] border border-white/10 bg-black/40 p-5 md:p-6 md:absolute md:w-[74%] ${
                            index === 0
                              ? 'md:left-0 md:top-[8%]'
                              : index === 1
                                ? 'md:right-0 md:top-[38%]'
                                : 'md:left-[12%] md:bottom-[8%]'
                          }`}
                        >
                          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.06),transparent_40%,rgba(197,160,89,0.05))]" />
                          <div className="relative">
                            <div className="flex items-center justify-between gap-4 mb-4">
                              <span className="text-[9px] uppercase tracking-[0.3em] text-text/42">
                                Sloj {index + 1}
                              </span>
                              <span className="text-[11px] uppercase tracking-[0.24em] text-accent">
                                {step.phase}
                              </span>
                            </div>
                            <h3 className="font-display text-[2rem] md:text-[2.35rem] leading-[0.96] mb-3 max-w-md">
                              {step.notes}
                            </h3>
                            <p className="text-[13px] md:text-sm leading-6 md:leading-7 text-text/60 max-w-sm">
                              {step.description}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Horizontal Scroll Section */}
        <HorizontalScrollCarousel />

        {/* Featured Scents */}
        <section className="py-20 px-4 md:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr] items-end mb-10">
              <div>
                <span className="inline-flex items-center gap-3 uppercase tracking-[0.28em] text-[10px] text-accent/80 mb-4">
                  <span className="h-px w-8 bg-accent/50" />
                  Ikonični mirisi
                </span>
                <h2 className="font-display text-3xl md:text-5xl leading-[0.96]">
                  Tri hero proizvoda prikazana kao premium selekcija, ne kao običan grid.
                </h2>
              </div>

              <div className="lg:pl-10">
                <p className="text-sm md:text-base leading-7 text-text/62 max-w-xl">
                  Ovdje proizvodi sada dobijaju više identiteta: jasnu ulogu, luksuzniji kadar i elegantniji
                  raspored koji izgleda bliže high-end fragrance brandu nego generičnoj ecommerce listi.
                </p>
                <Link to="/shop" className="group mt-5 inline-flex items-center gap-3 uppercase tracking-[0.24em] text-[11px] text-text/80 hover:text-accent transition-colors">
                  Svi proizvodi
                  <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
              {iconicScents.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-100px' }}
                  transition={{ duration: 0.8, delay: index * 0.14 }}
                  className="group cursor-pointer h-full"
                >
                  <Link
                    to={`/product/${item.id}`}
                    className="block h-full rounded-[1.4rem] border border-white/8 bg-white/[0.03] p-3 transition-transform duration-500 hover:-translate-y-1"
                  >
                    <div className="flex h-full flex-col">
                      <div className="flex items-center justify-between px-2 pt-1 pb-3">
                        <span className="text-[10px] uppercase tracking-[0.24em] text-text/55">{item.ritual}</span>
                        <span className="font-display text-3xl text-white/20">{`0${item.displayId || index + 1}`}</span>
                      </div>

                      <div className="relative aspect-[4/5] overflow-hidden bg-surface rounded-[1.1rem]">
                        <img 
                          src={item.img} 
                          alt={item.name}
                          loading="lazy"
                          className="w-full h-full object-cover opacity-72 group-hover:scale-105 group-hover:opacity-100 transition-all duration-700"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,5,5,0.06),rgba(5,5,5,0.38)_50%,rgba(5,5,5,0.92))]" />
                        <div className="absolute left-4 top-4 rounded-full border border-white/12 bg-black/60 px-3 py-1 text-[9px] uppercase tracking-[0.22em] text-accent">
                          {item.note}
                        </div>
                        <div className="absolute inset-x-0 bottom-0 p-4">
                          <div className="rounded-[1rem] border border-white/10 bg-black/60 p-4">
                            <div className="flex items-end justify-between gap-3">
                              <div>
                                <h3 className="font-display text-[1.8rem] leading-none mb-2 text-white">{item.name}</h3>
                                <p className="text-[12px] uppercase tracking-[0.2em] text-text/55">{item.ritual}</p>
                              </div>
                              <ArrowRight size={18} className="mb-1 text-text/70 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-accent" />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex-1 px-2 pt-4 pb-2">
                        <p className="text-[13px] leading-6 text-text/60">{item.description}</p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </PageWrapper>
  );
}
