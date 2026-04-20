import { motion } from 'motion/react';
import { ArrowRight, Star, Heart, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { HeroCarousel } from '@/components/sections/HeroCarousel';
import { BabylonCrochetViewer } from '@/components/Three/BabylonCrochetViewer';
import { CustomerReviews, ContactSection, WhatsAppFloat } from '@/components/sections/SocialSections';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, isConfigured } from '@/lib/supabase';
import { Product } from '@/types';

export function Home() {
  const { isCollector } = useAuth();
  const [featured, setFeatured] = useState<Product[]>([]);

  useEffect(() => {
    if (!isConfigured) {
      console.warn('Supabase not configured. Skipping data fetch in Home.');
      return;
    }
    fetchFeatured();
    
    // Subscribe to changes in the products table
    const channel = supabase
      .channel('featured-products-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        fetchFeatured();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function fetchFeatured() {
    let data: Product[] = [];
    
    try {
      const { data: supabaseData, error } = await supabase.from('products').select('*').eq('is_featured', true).limit(3);
      if (error) throw error;
      if (supabaseData) data = supabaseData;
    } catch (error: any) {
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        console.warn('Network connection to Supabase failed. Please check your VITE_SUPABASE_URL configuration.');
      } else {
        console.error('Home load error:', error);
      }
    }
    
    setFeatured(data);
  }

  const mainFeatured = featured[0];
  const sideFeatured = featured.slice(1);
  return (
    <div className="pt-24 pb-20 overflow-x-hidden">
      {/* Full Width Hero Carousel */}
      <section className="w-full mb-24">
        <div className="w-full liquid-refraction">
          <HeroCarousel />
        </div>
      </section>

      <div className="max-w-7xl mx-auto space-y-24 px-6 text-foreground">
        {/* Categories Grid */}
        <section className="grid md:grid-cols-3 gap-8">
          {[
            { name: 'Fashion', icon: TrendingUp, color: 'bg-secondary/10' },
            { name: 'Pattern Designs', icon: Star, color: 'bg-secondary/10' },
            { name: 'Accessories', icon: Heart, color: 'bg-secondary/10' },
          ].map((cat, i) => (
            <motion.div
              key={cat.name}
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="glass-card kfc-card-accent p-10 rounded-lg group cursor-pointer relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 blur-[60px] rounded-full -mr-16 -mt-16 group-hover:bg-secondary/20 transition-all" />
              <div className={`w-16 h-16 rounded-lg ${cat.color} flex items-center justify-center mb-8 border border-secondary/20 group-hover:scale-110 group-hover:border-secondary/40 transition-all duration-500`}>
                <cat.icon className="w-8 h-8 text-secondary shadow-[0_0_15px_rgba(255,0,0,0.4)]" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold mb-4 tracking-tighter uppercase">{cat.name}</h3>
              <p className="text-muted-foreground leading-relaxed mb-8 text-base md:text-lg font-medium">
                Explore our curated selection of bespoke {cat.name.toLowerCase()} pieces.
              </p>
              <div className="flex items-center gap-3 text-sm font-bold tracking-[0.2em] uppercase text-secondary group-hover:gap-5 transition-all">
                Explore {cat.name} <ArrowRight className="w-5 h-5" />
              </div>
            </motion.div>
          ))}
        </section>

        {/* 3D Conceptual Design Section - Updated to Babylon.js */}
        <section className="glass-card rounded-lg overflow-hidden p-12 md:p-20 relative">
          <div className="absolute inset-0 bg-secondary/5 -z-10" />
          <div className="grid md:grid-cols-2 gap-20 items-center">
            <div className="space-y-8 relative z-10">
              <Badge className="bg-secondary/10 text-secondary border-secondary/30 font-bold px-4 py-2 text-sm tracking-widest uppercase mb-4">
                Artisanal Fiber Precision
              </Badge>
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tighter leading-[0.85] text-glow uppercase">
                Designing in <span className="text-secondary italic">Every Stitch.</span>
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground font-medium leading-relaxed max-w-lg">
                Brenda's designs are visualized with high-density "Yarn Particle" systems and clustered lighting to showcase the intricate, unique texture of every fiber interaction.
              </p>
              <div className="flex gap-6">
                <Button className="rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/90 h-14 px-10 font-bold text-lg shadow-[0_10px_25px_rgba(255,0,0,0.2)]">
                  Explore Fiber Math
                </Button>
                <Button variant="outline" className="rounded-full border-black/10 glass-panel hover:bg-black/5 h-14 px-10 font-bold text-lg text-foreground">
                  View Source Mode
                </Button>
              </div>
            </div>
            
            <div className="h-[500px] md:h-[600px] relative rounded-lg overflow-hidden bg-black/5 backdrop-blur-sm">
              <div className="absolute inset-0 bg-secondary/10 blur-[120px] rounded-full animate-pulse" />
              <BabylonCrochetViewer />
            </div>
          </div>
        </section>

        {/* Redone Featured Section: Cinematic Lookbook */}
        <section className="space-y-16">
          <div className="flex flex-col md:flex-row items-end justify-between border-b border-black/5 pb-8 gap-6">
            <div className="space-y-4">
              <h2 className="text-3xl md:text-5xl lg:text-5xl font-extrabold tracking-tighter text-glow text-foreground uppercase leading-[0.85]">
                Curated<br />Highlights
              </h2>
              <p className="text-muted-foreground text-lg md:text-xl font-medium italic max-w-md">
                Handpicked items that define the artisanal spirit of Brenda's signature style.
              </p>
            </div>
            <Link to="/shop">
              <Button variant="link" className="text-secondary font-bold h-auto p-0 hover:no-underline hover:text-secondary/70 text-lg uppercase tracking-widest flex items-center gap-2 group">
                The Full Collection <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-12 gap-8 items-stretch">
            {/* Main Showcase Item */}
            {mainFeatured ? (
              <motion.div 
                className="md:col-span-7 glass-card kfc-card-accent group rounded-lg overflow-hidden flex flex-col pl-1.5"
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <div className="aspect-[16/10] overflow-hidden relative">
                  <div className="absolute inset-0 bg-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none" />
                  <Badge className="absolute top-8 left-8 bg-secondary/20 backdrop-blur-xl border border-secondary/40 text-secondary font-bold px-4 py-2 z-20 text-xs tracking-widest uppercase">
                    Exhibition Choice
                  </Badge>
                  <img 
                    src={mainFeatured.image_url} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                    alt={mainFeatured.name}
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />
                </div>
                <div className="p-10 md:p-14 space-y-10 flex-1 flex flex-col justify-between">
                  <div className="space-y-6">
                    <div className="flex justify-between items-start">
                      <h4 className="font-extrabold text-foreground text-2xl md:text-4xl lg:text-4xl tracking-tighter uppercase leading-none">
                        {mainFeatured.name}
                      </h4>
                      <span className="font-bold text-3xl md:text-5xl text-secondary tabular-nums">Ksh {Number(mainFeatured.price).toLocaleString()}</span>
                    </div>
                    <div className="flex flex-wrap gap-4">
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] px-4 py-2 bg-black/5 rounded-full border border-black/5">Artisanal Choice</span>
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] px-4 py-2 bg-black/5 rounded-full border border-black/5">{mainFeatured.category}</span>
                    </div>
                  </div>
                  <Link to={`/shop`}>
                    <Button className="w-full rounded-full border border-secondary/30 glass-interactive hover:bg-secondary text-secondary hover:text-white h-16 md:h-20 font-bold text-xl md:text-2xl group shadow-sm hover:shadow-secondary/20 transition-all uppercase tracking-widest gap-4">
                      Secure This Piece <ArrowRight className="w-6 h-6 group-hover:translate-x-3 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ) : (
              <div className="md:col-span-12 p-20 text-center glass-panel rounded-lg text-muted-foreground italic">
                No highlights currently curated by the studio.
              </div>
            )}

            {/* Smaller Grid Column */}
            {sideFeatured.length > 0 && (
              <div className="md:col-span-5 grid gap-8">
                {sideFeatured.map((item, i) => (
                  <motion.div 
                    key={i} 
                    className="glass-card kfc-card-accent group rounded-lg overflow-hidden flex flex-col pl-1.5"
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.2 }}
                  >
                    <div className="flex-1 flex flex-col md:flex-row">
                      <div className="w-full md:w-1/2 aspect-square md:aspect-auto overflow-hidden relative">
                        <img 
                          src={item.image_url} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          alt={item.name}
                          referrerPolicy="no-referrer"
                          loading="lazy"
                        />
                      </div>
                      <div className="w-full md:w-1/2 p-10 flex flex-col justify-between space-y-6">
                        <div className="space-y-2">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest italic">Featured</p>
                          <h4 className="font-bold text-foreground text-2xl tracking-tighter uppercase leading-tight">{item.name}</h4>
                          <span className="font-bold text-xl text-secondary">Ksh {Number(item.price).toLocaleString()}</span>
                        </div>
                        <Link to={`/shop`}>
                          <Button className="w-full rounded-full border border-secondary/20 glass-interactive hover:bg-secondary text-secondary hover:text-white h-12 font-bold text-sm group shadow-sm transition-all uppercase tracking-widest">
                            Quick View
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* New Social Proof & Contact Sections */}
        <CustomerReviews />
        <ContactSection />

        {/* Guest Nudge Section */}
        {!isCollector && (
          <section className="py-24">
            <div className="glass-card rounded-lg p-12 md:p-24 text-center space-y-10 relative overflow-hidden bg-black text-white">
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 via-transparent to-transparent opacity-50" />
              <div className="relative z-10 space-y-6">
                <Badge className="bg-secondary text-white border-none font-bold px-4 py-2 text-xs tracking-widest uppercase mb-4">
                  Collector Program
                </Badge>
                <h2 className="text-4xl md:text-7xl font-bold tracking-tighter leading-none uppercase italic">
                  From Window Shopper<br />to <span className="text-secondary not-italic">Digital Collector.</span>
                </h2>
                <p className="text-xl text-white/60 font-medium italic max-w-2xl mx-auto">
                  Unlock the "Virtual Closet," store your Measurement Profile, and track your handcrafted pieces stitch-by-stitch.
                </p>
                <div className="pt-8">
                  <Link to="/auth">
                    <Button className="rounded-full bg-white text-black hover:bg-white/90 h-16 px-12 font-bold text-xl shadow-[0_0_40px_rgba(255,255,255,0.2)]">
                      Create Your Studio Profile
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
      
      {/* Floating Action */}
      <WhatsAppFloat />
    </div>
  );
}
