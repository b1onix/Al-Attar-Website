import { useState, useEffect, useReducer } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Package, ShoppingBag, CheckCircle, Clock, Truck, Plus, Edit2, Trash2, X, Image as ImageIcon, LayoutDashboard, LogOut, ChevronRight, Settings, Lock, FileText, Upload } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';

interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  price_at_time: number;
}

interface Order {
  id: string;
  customer_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  total_amount: number;
  status: string;
  created_at: string;
  order_items: OrderItem[];
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  stock: number;
  is_featured: boolean;
  notes: string;
  intensity: string;
  occasion: string;
}

export default function Admin() {
  const [session, setSession] = useState<any>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [state, dispatch] = useReducer((state: any, action: any) => ({ ...state, ...action }), {
    orders: [],
    products: [],
    heroSlides: [],
    pageContent: {},
    loading: true,
    activeTab: 'orders',
    isModalOpen: false,
    editingProduct: null,
    isSaving: false,
    uploadingImage: false,
    formData: {
      name: '',
      description: '',
      price: 0,
      category: 'Attar',
      image_url: '',
      stock: 10,
      is_featured: false,
      notes: 'Sandalwood, Rose, Musk',
      intensity: 'Srednje',
      occasion: 'Svaki dan'
    }
  });

  const { orders, products, heroSlides, pageContent, loading, activeTab, isModalOpen, editingProduct, isSaving, uploadingImage, formData } = state;

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsCheckingAuth(false);
      if (session) {
        fetchData();
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchData();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });

      if (error) throw error;
    } catch (err: any) {
      setLoginError(err.message || 'Pogrešan email ili lozinka.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const fetchData = async () => {
    dispatch({ loading: true });
    await Promise.all([fetchOrders(), fetchProducts(), fetchLandingContent()]);
    dispatch({ loading: false });
  };

  const fetchLandingContent = async () => {
    try {
      const [slidesRes, contentRes] = await Promise.all([
        supabase.from('hero_slides').select('*').order('display_order', { ascending: true }),
        supabase.from('page_content').select('*')
      ]);

      if (slidesRes.error) {
        console.error('Error fetching slides:', slidesRes.error);
      } else {
        dispatch({ heroSlides: slidesRes.data || [] });
      }

      if (contentRes.error) {
        console.error('Error fetching page content:', contentRes.error);
      } else {
        const contentMap: Record<string, any> = {};
        contentRes.data?.forEach(item => {
          contentMap[item.id] = item.content;
        });
        dispatch({ pageContent: contentMap });
      }
    } catch (err) {
      console.error('Error in fetchLandingContent:', err);
    }
  };

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      dispatch({ orders: data || [] });
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      dispatch({ products: data || [] });
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);
        
      if (error) throw error;
      fetchOrders(); // Refresh orders
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Greška pri ažuriranju statusa.');
    }
  };

  // --- Product Management ---

  const handleOpenModal = (product?: Product) => {
    if (product) {
      dispatch({
        editingProduct: product,
        formData: {
          name: product.name,
          description: product.description || '',
          price: product.price,
          category: product.category,
          image_url: product.image_url || '',
          stock: product.stock,
          is_featured: product.is_featured,
          notes: product.notes || 'Sandalwood, Rose, Musk',
          intensity: product.intensity || 'Srednje',
          occasion: product.occasion || 'Svaki dan'
        },
        isModalOpen: true
      });
    } else {
      dispatch({
        editingProduct: null,
        formData: {
          name: '',
          description: '',
          price: 0,
          category: 'Attar',
          image_url: '',
          stock: 10,
          is_featured: false,
          notes: 'Sandalwood, Rose, Musk',
          intensity: 'Srednje',
          occasion: 'Svaki dan'
        },
        isModalOpen: true
      });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!e.target.files || e.target.files.length === 0) return;
      const file = e.target.files[0];
      dispatch({ uploadingImage: true });

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload image to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Supabase upload error detail:', uploadError);
        throw new Error(uploadError.message || 'Greška pri uploadu slike u Supabase.');
      }

      // Get public URL
      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      dispatch({ formData: { ...formData, image_url: data.publicUrl } });
    } catch (error: any) {
      console.error('Error uploading image:', error);
      alert(`Greška pri uploadu slike: ${error.message}`);
    } finally {
      dispatch({ uploadingImage: false });
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch({ isSaving: true });

    try {
      if (editingProduct) {
        // Update
        const { error } = await supabase
          .from('products')
          .update(formData)
          .eq('id', editingProduct.id);
        if (error) {
           console.error("Supabase Update Error:", error);
           throw error;
        }
      } else {
        // Create
        const { error } = await supabase
          .from('products')
          .insert([formData]);
        if (error) {
           console.error("Supabase Insert Error:", error);
           throw error;
        }
      }

      dispatch({ isModalOpen: false });
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Greška pri spremanju proizvoda.');
    } finally {
      dispatch({ isSaving: false });
    }
  };

  const setFormData = (updates: any) => {
    dispatch({ formData: { ...formData, ...updates } });
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('Da li ste sigurni da želite obrisati ovaj proizvod?')) return;
    
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      if (error) throw error;
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Greška pri brisanju proizvoda.');
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505] text-white">
        <div className="w-12 h-12 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505] p-4 relative overflow-hidden">
        {/* Background Accents */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/5 rounded-full blur-[120px] pointer-events-none"></div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-black/40 backdrop-blur-xl border border-white/10 p-10 rounded-3xl relative z-10 shadow-2xl"
        >
          <div className="text-center mb-10">
            <h1 className="font-display text-4xl text-white mb-2">Al-Attar</h1>
            <p className="text-[10px] uppercase tracking-[0.3em] text-accent">Admin Portal</p>
          </div>

          {loginError && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-white/50 mb-3">Email</label>
              <input 
                type="email" 
                required
                value={loginEmail}
                onChange={e => setLoginEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-accent transition-colors"
                placeholder="admin@al-attar.com"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-white/50 mb-3">Lozinka</label>
              <input 
                type="password" 
                required
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-accent transition-colors"
                placeholder="••••••••"
              />
            </div>
            
            <button 
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-accent text-black font-bold uppercase tracking-widest text-[11px] py-4 rounded-xl hover:bg-white transition-colors flex justify-center items-center gap-2 mt-4 disabled:opacity-50"
            >
              {isLoggingIn ? 'Prijava...' : (
                <>
                  <Lock size={16} /> Prijavi se
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <Link to="/" className="text-[10px] uppercase tracking-widest text-white/40 hover:text-white transition-colors">
              &larr; Nazad na trgovinu
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  if (loading && orders.length === 0 && products.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-white">
        <div className="w-12 h-12 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#050505] text-white font-sans overflow-hidden cursor-default selection:bg-accent selection:text-black">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 bg-[#0a0a0a] flex flex-col z-20 relative">
        <div className="p-8 pb-10">
          <Link to="/" className="inline-block">
            <h1 className="font-display text-3xl uppercase tracking-widest text-white hover:text-accent transition-colors">
              Al-Attar
            </h1>
            <p className="text-[9px] uppercase tracking-[0.3em] text-white/40 mt-2">Admin Panel</p>
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <button
            onClick={() => dispatch({ activeTab: 'orders' })}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 ${
              activeTab === 'orders' 
                ? 'bg-accent/10 text-accent border border-accent/20' 
                : 'text-white/60 hover:bg-white/5 hover:text-white border border-transparent'
            }`}
          >
            <div className="flex items-center gap-3">
              <Package size={18} />
              <span className="text-xs uppercase tracking-widest">Narudžbe</span>
            </div>
            {orders.filter((o: any) => o.status === 'Na čekanju').length > 0 && (
              <span className="bg-accent text-black text-[9px] font-bold px-2 py-0.5 rounded-full">
                {orders.filter((o: any) => o.status === 'Na čekanju').length}
              </span>
            )}
          </button>

          <button
            onClick={() => dispatch({ activeTab: 'products' })}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 ${
              activeTab === 'products' 
                ? 'bg-accent/10 text-accent border border-accent/20' 
                : 'text-white/60 hover:bg-white/5 hover:text-white border border-transparent'
            }`}
          >
            <div className="flex items-center gap-3">
              <ShoppingBag size={18} />
              <span className="text-xs uppercase tracking-widest">Proizvodi</span>
            </div>
          </button>

          <button
            onClick={() => dispatch({ activeTab: 'landing' })}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 ${
              activeTab === 'landing' 
                ? 'bg-accent/10 text-accent border border-accent/20' 
                : 'text-white/60 hover:bg-white/5 hover:text-white border border-transparent'
            }`}
          >
            <div className="flex items-center gap-3">
              <FileText size={18} />
              <span className="text-xs uppercase tracking-widest">Početna</span>
            </div>
          </button>

          <button
            onClick={() => dispatch({ activeTab: 'about' })}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 ${
              activeTab === 'about' 
                ? 'bg-accent/10 text-accent border border-accent/20' 
                : 'text-white/60 hover:bg-white/5 hover:text-white border border-transparent'
            }`}
          >
            <div className="flex items-center gap-3">
              <FileText size={18} />
              <span className="text-xs uppercase tracking-widest">O Nama</span>
            </div>
          </button>

          <button
            onClick={() => dispatch({ activeTab: 'contact' })}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 ${
              activeTab === 'contact' 
                ? 'bg-accent/10 text-accent border border-accent/20' 
                : 'text-white/60 hover:bg-white/5 hover:text-white border border-transparent'
            }`}
          >
            <div className="flex items-center gap-3">
              <FileText size={18} />
              <span className="text-xs uppercase tracking-widest">Kontakt</span>
            </div>
          </button>
        </nav>

        <div className="p-4 border-t border-white/5 space-y-2">
          <Link to="/" className="w-full flex items-center gap-3 px-4 py-3 text-white/40 hover:text-white transition-colors rounded-xl hover:bg-white/5">
            <LayoutDashboard size={18} />
            <span className="text-xs uppercase tracking-widest">Nazad na sajt</span>
          </Link>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-400/60 hover:text-red-400 transition-colors rounded-xl hover:bg-red-400/10"
          >
            <LogOut size={18} />
            <span className="text-xs uppercase tracking-widest">Odjava</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto custom-scrollbar relative">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-[#050505]/80 backdrop-blur-xl border-b border-white/5 px-10 py-6 flex justify-between items-center">
          <div>
            <h2 className="font-display text-3xl">
              {activeTab === 'orders' ? 'Upravljanje Narudžbama' : 'Katalog Proizvoda'}
            </h2>
            <p className="text-xs text-white/40 uppercase tracking-widest mt-2">
              {activeTab === 'orders' ? 'Pregled i obrada kupovina' : 'Kreiranje i izmjena mirisa'}
            </p>
          </div>
          
          {activeTab === 'products' && (
            <button
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 bg-accent text-black px-5 py-2.5 rounded-full text-xs uppercase tracking-widest font-bold hover:bg-white transition-colors"
            >
              <Plus size={16} /> Novi Proizvod
            </button>
          )}
        </header>

        <div className="p-10 pb-32">
          {activeTab === 'orders' && (
            <div className="space-y-6">
            {orders.length === 0 ? (
              <div className="text-center py-32 border border-white/5 bg-white/[0.02] rounded-2xl">
                <Package size={48} className="mx-auto mb-4 text-white/20" />
                <p className="text-sm uppercase tracking-widest text-white/40">Nema novih narudžbi.</p>
              </div>
            ) : (
              orders.map((order) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl"
                >
                  <div className="flex flex-col md:flex-row justify-between gap-6 mb-6 pb-6 border-b border-white/5">
                    <div>
                      <div className="flex items-center gap-4 mb-2">
                        <h2 className="font-display text-2xl">#{order.id.slice(0, 8)}</h2>
                        <span className={`px-3 py-1 text-[10px] uppercase tracking-widest rounded-full ${
                          order.status === 'Na čekanju' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' :
                          order.status === 'Poslano' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                          'bg-green-500/10 text-green-400 border border-green-500/20'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-xs text-white/40">{new Date(order.created_at).toLocaleString('bs-BA')}</p>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateOrderStatus(order.id, 'Na čekanju')}
                        className={`p-2 rounded-lg border transition-colors ${order.status === 'Na čekanju' ? 'bg-white/10 border-white/20 text-white' : 'border-white/5 text-white/40 hover:text-white hover:bg-white/5'}`}
                        title="Na čekanju"
                      >
                        <Clock size={18} />
                      </button>
                      <button
                        onClick={() => updateOrderStatus(order.id, 'Poslano')}
                        className={`p-2 rounded-lg border transition-colors ${order.status === 'Poslano' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'border-white/5 text-white/40 hover:text-blue-400 hover:bg-white/5'}`}
                        title="Poslano"
                      >
                        <Truck size={18} />
                      </button>
                      <button
                        onClick={() => updateOrderStatus(order.id, 'Dostavljeno')}
                        className={`p-2 rounded-lg border transition-colors ${order.status === 'Dostavljeno' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'border-white/5 text-white/40 hover:text-green-400 hover:bg-white/5'}`}
                        title="Dostavljeno"
                      >
                        <CheckCircle size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div>
                      <h3 className="text-[10px] uppercase tracking-widest text-white/40 mb-4">Detalji Kupca</h3>
                      <div className="space-y-3 text-sm">
                        <p className="flex justify-between"><span className="text-white/50">Ime:</span> <span>{order.customer_name}</span></p>
                        <p className="flex justify-between"><span className="text-white/50">Adresa:</span> <span className="text-right">{order.address}, {order.city}</span></p>
                        <p className="flex justify-between"><span className="text-white/50">Telefon:</span> <span>{order.phone}</span></p>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-[10px] uppercase tracking-widest text-white/40 mb-4">Naručene Stavke</h3>
                      <div className="space-y-3 bg-black/20 p-4 rounded-xl border border-white/5">
                        {order.order_items.map((item) => (
                          <div key={item.id} className="flex justify-between items-center text-sm pb-3 border-b border-white/5 last:border-0 last:pb-0">
                            <div>
                              <p className="text-white/90">{item.product_name}</p>
                              <p className="text-xs text-white/40 mt-1">Količina: {item.quantity} x {item.price_at_time.toFixed(2)} KM</p>
                            </div>
                            <p className="font-medium">{(item.price_at_time * item.quantity).toFixed(2)} KM</p>
                          </div>
                        ))}
                        <div className="flex justify-between items-center pt-3 border-t border-white/10 mt-2">
                          <span className="text-xs uppercase tracking-widest text-white/60">Ukupno</span>
                          <span className="font-display text-xl text-accent">{order.total_amount.toFixed(2)} KM</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}

        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map(product => (
                <div key={product.id} className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden flex flex-col group hover:border-white/10 transition-colors">
                  <div className="aspect-[4/5] bg-black/40 overflow-hidden relative">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} className="w-full h-full object-cover opacity-80 group-hover:scale-105 group-hover:opacity-100 transition-all duration-700" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/10">
                        <ImageIcon size={48} />
                      </div>
                    )}
                    {product.is_featured && (
                      <span className="absolute top-3 left-3 bg-accent text-black text-[9px] uppercase tracking-widest px-2.5 py-1 rounded-full font-bold">
                        Izdvojeno
                      </span>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent opacity-80"></div>
                  </div>
                  
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-[9px] uppercase tracking-widest text-accent">{product.category}</p>
                      <span className={`text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full border ${product.stock > 0 ? 'border-green-500/30 text-green-400 bg-green-500/10' : 'border-red-500/30 text-red-400 bg-red-500/10'}`}>
                        {product.stock > 0 ? `${product.stock} na stanju` : 'Rasprodano'}
                      </span>
                    </div>
                    <h3 className="font-display text-xl mb-1 text-white">{product.name}</h3>
                    <p className="text-sm text-white/60 mb-4 flex-1 line-clamp-2">{product.description}</p>
                    <p className="font-display text-xl text-white/90">{product.price.toFixed(2)} KM</p>
                  </div>
                  
                  <div className="grid grid-cols-2 border-t border-white/5">
                    <button
                      onClick={() => handleOpenModal(product)}
                      className="flex items-center justify-center gap-2 py-3.5 hover:bg-white/5 text-white/60 hover:text-white transition-colors uppercase tracking-widest text-[10px] border-r border-white/5"
                    >
                      <Edit2 size={14} /> Izmijeni
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="flex items-center justify-center gap-2 py-3.5 hover:bg-red-500/10 text-white/60 hover:text-red-400 transition-colors uppercase tracking-widest text-[10px]"
                    >
                      <Trash2 size={14} /> Obriši
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Product Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050505]/90 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[#0a0a0a] w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-white/10 rounded-3xl relative custom-scrollbar shadow-2xl"
            >
              <div className="sticky top-0 bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-white/5 p-6 flex justify-between items-center z-10">
                <h2 className="font-display text-2xl uppercase tracking-widest">
                  {editingProduct ? 'Izmijeni Proizvod' : 'Novi Proizvod'}
                </h2>
                <button 
                  onClick={() => dispatch({ isModalOpen: false })}
                  className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 md:p-8">
                <form onSubmit={handleSaveProduct} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr] gap-8">
                    <div className="space-y-6">
                      <div>
                        <label htmlFor="product_name" className="block text-[10px] uppercase tracking-[0.2em] text-white/50 mb-3">Naziv Parfema</label>
                        <input 
                          id="product_name"
                          required
                          type="text" 
                          value={formData.name}
                          onChange={e => setFormData({...formData, name: e.target.value})}
                          className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:border-accent transition-colors"
                          placeholder="npr. Crni Oud"
                        />
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label htmlFor="product_category" className="block text-[10px] uppercase tracking-[0.2em] text-white/50 mb-3">Kategorija</label>
                          <select 
                            id="product_category"
                            value={formData.category}
                            onChange={e => setFormData({...formData, category: e.target.value})}
                            className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:border-accent transition-colors appearance-none"
                          >
                            <option value="Attar" className="bg-[#0a0a0a]">Attar</option>
                            <option value="Oud" className="bg-[#0a0a0a]">Oud</option>
                            <option value="Mošus" className="bg-[#0a0a0a]">Mošus</option>
                            <option value="Parfem" className="bg-[#0a0a0a]">Parfem</option>
                          </select>
                        </div>
                        <div>
                          <label htmlFor="product_price" className="block text-[10px] uppercase tracking-[0.2em] text-white/50 mb-3">Cijena (KM)</label>
                          <input 
                            id="product_price"
                            required
                            type="number" 
                            step="0.01"
                            value={formData.price}
                            onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})}
                            className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:border-accent transition-colors"
                          />
                        </div>
                        <div>
                          <label htmlFor="product_stock" className="block text-[10px] uppercase tracking-[0.2em] text-white/50 mb-3">Zaliha (Komada)</label>
                          <input 
                            id="product_stock"
                            required
                            type="number" 
                            step="1"
                            min="0"
                            value={formData.stock}
                            onChange={e => setFormData({...formData, stock: parseInt(e.target.value)})}
                            className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:border-accent transition-colors"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="product_description" className="block text-[10px] uppercase tracking-[0.2em] text-white/50 mb-3">Opis</label>
                        <textarea 
                          id="product_description"
                          rows={4}
                          value={formData.description}
                          onChange={e => setFormData({...formData, description: e.target.value})}
                          className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:border-accent transition-colors resize-none"
                          placeholder="Detaljan opis karaktera..."
                        ></textarea>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label htmlFor="product_notes" className="block text-[10px] uppercase tracking-[0.2em] text-white/50 mb-3">Mirisne Note</label>
                          <input 
                            id="product_notes"
                            type="text" 
                            value={formData.notes}
                            onChange={e => setFormData({...formData, notes: e.target.value})}
                            className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:border-accent transition-colors"
                            placeholder="Sandalwood, Rose..."
                          />
                        </div>
                        <div>
                          <label htmlFor="product_intensity" className="block text-[10px] uppercase tracking-[0.2em] text-white/50 mb-3">Intenzitet</label>
                          <select 
                            id="product_intensity"
                            value={formData.intensity}
                            onChange={e => setFormData({...formData, intensity: e.target.value})}
                            className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:border-accent transition-colors appearance-none"
                          >
                            <option value="Blago" className="bg-[#0a0a0a]">Blago</option>
                            <option value="Srednje" className="bg-[#0a0a0a]">Srednje</option>
                            <option value="Jako" className="bg-[#0a0a0a]">Jako</option>
                            <option value="Veoma jako" className="bg-[#0a0a0a]">Veoma jako</option>
                          </select>
                        </div>
                        <div>
                          <label htmlFor="product_occasion" className="block text-[10px] uppercase tracking-[0.2em] text-white/50 mb-3">Prilika</label>
                          <select 
                            id="product_occasion"
                            value={formData.occasion}
                            onChange={e => setFormData({...formData, occasion: e.target.value})}
                            className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:border-accent transition-colors appearance-none"
                          >
                            <option value="Svaki dan" className="bg-[#0a0a0a]">Svaki dan</option>
                            <option value="Večer" className="bg-[#0a0a0a]">Večer</option>
                            <option value="Posebne prilike" className="bg-[#0a0a0a]">Posebne prilike</option>
                            <option value="Sve prilike" className="bg-[#0a0a0a]">Sve prilike</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <label htmlFor="product_image" className="block text-[10px] uppercase tracking-[0.2em] text-white/50 mb-3">Vizual (Upload)</label>
                        <div className={`aspect-[4/5] rounded-2xl border-2 border-dashed ${formData.image_url ? 'border-accent/30 bg-accent/5' : 'border-white/10 bg-black/40'} flex flex-col items-center justify-center p-4 hover:border-accent/50 transition-colors relative overflow-hidden group`}>
                          <input 
                            id="product_image"
                            type="file" 
                            accept="image/*"
                            onChange={handleImageUpload}
                            disabled={uploadingImage}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
                          />
                          
                          {uploadingImage ? (
                            <div className="text-center">
                              <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                              <span className="text-[10px] uppercase tracking-widest text-accent">Upload u toku...</span>
                            </div>
                          ) : formData.image_url ? (
                            <>
                              <img src={formData.image_url} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-30 transition-opacity" />
                              <div className="relative z-0 flex flex-col items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <ImageIcon size={24} className="text-white" />
                                <span className="text-[10px] uppercase tracking-widest bg-black/50 px-3 py-1 rounded-full">Promijeni sliku</span>
                              </div>
                            </>
                          ) : (
                            <div className="text-center flex flex-col items-center gap-3 text-white/40 group-hover:text-accent transition-colors">
                              <ImageIcon size={32} />
                              <span className="text-[10px] uppercase tracking-widest">Klikni za upload</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/5">
                        <div className="relative flex items-center">
                          <input 
                            type="checkbox" 
                            id="featured"
                            checked={formData.is_featured}
                            onChange={e => setFormData({...formData, is_featured: e.target.checked})}
                            className="peer appearance-none w-5 h-5 border border-white/20 rounded bg-black/40 checked:bg-accent checked:border-accent transition-colors cursor-pointer"
                          />
                          <CheckCircle size={14} className="absolute left-[3px] pointer-events-none opacity-0 peer-checked:opacity-100 text-black transition-opacity" />
                        </div>
                        <label htmlFor="featured" className="text-[11px] uppercase tracking-widest cursor-pointer select-none">
                          Prikaži u Hero Sekciji
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="pt-8 border-t border-white/5 flex justify-end gap-4">
                    <button 
                      type="button"
                      onClick={() => dispatch({ isModalOpen: false })}
                      className="px-8 py-3.5 rounded-full uppercase tracking-widest text-[11px] font-bold text-white/60 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      Odustani
                    </button>
                    <button 
                      type="submit"
                      disabled={isSaving || uploadingImage}
                      className="px-8 py-3.5 bg-accent text-black rounded-full uppercase tracking-widest text-[11px] font-bold hover:bg-white transition-colors disabled:opacity-50"
                    >
                      {isSaving ? 'Spremanje...' : 'Spremi Proizvod'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
          )}

          {activeTab === 'landing' && (
            <LandingPageManager 
              heroSlides={heroSlides} 
              pageContent={pageContent} 
              onUpdate={fetchLandingContent} 
            />
          )}

          {activeTab === 'about' && (
            <AboutManager 
              content={pageContent} 
              onUpdate={fetchLandingContent} 
            />
          )}

          {activeTab === 'contact' && (
            <ContactManager 
              content={pageContent} 
              onUpdate={fetchLandingContent} 
            />
          )}
        </div>
      </main>
    </div>
  );
}

function LandingPageManager({ heroSlides, pageContent, onUpdate }: { heroSlides: any[], pageContent: any, onUpdate: () => void }) {
  const [activeSection, setActiveSection] = useState('hero');
  const [saving, setSaving] = useState(false);

  const sections = [
    { id: 'hero', label: 'Hero Slider' },
    { id: 'narrative', label: 'O nama (Header)' },
    { id: 'atelier', label: 'O nama (Kartice)' },
    { id: 'journey', label: 'Scent Journey' },
    { id: 'carousel', label: 'Istaknuti Parfemi (Carousel)' },
    { id: 'footer', label: 'Footer (Podnožje)' },
  ];

  return (
    <div className="space-y-8">
      {/* Section Navigation */}
      <div className="flex gap-4 border-b border-white/10 pb-4">
        {sections.map(section => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeSection === section.id 
                ? 'bg-accent text-black' 
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            {section.label}
          </button>
        ))}
      </div>

      {activeSection === 'hero' && (
        <HeroSliderManager slides={heroSlides} onUpdate={onUpdate} saving={saving} setSaving={setSaving} />
      )}

      {activeSection === 'narrative' && (
        <NarrativeManager content={pageContent} onUpdate={onUpdate} saving={saving} setSaving={setSaving} />
      )}

      {activeSection === 'atelier' && (
        <AtelierManager content={pageContent} onUpdate={onUpdate} saving={saving} setSaving={setSaving} />
      )}

      {activeSection === 'journey' && (
        <ScentJourneyManager content={pageContent} onUpdate={onUpdate} saving={saving} setSaving={setSaving} />
      )}

      {activeSection === 'carousel' && (
        <CarouselManager content={pageContent} onUpdate={onUpdate} saving={saving} setSaving={setSaving} />
      )}

      {activeSection === 'footer' && (
        <FooterManager content={pageContent} onUpdate={onUpdate} saving={saving} setSaving={setSaving} />
      )}
    </div>
  );
}

function HeroSliderManager({ slides, onUpdate, saving, setSaving }: any) {
  // Temporary state for editing before save
  const [editedSlides, setEditedSlides] = useState<any[]>([]);
  const [uploadingImageId, setUploadingImageId] = useState<string | null>(null);

  useEffect(() => {
    if (slides && slides.length > 0) {
      setEditedSlides(JSON.parse(JSON.stringify(slides)));
    }
  }, [slides]);

  const handleSlideChange = (id: string, field: string, value: any) => {
    setEditedSlides(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const handleNotesChange = (id: string, notesStr: string) => {
    const notesArray = notesStr.split(',').map(n => n.trim()).filter(Boolean);
    handleSlideChange(id, 'notes', notesArray);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, slideId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImageId(slideId);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `landing/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images') // Reusing same bucket for simplicity
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('product-images').getPublicUrl(filePath);
      handleSlideChange(slideId, 'image_url', data.publicUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Greška pri uploadu slike.');
    } finally {
      setUploadingImageId(null);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const slide of editedSlides) {
        const { error } = await supabase
          .from('hero_slides')
          .update({
            eyebrow: slide.eyebrow,
            title: slide.title,
            description: slide.description,
            image_url: slide.image_url,
            stat_label: slide.stat_label,
            stat_value: slide.stat_value,
            card_title: slide.card_title,
            card_copy: slide.card_copy,
            notes: slide.notes
          })
          .eq('id', slide.id);
        
        if (error) throw error;
      }
      alert('Hero sekcija uspješno sačuvana!');
      onUpdate();
    } catch (error) {
      console.error('Error saving hero slides:', error);
      alert('Greška pri spašavanju hero sekcije.');
    } finally {
      setSaving(false);
    }
  };

  if (!editedSlides.length) return <div className="text-white/50">Nema hero slajdova u bazi. Pokrenite SQL skriptu.</div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-display text-white">Hero Slider (Početna sekcija)</h2>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-accent text-black px-6 py-2 rounded-xl font-bold uppercase tracking-widest text-xs disabled:opacity-50"
        >
          {saving ? 'Spašavanje...' : 'Sačuvaj Promjene'}
        </button>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {editedSlides.map((slide, index) => (
          <div key={slide.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
            <h3 className="text-accent font-bold mb-4">Slajd {index + 1}</h3>
            
            {/* Image Upload */}
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-white/50">Slika pozadine</label>
              <div className="relative aspect-[4/5] bg-black/40 rounded-xl overflow-hidden group border border-white/10">
                {slide.image_url ? (
                  <img src={slide.image_url} alt="Hero" className="w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ImageIcon className="text-white/20" size={32} />
                  </div>
                )}
                
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <label className="cursor-pointer bg-white text-black px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2">
                    <Upload size={14} />
                    {uploadingImageId === slide.id ? 'Upload...' : 'Promijeni'}
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, slide.id)}
                      disabled={uploadingImageId === slide.id}
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <input
                type="text"
                value={slide.eyebrow}
                onChange={e => handleSlideChange(slide.id, 'eyebrow', e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-accent"
                placeholder="Eyebrow text"
              />
              <textarea
                value={slide.title}
                onChange={e => handleSlideChange(slide.id, 'title', e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white h-20"
                placeholder="Glavni Naslov"
              />
              <textarea
                value={slide.description}
                onChange={e => handleSlideChange(slide.id, 'description', e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/70 h-24"
                placeholder="Opis ispod naslova"
              />
              
              <div className="grid grid-cols-2 gap-2 pt-4 border-t border-white/10">
                <input
                  type="text"
                  value={slide.stat_label}
                  onChange={e => handleSlideChange(slide.id, 'stat_label', e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white/50"
                  placeholder="Stat Label"
                />
                <input
                  type="text"
                  value={slide.stat_value}
                  onChange={e => handleSlideChange(slide.id, 'stat_value', e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
                  placeholder="Stat Value"
                />
              </div>

              <div className="space-y-2 pt-4 border-t border-white/10">
                <label className="text-[10px] uppercase tracking-widest text-white/50">Info Kartica (Desktop)</label>
                <input
                  type="text"
                  value={slide.card_title}
                  onChange={e => handleSlideChange(slide.id, 'card_title', e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                  placeholder="Naslov kartice"
                />
                <textarea
                  value={slide.card_copy}
                  onChange={e => handleSlideChange(slide.id, 'card_copy', e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white/70 h-16"
                  placeholder="Tekst kartice"
                />
                <input
                  type="text"
                  value={slide.notes?.join(', ')}
                  onChange={e => handleNotesChange(slide.id, e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-accent"
                  placeholder="Note (odvojene zarezom)"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ContactManager({ content, onUpdate }: { content: any, onUpdate: () => void }) {
  const [saving, setSaving] = useState(false);
  const [editedContent, setEditedContent] = useState<any>({
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
  });

  useEffect(() => {
    if (content?.contact_content) {
      setEditedContent(content.contact_content);
    }
  }, [content]);

  const handleChange = (field: string, value: string) => {
    setEditedContent((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('page_content')
        .upsert({ id: 'contact_content', content: editedContent });
      
      if (error) throw error;
      alert('Kontakt stranica uspješno sačuvana!');
      onUpdate();
    } catch (error) {
      console.error('Error saving contact content:', error);
      alert('Greška pri spašavanju Kontakt stranice.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-12">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-display text-white">Upravljanje sadržajem: Kontakt</h2>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-accent text-black px-6 py-2 rounded-xl font-bold uppercase tracking-widest text-xs disabled:opacity-50"
        >
          {saving ? 'Spašavanje...' : 'Sačuvaj Promjene'}
        </button>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Header Section */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
          <h3 className="text-accent font-bold mb-4">Naslovni dio</h3>
          
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-white/50">Mali naslov iznad (Eyebrow)</label>
            <input
              type="text"
              value={editedContent.eyebrow || ''}
              onChange={e => handleChange('eyebrow', e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm text-accent focus:border-accent outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-white/50">Glavni Naslov (Prvi red)</label>
            <input
              type="text"
              value={editedContent.title_1 || ''}
              onChange={e => handleChange('title_1', e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:border-accent outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-white/50">Glavni Naslov (Drugi red)</label>
            <input
              type="text"
              value={editedContent.title_2 || ''}
              onChange={e => handleChange('title_2', e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:border-accent outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-white/50">Opisni tekst</label>
            <textarea
              value={editedContent.description || ''}
              onChange={e => handleChange('description', e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm text-white/70 focus:border-accent outline-none h-24"
            />
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
          <h3 className="text-accent font-bold mb-4">Kontakt Informacije</h3>
          
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-white/50">Naslov Adrese</label>
            <input
              type="text"
              value={editedContent.address_label || ''}
              onChange={e => handleChange('address_label', e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:border-accent outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-white/50">Adresa</label>
            <input
              type="text"
              value={editedContent.address || ''}
              onChange={e => handleChange('address', e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:border-accent outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-white/50">Naslov Emaila</label>
            <input
              type="text"
              value={editedContent.email_label || ''}
              onChange={e => handleChange('email_label', e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:border-accent outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-white/50">Email</label>
            <input
              type="email"
              value={editedContent.email || ''}
              onChange={e => handleChange('email', e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:border-accent outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-white/50">Naslov Telefona</label>
            <input
              type="text"
              value={editedContent.phone_label || ''}
              onChange={e => handleChange('phone_label', e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:border-accent outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-white/50">Telefon</label>
            <input
              type="text"
              value={editedContent.phone || ''}
              onChange={e => handleChange('phone', e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:border-accent outline-none"
            />
          </div>
        </div>

        {/* Form Settings */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4 lg:col-span-2 max-w-2xl">
          <h3 className="text-accent font-bold mb-4">Kontakt Forma i Mreže</h3>
          
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-white/50">Naslov Forme</label>
            <input
              type="text"
              value={editedContent.form_title || ''}
              onChange={e => handleChange('form_title', e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:border-accent outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-white/50">Instagram Prikazno Ime</label>
              <input
                type="text"
                value={editedContent.instagram_handle || ''}
                onChange={e => handleChange('instagram_handle', e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:border-accent outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-white/50">Instagram Link (URL)</label>
              <input
                type="url"
                value={editedContent.instagram_url || ''}
                onChange={e => handleChange('instagram_url', e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:border-accent outline-none"
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

function AboutManager({ content, onUpdate }: { content: any, onUpdate: () => void }) {
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState<any>({
    hero: {
      eyebrow: 'Naša Priča',
      title_1: 'Umjetnost',
      title_2: 'Parfimerije',
      description: 'U srcu Tuzle, gdje se susreću istok i zapad, rođena je ideja o parfimeriji koja ne prati prolazne trendove, već stvara trajne uspomene kroz najfinije esencije.'
    },
    story_1: {
      image_url: 'https://picsum.photos/seed/atelier-perfume/1000/1200?grayscale',
      label: '01 / Filozofija',
      title: 'Spori proces, apsolutna posvećenost detaljima.',
      text_1: 'Svaki Al-Attar miris je rezultat stotina sati pažljivog miješanja, maceracije i sazrijevanja. Ne vjerujemo u masovnu produkciju. Vjerujemo u strpljenje potrebno da bi sirovine razvile svoj puni potencijal.',
      text_2: 'Koristimo isključivo najfinije sirovine iz cijelog svijeta - od rijetkog ouda iz Kambodže, senzualnog mošusa, do najčišće ruže iz Taifa. Naš proces duboko poštuje viševjekovnu tradiciju orijentalne parfumerije.'
    },
    story_2: {
      image_url: 'https://picsum.photos/seed/minimal-bottle/1000/1500?grayscale',
      label: '02 / Estetika',
      title: 'Dizajn koji prepušta glavnu riječ mirisu.',
      text_1: 'Vjerujemo u snagu apsolutnog minimalizma. Naše bočice su lišene suvišnih ukrasa, teške i hladne na dodir, dizajnirane kao trezori koji čuvaju dragocjenu esenciju unutar njih.',
      text_2: 'Fokus je isključivo na mirisu - nevidljivom, ali najmoćnijem dodatku koji nosite. Kad zatvorite oči, jedino što ostaje je karakter.'
    },
    location: {
      label: 'Sjedište',
      title: 'Tuzla, Bosna i Hercegovina',
      description: 'Naš atelje se nalazi u srcu Tuzle, gdje pažljivo dizajniramo, miješamo i pakujemo svaki miris prije nego što krene na put do vas.'
    }
  });

  useEffect(() => {
    if (content?.about_content) {
      setEditedContent(content.about_content);
    }
  }, [content]);

  const handleChange = (section: string, field: string, value: string) => {
    setEditedContent((prev: any) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, section: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(section);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `about/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('product-images').getPublicUrl(filePath);
      handleChange(section, 'image_url', data.publicUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Greška pri uploadu slike.');
    } finally {
      setUploadingImage(null);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('page_content')
        .upsert({ id: 'about_content', content: editedContent });
      
      if (error) throw error;
      alert('O nama stranica uspješno sačuvana!');
      onUpdate();
    } catch (error) {
      console.error('Error saving about content:', error);
      alert('Greška pri spašavanju O nama stranice.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-12">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-display text-white">Upravljanje sadržajem: O Nama</h2>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-accent text-black px-6 py-2 rounded-xl font-bold uppercase tracking-widest text-xs disabled:opacity-50"
        >
          {saving ? 'Spašavanje...' : 'Sačuvaj Promjene'}
        </button>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Hero Section */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
          <h3 className="text-accent font-bold mb-4">Hero Sekcija (Vrh stranice)</h3>
          
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-white/50">Mali naslov iznad (Eyebrow)</label>
            <input
              type="text"
              value={editedContent.hero?.eyebrow || ''}
              onChange={e => handleChange('hero', 'eyebrow', e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm text-accent focus:border-accent outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-white/50">Glavni Naslov (Prva Riječ)</label>
            <input
              type="text"
              value={editedContent.hero?.title_1 || ''}
              onChange={e => handleChange('hero', 'title_1', e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:border-accent outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-white/50">Glavni Naslov (Druga Riječ)</label>
            <input
              type="text"
              value={editedContent.hero?.title_2 || ''}
              onChange={e => handleChange('hero', 'title_2', e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:border-accent outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-white/50">Opisni tekst</label>
            <textarea
              value={editedContent.hero?.description || ''}
              onChange={e => handleChange('hero', 'description', e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm text-white/70 focus:border-accent outline-none h-24"
            />
          </div>
        </div>

        {/* Location Section */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
          <h3 className="text-accent font-bold mb-4">Lokacija (Dno stranice)</h3>
          
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-white/50">Oznaka (Label)</label>
            <input
              type="text"
              value={editedContent.location?.label || ''}
              onChange={e => handleChange('location', 'label', e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm text-accent focus:border-accent outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-white/50">Naslov lokacije</label>
            <input
              type="text"
              value={editedContent.location?.title || ''}
              onChange={e => handleChange('location', 'title', e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:border-accent outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-white/50">Opis lokacije</label>
            <textarea
              value={editedContent.location?.description || ''}
              onChange={e => handleChange('location', 'description', e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm text-white/70 focus:border-accent outline-none h-24"
            />
          </div>
        </div>

        {/* Story 1 Section */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
          <h3 className="text-accent font-bold mb-4">Sekcija: Filozofija</h3>
          
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-white/50">Slika</label>
            <div className="relative aspect-[4/5] bg-black/40 rounded-xl overflow-hidden group border border-white/10 max-h-48">
              {editedContent.story_1?.image_url ? (
                <img src={editedContent.story_1.image_url} alt="Story 1" className="w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <ImageIcon className="text-white/20" size={32} />
                </div>
              )}
              
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <label className="cursor-pointer bg-white text-black px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2">
                  <Upload size={14} />
                  {uploadingImage === 'story_1' ? 'Upload...' : 'Promijeni'}
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'story_1')}
                    disabled={uploadingImage === 'story_1'}
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-white/50">Oznaka</label>
            <input
              type="text"
              value={editedContent.story_1?.label || ''}
              onChange={e => handleChange('story_1', 'label', e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm text-accent focus:border-accent outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-white/50">Naslov</label>
            <textarea
              value={editedContent.story_1?.title || ''}
              onChange={e => handleChange('story_1', 'title', e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:border-accent outline-none h-16"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-white/50">Paragraf 1</label>
            <textarea
              value={editedContent.story_1?.text_1 || ''}
              onChange={e => handleChange('story_1', 'text_1', e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-xs text-white/70 focus:border-accent outline-none h-24"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-white/50">Paragraf 2</label>
            <textarea
              value={editedContent.story_1?.text_2 || ''}
              onChange={e => handleChange('story_1', 'text_2', e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-xs text-white/70 focus:border-accent outline-none h-24"
            />
          </div>
        </div>

        {/* Story 2 Section */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
          <h3 className="text-accent font-bold mb-4">Sekcija: Estetika</h3>
          
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-white/50">Slika</label>
            <div className="relative aspect-[4/5] bg-black/40 rounded-xl overflow-hidden group border border-white/10 max-h-48">
              {editedContent.story_2?.image_url ? (
                <img src={editedContent.story_2.image_url} alt="Story 2" className="w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <ImageIcon className="text-white/20" size={32} />
                </div>
              )}
              
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <label className="cursor-pointer bg-white text-black px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2">
                  <Upload size={14} />
                  {uploadingImage === 'story_2' ? 'Upload...' : 'Promijeni'}
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'story_2')}
                    disabled={uploadingImage === 'story_2'}
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-white/50">Oznaka</label>
            <input
              type="text"
              value={editedContent.story_2?.label || ''}
              onChange={e => handleChange('story_2', 'label', e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm text-accent focus:border-accent outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-white/50">Naslov</label>
            <textarea
              value={editedContent.story_2?.title || ''}
              onChange={e => handleChange('story_2', 'title', e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:border-accent outline-none h-16"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-white/50">Paragraf 1</label>
            <textarea
              value={editedContent.story_2?.text_1 || ''}
              onChange={e => handleChange('story_2', 'text_1', e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-xs text-white/70 focus:border-accent outline-none h-24"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-white/50">Paragraf 2</label>
            <textarea
              value={editedContent.story_2?.text_2 || ''}
              onChange={e => handleChange('story_2', 'text_2', e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-xs text-white/70 focus:border-accent outline-none h-24"
            />
          </div>
        </div>

      </div>
    </div>
  );
}

function FooterManager({ content, onUpdate, saving, setSaving }: any) {
  const [editedFooter, setEditedFooter] = useState<any>(content?.footer_content || {});

  useEffect(() => {
    if (content?.footer_content) {
      setEditedFooter(content.footer_content);
    } else {
      setEditedFooter({
        brand_description: 'Luksuzni mirisi inspirisani tradicijom i oblikovani za moderno doba.',
        contact_email: 'info@al-attar.com',
        contact_phone: '+387 61 234 567',
        address: 'Sarajevo, Bosna i Hercegovina',
        instagram_url: 'https://instagram.com',
        facebook_url: 'https://facebook.com',
        tiktok_url: 'https://tiktok.com',
        copyright_text: '© 2024 Al-Attar. Sva prava zadržana.'
      });
    }
  }, [content]);

  const handleChange = (field: string, value: string) => {
    setEditedFooter({ ...editedFooter, [field]: value });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('page_content')
        .upsert({ id: 'footer_content', content: editedFooter });
      
      if (error) throw error;
      alert('Footer uspješno sačuvan!');
      onUpdate();
    } catch (error) {
      console.error('Error saving footer:', error);
      alert('Greška pri spašavanju footera.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-2xl">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-display text-white">Footer (Podnožje stranice)</h2>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-accent text-black px-6 py-2 rounded-xl font-bold uppercase tracking-widest text-xs disabled:opacity-50"
        >
          {saving ? 'Spašavanje...' : 'Sačuvaj Promjene'}
        </button>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6">
        
        <div className="space-y-4 border-b border-white/10 pb-6">
          <h3 className="text-accent font-bold">Brend i Opis</h3>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-white/50">Kratki opis ispod loga</label>
            <textarea
              value={editedFooter.brand_description || ''}
              onChange={e => handleChange('brand_description', e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm text-white/70 focus:border-accent outline-none h-20"
            />
          </div>
        </div>

        <div className="space-y-4 border-b border-white/10 pb-6">
          <h3 className="text-accent font-bold">Kontakt Informacije</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-white/50">Email Adresa</label>
              <input
                type="email"
                value={editedFooter.contact_email || ''}
                onChange={e => handleChange('contact_email', e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:border-accent outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-white/50">Broj Telefona</label>
              <input
                type="text"
                value={editedFooter.contact_phone || ''}
                onChange={e => handleChange('contact_phone', e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:border-accent outline-none"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] uppercase tracking-widest text-white/50">Fizička Adresa / Lokacija</label>
              <input
                type="text"
                value={editedFooter.address || ''}
                onChange={e => handleChange('address', e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:border-accent outline-none"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4 border-b border-white/10 pb-6">
          <h3 className="text-accent font-bold">Društvene Mreže (Linkovi)</h3>
          <div className="space-y-3">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-white/50">Instagram URL</label>
              <input
                type="url"
                value={editedFooter.instagram_url || ''}
                onChange={e => handleChange('instagram_url', e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:border-accent outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-white/50">Facebook URL</label>
              <input
                type="url"
                value={editedFooter.facebook_url || ''}
                onChange={e => handleChange('facebook_url', e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:border-accent outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-white/50">TikTok URL</label>
              <input
                type="url"
                value={editedFooter.tiktok_url || ''}
                onChange={e => handleChange('tiktok_url', e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:border-accent outline-none"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-accent font-bold">Autorska Prava</h3>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-white/50">Copyright Tekst</label>
            <input
              type="text"
              value={editedFooter.copyright_text || ''}
              onChange={e => handleChange('copyright_text', e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:border-accent outline-none"
            />
          </div>
        </div>

      </div>
    </div>
  );
}

function NarrativeManager({ content, onUpdate, saving, setSaving }: any) {
  const [editedHeader, setEditedHeader] = useState<any>(content?.narrative_header || {});

  useEffect(() => {
    if (content?.narrative_header) {
      setEditedHeader(content.narrative_header);
    }
  }, [content]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('page_content')
        .upsert({ id: 'narrative_header', content: editedHeader });
      
      if (error) throw error;
      alert('Narrative sekcija uspješno sačuvana!');
      onUpdate();
    } catch (error) {
      console.error('Error saving narrative:', error);
      alert('Greška pri spašavanju narrative sekcije.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-2xl">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-display text-white">Narrative Sekcija (O nama)</h2>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-accent text-black px-6 py-2 rounded-xl font-bold uppercase tracking-widest text-xs disabled:opacity-50"
        >
          {saving ? 'Spašavanje...' : 'Sačuvaj Promjene'}
        </button>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-widest text-white/50">Mali naslov iznad (Eyebrow)</label>
          <input
            type="text"
            value={editedHeader.eyebrow || ''}
            onChange={e => setEditedHeader({...editedHeader, eyebrow: e.target.value})}
            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm text-accent focus:border-accent outline-none"
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-widest text-white/50">Glavni naslov</label>
          <textarea
            value={editedHeader.title || ''}
            onChange={e => setEditedHeader({...editedHeader, title: e.target.value})}
            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-lg text-white focus:border-accent outline-none h-24"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-widest text-white/50">Opisni tekst</label>
          <textarea
            value={editedHeader.description || ''}
            onChange={e => setEditedHeader({...editedHeader, description: e.target.value})}
            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm text-white/70 focus:border-accent outline-none h-32"
          />
        </div>
      </div>
    </div>
  );
}

function AtelierManager({ content, onUpdate, saving, setSaving }: any) {
  const [editedCards, setEditedCards] = useState<any[]>([]);

  useEffect(() => {
    if (content?.atelier_details) {
      setEditedCards(content.atelier_details);
    } else {
      // Default fallback structure
      setEditedCards([
        { label: '', title: '', description: '' },
        { label: '', title: '', description: '' },
        { label: '', title: '', description: '' }
      ]);
    }
  }, [content]);

  const handleCardChange = (index: number, field: string, value: string) => {
    const newCards = [...editedCards];
    newCards[index] = { ...newCards[index], [field]: value };
    setEditedCards(newCards);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('page_content')
        .upsert({ id: 'atelier_details', content: editedCards });
      
      if (error) throw error;
      alert('Kartice uspješno sačuvane!');
      onUpdate();
    } catch (error) {
      console.error('Error saving atelier cards:', error);
      alert('Greška pri spašavanju kartica.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-display text-white">O nama (Informacijske kartice)</h2>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-accent text-black px-6 py-2 rounded-xl font-bold uppercase tracking-widest text-xs disabled:opacity-50"
        >
          {saving ? 'Spašavanje...' : 'Sačuvaj Promjene'}
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {editedCards.map((card, index) => (
          <div key={index} className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
            <h3 className="text-accent font-bold mb-4">Kartica {index + 1}</h3>
            
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-white/50">Mali naslov (Label)</label>
              <input
                type="text"
                value={card.label || ''}
                onChange={e => handleCardChange(index, 'label', e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-sm text-accent focus:border-accent outline-none"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-white/50">Glavni naslov</label>
              <textarea
                value={card.title || ''}
                onChange={e => handleCardChange(index, 'title', e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:border-accent outline-none h-20"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-white/50">Opis</label>
              <textarea
                value={card.description || ''}
                onChange={e => handleCardChange(index, 'description', e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-xs text-white/70 focus:border-accent outline-none h-28"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ScentJourneyManager({ content, onUpdate, saving, setSaving }: any) {
  const [editedJourney, setEditedJourney] = useState<any[]>([]);

  useEffect(() => {
    if (content?.scent_journey) {
      setEditedJourney(content.scent_journey);
    } else {
      setEditedJourney([
        { phase: 'Otvaranje', notes: '', description: '' },
        { phase: 'Srce', notes: '', description: '' },
        { phase: 'Trag', notes: '', description: '' }
      ]);
    }
  }, [content]);

  const handleJourneyChange = (index: number, field: string, value: string) => {
    const newJourney = [...editedJourney];
    newJourney[index] = { ...newJourney[index], [field]: value };
    setEditedJourney(newJourney);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('page_content')
        .upsert({ id: 'scent_journey', content: editedJourney });
      
      if (error) throw error;
      alert('Scent Journey uspješno sačuvan!');
      onUpdate();
    } catch (error) {
      console.error('Error saving journey:', error);
      alert('Greška pri spašavanju.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-display text-white">Scent Journey (Piramida mirisa)</h2>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-accent text-black px-6 py-2 rounded-xl font-bold uppercase tracking-widest text-xs disabled:opacity-50"
        >
          {saving ? 'Spašavanje...' : 'Sačuvaj Promjene'}
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {editedJourney.map((step, index) => (
          <div key={index} className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
            <h3 className="text-accent font-bold mb-4">Sloj {index + 1} ({step.phase})</h3>
            
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-white/50">Ime faze</label>
              <input
                type="text"
                value={step.phase || ''}
                onChange={e => handleJourneyChange(index, 'phase', e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-sm text-accent focus:border-accent outline-none"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-white/50">Note (Veliki naslov)</label>
              <textarea
                value={step.notes || ''}
                onChange={e => handleJourneyChange(index, 'notes', e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-lg font-display text-white focus:border-accent outline-none h-24"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-white/50">Opis</label>
              <textarea
                value={step.description || ''}
                onChange={e => handleJourneyChange(index, 'description', e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-xs text-white/70 focus:border-accent outline-none h-28"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CarouselManager({ content, onUpdate, saving, setSaving }: any) {
  const [editedHeader, setEditedHeader] = useState<any>(content?.carousel_header || {});
  const [editedCards, setEditedCards] = useState<any[]>([]);
  const [uploadingImageId, setUploadingImageId] = useState<number | null>(null);

  useEffect(() => {
    if (content?.carousel_header) {
      setEditedHeader(content.carousel_header);
    } else {
      setEditedHeader({
        eyebrow: 'Signature kolekcija',
        title: 'Mirisi koji definišu karakter i ostavljaju neizbrisiv trag.',
        description: 'Svaka kreacija je pažljivo balansirana da pruži jedinstveno iskustvo, od prvog dodira sa kožom do dugotrajnog traga.'
      });
    }

    if (content?.carousel_cards) {
      setEditedCards(content.carousel_cards);
    } else {
      setEditedCards([
        { title: 'Crni Oud', subtitle: 'Večernji potpis', description: 'Dubok, dimljen i gotovo filmski. Kompozicija koja ostavlja trag.', notes: 'Oud, Tamjan, Koža', accent: 'Atelier izbor', url: 'https://picsum.photos/seed/oud/1200/1400?grayscale', link: '/product/1' },
        { title: 'Bijeli Mošus', subtitle: 'Čistoća sa karakterom', description: 'Minimalistički i svilenkast miris za svakodnevni luksuz.', notes: 'Mošus, Ruža', accent: 'Tihi potpis', url: 'https://picsum.photos/seed/musk/1000/1200?grayscale', link: '/product/2' },
        { title: 'Ponoćna Ruža', subtitle: 'Baršunasta dramatičnost', description: 'Cvjetna kompozicija sa tamnom dubinom koja ostaje elegantna.', notes: 'Damask Ruža, Pačuli', accent: 'Noćna edicija', url: 'https://picsum.photos/seed/rose/1000/1200?grayscale', link: '/product/3' }
      ]);
    }
  }, [content]);

  const handleCardChange = (index: number, field: string, value: string) => {
    const newCards = [...editedCards];
    newCards[index] = { ...newCards[index], [field]: value };
    setEditedCards(newCards);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImageId(index);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `landing/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('product-images').getPublicUrl(filePath);
      handleCardChange(index, 'url', data.publicUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Greška pri uploadu slike.');
    } finally {
      setUploadingImageId(null);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error: headerError } = await supabase
        .from('page_content')
        .upsert({ id: 'carousel_header', content: editedHeader });
      
      if (headerError) throw headerError;

      const { error: cardsError } = await supabase
        .from('page_content')
        .upsert({ id: 'carousel_cards', content: editedCards });

      if (cardsError) throw cardsError;

      alert('Carousel sekcija uspješno sačuvana!');
      onUpdate();
    } catch (error) {
      console.error('Error saving carousel:', error);
      alert('Greška pri spašavanju carousel sekcije.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-12">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-display text-white">Istaknuti Parfemi (Horizontalni Slider)</h2>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-accent text-black px-6 py-2 rounded-xl font-bold uppercase tracking-widest text-xs disabled:opacity-50"
        >
          {saving ? 'Spašavanje...' : 'Sačuvaj Promjene'}
        </button>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4 max-w-2xl">
        <h3 className="text-accent font-bold mb-4">Glavni naslov sekcije</h3>
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-widest text-white/50">Mali naslov iznad (Eyebrow)</label>
          <input
            type="text"
            value={editedHeader.eyebrow || ''}
            onChange={e => setEditedHeader({...editedHeader, eyebrow: e.target.value})}
            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm text-accent focus:border-accent outline-none"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-widest text-white/50">Glavni naslov</label>
          <textarea
            value={editedHeader.title || ''}
            onChange={e => setEditedHeader({...editedHeader, title: e.target.value})}
            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-lg text-white focus:border-accent outline-none h-24"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-widest text-white/50">Opisni tekst</label>
          <textarea
            value={editedHeader.description || ''}
            onChange={e => setEditedHeader({...editedHeader, description: e.target.value})}
            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm text-white/70 focus:border-accent outline-none h-24"
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {editedCards.map((card, index) => (
          <div key={index} className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
            <h3 className="text-accent font-bold mb-4">Parfem {index + 1}</h3>
            
            {/* Image Upload */}
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-white/50">Slika parfema</label>
              <div className="relative aspect-[3/4] bg-black/40 rounded-xl overflow-hidden group border border-white/10">
                {card.url ? (
                  <img src={card.url} alt="Carousel item" className="w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ImageIcon className="text-white/20" size={32} />
                  </div>
                )}
                
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <label className="cursor-pointer bg-white text-black px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2">
                    <Upload size={14} />
                    {uploadingImageId === index ? 'Upload...' : 'Promijeni'}
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, index)}
                      disabled={uploadingImageId === index}
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-white/50">Oznaka (Badge)</label>
                  <input
                    type="text"
                    value={card.accent || ''}
                    onChange={e => handleCardChange(index, 'accent', e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-accent"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-white/50">Link (/product/ID)</label>
                  <input
                    type="text"
                    value={card.link || ''}
                    onChange={e => handleCardChange(index, 'link', e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-white/50">Naslov parfema</label>
                <input
                  type="text"
                  value={card.title || ''}
                  onChange={e => handleCardChange(index, 'title', e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-white/50">Podnaslov</label>
                <input
                  type="text"
                  value={card.subtitle || ''}
                  onChange={e => handleCardChange(index, 'subtitle', e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white/70"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-white/50">Opis</label>
                <textarea
                  value={card.description || ''}
                  onChange={e => handleCardChange(index, 'description', e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white/70 h-20"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-white/50">Note (Zarezom odvojene)</label>
                <input
                  type="text"
                  value={card.notes || ''}
                  onChange={e => handleCardChange(index, 'notes', e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white/50"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
