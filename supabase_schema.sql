-- Supabase Database Schema for Brenda Designs

-- 1. Enable RLS
-- (Run these via the Supabase Dashboard SQL Editor)

-- 2. Products Table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    currency TEXT DEFAULT 'Ksh',
    category TEXT NOT NULL CHECK (category IN ('FASHION', 'ACCESSORIES', 'PATTERNS')),
    image_url TEXT,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- (Profiles, Orders, Activities remain same)

-- 6. Portfolio Items
CREATE TABLE IF NOT EXISTS public.portfolio (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    category TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Inquiries
CREATE TABLE IF NOT EXISTS public.inquiries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'RESOLVED')),
    response TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Profiles Table (Linked to Auth.Users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'COLLECTOR' CHECK (role IN ('GUEST', 'COLLECTOR', 'MUSE', 'ADMIN')),
    authorities TEXT[], -- Array of AdminAuthority strings
    measurements JSONB DEFAULT '{"height": 0, "chest": 0, "arm_length": 0, "unit": "cm"}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Orders & Commissions
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID REFERENCES public.profiles(id),
    amount DECIMAL(10, 2) NOT NULL,
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
    progress INT DEFAULT 0,
    item_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Activities (Global Feed)
CREATE TABLE IF NOT EXISTS public.activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_name TEXT,
    action TEXT NOT NULL,
    icon_type TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Content Narratives
CREATE TABLE IF NOT EXISTS public.narratives (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT,
    section TEXT UNIQUE, -- e.g. 'craftsmanship', 'about'
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. UI Settings
CREATE TABLE IF NOT EXISTS public.ui_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    key TEXT UNIQUE NOT NULL, -- e.g. 'glass_blur', 'primary_color'
    value TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Wishlists
CREATE TABLE IF NOT EXISTS public.wishlists (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

-- RLS Policies Examples:
-- ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Public read" ON public.products FOR SELECT USING (true);
-- CREATE POLICY "Admin write" ON public.products FOR ALL USING (
--   EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN')
-- );
-- ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Users can read own wishlist" ON public.wishlists FOR SELECT USING (auth.uid() = user_id);
-- CREATE POLICY "Users can insert own wishlist" ON public.wishlists FOR INSERT WITH CHECK (auth.uid() = user_id);
-- CREATE POLICY "Users can delete own wishlist" ON public.wishlists FOR DELETE USING (auth.uid() = user_id);
