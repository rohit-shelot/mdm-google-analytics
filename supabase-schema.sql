-- =============================================
-- MDM Gaming Store — Supabase Database Schema
-- Run this ONCE in your Supabase SQL Editor
-- =============================================

-- PROFILES (extends auth.users)
-- NOTE: Passwords are NEVER stored here. Supabase Auth handles that securely.
CREATE TABLE IF NOT EXISTS public.profiles (
  id         uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username   text,
  email      text UNIQUE,
  role       text NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  avatar_url text,
  created_at timestamptz DEFAULT now()
);

-- =============================================
-- SINGLE ADMIN ENFORCEMENT
-- Only ONE user can ever have role = 'admin'.
-- The admin email is hardcoded below.
-- Change ADMIN_EMAIL to your own email before running.
-- =============================================

-- Constraint: only one admin row can exist at a time
CREATE UNIQUE INDEX IF NOT EXISTS only_one_admin
  ON public.profiles (role)
  WHERE role = 'admin';

-- Auto-create profile on signup.
-- If the registered email matches ADMIN_EMAIL → role = 'admin' automatically.
-- Everyone else gets role = 'customer'.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  v_role text := 'customer';
BEGIN
  -- ⬇ Change this to YOUR email to auto-become admin on first login
  IF new.email = 'admin@mdmgaming.com' THEN
    v_role := 'admin';
  END IF;

  INSERT INTO public.profiles (id, email, username, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    v_role
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- PRODUCTS
CREATE TABLE IF NOT EXISTS public.products (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  description text,
  price       decimal(10,2) NOT NULL CHECK (price >= 0),
  category    text NOT NULL CHECK (category IN ('console', 'game', 'keyboard', 'mouse', 'accessory')),
  image_url   text,
  stock       integer NOT NULL DEFAULT 0 CHECK (stock >= 0),
  featured    boolean NOT NULL DEFAULT false,
  created_at  timestamptz DEFAULT now()
);

-- ORDERS
CREATE TABLE IF NOT EXISTS public.orders (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  total_amount     decimal(10,2) NOT NULL,
  status           text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  items            jsonb NOT NULL DEFAULT '[]',
  shipping_address jsonb,
  created_at       timestamptz DEFAULT now()
);

-- CART ITEMS
CREATE TABLE IF NOT EXISTS public.cart_items (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity   integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

ALTER TABLE public.profiles   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items  ENABLE ROW LEVEL SECURITY;

-- PROFILES policies
CREATE POLICY "Public profiles are viewable" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- PRODUCTS policies (public read, admin write)
CREATE POLICY "Anyone can view products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Admins can insert products" ON public.products FOR INSERT
  WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Admins can update products" ON public.products FOR UPDATE
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Admins can delete products" ON public.products FOR DELETE
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- ORDERS policies
CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT
  USING (auth.uid() = user_id OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Users can create own orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can update orders" ON public.orders FOR UPDATE
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- CART policies
CREATE POLICY "Users can manage own cart" ON public.cart_items FOR ALL USING (auth.uid() = user_id);

-- =============================================
-- SEED DATA — 12 Sample Gaming Products
-- =============================================

INSERT INTO public.products (name, description, price, category, image_url, stock, featured) VALUES
  ('PlayStation 5 Disc Edition', 'Next-gen Sony PlayStation 5 with disc drive. Experience lightning-fast loading, deeper immersion, and an all-new generation of incredible PlayStation games.', 499.99, 'console', 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=600', 15, true),
  ('Xbox Series X', 'The fastest, most powerful Xbox ever. Play thousands of titles from four generations of consoles.', 499.99, 'console', 'https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=600', 10, true),
  ('God of War Ragnarök', 'Kratos and Atreus journey across the Nine Realms of Norse mythology in this epic sequel.', 69.99, 'game', 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600', 50, true),
  ('Spider-Man 2', 'Marvel''s Spider-Man 2 — Experience the ultimate Spider-Man adventure in an expanded New York.', 69.99, 'game', 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600', 45, true),
  ('Elden Ring', 'Rise, Tarnished, and be guided by grace to brandish the power of the Elden Ring.', 59.99, 'game', 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=600', 60, false),
  ('Logitech G Pro X Keyboard', 'Tournament-grade tenkeyless keyboard with swappable pro-grade switches and LIGHTSYNC RGB.', 129.99, 'keyboard', 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600', 30, true),
  ('Razer BlackWidow V4 Pro', 'Wireless mechanical keyboard with Razer Yellow switches, doubleshot keycaps, and Chroma RGB.', 229.99, 'keyboard', 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=600', 20, false),
  ('Logitech G502 X Plus', 'Wireless gaming mouse with LIGHTFORCE hybrid optical-mechanical switches and HERO 25K sensor.', 159.99, 'mouse', 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=600', 40, true),
  ('Razer DeathAdder V3 Pro', 'Iconic ergonomic gaming mouse with Focus Pro 30K optical sensor and ultra-lightweight design.', 149.99, 'mouse', 'https://images.unsplash.com/photo-1608751819407-8c8672b55b42?w=600', 35, false),
  ('SteelSeries Arctis Nova Pro', 'Premium wireless gaming headset with dual wireless, active noise cancellation, and 360° spatial audio.', 349.99, 'accessory', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600', 25, true),
  ('PS5 DualSense Controller', 'Experience a new era of gaming with haptic feedback and adaptive trigger technology.', 74.99, 'accessory', 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=600', 50, true),
  ('Cyberpunk 2077 Phantom Liberty', 'The only expansion for Cyberpunk 2077. Become an agent of the New United States of America.', 29.99, 'game', 'https://images.unsplash.com/photo-1614624532983-4ce03382d63d?w=600', 80, false);
