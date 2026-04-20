import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Trash2, 
  Edit, 
  TrendingUp, 
  Users, 
  Package, 
  DollarSign,
  LayoutGrid,
  Settings,
  ShieldCheck,
  Ruler,
  MessageSquare,
  Lock,
  Globe,
  Palette,
  Camera,
  Layers,
  ArrowUpRight,
  UserCheck,
  Ban,
  Crown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Product, PortfolioItem, Inquiry } from '@/types';
import { supabase } from '@/lib/supabase';
import { useAuth, AdminAuthority, UserRole } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip
} from 'recharts';

const data = [
  { name: 'Mon', sales: 4000 },
  { name: 'Tue', sales: 3000 },
  { name: 'Wed', sales: 5000 },
  { name: 'Thu', sales: 2780 },
  { name: 'Fri', sales: 1890 },
  { name: 'Sat', sales: 2390 },
  { name: 'Sun', sales: 3490 },
];

export function Admin() {
  const { user, hasAuthority, isAdmin } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [personnel, setPersonnel] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [stats, setStats] = useState({
    revenue: 'Ksh 0',
    commissions: '0',
    collectors: '0',
    stability: 'Optimal'
  });
  const [velocity, setVelocity] = useState(data);
  const [isAdding, setIsAdding] = useState(false);
  const [isAddingPortfolio, setIsAddingPortfolio] = useState(false);
  const [loading, setLoading] = useState(true);

  const displayName = user?.user_metadata?.full_name || 'Maestro';

  useEffect(() => {
    fetchAllData();

    // Listen to cross-tab updates and simulation events
    const handleStorageChange = () => fetchAllData();
    window.addEventListener('storage', handleStorageChange);

    // Setup Supabase Realtime
    const channel = supabase
      .channel('admin-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'inquiries' }, () => {
        fetchAllData();
      })
      .subscribe();

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      supabase.removeChannel(channel);
    };
  }, []);

  async function fetchAllData() {
    setLoading(true);
    
    try {
      // 1. Fetch Products
      const { data: productsData } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (productsData) setProducts(productsData);

      // 2. Fetch Stats
      const { data: ordersData } = await supabase.from('orders').select('amount, status');
      if (ordersData) {
        const total = ordersData.reduce((acc, curr) => acc + Number(curr.amount), 0);
        const inProgress = ordersData.filter(o => o.status === 'IN_PROGRESS').length;
        setStats(prev => ({ ...prev, revenue: `Ksh ${total.toLocaleString()}`, commissions: inProgress.toString() }));
      }

      // 3. Fetch Personnel
      const { data: profilesData } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      if (profilesData) {
        setPersonnel(profilesData.map(p => ({
          id: p.id,
          name: p.full_name || 'Anonymous',
          email: p.id, 
          role: p.role,
          status: 'ACTIVE'
        })));
        setStats(prev => ({ ...prev, collectors: profilesData.length.toString() }));
      }

      // 4. Fetch Activities
      const { data: activityData } = await supabase.from('activities').select('*').order('created_at', { ascending: false }).limit(5);
      if (activityData) {
        setActivities(activityData.map(a => ({
          u: a.user_name,
          a: a.action,
          icon: a.icon_type === 'user' ? UserCheck : ShieldCheck,
          t: new Date(a.created_at).toLocaleTimeString()
        })));
      }

      // 5. Fetch Inquiries
      const { data: inquiryData } = await supabase.from('inquiries').select('*').order('created_at', { ascending: false });
      if (inquiryData) setInquiries(inquiryData);

      // 6. Fetch Portfolio
      const { data: portfolioData } = await supabase.from('portfolio').select('*').order('created_at', { ascending: false });
      if (portfolioData) setPortfolio(portfolioData);

    } catch (error: any) {
        toast.error('Sync failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddProduct(e: React.FormEvent) {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const product = {
      name: formData.get('name') as string,
      price: Number(formData.get('price')),
      currency: 'Ksh',
      image_url: formData.get('image') as string,
      description: formData.get('description') as string,
      category: formData.get('category') as any,
      is_featured: formData.get('is_featured') === 'on'
    };
    
    try {
      const { error } = await supabase.from('products').insert([product]);
      if (error) {
        console.error('Supabase Insert Error:', error);
        throw error;
      }
      toast.success('Concept archived in the studio ledger.');
      setIsAdding(false);
      fetchAllData();
    } catch (error: any) {
      console.error('handleAddProduct Error:', error);
      toast.error('Sync failed: ' + (error.message || 'Unknown error'));
      setIsAdding(false);
    }
  }

  async function handleAddPortfolio(e: React.FormEvent) {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const item = {
      title: formData.get('title') as string,
      category: formData.get('category') as string,
      image_url: formData.get('image') as string,
      description: formData.get('description') as string,
    };
    
    try {
      const { error } = await supabase.from('portfolio').insert([item]);
      if (error) throw error;
      toast.success('Portfolio calibrated with new work.');
      setIsAddingPortfolio(false);
      fetchAllData();
    } catch (error: any) {
      toast.error('Sync failed: ' + error.message);
      setIsAddingPortfolio(false);
    }
  }

  async function handleResolveInquiry(id: string) {
    const response = prompt('Craft your response to the customer:');
    if (!response) return;

    try {
      const { error } = await supabase.from('inquiries').update({ 
        status: 'RESOLVED',
        response,
        updated_at: new Date().toISOString()
      }).eq('id', id);
      
      if (error) throw error;
      toast.success('Inquiry resolved. Customer notified via record.');
      fetchAllData();
    } catch (error: any) {
      toast.error('Response failed: ' + error.message);
    }
  }

  async function handlePromote(personId: string, currentRole: string) {
    const roles: UserRole[] = ['GUEST', 'COLLECTOR', 'MUSE', 'ADMIN'];
    const currentIndex = roles.indexOf(currentRole as UserRole);
    const nextRole = roles[(currentIndex + 1) % roles.length];

    try {
      const { error } = await supabase.from('profiles').update({ role: nextRole }).eq('id', personId);
      if (error) throw error;
      toast.success(`Access elevated to ${nextRole} tier.`);
      fetchAllData();
    } catch (error: any) {
      toast.error('Promotion failed: ' + error.message);
    }
  }

  async function updateNarrative(section: string) {
    const newContent = prompt('Enter new narrative content:');
    if (!newContent) return;

    try {
      const { error } = await supabase.from('narratives').upsert({ section, content: newContent });
      if (error) throw error;
      toast.success('Studio narrative recalibrated.');
    } catch (error: any) {
      toast.error('Calibration failed: ' + error.message);
    }
  }

  // Permission Check Helper for the UI
  const AuthGate = ({ authority, children }: { authority: AdminAuthority, children: React.ReactNode }) => {
    if (hasAuthority(authority)) return <>{children}</>;
    return (
      <div className="opacity-40 grayscale pointer-events-none cursor-not-allowed select-none relative group">
        <div className="absolute inset-0 z-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-background/40 backdrop-blur-sm rounded-lg">
           <Badge variant="outline" className="bg-background border-red-500/20 text-red-500 font-bold uppercase tracking-widest text-[10px]">Authority Required</Badge>
        </div>
        {children}
      </div>
    );
  };

  return (
    <div className="pt-32 pb-20 px-6 bg-background min-h-screen">
      <div className="max-w-7xl mx-auto space-y-12">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Badge className="bg-secondary/10 text-secondary border-secondary/20 font-bold px-3 py-1 text-[10px] tracking-widest uppercase">
                {isAdmin ? 'Super Admin' : 'Authority Restricted'}
              </Badge>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest border-l border-black/10 pl-3">Studio Operational</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter text-glow text-foreground uppercase leading-none">
              Command <span className="text-secondary italic">Center</span>
            </h1>
            <p className="text-muted-foreground font-medium text-lg italic max-w-2xl">
              Artisanal oversight and system orchestration. Manage authorities, assets, and the digital collective.
            </p>
          </div>
          <div className="flex gap-4">
            <Button variant="outline" className="rounded-full border-black/5 glass-panel h-14 px-8 font-bold text-foreground">
              <Settings className="w-5 h-5 mr-3" /> System Config
            </Button>
            <AuthGate authority="DROP_COORDINATOR">
              <Button className="rounded-full bg-secondary text-secondary-foreground h-14 px-10 font-bold shadow-[0_10px_25px_rgba(255,0,0,0.25)]" onClick={() => setIsAdding(!isAdding)}>
                <Plus className="w-5 h-5 mr-3" /> New Collection
              </Button>
            </AuthGate>
          </div>
        </header>

        <Tabs defaultValue="OVERVIEW" className="space-y-10">
          <TabsList className="glass-panel p-2 rounded-full gap-2 border-black/5 h-16 bg-white/40 mb-10 w-full md:w-fit mx-auto md:mx-0 overflow-x-auto overflow-y-hidden">
            <TabsTrigger value="OVERVIEW" className="rounded-full px-8 h-full data-[state=active]:bg-secondary data-[state=active]:text-white font-bold tracking-widest text-[10px] uppercase transition-all">Overview</TabsTrigger>
            <TabsTrigger value="CUSTOMERS" className="rounded-full px-8 h-full data-[state=active]:bg-secondary data-[state=active]:text-white font-bold tracking-widest text-[10px] uppercase transition-all">Collective</TabsTrigger>
            <TabsTrigger value="CONTENT" className="rounded-full px-8 h-full data-[state=active]:bg-secondary data-[state=active]:text-white font-bold tracking-widest text-[10px] uppercase transition-all">Materiality</TabsTrigger>
            <TabsTrigger value="INQUIRIES" className="rounded-full px-8 h-full data-[state=active]:bg-secondary data-[state=active]:text-white font-bold tracking-widest text-[10px] uppercase transition-all">Inquiries</TabsTrigger>
            <TabsTrigger value="TECHNICAL" className="rounded-full px-8 h-full data-[state=active]:bg-secondary data-[state=active]:text-white font-bold tracking-widest text-[10px] uppercase transition-all">Operations</TabsTrigger>
          </TabsList>

          <TabsContent value="OVERVIEW" className="space-y-10 outline-none">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { label: 'Weekly Revenue', value: stats.revenue, icon: DollarSign, change: '+12.5%' },
                { label: 'Active Commissions', value: stats.commissions, icon: Package, change: '6 Slots Open' },
                { label: 'Total Collectors', value: stats.collectors, icon: Users, change: '+18.1%' },
                { label: 'Studio Stability', value: stats.stability, icon: ShieldCheck, change: 'Optimal' },
              ].map((stat) => (
                <Card key={stat.label} className="glass-panel kfc-card-accent border-black/5 rounded-lg overflow-hidden group pl-1.5 transition-all duration-300 hover:shadow-xl">
                  <CardContent className="p-8 space-y-6">
                    <div className="flex justify-between items-start">
                      <div className="p-4 bg-secondary/10 rounded-md border border-secondary/20 group-hover:scale-110 transition-transform">
                        <stat.icon className="w-6 h-6 text-secondary" />
                      </div>
                      <Badge variant="outline" className="bg-secondary/5 text-secondary border-secondary/20 font-bold px-3 py-1 text-[10px]">
                        {stat.change}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">{stat.label}</p>
                      <h3 className="text-3xl font-bold tracking-tighter mt-2 text-foreground">{stat.value}</h3>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

             <div className="grid lg:grid-cols-1 gap-8">
              <Card className="glass-panel border-black/5 rounded-lg p-10 space-y-8">
                <CardTitle className="text-xl font-bold uppercase tracking-widest flex items-center gap-3">
                  <Globe className="w-6 h-6 text-secondary" /> Global Feed
                </CardTitle>
                <div className="space-y-8">
                  {activities.map((activity, i) => (
                    <div key={i} className="flex items-center gap-5 group">
                      <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-black/5 flex items-center justify-center group-hover:bg-secondary/10 transition-colors">
                        <activity.icon className="w-5 h-5 text-muted-foreground group-hover:text-secondary transition-colors" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-xs uppercase tracking-widest text-muted-foreground mb-1">{activity.t}</p>
                        <p className="font-bold text-foreground leading-tight"><span className="text-secondary italic">{activity.u}</span> {activity.a}</p>
                      </div>
                    </div>
                  ))}
                  <Button variant="ghost" className="w-full rounded-full border border-black/5 font-bold uppercase tracking-widest text-[10px] h-12 hover:bg-black/5">View Full Ledger</Button>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="CUSTOMERS" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 outline-none">
            {/* 1. Customer Management Sections */}
            <AuthGate authority="TIER_AUTHORITY">
              <Card className="glass-panel border-black/5 rounded-lg p-10 space-y-6">
                <div className="p-4 bg-secondary/10 rounded-lg w-fit mb-4">
                  <Crown className="w-8 h-8 text-secondary" />
                </div>
                <h3 className="text-2xl font-bold uppercase tracking-tight">Tier Authority</h3>
                <p className="text-sm text-muted-foreground font-medium italic">Promote Collectors to Muse status or adjust curation tiers.</p>
                <div className="space-y-4 pt-4">
                  <div className="flex items-center justify-between p-4 bg-black/5 rounded-lg">
                    <p className="text-xs font-bold uppercase tracking-widest">Pending Upgrades</p>
                    <Badge variant="secondary" className="bg-secondary text-white font-bold">12</Badge>
                  </div>
                  <Button className="w-full rounded-full bg-black text-white font-bold uppercase text-[10px] tracking-widest h-12">Manage Curation</Button>
                </div>
              </Card>
            </AuthGate>

            <AuthGate authority="MEASUREMENT_CUSTODIAN">
               <Card className="glass-panel border-black/5 rounded-lg p-10 space-y-6">
                <div className="p-4 bg-secondary/10 rounded-lg w-fit mb-4">
                  <Ruler className="w-8 h-8 text-secondary" />
                </div>
                <h3 className="text-2xl font-bold uppercase tracking-tight">Measurement Custodian</h3>
                <p className="text-sm text-muted-foreground font-medium italic">Troubleshoot Digital Twin profiles and calibrate fitting data.</p>
                <div className="space-y-4 pt-4">
                  <div className="flex items-center gap-4">
                    <Input placeholder="User ID or Email" className="glass-panel rounded-full border-black/5 px-6 h-12" />
                    <Button size="icon" className="rounded-full bg-black h-12 w-12 flex-shrink-0"><ArrowUpRight className="w-5 h-5" /></Button>
                  </div>
                </div>
              </Card>
            </AuthGate>

            <AuthGate authority="COMMISSION_FACILITATOR">
              <Card className="glass-panel border-black/5 rounded-lg p-10 space-y-6">
                <div className="p-4 bg-secondary/10 rounded-lg w-fit mb-4">
                  <Layers className="w-8 h-8 text-secondary" />
                </div>
                <h3 className="text-2xl font-bold uppercase tracking-tight">Commission Facilitator</h3>
                <p className="text-sm text-muted-foreground font-medium italic">Open, close, and assign custom crochet commission slots.</p>
                <div className="space-y-4 pt-4">
                   <div className="flex items-center justify-between">
                     <span className="text-xs font-bold uppercase tracking-widest">Global Status: <span className="text-green-500">OPEN</span></span>
                     <Button variant="outline" className="rounded-full border-red-500/20 text-red-500 h-10 px-6 font-bold text-[10px] uppercase">Close Slots</Button>
                   </div>
                </div>
              </Card>
            </AuthGate>

             <AuthGate authority="DISPUTE_ARBITRATOR">
              <Card className="glass-panel border-black/5 rounded-lg p-10 space-y-6">
                <div className="p-4 bg-secondary/10 rounded-lg w-fit mb-4">
                  <MessageSquare className="w-8 h-8 text-secondary" />
                </div>
                <h3 className="text-2xl font-bold uppercase tracking-tight">Dispute Arbitrator</h3>
                <p className="text-sm text-muted-foreground font-medium italic">Audit Artisan-Customer communication logs for resolution.</p>
                <Button variant="ghost" className="w-full rounded-full border border-black/5 font-bold uppercase text-[10px] tracking-widest h-12">View History</Button>
              </Card>
            </AuthGate>

            <AuthGate authority="ACCOUNT_OVERSIGHT">
              <Card className="lg:col-span-3 glass-panel border-black/5 rounded-lg overflow-hidden">
                <CardHeader className="border-b border-black/5 bg-black/[0.02] p-10 flex flex-row items-center justify-between">
                  <CardTitle className="text-xl font-bold flex items-center gap-4 text-foreground uppercase tracking-widest">
                    <UserCheck className="w-7 h-7 text-secondary" /> Studio Personnel & Collective
                  </CardTitle>
                  <Button variant="outline" className="rounded-full border-black/5 font-bold uppercase tracking-widest text-[10px] h-10 px-6">Export Ledger</Button>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-black/5">
                    {personnel.map((person, i) => (
                      <div key={i} className="p-8 flex items-center justify-between hover:bg-black/[0.01] transition-all group">
                        <div className="flex items-center gap-6">
                           <div className="w-14 h-14 rounded-lg bg-secondary/10 flex items-center justify-center font-bold text-secondary text-lg border border-secondary/20">
                             {person.name.split(' ').map((n: string) => n[0]).join('')}
                           </div>
                           <div>
                             <p className="font-bold text-xl text-foreground">{person.name}</p>
                             <p className="text-sm font-medium text-muted-foreground italic max-w-[200px] truncate">{person.email}</p>
                           </div>
                        </div>
                        <div className="flex items-center gap-10">
                           <div className="text-right">
                             <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Assigned Role</p>
                             <Badge className={`${person.role === 'ADMIN' ? 'bg-black text-white shadow-[0_0_15px_rgba(0,0,0,0.2)]' : 'bg-secondary/10 text-secondary'} font-bold px-4 py-1 rounded-full uppercase tracking-tighter`}>
                               {person.role === 'ADMIN' ? 'The Maestro' : 
                                person.role === 'MUSE' ? 'The Muse' :
                                person.role === 'COLLECTOR' ? 'The Collector' : 'The Guest'}
                             </Badge>
                           </div>
                           <div className="flex gap-3 h-10">
                              <Button variant="ghost" className="rounded-lg border border-black/5 px-4 font-bold text-[10px] uppercase hover:bg-black/5 transition-all">Audit</Button>
                              <Button 
                                variant="ghost" 
                                onClick={() => handlePromote(person.id, person.role)}
                                className="rounded-lg border border-black/5 px-4 font-bold text-[10px] uppercase hover:bg-black/5 transition-all text-secondary"
                              >
                                Promote
                              </Button>
                           </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </AuthGate>
          </TabsContent>

          <TabsContent value="INQUIRIES" className="space-y-8 outline-none">
            <Card className="glass-panel border-black/5 rounded-lg overflow-hidden">
              <CardHeader className="p-10 border-b border-black/5 flex flex-row items-center justify-between">
                <CardTitle className="text-xl font-bold uppercase tracking-widest flex items-center gap-3">
                  <MessageSquare className="w-7 h-7 text-secondary" /> Customer Dialogue
                </CardTitle>
                <Badge variant="outline" className="bg-secondary/5 text-secondary border-secondary/20 font-bold px-4 py-1 text-[10px] uppercase">
                  {inquiries.filter(i => i.status === 'PENDING').length} Unresolved
                </Badge>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-black/5">
                  {inquiries.length === 0 ? (
                    <div className="p-20 text-center text-muted-foreground italic">No inquiries recorded in the studio ledger.</div>
                  ) : (
                    inquiries.map((inquiry) => (
                      <div key={inquiry.id} className="p-10 hover:bg-black/[0.01] transition-all grid md:grid-cols-4 gap-8 items-start">
                        <div className="md:col-span-1 space-y-2">
                          <p className="font-bold text-lg text-foreground uppercase tracking-tight leading-none">{inquiry.customer_name}</p>
                          <p className="text-sm font-medium text-muted-foreground italic truncate">{inquiry.customer_email}</p>
                          <Badge className={inquiry.status === 'PENDING' ? 'bg-secondary text-white' : 'bg-green-500/10 text-green-500 border-green-500/20'}>
                            {inquiry.status}
                          </Badge>
                        </div>
                        <div className="md:col-span-2 space-y-4">
                          <div className="p-6 bg-black/5 rounded-md border border-black/5">
                            <p className="text-foreground font-medium leading-relaxed italic">"{inquiry.message}"</p>
                          </div>
                          {inquiry.response && (
                            <div className="p-6 bg-secondary/5 rounded-md border border-secondary/10 ml-6">
                              <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-2">Studio Response:</p>
                              <p className="text-foreground/80 font-medium italic">"{inquiry.response}"</p>
                            </div>
                          )}
                        </div>
                        <div className="md:col-span-1 flex justify-end">
                          {inquiry.status === 'PENDING' && (
                            <Button 
                              onClick={() => handleResolveInquiry(inquiry.id)}
                              className="rounded-full bg-black text-white px-8 h-12 font-bold uppercase text-[10px] tracking-widest"
                            >
                              Dispatch Response
                            </Button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="CONTENT" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 outline-none">
            {/* 2. Content Management Roles */}
            <AuthGate authority="DROP_COORDINATOR">
               <Card className="glass-panel border-black/5 rounded-lg p-10 space-y-6">
                <div className="p-4 bg-secondary/10 rounded-lg w-fit mb-4">
                  <Package className="w-8 h-8 text-secondary" />
                </div>
                <h3 className="text-2xl font-bold uppercase tracking-tight">Collection Drops</h3>
                <p className="text-sm text-muted-foreground font-medium italic">Publish new designs directly to the commercial collection.</p>
                <Button 
                  onClick={() => setIsAdding(true)}
                  className="w-full rounded-full bg-secondary text-white font-bold uppercase text-[10px] tracking-widest h-12 shadow-[0_10px_25px_rgba(255,0,0,0.15)]"
                >
                  Initiate Drop
                </Button>
              </Card>
            </AuthGate>

            <AuthGate authority="STORYTELLING_LEAD">
              <Card className="glass-panel border-black/5 rounded-lg p-10 space-y-6">
                <div className="p-4 bg-secondary/10 rounded-lg w-fit mb-4">
                   <Palette className="w-8 h-8 text-secondary" />
                </div>
                <h3 className="text-2xl font-bold uppercase tracking-tight">Portfolio Calibration</h3>
                <p className="text-sm text-muted-foreground font-medium italic">Showcase high-couture projects and artisanal milestones.</p>
                <Button 
                  onClick={() => setIsAddingPortfolio(true)}
                  variant="outline" 
                  className="w-full rounded-full border-black/5 font-bold uppercase text-[10px] tracking-widest h-12"
                >
                  Curate Project
                </Button>
              </Card>
            </AuthGate>

            <AuthGate authority="STORYTELLING_LEAD">
              <Card className="glass-panel border-black/5 rounded-lg p-10 space-y-6">
                <h3 className="text-2xl font-bold uppercase tracking-tight">Narrative Specs</h3>
                <p className="text-sm text-muted-foreground font-medium italic">Update the studio's craftsmanship philosophies.</p>
                <Button 
                  variant="ghost" 
                  onClick={() => updateNarrative('craftsmanship')}
                  className="w-full rounded-full border border-black/5 font-bold uppercase text-[10px] tracking-widest h-12"
                >
                  Edit Philosophies
                </Button>
              </Card>
            </AuthGate>
          </TabsContent>

          <TabsContent value="TECHNICAL" className="space-y-12 outline-none">
             <Card className="glass-panel border-black/5 rounded-lg p-12 bg-black text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-20 opacity-10">
                   <Lock className="w-64 h-64" />
                </div>
                <div className="max-w-2xl space-y-8 relative z-10">
                   <h2 className="text-5xl font-bold tracking-tighter uppercase leading-none">Security<br />Audit <span className="text-secondary italic">Terminal</span></h2>
                   <p className="text-white/60 text-xl font-medium leading-relaxed">
                     Every action within the Command Center is logged to the immutable studio ledger. 
                     Unauthorized attempts to bypass Authority Gates will trigger an immediate account audit.
                   </p>
                   <div className="flex gap-4">
                     <Button className="rounded-full bg-white text-black h-14 px-10 font-bold uppercase tracking-widest text-xs">Download Ledger</Button>
                     <Button variant="outline" className="rounded-full border-white/20 text-white h-14 px-10 font-bold uppercase tracking-widest text-xs hover:bg-white/10">Rotate Secrets</Button>
                   </div>
                </div>
             </Card>
          </TabsContent>
        </Tabs>

        {/* Add Product Modal */}
        <AnimatePresence>
          {isAdding && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 bg-black/40 backdrop-blur-3xl overflow-y-auto"
            >
              <div className="glass-panel p-8 md:p-16 rounded-lg max-w-4xl w-full border-white/10 space-y-12 relative bg-white/90 shadow-2xl my-auto">
                <div className="flex justify-between items-start">
                  <div className="space-y-4">
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground uppercase">Initiate Drop</h2>
                    <p className="text-muted-foreground font-medium italic text-lg">Define a new design concept for the commercial collection.</p>
                  </div>
                  <Button variant="ghost" className="rounded-full w-12 h-12 p-0" onClick={() => setIsAdding(false)}>
                    <Trash2 className="w-6 h-6" />
                  </Button>
                </div>

                <form onSubmit={handleAddProduct} className="grid lg:grid-cols-2 gap-12">
                  <div className="space-y-8">
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Design Identity</label>
                      <Input name="name" className="glass-panel h-16 rounded-lg border-black/5 focus:border-secondary/40 focus:ring-secondary/20 px-8 font-bold text-xl uppercase tracking-tight" required placeholder="Design Name" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Investment (Ksh)</label>
                        <Input name="price" type="number" className="glass-panel h-16 rounded-lg border-black/5 focus:border-secondary/40 focus:ring-secondary/20 px-8 font-bold text-xl" required placeholder="0.00" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Category</label>
                        <select name="category" className="w-full h-16 glass-panel rounded-lg border-black/5 px-8 font-bold text-[10px] uppercase tracking-widest outline-none bg-white/50">
                          <option value="FASHION">Fashion</option>
                          <option value="ACCESSORIES">Accessories</option>
                          <option value="PATTERNS">Patterns</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-black/5 rounded-lg border border-black/5">
                      <input type="checkbox" name="is_featured" id="feat" className="w-5 h-5 accent-secondary" />
                      <label htmlFor="feat" className="text-xs font-bold uppercase tracking-widest cursor-pointer">Curated Highlight (Homepage)</label>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Visual Asset (URL)</label>
                      <Input name="image" className="glass-panel h-16 rounded-lg border-black/5 focus:border-secondary/40 focus:ring-secondary/20 px-8 font-medium" placeholder="https://unsplash.com/..." />
                    </div>
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Artistic Statement</label>
                      <textarea 
                        name="description"
                        className="w-full h-40 glass-panel rounded-lg border-black/5 p-8 outline-none focus:border-secondary/40 focus:ring-2 focus:ring-secondary/20 transition-all font-medium text-lg leading-relaxed text-foreground bg-white/50"
                        placeholder="Materiality, silhouette, and technique..."
                      />
                    </div>
                    <Button type="submit" className="w-full rounded-full bg-secondary text-white h-20 font-bold uppercase text-lg tracking-widest shadow-[0_15px_40px_rgba(255,0,0,0.2)]">
                      Publish Design
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add Portfolio Modal */}
        <AnimatePresence>
          {isAddingPortfolio && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 bg-black/40 backdrop-blur-3xl overflow-y-auto"
            >
              <div className="glass-panel p-8 md:p-16 rounded-lg max-w-4xl w-full border-white/10 space-y-12 relative bg-white/90 shadow-2xl my-auto">
                <div className="flex justify-between items-start">
                  <div className="space-y-4">
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground uppercase leading-none">Curate<br /><span className="text-secondary italic">Project</span></h2>
                    <p className="text-muted-foreground font-medium italic text-lg">Document a high-couture milestone in the studio portfolio.</p>
                  </div>
                  <Button variant="ghost" className="rounded-full w-12 h-12 p-0" onClick={() => setIsAddingPortfolio(false)}>
                    <Trash2 className="w-6 h-6" />
                  </Button>
                </div>

                <form onSubmit={handleAddPortfolio} className="grid lg:grid-cols-2 gap-12">
                  <div className="space-y-8">
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Project Title</label>
                      <Input name="title" className="glass-panel h-16 rounded-lg border-black/5 focus:border-secondary/40 focus:ring-secondary/20 px-8 font-bold text-xl uppercase" required placeholder="e.g. The Solaris Shroud" />
                    </div>
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Presentation Category</label>
                      <Input name="category" className="glass-panel h-16 rounded-lg border-black/5 focus:border-secondary/40 focus:ring-secondary/20 px-8 font-bold text-xs uppercase tracking-widest" required placeholder="RUNWAY / EXHIBITION / BESPOKE" />
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Visual Documentation (URL)</label>
                      <Input name="image" className="glass-panel h-16 rounded-lg border-black/5 focus:border-secondary/40 focus:ring-secondary/20 px-8 font-medium" placeholder="URL to project image" />
                    </div>
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Project Narrative</label>
                      <textarea 
                        name="description"
                        className="w-full h-40 glass-panel rounded-lg border-black/5 p-8 outline-none focus:border-secondary/40 focus:ring-2 focus:ring-secondary/20 transition-all font-medium text-lg leading-relaxed text-foreground bg-white/50"
                        placeholder="The concept, the technique, the journey..."
                      />
                    </div>
                    <Button type="submit" className="w-full rounded-full bg-black text-white h-20 font-bold uppercase text-lg tracking-widest">
                      Calibrate Portfolio
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
