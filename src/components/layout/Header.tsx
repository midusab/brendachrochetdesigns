import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, User, Menu, Scissors, LogOut, LayoutDashboard, Heart } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'Portfolio', path: '/portfolio' },
  { name: 'Shop', path: '/shop' },
];

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Logged out from the studio');
      navigate('/');
    } catch (error: any) {
      console.error('Sign out failed:', error);
      toast.error('Logout failed but we are clearing your session.');
      // Force exit if supabase hangs
      window.location.href = '/';
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
      <motion.div 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="max-w-7xl mx-auto flex items-center justify-between glass-panel px-6 py-3 rounded-full relative overflow-hidden"
      >
        {/* KFC Style Accent Line */}
        <div className="absolute bottom-0 left-0 w-full h-[2px] bg-repeating-linear-gradient(90deg, var(--secondary) 0, var(--secondary) 10px, transparent 10px, transparent 20px) opacity-30" />
        
        <Link to="/" className="flex items-center gap-2 group relative z-10">
          <div className="p-2 bg-black/5 rounded-full group-hover:bg-primary/10 transition-colors">
            <Scissors className="w-5 h-5 text-primary" />
          </div>
          <span className="font-extrabold tracking-tighter text-lg md:text-xl bg-clip-text text-transparent bg-gradient-to-r from-slate-950 to-slate-600 uppercase">
            Brenda Designs
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link 
              key={link.path} 
              to={link.path}
              className={`text-[10px] font-bold uppercase tracking-[0.2em] transition-colors hover:text-foreground ${
                location.pathname === link.path ? 'text-foreground' : 'text-foreground/60'
              }`}
            >
              {link.name}
              {location.pathname === link.path && (
                <motion.div 
                  layoutId="nav-underline"
                  className="h-1 bg-secondary rounded-full mt-0.5"
                />
              )}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 md:gap-4">
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-black/5 text-foreground hidden md:flex">
            <ShoppingBag className="w-5 h-5" />
          </Button>
          
          <AnimatePresence mode="wait">
            {!user ? (
              <div className="flex items-center gap-2">
                <Link to="/auth" className="hidden lg:block">
                  <Button 
                    className="rounded-full bg-black text-white px-6 h-10 text-[10px] font-bold uppercase tracking-widest hover:scale-105 transition-transform"
                  >
                    Join The Studio
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="rounded-full hover:bg-black/5 text-foreground"
                  >
                    <User className="w-5 h-5" />
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/profile">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className={`rounded-full overflow-hidden hover:bg-black/5 ${location.pathname === '/profile' ? 'text-secondary bg-black/5' : 'text-foreground'}`}
                  >
                    {user?.user_metadata?.avatar_url ? (
                      <img src={user.user_metadata.avatar_url} className="w-full h-full object-cover" alt="Profile" />
                    ) : (
                      <User className="w-5 h-5" />
                    )}
                  </Button>
                </Link>
                <Link to="/admin">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className={`rounded-full hover:bg-black/5 ${location.pathname === '/admin' ? 'text-secondary bg-black/5' : 'text-foreground'} hidden md:flex`}
                  >
                    <LayoutDashboard className="w-5 h-5" />
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleSignOut}
                  className="rounded-full hover:bg-red-500/10 text-red-500"
                >
                  <LogOut className="w-5 h-5" />
                </Button>
              </div>
            )}
          </AnimatePresence>
          
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger
              render={
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="md:hidden rounded-full hover:bg-black/5 text-foreground" 
                />
              }
            >
              <Menu className="w-5 h-5" />
            </SheetTrigger>
            <SheetContent side="right" className="glass-panel border-l-black/5 text-foreground">
              <div className="flex flex-col gap-8 mt-12">
                {navLinks.map((link) => (
                  <Link 
                    key={link.path} 
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className="text-3xl font-bold uppercase tracking-tighter hover:text-secondary transition-colors"
                  >
                    {link.name}
                  </Link>
                ))}
                
                {user && (
                  <>
                    <div className="h-px bg-black/5 w-full my-4" />
                    <Link 
                      to="/wishlist" 
                      onClick={() => setIsOpen(false)}
                      className="text-2xl font-bold uppercase tracking-tighter flex items-center gap-3 text-foreground/60 hover:text-foreground"
                    >
                      <Heart className="w-6 h-6" /> Wishlist
                    </Link>
                    <Link 
                      to="/profile" 
                      onClick={() => setIsOpen(false)}
                      className="text-2xl font-bold uppercase tracking-tighter flex items-center gap-3 text-foreground/60 hover:text-foreground"
                    >
                      {user?.user_metadata?.avatar_url ? (
                        <div className="w-8 h-8 rounded-full overflow-hidden border border-black/5">
                          <img src={user.user_metadata.avatar_url} className="w-full h-full object-cover" alt="Profile" />
                        </div>
                      ) : (
                        <User className="w-6 h-6" />
                      )}{" "}
                      Profile
                    </Link>
                    <Link 
                      to="/admin" 
                      onClick={() => setIsOpen(false)}
                      className="text-2xl font-bold uppercase tracking-tighter flex items-center gap-3 text-foreground/60 hover:text-foreground"
                    >
                      <LayoutDashboard className="w-6 h-6" /> Dashboard
                    </Link>
                    <Button 
                      variant="ghost" 
                      onClick={() => {
                        handleSignOut();
                        setIsOpen(false);
                      }}
                      className="text-2xl font-bold uppercase tracking-tighter flex items-center gap-3 text-red-500 hover:text-red-600 hover:bg-red-50 p-0 h-auto justify-start"
                    >
                      <LogOut className="w-6 h-6" /> Sign Out
                    </Button>
                  </>
                )}
                
                {!user && (
                  <Link to="/auth" onClick={() => setIsOpen(false)}>
                    <Button className="w-full rounded-full bg-black text-white py-6 font-bold uppercase tracking-widest">
                      Join The Studio
                    </Button>
                  </Link>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </motion.div>
    </header>
  );
}
