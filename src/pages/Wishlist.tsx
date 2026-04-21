import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Product } from '@/types';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { Heart, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageLoader } from '@/components/ui/loaders';

export function Wishlist() {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchWishlist();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  async function fetchWishlist() {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('wishlists')
        .select('product_id, products(*)')
        .eq('user_id', user!.id);
      
      if (error) throw error;
      setWishlist(data.map((item: any) => item.products));
    } catch (error: any) {
      toast.error('Failed to load wishlist: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function removeFromWishlist(productId: string) {
    try {
      const { error } = await supabase
        .from('wishlists')
        .delete()
        .eq('user_id', user!.id)
        .eq('product_id', productId);
      
      if (error) throw error;
      setWishlist(prev => prev.filter(p => p.id !== productId));
      toast.success('Removed from wishlist');
    } catch (error: any) {
      toast.error('Failed to remove: ' + error.message);
    }
  }

  if (isLoading) return <PageLoader />;

  return (
    <div className="pt-32 pb-20 px-6 bg-background min-h-screen">
      <div className="max-w-7xl mx-auto space-y-12">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tighter uppercase text-glow">Your Wishlist</h1>
        
        {wishlist.length === 0 ? (
          <p className="text-xl text-muted-foreground">Your wishlist is currently empty.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <AnimatePresence>
              {wishlist.map(product => (
                <motion.div key={product.id} layout exit={{ opacity: 0, scale: 0.9 }} className="glass-card rounded-lg overflow-hidden flex flex-col">
                  <img src={product.image_url} alt={product.name} className="aspect-[3/4] object-cover" />
                  <div className="p-4 flex justify-between items-center">
                    <h3 className="font-bold">{product.name}</h3>
                    <Button variant="ghost" size="icon" onClick={() => removeFromWishlist(product.id)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
