-- ==============================================================================
-- Inkora: Supabase Permissions, Schema Verification & Seed Script
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/dhhjqzazevjomffnunvm/sql)
-- ==============================================================================

-- 1. GRANT TABLE PRIVILEGES TO anon & authenticated ROLES
-- In PostgreSQL, RLS policies only work AFTER table privileges are granted.
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO anon, authenticated;

-- 2. EXTENSIONS & ENUMS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('customer', 'admin');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE order_status AS ENUM ('pending', 'processing', 'completed', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 3. ENSURE TABLES EXIST (matching PRD Section 25)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  role user_role DEFAULT 'customer' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  category_id TEXT REFERENCES public.categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  description TEXT,
  price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  stock_quantity INTEGER DEFAULT 0 CHECK (stock_quantity >= 0),
  image_url TEXT,
  is_active BOOLEAN DEFAULT true NOT NULL,
  featured BOOLEAN DEFAULT false NOT NULL,
  specifications JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id TEXT REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, product_id)
);

CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  total_amount NUMERIC(12, 2) NOT NULL CHECK (total_amount >= 0),
  status TEXT DEFAULT 'pending' NOT NULL,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT,
  delivery_address TEXT,
  notes TEXT,
  payment_method TEXT DEFAULT 'cod' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  product_id TEXT REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  price NUMERIC(12, 2) NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  subtotal NUMERIC(12, 2) NOT NULL,
  image_url TEXT
);

-- 4. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Helper to check if current authenticated user is an Admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND (role = 'admin' OR email = 'admin@example.com' OR email = 'admin@inkora.com')
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Profiles Policies
DROP POLICY IF EXISTS "Public profiles can view own" ON public.profiles;
CREATE POLICY "Public profiles can view own" ON public.profiles FOR SELECT USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Categories Policies (Anyone can browse active categories)
DROP POLICY IF EXISTS "Anyone can view active categories" ON public.categories;
CREATE POLICY "Anyone can view active categories" ON public.categories FOR SELECT USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "Admin can manage categories" ON public.categories;
CREATE POLICY "Admin can manage categories" ON public.categories FOR ALL USING (public.is_admin());

-- Products Policies (Anyone can browse active products)
DROP POLICY IF EXISTS "Anyone can view active products" ON public.products;
CREATE POLICY "Anyone can view active products" ON public.products FOR SELECT USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "Admin can manage products" ON public.products;
CREATE POLICY "Admin can manage products" ON public.products FOR ALL USING (public.is_admin());

-- Cart Items Policies (Customer owns their cart)
DROP POLICY IF EXISTS "Users can view their own cart" ON public.cart_items;
CREATE POLICY "Users can view their own cart" ON public.cart_items FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own cart" ON public.cart_items;
CREATE POLICY "Users can manage their own cart" ON public.cart_items FOR ALL USING (auth.uid() = user_id);

-- Orders Policies
DROP POLICY IF EXISTS "Users can view own orders or Admin can view all" ON public.orders;
CREATE POLICY "Users can view own orders or Admin can view all" ON public.orders FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can place orders" ON public.orders;
CREATE POLICY "Users can place orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Admin can update orders" ON public.orders;
CREATE POLICY "Admin can update orders" ON public.orders FOR UPDATE USING (public.is_admin());

-- Order Items Policies
DROP POLICY IF EXISTS "Users can view order items for their orders" ON public.order_items;
CREATE POLICY "Users can view order items for their orders" ON public.order_items FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = order_items.order_id
      AND (orders.user_id = auth.uid() OR public.is_admin())
  )
);

DROP POLICY IF EXISTS "Allow insert order items on order placement" ON public.order_items;
CREATE POLICY "Allow insert order items on order placement" ON public.order_items FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = order_items.order_id
      AND (orders.user_id = auth.uid() OR orders.user_id IS NULL)
  )
);

-- 5. AUTOMATIC PROFILE TRIGGER ON SIGNUP (SECURITY DEFINER)
-- Always enforces role = 'customer' on normal signup per PRD Section 27
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_role user_role := 'customer';
BEGIN
  -- Only allow admin if email specifically matches trusted admin emails
  IF new.email IN ('admin@example.com', 'admin@inkora.com') THEN
    v_role := 'admin';
  END IF;

  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    v_role
  )
  ON CONFLICT (id) DO UPDATE
  SET full_name = EXCLUDED.full_name,
      updated_at = timezone('utc'::text, now());
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. ATOMIC ORDER PLACEMENT AND SAFE STOCK DEDUCTION
CREATE OR REPLACE FUNCTION public.place_order_atomic(
  p_user_id UUID,
  p_order_number TEXT,
  p_total_amount NUMERIC,
  p_customer_name TEXT,
  p_phone TEXT,
  p_delivery_address TEXT,
  p_notes TEXT,
  p_payment_method TEXT,
  p_items JSONB
)
RETURNS UUID AS $$
DECLARE
  v_order_id UUID;
  v_item RECORD;
  v_current_stock INTEGER;
BEGIN
  -- 1. Validate stock for every item first
  FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(
    product_id TEXT,
    product_name TEXT,
    price NUMERIC,
    quantity INTEGER,
    subtotal NUMERIC,
    image_url TEXT
  ) LOOP
    SELECT COALESCE(stock, stock_quantity, 0) INTO v_current_stock
    FROM public.products
    WHERE id = v_item.product_id AND is_active = true
    FOR UPDATE;

    IF v_current_stock IS NULL THEN
      RAISE EXCEPTION 'Product % is unavailable.', v_item.product_name;
    END IF;

    IF v_current_stock < v_item.quantity THEN
      RAISE EXCEPTION 'Insufficient stock for % (Available: %, Requested: %)', 
        v_item.product_name, v_current_stock, v_item.quantity;
    END IF;
  END LOOP;

  -- 2. Insert Order
  INSERT INTO public.orders (
    order_number,
    user_id,
    total_amount,
    status,
    customer_name,
    phone,
    address,
    delivery_address,
    notes,
    payment_method
  ) VALUES (
    p_order_number,
    p_user_id,
    p_total_amount,
    'pending',
    p_customer_name,
    p_phone,
    p_delivery_address,
    p_delivery_address,
    p_notes,
    p_payment_method
  ) RETURNING id INTO v_order_id;

  -- 3. Insert Order Items & Deduct Stock
  FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(
    product_id TEXT,
    product_name TEXT,
    price NUMERIC,
    quantity INTEGER,
    subtotal NUMERIC,
    image_url TEXT
  ) LOOP
    INSERT INTO public.order_items (
      order_id,
      product_id,
      product_name,
      price,
      quantity,
      subtotal,
      image_url
    ) VALUES (
      v_order_id,
      v_item.product_id,
      v_item.product_name,
      v_item.price,
      v_item.quantity,
      v_item.subtotal,
      v_item.image_url
    );

    UPDATE public.products
    SET stock = GREATEST(0, COALESCE(stock, stock_quantity, 0) - v_item.quantity),
        stock_quantity = GREATEST(0, COALESCE(stock_quantity, stock, 0) - v_item.quantity),
        updated_at = timezone('utc'::text, now())
    WHERE id = v_item.product_id;
  END LOOP;

  -- 4. Clear cart for user if authenticated
  IF p_user_id IS NOT NULL THEN
    DELETE FROM public.cart_items WHERE user_id = p_user_id;
  END IF;

  RETURN v_order_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. SEED INITIAL STATIONERY CATEGORIES & PRODUCTS (matching PRD Section 28)
INSERT INTO public.categories (id, name, slug, description, is_active) VALUES
  ('cat-writing', 'Writing', 'writing', 'Smooth gel pens, ballpoints, and mechanical pencils', true),
  ('cat-notebooks', 'Notebooks', 'notebooks', 'Spiral notebooks, hardcover journals, and grid pads', true),
  ('cat-school', 'School Supplies', 'school-supplies', 'Rulers, highlighters, erasers, and pencil cases', true),
  ('cat-office', 'Office Supplies', 'office-supplies', 'Sticky notes, document folders, and correction tape', true),
  ('cat-art', 'Art Supplies', 'art-supplies', 'Drawing graphite pencils, sketchpads, and marker sets', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.products (id, category_id, name, slug, description, price, stock, stock_quantity, image_url, is_active, featured) VALUES
  ('prod-001', 'cat-writing', 'Blue Ballpoint Pen (0.7mm)', 'blue-ballpoint-pen', 'Classic oil-based blue ballpoint pen with smooth tungsten carbide ball. Ideal for daily writing and examinations.', 1200, 50, 50, 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=600&q=80', true, true),
  ('prod-002', 'cat-writing', 'Black Gel Pen (0.5mm Quick-Dry)', 'black-gel-pen', 'Ultra-smooth Japanese-style roller gel pen with fast-drying pigment ink and comfortable non-slip grip.', 1500, 45, 45, 'https://images.unsplash.com/photo-1569683795645-b62e50fbf103?auto=format&fit=crop&w=600&q=80', true, true),
  ('prod-003', 'cat-writing', 'Mechanical Pencil (0.5mm Metal Body)', 'mechanical-pencil', 'Weighted precision drafting pencil with diamond knurled metal grip and brass clutch mechanism.', 3200, 25, 25, 'https://images.unsplash.com/photo-1585336261026-41804f5e7c20?auto=format&fit=crop&w=600&q=80', true, true),
  ('prod-004', 'cat-writing', 'HB Wooden Pencil (Box of 12)', 'hb-wooden-pencil', 'Break-resistant cedarwood HB graphite pencils with soft latex-free pink erasers.', 2400, 30, 30, 'https://images.unsplash.com/photo-1598971861713-54ad16a7e72e?auto=format&fit=crop&w=600&q=80', true, false),
  ('prod-005', 'cat-notebooks', 'A5 Spiral Notebook (Lined 120 Pages)', 'a5-spiral-notebook', 'Durable double-wire spiral binding with protective frosted poly cover and 80 GSM bleed-resistant cream paper.', 2800, 35, 35, 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&w=600&q=80', true, true),
  ('prod-006', 'cat-notebooks', 'A4 Hardcover Notebook (Grid 160 Pages)', 'a4-hardcover-notebook', 'Premium 100 GSM thread-bound grid notebook. Opens flat 180 degrees with dual bookmark ribbons.', 6500, 20, 20, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80', true, true),
  ('prod-007', 'cat-office', 'Pastel Sticky Notes (4 Pads Pack)', 'pastel-sticky-notes', 'Soft aesthetic Morandi pastel sticky notes. Strong adhesive leaves zero residue on removal.', 2500, 40, 40, 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=600&q=80', true, true),
  ('prod-008', 'cat-school', 'Pastel Highlighter Set (5 Colors)', 'pastel-highlighter-set', 'Gentle chisel-tip pastel highlighters that highlight without bleeding through textbook pages.', 4500, 18, 18, 'https://images.unsplash.com/photo-1568205612837-017257d2310a?auto=format&fit=crop&w=600&q=80', true, true),
  ('prod-009', 'cat-school', 'Dust-Free Soft Eraser (Pack of 2)', 'dust-free-soft-eraser', 'Non-abrasive polymer eraser that leaves minimal shavings and does not tear delicate notebook paper.', 1000, 4, 4, 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=600&q=80', true, false),
  ('prod-010', 'cat-school', '30cm Clear Acrylic Ruler', '30cm-clear-acrylic-ruler', 'Shatter-resistant transparent ruler with millimeter and centimeter precision etched markings.', 1200, 15, 15, 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80', true, false),
  ('prod-011', 'cat-school', 'Canvas Zipper Pencil Case', 'canvas-zipper-pencil-case', 'Multi-layer expandable canvas pouch that holds up to 50 pens and accessories with smooth brass zipper.', 5500, 5, 5, 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=600&q=80', true, true),
  ('prod-012', 'cat-office', 'A4 Expanding Document Folder', 'a4-expanding-document-folder', '13-pocket accordion file organizer with color index tabs and secure elastic cord closure.', 4800, 8, 8, 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80', true, false),
  ('prod-013', 'cat-office', 'Correction Tape (5mm x 6m)', 'correction-tape', 'Instant dry white correction tape with tear-resistant polyester film and swivel applicator tip.', 1800, 22, 22, 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=600&q=80', true, false),
  ('prod-014', 'cat-art', 'Dual Tip Art Marker Set (12 Colors)', 'dual-tip-art-marker-set', 'Dual-ended brush and chisel tip markers for sketching, bullet journaling, and hand lettering.', 12500, 6, 6, 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=600&q=80', true, true)
ON CONFLICT (id) DO NOTHING;
