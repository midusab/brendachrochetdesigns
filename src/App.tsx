import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { useState, useEffect, ReactNode, lazy, Suspense } from 'react';
import { PageLoader } from '@/components/ui/loaders';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { Home } from '@/pages/Home';

// Lazy load other pages
const Portfolio = lazy(() => import('@/pages/Portfolio').then(m => ({ default: m.Portfolio })));
const Shop = lazy(() => import('@/pages/Shop').then(m => ({ default: m.Shop })));
const Admin = lazy(() => import('@/pages/Admin').then(m => ({ default: m.Admin })));
const Auth = lazy(() => import('@/pages/Auth').then(m => ({ default: m.Auth })));
const Profile = lazy(() => import('@/pages/Profile').then(m => ({ default: m.Profile })));
const Wishlist = lazy(() => import('@/pages/Wishlist').then(m => ({ default: m.Wishlist })));

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) return <PageLoader />;
  if (!user) return <Navigate to="/auth" replace />;

  return <>{children}</>;
}

export default function App() {
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    // Simulate initial brand load
    const timer = setTimeout(() => setIsInitialLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (isInitialLoading) return <PageLoader />;

  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen mesh-gradient selection:bg-white/20 relative">
          <Header />
          <main>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/portfolio" element={<Portfolio />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/auth" element={<Auth />} />
                <Route 
                  path="/wishlist" 
                  element={
                    <ProtectedRoute>
                      <Wishlist />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/profile" 
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin" 
                  element={
                    <ProtectedRoute>
                      <Admin />
                    </ProtectedRoute>
                  } 
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </main>
          <Footer />
          <Toaster theme="light" position="bottom-right" />
        </div>
      </Router>
    </AuthProvider>
  );
}
