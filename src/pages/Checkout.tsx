import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useStore } from '../store';
import { supabase } from '../lib/supabase';
import { CheckCircle2 } from 'lucide-react';
import PageWrapper from '../components/PageWrapper';
import SplitText from '../components/SplitText';

export default function Checkout() {
  const { cart, clearCart } = useStore();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    city: '',
    phone: '',
  });

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  if (cart.length === 0 && !isSuccess) {
    return (
      <PageWrapper>
        <div className="min-h-screen pt-28 pb-20 flex flex-col items-center justify-center bg-bg">
          <h1 className="font-display text-[2rem] uppercase tracking-tight mb-5">Vaša korpa je prazna</h1>
          <button onClick={() => navigate('/shop')} className="uppercase tracking-[0.24em] text-[11px] border-b border-white/20 pb-1 hover:border-accent hover:text-accent transition-colors">
            Povratak u butik
          </button>
        </div>
      </PageWrapper>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 1. Create the order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([{
          customer_name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          total_amount: total,
          status: 'Na čekanju'
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. Create the order items
      const orderItems = cart.map(item => ({
        order_id: orderData.id,
        product_id: item.id,
        product_name: item.name,
        quantity: item.quantity,
        price_at_time: item.price
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // 3. Send Email Notification to Admin via FormSubmit
      try {
        const orderDetailsText = cart.map(item => `${item.quantity}x ${item.name} (${(item.price * item.quantity).toFixed(2)} KM)`).join('\n');
        
        await fetch('https://formsubmit.co/ajax/alattarperfumes2025@gmail.com', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            _subject: `Nova Narudžba #${orderData.id.slice(0, 8)} - ${formData.name}`,
            Ime: formData.name,
            Email: formData.email,
            Telefon: formData.phone,
            Adresa: `${formData.address}, ${formData.city}`,
            Ukupno: `${total.toFixed(2)} KM`,
            Naručeni_Artikli: orderDetailsText,
            _template: 'table' // Gives a nice table layout in the email
          })
        });
      } catch (emailError) {
        console.error('Email sending failed, but order was saved:', emailError);
        // We don't throw here so the user still sees the success screen
      }

      // Success
      setOrderId(orderData.id);
      setIsSuccess(true);
      clearCart();
      
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Došlo je do greške pri kreiranju narudžbe.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <PageWrapper>
        <div className="min-h-screen pt-28 pb-20 flex items-center justify-center bg-bg px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full bg-surface p-9 text-center border border-white/5 shadow-2xl rounded-[1.2rem]"
          >
            <CheckCircle2 size={54} className="mx-auto mb-6 text-accent" strokeWidth={1} />
            <h1 className="font-display text-3xl uppercase tracking-tight mb-3">Narudžba Potvrđena</h1>
            <p className="text-base text-text/70 mb-6 font-light leading-7">
              Hvala vam na povjerenju. Vaša narudžba #{orderId} je uspješno zaprimljena.
            </p>
            <div className="bg-bg/50 p-5 mb-6 text-left border border-white/5 rounded-[1rem]">
              <h3 className="uppercase tracking-[0.24em] text-[11px] text-text/50 mb-3">Detalji Dostave</h3>
              <p className="font-medium text-text/90">{formData.name}</p>
              <p className="text-text/70">{formData.address}, {formData.city}</p>
              <p className="text-text/70">{formData.phone}</p>
              <p className="mt-4 font-medium text-accent">Plaćanje pouzećem</p>
            </div>
            <button
              onClick={() => navigate('/')}
              className="w-full bg-accent text-bg py-3 uppercase tracking-[0.24em] text-[11px] hover:bg-accent-hover transition-colors font-bold rounded-full"
            >
              Povratak na Početnu
            </button>
          </motion.div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="bg-bg min-h-screen pt-28 pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <SplitText 
            text="Završetak Kupovine" 
            className="font-display text-4xl md:text-6xl uppercase tracking-tight mb-12 justify-start" 
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Form */}
            <div className="lg:col-span-7">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <h2 className="font-display text-[1.8rem] uppercase tracking-tight mb-5">Podaci za Dostavu</h2>
                  <div className="space-y-5">
                    <div>
                      <label className="block uppercase tracking-[0.24em] text-[11px] text-text/50 mb-2">Ime i Prezime</label>
                      <input
                        required
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-transparent border-b border-white/20 py-3 px-0 focus:outline-none focus:border-accent transition-colors text-text placeholder:text-text/20"
                        placeholder="Unesite vaše ime"
                      />
                    </div>
                    <div>
                      <label className="block uppercase tracking-[0.24em] text-[11px] text-text/50 mb-2">Adresa</label>
                      <input
                        required
                        type="text"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="w-full bg-transparent border-b border-white/20 py-3 px-0 focus:outline-none focus:border-accent transition-colors text-text placeholder:text-text/20"
                        placeholder="Unesite vašu adresu"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-5">
                      <div>
                        <label className="block uppercase tracking-[0.24em] text-[11px] text-text/50 mb-2">Grad</label>
                        <input
                          required
                          type="text"
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          className="w-full bg-transparent border-b border-white/20 py-3 px-0 focus:outline-none focus:border-accent transition-colors text-text placeholder:text-text/20"
                          placeholder="Unesite grad"
                        />
                      </div>
                      <div>
                        <label className="block uppercase tracking-[0.24em] text-[11px] text-text/50 mb-2">Telefon</label>
                        <input
                          required
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full bg-transparent border-b border-white/20 py-3 px-0 focus:outline-none focus:border-accent transition-colors text-text placeholder:text-text/20"
                          placeholder="Unesite broj telefona"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/10">
                  <h2 className="font-display text-[1.8rem] uppercase tracking-tight mb-5">Način Plaćanja</h2>
                  <div className="p-5 border border-white/10 bg-surface rounded-[1rem]">
                    <div className="flex items-center">
                      <div className="w-4 h-4 rounded-full border-2 border-accent flex items-center justify-center mr-4">
                        <div className="w-2 h-2 bg-accent rounded-full"></div>
                      </div>
                      <span className="font-medium text-text/90">Plaćanje pouzećem (Gotovina pri preuzimanju)</span>
                    </div>
                    <p className="text-sm text-text/50 mt-2 ml-8">
                      Plaćate kuriru gotovinom prilikom preuzimanja pošiljke.
                    </p>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-accent text-bg py-3.5 uppercase tracking-[0.24em] text-[11px] font-bold hover:bg-accent-hover transition-colors disabled:opacity-50 rounded-full"
                >
                  {isSubmitting ? 'Procesiranje...' : 'Potvrdi Narudžbu'}
                </button>
              </form>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-5">
              <div className="bg-surface p-6 border border-white/5 sticky top-24 rounded-[1.2rem]">
                <h2 className="font-display text-[1.8rem] uppercase tracking-tight mb-6">Pregled Narudžbe</h2>
                
                <div className="space-y-5 mb-6">
                  {cart.map((item) => (
                    <div key={item.id} className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="w-11 h-14 bg-bg mr-3 border border-white/5 rounded-[0.7rem] overflow-hidden">
                          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover opacity-80" />
                        </div>
                        <div>
                          <h4 className="font-display uppercase">{item.name}</h4>
                          <p className="text-[11px] text-text/50 uppercase tracking-[0.22em]">Količina: {item.quantity}</p>
                        </div>
                      </div>
                      <span className="font-medium text-sm text-accent">{(item.price * item.quantity).toFixed(2)} KM</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-white/10 pt-5 space-y-3">
                  <div className="flex justify-between text-sm text-text/70">
                    <span>Međuzbir</span>
                    <span>{total.toFixed(2)} KM</span>
                  </div>
                  <div className="flex justify-between text-sm text-text/70">
                    <span>Dostava</span>
                    <span>Besplatna</span>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-white/10">
                    <span className="uppercase tracking-[0.22em] text-[11px]">Ukupno za platiti</span>
                    <span className="font-display text-[1.9rem] text-accent">{total.toFixed(2)} KM</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
