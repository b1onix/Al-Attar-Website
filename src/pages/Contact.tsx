import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import PageWrapper from '../components/PageWrapper';
import SplitText from '../components/SplitText';
import { Mail, MapPin, Phone, Instagram, ArrowRight } from 'lucide-react';
import MagneticButton from '../components/MagneticButton';
import { supabase } from '../lib/supabase';

export default function Contact() {
  const [content, setContent] = useState<any>(null);

  useEffect(() => {
    const fetchContent = async () => {
      const { data, error } = await supabase
        .from('page_content')
        .select('content')
        .eq('id', 'contact_content')
        .single();
      
      if (!error && data) {
        setContent(data.content);
      }
    };
    fetchContent();
  }, []);

  const contactData = content || {
    eyebrow: 'Korisnička Podrška',
    title_1: 'Stupimo u',
    title_2: 'Kontakt.',
    description: 'Bilo da imate pitanje o našim mirisima, trebate pomoć pri odabiru savršenog parfema ili želite razgovarati o saradnji, tu smo za vas.',
    address_label: 'Atelje & Sjedište',
    address: 'Tuzla, Bosna i Hercegovina',
    email_label: 'Email',
    email: 'hello@al-attar.ba',
    phone_label: 'Telefon',
    phone: '+387 60 000 000',
    form_title: 'Pošaljite nam poruku',
    instagram_handle: '@al.attar',
    instagram_url: 'https://instagram.com'
  };

  return (
    <PageWrapper>
      <div className="min-h-screen bg-bg relative overflow-hidden">
        {/* Background ambient noise/gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(197,160,89,0.05),transparent_50%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.02),transparent_40%)] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 pt-40 pb-24 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-20 items-start">
            
            {/* Left Column - Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="text-[10px] uppercase tracking-[0.4em] text-accent mb-8">{contactData.eyebrow}</p>
              
              <SplitText 
                text={contactData.title_1} 
                className="font-display text-5xl md:text-7xl leading-[0.9] mb-2 justify-start" 
                delay={0.1}
              />
              <SplitText 
                text={contactData.title_2} 
                className="font-display text-5xl md:text-7xl leading-[0.9] mb-12 justify-start text-white/50" 
                delay={0.3}
              />

              <p className="text-lg font-light text-white/60 leading-relaxed mb-16 max-w-md">
                {contactData.description}
              </p>

              <div className="space-y-10">
                <div className="flex items-start gap-6 group">
                  <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center bg-white/[0.02] group-hover:border-accent/50 group-hover:bg-accent/5 transition-colors">
                    <MapPin size={20} className="text-white/60 group-hover:text-accent transition-colors" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 mb-2">{contactData.address_label}</p>
                    <p className="text-lg text-white/90">{contactData.address}</p>
                  </div>
                </div>

                <div className="flex items-start gap-6 group">
                  <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center bg-white/[0.02] group-hover:border-accent/50 group-hover:bg-accent/5 transition-colors">
                    <Mail size={20} className="text-white/60 group-hover:text-accent transition-colors" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 mb-2">{contactData.email_label}</p>
                    <a href={`mailto:${contactData.email}`} className="text-lg text-white/90 hover:text-accent transition-colors">{contactData.email}</a>
                  </div>
                </div>

                <div className="flex items-start gap-6 group">
                  <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center bg-white/[0.02] group-hover:border-accent/50 group-hover:bg-accent/5 transition-colors">
                    <Phone size={20} className="text-white/60 group-hover:text-accent transition-colors" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 mb-2">{contactData.phone_label}</p>
                    <a href={`tel:${contactData.phone.replace(/\s+/g, '')}`} className="text-lg text-white/90 hover:text-accent transition-colors">{contactData.phone}</a>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right Column - Form */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 md:p-12 backdrop-blur-sm"
            >
              <h3 className="font-display text-3xl mb-8">{contactData.form_title}</h3>
              
              <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="relative group">
                    <input 
                      type="text" 
                      id="name"
                      required
                      className="w-full bg-transparent border-b border-white/10 py-4 text-white placeholder-transparent focus:outline-none focus:border-accent transition-colors peer"
                      placeholder="Vaše Ime"
                    />
                    <label htmlFor="name" className="absolute left-0 top-4 text-sm text-white/40 uppercase tracking-widest transition-all peer-focus:-top-4 peer-focus:text-[10px] peer-focus:text-accent peer-valid:-top-4 peer-valid:text-[10px] cursor-text">
                      Vaše Ime
                    </label>
                  </div>
                  
                  <div className="relative group">
                    <input 
                      type="email" 
                      id="email"
                      required
                      className="w-full bg-transparent border-b border-white/10 py-4 text-white placeholder-transparent focus:outline-none focus:border-accent transition-colors peer"
                      placeholder="Email Adresa"
                    />
                    <label htmlFor="email" className="absolute left-0 top-4 text-sm text-white/40 uppercase tracking-widest transition-all peer-focus:-top-4 peer-focus:text-[10px] peer-focus:text-accent peer-valid:-top-4 peer-valid:text-[10px] cursor-text">
                      Email Adresa
                    </label>
                  </div>
                </div>

                <div className="relative group">
                  <input 
                    type="text" 
                    id="subject"
                    required
                    className="w-full bg-transparent border-b border-white/10 py-4 text-white placeholder-transparent focus:outline-none focus:border-accent transition-colors peer"
                    placeholder="Naslov Poruke"
                  />
                  <label htmlFor="subject" className="absolute left-0 top-4 text-sm text-white/40 uppercase tracking-widest transition-all peer-focus:-top-4 peer-focus:text-[10px] peer-focus:text-accent peer-valid:-top-4 peer-valid:text-[10px] cursor-text">
                    Naslov Poruke
                  </label>
                </div>

                <div className="relative group">
                  <textarea 
                    id="message"
                    required
                    rows={4}
                    className="w-full bg-transparent border-b border-white/10 py-4 text-white placeholder-transparent focus:outline-none focus:border-accent transition-colors peer resize-none"
                    placeholder="Vaša Poruka"
                  ></textarea>
                  <label htmlFor="message" className="absolute left-0 top-4 text-sm text-white/40 uppercase tracking-widest transition-all peer-focus:-top-4 peer-focus:text-[10px] peer-focus:text-accent peer-valid:-top-4 peer-valid:text-[10px] cursor-text">
                    Vaša Poruka
                  </label>
                </div>

                <div className="pt-4 flex items-center justify-between">
                  <a href={contactData.instagram_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-white/40 hover:text-accent transition-colors text-sm uppercase tracking-widest">
                    <Instagram size={18} /> {contactData.instagram_handle}
                  </a>
                  
                  <MagneticButton>
                    <button type="submit" className="group flex items-center gap-4 bg-accent text-black px-8 py-4 rounded-full text-[11px] font-bold uppercase tracking-[0.25em] hover:bg-white transition-colors">
                      Pošalji <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </MagneticButton>
                </div>
              </form>
            </motion.div>

          </div>
        </div>
      </div>
    </PageWrapper>
  );
}