import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, MessageSquare, Quote, Send, MapPin, Phone, Mail, Instagram, Facebook, Twitter, MessageCircle, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { supabase, isConfigured } from '@/lib/supabase';

const reviews = [
  {
    id: 1,
    name: "Elena Richardson",
    role: "Fashion Curator",
    content: "The level of intricate detail in Brenda's crochet work is unprecedented. It's not just fashion; it's wearable sculpture.",
    rating: 5,
    image: "https://picsum.photos/seed/curator1/100/100"
  },
  {
    id: 2,
    name: "Marcus Vane",
    role: "Private Collector",
    content: "I commissioned a bespoke shawl for a gallery opening. The sustainability of the fibers and the craftsmanship were beyond expectation.",
    rating: 5,
    image: "https://picsum.photos/seed/collector1/100/100"
  },
  {
    id: 3,
    name: "Sarah Jenkins",
    role: "Sustainability Advocate",
    content: "Seeing traditional Kenyan techniques elevated to this level of luxury while maintaining ethical sourcing is truly inspiring.",
    rating: 5,
    image: "https://picsum.photos/seed/advocate1/100/100"
  }
];

export function WhatsAppFloat() {
  return (
    <motion.a
      href="https://wa.me/254700000000"
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1 }}
      className="fixed bottom-8 right-8 z-[100] bg-[#25D366] text-white p-4 rounded-full shadow-2xl flex items-center justify-center hover:bg-[#128C7E] transition-colors"
      style={{ filter: 'drop-shadow(0 0 15px rgba(37, 211, 102, 0.4))' }}
    >
      <MessageCircle className="w-6 h-6 fill-current" />
      <span className="sr-only">Chat on WhatsApp</span>
    </motion.a>
  );
}

export function CustomerReviews() {
  return (
    <section className="py-24 max-w-7xl mx-auto px-6 space-y-16">
      <div className="text-center space-y-4">
        <h2 className="text-3xl md:text-5xl lg:text-5xl font-bold tracking-tighter text-glow text-foreground uppercase leading-none">
          Voice of the Collective
        </h2>
        <p className="text-lg md:text-xl font-medium italic text-muted-foreground">Stories from those who wear the art.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {reviews.map((review, index) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="glass-card border-black/5 rounded-lg p-8 h-full flex flex-col justify-between hover:border-secondary/20 transition-all duration-700">
              <div className="space-y-6">
                <div className="flex gap-1">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-secondary text-secondary" />
                  ))}
                </div>
                <div className="relative">
                  <Quote className="absolute -top-4 -left-4 w-12 h-12 text-secondary/10 -z-10" />
                  <p className="text-lg font-medium italic leading-relaxed text-foreground/80">
                    "{review.content}"
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 mt-8 pt-6 border-t border-black/5">
                <img 
                  src={review.image} 
                  alt={review.name} 
                  className="w-12 h-12 rounded-full border border-black/5 object-cover"
                />
                <div>
                  <h4 className="font-bold text-foreground">{review.name}</h4>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{review.role}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

export function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Full identity is required';
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Digital reach is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Indicate a valid digital reach (email)';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Please share your vision or request';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      if (!isConfigured) {
        throw new Error('Database not configured. Cannot save inquiry.');
      }
      const { error } = await supabase.from('inquiries').insert([{
        customer_name: formData.name,
        customer_email: formData.email,
        message: formData.message,
        status: 'PENDING'
      }]);
      if (error) throw error;
      
      setIsSuccess(true);
      toast.success('Your message has been woven into our queue.');
      setFormData({ name: '', email: '', message: '' });
    } catch (error: any) {
      console.error('Inquiry submission failed:', error);
      toast.error('Sync failed: ' + (error.message || 'Unknown error'));
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setIsSuccess(false), 5000);
    }
  };

  return (
    <section className="py-24 max-w-7xl mx-auto px-6" id="contact">
      <div className="glass-card border-black/5 rounded-lg overflow-hidden grid lg:grid-cols-2">
        <div className="p-12 md:p-20 space-y-12">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tighter text-glow text-foreground leading-[0.85] uppercase">
              Begin a<br />Conversation
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground italic font-medium leading-relaxed tracking-tight">
              For bespoke commissions, press inquiries, or collaboration proposals, 
              our studio is ready to listen.
            </p>
          </div>

          <div className="grid gap-8">
            <div className="flex items-center gap-6 group">
              <div className="p-4 bg-secondary/10 rounded-lg group-hover:scale-110 transition-transform">
                <MapPin className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em] mb-1">Our Studio</p>
                <p className="text-lg font-bold text-foreground">Lavington, Nairobi, Kenya</p>
              </div>
            </div>

            <div className="flex items-center gap-6 group">
              <div className="p-4 bg-secondary/10 rounded-lg group-hover:scale-110 transition-transform">
                <Mail className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em] mb-1">Email Us</p>
                <p className="text-lg font-bold text-foreground">studio@brendadesigns.com</p>
              </div>
            </div>

            <div className="flex items-center gap-6 group">
              <div className="p-4 bg-secondary/10 rounded-lg group-hover:scale-110 transition-transform">
                <Instagram className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em] mb-1">Follow Our Process</p>
                <p className="text-lg font-bold text-foreground">@brenda_crochet_art</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-black/5 p-12 md:p-20 flex flex-col justify-center border-l border-black/5 relative">
          <AnimatePresence>
            {isSuccess ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute inset-0 bg-white/40 backdrop-blur-3xl z-20 flex flex-col items-center justify-center text-center p-12"
              >
                <div className="p-4 bg-green-500/10 rounded-full mb-6">
                  <CheckCircle2 className="w-12 h-12 text-green-500" />
                </div>
                <h3 className="text-3xl font-bold text-foreground mb-2">Message Sent</h3>
                <p className="text-muted-foreground font-medium">We'll reach out across the thread shortly.</p>
                <Button variant="link" className="mt-8 text-secondary font-bold" onClick={() => setIsSuccess(false)}>
                  Send another inquiry
                </Button>
              </motion.div>
            ) : null}
          </AnimatePresence>

          <form className="space-y-8" onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Full Identity</label>
                <div className="relative">
                  <Input 
                    placeholder="Your good name" 
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      if (errors.name) setErrors({ ...errors, name: '' });
                    }}
                    className={`glass-panel h-14 rounded-lg border-black/5 px-6 font-medium text-foreground bg-white/20 transition-all ${errors.name ? 'border-red-500/50 ring-2 ring-red-500/10' : ''}`} 
                  />
                  {errors.name && (
                    <motion.p initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} className="text-red-500 text-xs font-bold mt-2 flex items-center gap-1 ml-1">
                      <AlertCircle className="w-3 h-3" /> {errors.name}
                    </motion.p>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Digital Reach</label>
                <div className="relative">
                  <Input 
                    type="text" 
                    placeholder="email@address.com" 
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      if (errors.email) setErrors({ ...errors, email: '' });
                    }}
                    className={`glass-panel h-14 rounded-lg border-black/5 px-6 font-medium text-foreground bg-white/20 transition-all ${errors.email ? 'border-red-500/50 ring-2 ring-red-500/10' : ''}`} 
                  />
                  {errors.email && (
                    <motion.p initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} className="text-red-500 text-xs font-bold mt-2 flex items-center gap-1 ml-1">
                      <AlertCircle className="w-3 h-3" /> {errors.email}
                    </motion.p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">The Inquiry</label>
                <textarea 
                  value={formData.message}
                  onChange={(e) => {
                    setFormData({ ...formData, message: e.target.value });
                    if (errors.message) setErrors({ ...errors, message: '' });
                  }}
                  className={`w-full h-40 glass-panel rounded-lg border-black/5 p-6 outline-none focus:border-secondary/40 focus:ring-2 focus:ring-secondary/20 transition-all font-medium text-foreground bg-white/20 ${errors.message ? 'border-red-500/50 ring-2 ring-red-500/10' : ''}`}
                  placeholder="Share your vision or request..."
                />
                {errors.message && (
                  <motion.p initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} className="text-red-500 text-xs font-bold mt-2 flex items-center gap-1 ml-1">
                    <AlertCircle className="w-3 h-3" /> {errors.message}
                  </motion.p>
                )}
              </div>
            </div>

            <Button 
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/90 h-16 font-bold text-lg shadow-[0_10px_30px_rgba(255,0,0,0.2)] disabled:opacity-50"
            >
              {isSubmitting ? 'Weaving...' : (
                <>Send Inquiry <Send className="w-5 h-5 ml-2" /></>
              )}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}
