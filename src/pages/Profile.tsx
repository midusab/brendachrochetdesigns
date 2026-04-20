import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  Camera, 
  Settings, 
  Package, 
  Ruler, 
  Layers, 
  Bell, 
  History, 
  Crown, 
  Sparkles, 
  ChevronRight,
  Upload,
  CheckCircle2,
  Lock,
  MessageSquare,
  Box,
  Scissors
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';


export function Profile() {
  const { user, role, isMuse, isCollector } = useAuth();
  const [activeTab, setActiveTab] = useState('OVERVIEW');
  const [fullName, setFullName] = useState(user?.user_metadata?.full_name || '');
  const [isEditing, setIsEditing] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(user?.user_metadata?.avatar_url || '');
  const [orderCount, setOrderCount] = useState(0);
  const [savedCount, setSavedCount] = useState(0);
  const [measurements, setMeasurements] = useState(user?.user_metadata?.measurements || {
    chest: '92',
    arm: '64',
    height: '182',
    stb: '72'
  });
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProfileStats();
  }, [user]);

  async function fetchProfileStats() {
    if (!user) return;
    
    try {
      // Fetch order count
      const { count: oCount, error } = await supabase.from('orders').select('*', { count: 'exact', head: true }).eq('customer_id', user.id);
      if (error) throw error;
      setOrderCount(oCount || 0);
    } catch (error: any) {
      if (error.message !== 'Failed to fetch') {
        console.error('Profile fetch error:', error);
      }
    }
  }

  const handleUpdateMeasurements = async () => {
    try {
      const { error } = await supabase.auth.updateUser({
        data: { measurements }
      });
      if (error) throw error;
      toast.success('Your Digital Twin data has been synced.');
    } catch (error: any) {
      toast.error('Failed to update twin: ' + error.message);
    }
  };
  
  // Progress tracker mockup
  const currentOrder = {
    id: 'BR-9921',
    item: 'Solaris Shawl',
    progress: 65,
    status: 'In Progress'
  };

  const handleUpdateProfile = async () => {
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: fullName }
      });
      if (error) throw error;
      toast.success('Your signature has been updated.');
      setIsEditing(false);
    } catch (error: any) {
      toast.error('Failed to update: ' + error.message);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      // 1. Upload to Supabase Storage bucket 'profile'
      const { error: uploadError } = await supabase.storage
        .from('profile')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile')
        .getPublicUrl(filePath);

      // 3. Update user metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
      });

      if (updateError) throw updateError;
      
      setAvatarUrl(publicUrl);
      toast.success('Your visual identity has been updated.');
      // Reload to ensure all components (like Header) sync up
      window.location.reload();
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error('Avatar update failed: ' + (error.message || 'Check if "profile" bucket exists'));
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSimulateMuse = async () => {
    try {
      const newRole = role === 'MUSE' ? 'COLLECTOR' : 'MUSE';

      const { error } = await supabase.auth.updateUser({
        data: { role: newRole }
      });
      if (error) throw error;
      toast.success(`Role updated to: ${newRole}. Refreshing state...`);
      // Local reload to trigger AuthContext refresh
      window.location.reload();
    } catch (error: any) {
      toast.error('Update failed: ' + error.message);
    }
  };

  return (
    <div className="pt-32 pb-20 px-6 bg-background min-h-screen">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Role Simulation Helper (Debug Only) */}
        <div className="flex justify-end">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleSimulateMuse}
            className="rounded-full border-secondary/20 text-secondary hover:bg-secondary/5 text-[10px] font-bold uppercase tracking-widest"
          >
            {role === 'MUSE' ? 'Downgrade to Collector' : 'Simulate Muse Status (VIP Test)'}
          </Button>
        </div>

        {/* Profile Header */}
        <section className="relative glass-card rounded-lg p-8 md:p-12 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/5 blur-[100px] rounded-full -mr-32 -mt-32" />
          
          <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
            <div className="relative group">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleAvatarUpload} 
                accept="image/*" 
                className="hidden" 
              />
              <div 
                className="w-32 h-32 md:w-44 md:h-44 rounded-full overflow-hidden border-4 border-white/50 glass-panel shadow-2xl relative cursor-pointer"
                onClick={triggerFileInput}
              >
                {avatarUrl ? (
                  <img src={avatarUrl} className="w-full h-full object-cover" alt="Avatar" />
                ) : (
                  <div className="w-full h-full bg-black/5 flex items-center justify-center text-muted-foreground/30">
                    <User className="w-16 h-16" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                  <Camera className="w-8 h-8" />
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 p-2 bg-secondary rounded-full border-4 border-background text-white shadow-lg">
                {isMuse ? <Crown className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
              </div>
            </div>

            <div className="flex-1 text-center md:text-left space-y-4">
              <div className="space-y-1">
                <Badge className="bg-secondary/10 text-secondary border-secondary/20 font-bold px-3 py-1 text-[10px] tracking-widest uppercase mb-2">
                  {role} Member
                </Badge>
                {isEditing ? (
                  <div className="flex items-center gap-4 justify-center md:justify-start">
                    <Input 
                      value={fullName} 
                      onChange={(e) => setFullName(e.target.value)}
                      className="text-2xl md:text-4xl font-bold bg-transparent border-b border-black/10 rounded-none h-auto p-0 focus-visible:ring-0 w-full max-w-sm"
                    />
                    <Button size="sm" onClick={handleUpdateProfile} className="rounded-full bg-secondary">Save</Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-4 justify-center md:justify-start group">
                    <h1 className="text-3xl md:text-5xl font-bold tracking-tighter text-foreground uppercase">
                      {fullName || 'Anonymous Collector'}
                    </h1>
                    <button onClick={() => setIsEditing(true)} className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground">
                      <Settings className="w-5 h-5" />
                    </button>
                  </div>
                )}
                <p className="text-muted-foreground font-medium italic text-lg">{user?.email}</p>
              </div>

              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                <div className="glass-panel px-4 py-2 rounded-full flex items-center gap-2 text-xs font-bold uppercase tracking-widest bg-white/20">
                  <Package className="w-4 h-4 text-secondary" /> {orderCount} Orders
                </div>
                <div className="glass-panel px-4 py-2 rounded-full flex items-center gap-2 text-xs font-bold uppercase tracking-widest bg-white/20">
                  <Layers className="w-4 h-4 text-secondary" /> {savedCount} Items Saved
                </div>
              </div>
            </div>
            
            {isMuse && (
              <div className="glass-panel p-6 rounded-lg border-secondary/20 bg-secondary/5 backdrop-blur-3xl hidden lg:block">
                <p className="text-[10px] font-bold text-secondary uppercase tracking-[0.2em] mb-2">Muse Perks Active</p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm font-medium">
                    <CheckCircle2 className="w-4 h-4 text-secondary" /> Early Access Unlocked
                  </div>
                  <div className="flex items-center gap-3 text-sm font-medium">
                    <CheckCircle2 className="w-4 h-4 text-secondary" /> Custom Commissions
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Tabbed Interface */}
        <Tabs defaultValue="OVERVIEW" onValueChange={setActiveTab} className="w-full space-y-10">
          <div className="flex justify-center overflow-x-auto pb-4">
            <TabsList className="glass-panel p-2 rounded-full gap-2 border-black/5 h-14 bg-white/40 mb-2">
              <TabsTrigger value="OVERVIEW" className="rounded-full px-8 h-full data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground transition-all font-bold tracking-[0.1em] text-[10px] md:text-xs uppercase">OVERVIEW</TabsTrigger>
              <TabsTrigger value="CLOSET" className="rounded-full px-8 h-full data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground transition-all font-bold tracking-[0.1em] text-[10px] md:text-xs uppercase">VIRTUAL CLOSET</TabsTrigger>
              <TabsTrigger value="TWIN" className="rounded-full px-8 h-full data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground transition-all font-bold tracking-[0.1em] text-[10px] md:text-xs uppercase">DIGITAL TWIN</TabsTrigger>
              <TabsTrigger value="STITCH" className="rounded-full px-8 h-full data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground transition-all font-bold tracking-[0.1em] text-[10px] md:text-xs uppercase">STITCH-BY-STITCH</TabsTrigger>
            </TabsList>
          </div>

          {/* Overview Content */}
          <TabsContent value="OVERVIEW" className="grid lg:grid-cols-3 gap-8 outline-none">
            {/* Recent Notifications */}
            <div className="lg:col-span-2 space-y-8">
              <Card className="glass-card rounded-lg p-8 border-black/5 bg-white/30 backdrop-blur-3xl overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between p-0 mb-8">
                  <CardTitle className="text-xl font-bold uppercase tracking-widest flex items-center gap-3">
                    <Bell className="w-6 h-6 text-secondary" /> Digital Pulse
                  </CardTitle>
                  <Button variant="link" className="text-xs font-bold uppercase text-secondary">Clear All</Button>
                </CardHeader>
                <div className="space-y-6">
                  <p className="text-muted-foreground text-sm italic">No notifications yet.</p>
                </div>
              </Card>

              {/* Recent Activity */}
              <Card className="glass-card rounded-lg p-8 border-black/5 bg-white/30 backdrop-blur-3xl">
                <CardHeader className="flex flex-row items-center justify-between p-0 mb-8">
                  <CardTitle className="text-xl font-bold uppercase tracking-widest flex items-center gap-3">
                    <History className="w-6 h-6 text-secondary" /> Activity Log
                  </CardTitle>
                </CardHeader>
                <div className="space-y-6">
                  <p className="text-muted-foreground text-sm italic">No activities recorded.</p>
                </div>
              </Card>
            </div>

            {/* Sidebar Overview */}
            <div className="space-y-8">
              <Card className="glass-card rounded-lg p-8 border-black/5 bg-secondary/5 border-secondary/10">
                <CardTitle className="text-lg font-bold uppercase tracking-widest mb-6 flex items-center gap-3">
                  <Crown className="w-5 h-5 text-secondary" /> Brand Status
                </CardTitle>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      <span>Progress to Muse</span>
                      <span>420 / 1000 pts</span>
                    </div>
                    <div className="h-2 w-full bg-black/5 rounded-full overflow-hidden">
                      <div className="h-full bg-secondary w-[42%] rounded-full" />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground italic font-medium leading-relaxed">
                    Earn Muse status by collecting 3 pieces or attending an exhibition.
                  </p>
                  <Button className="w-full rounded-full bg-black text-white h-12 text-xs font-bold uppercase tracking-[0.2em] hover:bg-black/90">
                    How to level up
                  </Button>
                </div>
              </Card>
              
              {!isMuse && (
                <Card className="glass-card rounded-lg p-8 border-black/5 bg-white/30 backdrop-blur-3xl text-center space-y-6">
                  <div className="p-4 bg-secondary/10 w-fit mx-auto rounded-full">
                    <Lock className="w-8 h-8 text-secondary" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-bold uppercase tracking-widest">Early Access Locked</h4>
                    <p className="text-sm text-muted-foreground font-medium italic">Available for "Muse" level collectors only.</p>
                  </div>
                  <Button variant="outline" className="w-full rounded-full border-black/10 glass-panel h-11 text-xs font-bold uppercase tracking-widest">
                    Request Upgrade
                  </Button>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Virtual Closet Content */}
          <TabsContent value="CLOSET" className="space-y-12 outline-none">
            <div className="flex justify-between items-end">
              <div className="space-y-4">
                <h2 className="text-3xl md:text-5xl font-bold tracking-tighter text-foreground uppercase leading-none">The Virtual <span className="text-secondary italic">Closet</span></h2>
                <p className="text-muted-foreground text-lg md:text-xl italic font-medium max-w-xl">
                  Inspect your collection in full 3D detail. Visualize fits before they even arrive.
                </p>
              </div>
              <Button 
                onClick={() => toast.success('Closet synchronized with 3D Cloud.')}
                className="rounded-full bg-secondary h-12 px-8 font-bold uppercase tracking-widest text-xs shadow-lg"
              >
                <Upload className="w-4 h-4 mr-2" /> Sync Save
              </Button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="text-muted-foreground text-sm italic col-span-full text-center py-20">Your closet is empty.</div>
              
              {/* Add New Slot */}
              <div className="glass-card rounded-lg border-dashed border-black/10 flex flex-col items-center justify-center p-12 space-y-6 text-center hover:bg-black/5 transition-all group">
                <div className="p-6 rounded-full bg-black/5 group-hover:scale-110 transition-transform">
                  <Box className="w-12 h-12 text-muted-foreground/30" />
                </div>
                <div className="space-y-2">
                  <p className="font-bold uppercase tracking-widest text-muted-foreground">Available Slot</p>
                  <p className="text-xs text-muted-foreground/60 italic">Collect pieces to populate your closet.</p>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Digital Twin Content */}
          <TabsContent value="TWIN" className="space-y-12 outline-none">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div className="space-y-10">
                <div className="space-y-4">
                  <h2 className="text-3xl md:text-5xl font-bold tracking-tighter text-foreground uppercase leading-none">Measurement <span className="text-secondary italic">Profile</span></h2>
                  <p className="text-muted-foreground text-lg md:text-xl italic font-medium">
                    Our crochet pieces are "zero-waste" and made-to-measure. Up-to-date measurements guarantee an architecturally precise fit.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  {[
                    { label: 'Chest Width', key: 'chest', icon: Ruler },
                    { label: 'Arm Length', key: 'arm', icon: Ruler },
                    { label: 'Total Height', key: 'height', icon: Ruler },
                    { label: 'Shoulder-to-Base', key: 'stb', icon: Ruler },
                  ].map((field) => (
                    <div key={field.key} className="space-y-3">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] ml-1">{field.label}</label>
                      <div className="relative">
                        <Input 
                          value={measurements[field.key as keyof typeof measurements]}
                          onChange={(e) => setMeasurements({ ...measurements, [field.key]: e.target.value })}
                          className="glass-panel h-14 rounded-lg border-black/5 px-6 font-bold text-lg text-foreground focus:border-secondary/40"
                        />
                        <span className="absolute right-6 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground uppercase tracking-widest">CM</span>
                      </div>
                    </div>
                  ))}
                </div>

                <Button 
                  onClick={handleUpdateMeasurements}
                  className="w-full md:w-auto rounded-full bg-secondary h-16 px-12 font-bold text-lg shadow-lg"
                >
                  Update Digital Twin
                </Button>
              </div>

              {/* Measurement Visualization Placeholder */}
              <div className="glass-card rounded-lg aspect-square flex flex-col items-center justify-center relative overflow-hidden bg-black/5 p-12">
                <div className="absolute inset-0 bg-secondary/5 blur-[120px] rounded-full" />
                <img src="https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=800" className="w-full h-full object-contain opacity-30 mix-blend-multiply" alt="Mannequin" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center space-y-4 p-8">
                  <Ruler className="w-16 h-16 text-secondary mb-4" />
                  <h4 className="text-2xl font-bold uppercase tracking-tight">Interactive Twin</h4>
                  <p className="text-sm text-muted-foreground font-medium italic">Rotation & Overlay mode disabled in preview. Update info to refresh render.</p>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Stitch-by-Stitch Content */}
          <TabsContent value="STITCH" className="space-y-12 outline-none">
             <div className="space-y-4">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tighter text-foreground uppercase leading-none">Stitch-by-Stitch <span className="text-secondary italic">Progress</span></h2>
              <p className="text-muted-foreground text-lg md:text-xl italic font-medium max-w-xl">
                Real-time visibility into the artisanal heartbeat. See your piece come alive.
              </p>
            </div>

            <Card className="glass-card rounded-lg p-8 md:p-14 border-black/5 bg-white/30 backdrop-blur-3xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-10 opacity-5">
                <Scissors className="w-32 h-32 text-secondary" />
              </div>
              
              <div className="grid md:grid-cols-2 gap-16 relative z-10">
                <div className="space-y-12">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                       <Badge className="bg-secondary/10 text-secondary border-secondary/20 font-bold px-3 py-1 text-[10px] uppercase">
                        Current Creation
                      </Badge>
                      <h3 className="text-3xl font-bold tracking-tight uppercase">{currentOrder.item}</h3>
                      <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs">Order ID: {currentOrder.id}</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex justify-between items-end text-sm font-bold uppercase">
                      <span className="tracking-[0.2em]">Craft Progress</span>
                      <span className="text-2xl tracking-tighter">{currentOrder.progress}%</span>
                    </div>
                    <div className="h-4 w-full bg-black/5 rounded-full overflow-hidden p-1">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${currentOrder.progress}%` }}
                        transition={{ duration: 2, ease: "easeOut" }}
                        className="h-full bg-secondary rounded-full shadow-[0_0_15px_rgba(255,0,0,0.3)]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { l: 'Thread Prepped', done: true },
                      { l: 'Base Structure', done: true },
                      { l: 'Fine Detailing', done: false },
                    ].map((step, i) => (
                      <div key={i} className={`p-4 rounded-lg border ${step.done ? 'bg-secondary/10 border-secondary/20' : 'bg-black/5 border-transparent opacity-40'} text-center space-y-2`}>
                        {step.done ? <CheckCircle2 className="w-6 h-6 text-secondary mx-auto" /> : <div className="w-6 h-6 border-2 border-black/10 rounded-full mx-auto" />}
                        <p className="text-[10px] font-bold uppercase tracking-tight leading-none h-4">{step.l}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-8 flex flex-col justify-center">
                  <div className="glass-panel p-8 rounded-lg border-black/5 space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-secondary/10 rounded-lg">
                        <MessageSquare className="w-6 h-6 text-secondary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Message Artisan</p>
                        <p className="font-bold text-foreground">Artisan Brenda Musonye</p>
                      </div>
                    </div>
                    <p className="text-sm font-medium italic text-muted-foreground leading-relaxed">
                      "Finishing the pattern highlights today. The Rift Valley inspirations are coming through beautifully in the sleeve taper."
                    </p>
                    {isMuse ? (
                      <Button className="w-full rounded-full bg-secondary text-white h-12 font-bold uppercase text-xs tracking-widest">
                        Reply Directly
                      </Button>
                    ) : (
                      <div className="p-4 bg-black/5 rounded-lg flex items-center gap-3 text-[10px] font-bold uppercase text-muted-foreground justify-center">
                        <Lock className="w-3 h-3" /> Muse-only Chat Access
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
