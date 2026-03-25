import { useState, useEffect, useReducer } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Package, ShoppingBag, CheckCircle, Clock, Truck, Plus, Edit2, Trash2, X, Image as ImageIcon, LayoutDashboard, LogOut, ChevronRight, Settings, Lock } from 'lucide-react';
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

  const { orders, products, loading, activeTab, isModalOpen, editingProduct, isSaving, uploadingImage, formData } = state;

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
    await Promise.all([fetchOrders(), fetchProducts()]);
    dispatch({ loading: false });
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

        <div className="p-10">

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
        </div>
      </main>
    </div>
  );
}
