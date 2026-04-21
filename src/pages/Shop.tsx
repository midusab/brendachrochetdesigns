import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Crown, ShoppingBag, Search, Filter, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Product } from '@/types';
import { supabase, isConfigured } from '@/lib/supabase';

const CATEGORIES = ['ALL', 'FASHION', 'ACCESSORIES', 'PATTERNS', 'EXCLUSIVES'] as const;

export function Shop() {
  const { user, isMuse } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<typeof CATEGORIES[number]>('ALL');
  const [search, setSearch] = useState('');

  async function toggleWishlist(productId: string) {
    if (!user) {
      toast.error('Please login to add to wishlist');
      return;
    }
    try {
      const { data, error: checkError } = await supabase
        .from('wishlists')
        .select('id')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .maybeSingle();
      
      if (checkError) throw checkError;

      if (data) {
        // Remove
        await supabase.from('wishlists').delete().eq('id', data.id);
        toast.success('Removed from wishlist');
      } else {
        // Add
        await supabase.from('wishlists').insert({ user_id: user.id, product_id: productId });
        toast.success('Added to wishlist');
      }
    } catch (error: any) {
      toast.error('Failed to update wishlist: ' + error.message);
    }
  }

  useEffect(() => {
    if (!isConfigured) {
      console.warn('Supabase not configured. Skipping data fetch in Shop.');
      setLoading(false);
      return;
    }
    fetchProducts();
    
    // Subscribe to changes in the products table
    const channel = supabase
      .channel('products-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        fetchProducts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function fetchProducts() {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      if (data && data.length > 0) {
        setProducts(data);
      } else {
        setProducts([]);
      }
    } catch (error: any) {
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        console.warn('Network connection to Supabase failed. Please check your VITE_SUPABASE_URL configuration.');
      } else {
        toast.error('Failed to load products: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  const filteredProducts = products.filter(p => {
    // Only Muses see "Exclusives" (simulated by looking at price/description or specific tag)
    const isExclusive = p.name.includes('Primal') || p.description.includes('Exclusive');
    if (isExclusive && !isMuse) return false;
    
    const matchesFilter = filter === 'ALL' || p.category === filter || (filter === 'EXCLUSIVES' && isExclusive);
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const availableCategories = CATEGORIES.filter(cat => cat !== 'EXCLUSIVES' || isMuse);

  return (
    <div className="pt-32 pb-20 px-6 bg-background">
      <div className="max-w-7xl mx-auto space-y-12">
        <header className="space-y-6">
          <div className="flex justify-between items-end">
            <h1 className="text-4xl md:text-5xl lg:text-5xl font-bold tracking-tighter leading-none text-glow text-foreground uppercase">The Collection</h1>
            {isMuse && (
              <Badge className="bg-secondary/10 text-secondary border-secondary/20 font-bold px-4 py-2 text-xs tracking-widest uppercase mb-2 animate-pulse flex items-center gap-2">
                <Crown className="w-4 h-4" /> Muse Access Active
              </Badge>
            )}
          </div>
          
          <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search designs..." 
                className="pl-11 rounded-full border-black/5 glass-panel h-12 text-foreground font-medium"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <Tabs defaultValue="ALL" onValueChange={(v) => setFilter(v as any)} className="w-full md:w-auto">
              <TabsList className="glass-panel p-1.5 rounded-full gap-2 border-black/5 h-14 bg-white/40">
                {availableCategories.map(cat => (
                  <TabsTrigger 
                    key={cat} 
                    value={cat} 
                    className="rounded-full px-6 md:px-8 h-full data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground transition-all font-bold tracking-[0.1em] text-[10px] md:text-xs uppercase text-foreground/60"
                  >
                    {cat === 'EXCLUSIVES' && <Crown className="w-3 h-3 mr-2" />}
                    {cat}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </header>

        <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredProducts.map((product) => (
              <motion.div
                layout
                key={product.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="glass-card kfc-card-accent group flex flex-col rounded-lg overflow-hidden pl-1.5"
              >
                <div className="aspect-[3/4] overflow-hidden relative">
                  <div className="absolute inset-0 bg-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none" />
                  <img 
                    src={product.image_url} 
                    className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-500 ease-out cursor-zoom-in"
                    alt={product.name}
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {product.is_featured && (
                      <Badge className="bg-secondary/20 backdrop-blur-md border border-secondary/40 text-secondary font-bold px-3 py-1">
                        FEATURED
                      </Badge>
                    )}
                    {(product.name.includes('Primal') || product.description.includes('Exclusive')) && (
                      <Badge className="bg-black/80 backdrop-blur-md border border-white/20 text-white font-bold px-3 py-1 flex items-center gap-1">
                        <Crown className="w-3 h-3" /> EXCLUSIVE
                      </Badge>
                    )}
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute top-2 right-2 rounded-full glass-panel hover:bg-white/20 z-20"
                    onClick={() => toggleWishlist(product.id)}
                  >
                    <Heart className="w-5 h-5 text-secondary" />
                  </Button>
                </div>
                <div className="p-8 md:p-10 flex-1 flex flex-col justify-between space-y-8">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-bold text-lg md:text-2xl tracking-tighter leading-tight text-foreground uppercase">{product.name}</h3>
                      <span className="font-bold text-2xl md:text-3xl text-secondary">Ksh {Number(product.price).toLocaleString()}</span>
                    </div>
                    <p className="text-muted-foreground text-sm md:text-base font-medium line-clamp-2 leading-relaxed">{product.description}</p>
                  </div>
                  <Button className="w-full rounded-full border border-secondary/30 glass-interactive hover:bg-secondary text-secondary hover:text-white gap-3 h-14 md:h-16 font-bold text-lg md:text-xl group shadow-sm hover:shadow-secondary/20 transition-all">
                    <ShoppingBag className="w-5 h-5 transition-transform group-hover:scale-110" /> Add to Cart
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </section>

        {!loading && filteredProducts.length === 0 && (
          <div className="text-center py-20 glass-panel rounded-lg border-black/5">
            <p className="text-muted-foreground text-lg">No designs found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
