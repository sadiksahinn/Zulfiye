-- =====================================================
-- ZÜLFİYE CANBOLAT GELİNLİK - TAM ŞEMA
-- Supabase SQL Editor'a yapıştır ve RUN et
-- =====================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- TABLOLAR

CREATE TABLE IF NOT EXISTS public.branches (
  id uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  name text DEFAULT 'Merkez',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  branch_id uuid REFERENCES public.branches(id),
  full_name text,
  phone text,
  role text DEFAULT 'staff',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  avatar_url text,
  pin_code text,
  profile_completed boolean DEFAULT false,
  duty text,
  emergency_note text
);

CREATE TABLE IF NOT EXISTS public.products (
  id uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  branch_id uuid REFERENCES public.branches(id),
  barcode text UNIQUE NOT NULL,
  product_code text,
  name text NOT NULL,
  category text NOT NULL,
  operation_type text DEFAULT 'kiralama_satis',
  size text,
  color text,
  model_name text,
  purchase_price numeric DEFAULT 0,
  sale_price numeric DEFAULT 0,
  rental_price numeric DEFAULT 0,
  status text DEFAULT 'stokta',
  image_url text,
  notes text,
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.customers (
  id uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  branch_id uuid REFERENCES public.branches(id),
  full_name text NOT NULL,
  phone text NOT NULL,
  instagram text,
  address text,
  wedding_date date,
  wedding_time time,
  measurements text,
  notes text,
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamptz DEFAULT now(),
  photo_video text,
  photo_video_date date,
  photo_video_dress boolean DEFAULT false,
  photo_video_makeup boolean DEFAULT false,
  birth_date date,
  engagement_date date,
  engagement_time time,
  waist integer,
  hip integer,
  bust integer,
  fitting_date_1 date,
  fitting_date_2 date,
  fitting_date_3 date,
  fitting_time_1 time,
  fitting_time_2 time,
  fitting_time_3 time
);

CREATE TABLE IF NOT EXISTS public.rentals (
  id uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  branch_id uuid REFERENCES public.branches(id),
  product_id uuid REFERENCES public.products(id),
  customer_id uuid REFERENCES public.customers(id),
  rental_date date DEFAULT CURRENT_DATE,
  delivery_date date,
  delivery_time time,
  return_date date,
  return_time time,
  event_date date,
  event_time time,
  event_type text,
  total_amount numeric DEFAULT 0,
  deposit_amount numeric DEFAULT 0,
  remaining_amount numeric DEFAULT 0,
  status text DEFAULT 'aktif',
  notes text,
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.rental_items (
  id uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  rental_id uuid REFERENCES public.rentals(id),
  product_id uuid REFERENCES public.products(id),
  price numeric DEFAULT 0 NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.sales (
  id uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  branch_id uuid REFERENCES public.branches(id),
  product_id uuid REFERENCES public.products(id),
  customer_id uuid REFERENCES public.customers(id),
  sale_date date DEFAULT CURRENT_DATE,
  total_amount numeric DEFAULT 0,
  paid_amount numeric DEFAULT 0,
  remaining_amount numeric DEFAULT 0,
  payment_type text,
  status text DEFAULT 'tamamlandi',
  notes text,
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.sale_items (
  id uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  sale_id uuid REFERENCES public.sales(id),
  product_id uuid REFERENCES public.products(id),
  price numeric DEFAULT 0 NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.fittings (
  id uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  branch_id uuid REFERENCES public.branches(id),
  customer_id uuid REFERENCES public.customers(id),
  product_id uuid REFERENCES public.products(id),
  fitting_date date NOT NULL,
  fitting_time time,
  status text DEFAULT 'bekliyor',
  measurement_notes text,
  alteration_notes text,
  assigned_to uuid REFERENCES public.profiles(id),
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.beauty_appointments (
  id uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  customer_id uuid REFERENCES public.customers(id) ON DELETE SET NULL,
  service_type text NOT NULL DEFAULT 'Kuaför + Makyaj',
  appointment_date date,
  appointment_time time,
  event_date date,
  event_time time,
  event_type text DEFAULT 'Düğün',
  price numeric(12,2) DEFAULT 0,
  deposit_amount numeric(12,2) DEFAULT 0,
  paid_amount numeric(12,2) DEFAULT 0,
  remaining_amount numeric(12,2) GENERATED ALWAYS AS (price - paid_amount) STORED,
  status text NOT NULL DEFAULT 'rezerve',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.payments (
  id uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  branch_id uuid REFERENCES public.branches(id),
  customer_id uuid REFERENCES public.customers(id),
  rental_id uuid REFERENCES public.rentals(id),
  sale_id uuid REFERENCES public.sales(id),
  amount numeric NOT NULL,
  payment_type text,
  payment_date date DEFAULT CURRENT_DATE,
  note text,
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.expenses (
  id uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  branch_id uuid REFERENCES public.branches(id),
  title text NOT NULL,
  amount numeric NOT NULL,
  expense_date date DEFAULT CURRENT_DATE,
  category text,
  note text,
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.alteration_records (
  id uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  branch_id uuid REFERENCES public.branches(id),
  product_id uuid REFERENCES public.products(id),
  customer_id uuid REFERENCES public.customers(id),
  title text,
  description text,
  status text DEFAULT 'bekliyor',
  due_date date,
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.cleaning_records (
  id uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  branch_id uuid REFERENCES public.branches(id),
  product_id uuid REFERENCES public.products(id),
  status text DEFAULT 'bekliyor',
  sent_date date,
  return_date date,
  cost numeric DEFAULT 0,
  note text,
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.damage_reports (
  id uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  branch_id uuid REFERENCES public.branches(id),
  product_id uuid REFERENCES public.products(id),
  customer_id uuid REFERENCES public.customers(id),
  rental_id uuid REFERENCES public.rentals(id),
  damage_type text,
  description text,
  penalty_amount numeric DEFAULT 0,
  image_url text,
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.sms_templates (
  id uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  branch_id uuid REFERENCES public.branches(id),
  title text NOT NULL,
  message text NOT NULL,
  type text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  branch_id uuid REFERENCES public.branches(id),
  customer_id uuid REFERENCES public.customers(id),
  type text,
  channel text,
  message text,
  scheduled_at timestamptz,
  sent_at timestamptz,
  status text DEFAULT 'bekliyor',
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.product_logs (
  id uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  branch_id uuid REFERENCES public.branches(id),
  product_id uuid REFERENCES public.products(id),
  action text NOT NULL,
  old_status text,
  new_status text,
  note text,
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.activity_logs (
  id uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  branch_id uuid REFERENCES public.branches(id),
  user_id uuid REFERENCES public.profiles(id),
  action text NOT NULL,
  table_name text,
  record_id uuid,
  description text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.barcode_counters (
  id uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  category_code text NOT NULL,
  year integer NOT NULL,
  last_number integer DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.calendar_events (
  id uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  branch_id uuid REFERENCES public.branches(id),
  product_id uuid REFERENCES public.products(id),
  customer_id uuid REFERENCES public.customers(id),
  rental_id uuid REFERENCES public.rentals(id),
  sale_id uuid REFERENCES public.sales(id),
  title text NOT NULL,
  event_type text NOT NULL,
  event_date date NOT NULL,
  event_time time,
  color text,
  description text,
  sms_enabled boolean DEFAULT true,
  sms_status text DEFAULT 'bekliyor',
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.accounting_records (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  type text NOT NULL,
  category text,
  title text NOT NULL,
  amount numeric DEFAULT 0,
  payment_method text,
  notes text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- VARSAYILAN VERİ
INSERT INTO public.branches (name, is_active) VALUES ('Merkez', true)
ON CONFLICT DO NOTHING;

-- FONKSİYONLAR

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT COALESCE(role IN ('admin', 'super_admin'), false)
  FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
declare
  merkez_branch_id uuid;
begin
  SELECT id INTO merkez_branch_id FROM public.branches WHERE name = 'Merkez' LIMIT 1;
  INSERT INTO public.profiles (id, branch_id, full_name, phone, role, is_active)
  VALUES (
    new.id, merkez_branch_id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    new.raw_user_meta_data->>'phone',
    'staff', true
  );
  RETURN new;
END;
$$;

CREATE OR REPLACE FUNCTION public.log_activity()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_user_id   uuid;
  v_desc      text;
  v_action    text;
BEGIN
  v_user_id := auth.uid();
  IF TG_OP = 'INSERT' THEN
    IF TG_TABLE_NAME = 'customers' THEN v_action := 'Müşteri ekledi'; v_desc := NEW.full_name;
    ELSIF TG_TABLE_NAME = 'products' THEN v_action := 'Ürün ekledi'; v_desc := NEW.name;
    ELSIF TG_TABLE_NAME = 'rentals' THEN v_action := 'Kiralama oluşturdu'; SELECT full_name INTO v_desc FROM public.customers WHERE id = NEW.customer_id;
    ELSIF TG_TABLE_NAME = 'sales' THEN v_action := 'Satış yaptı'; SELECT full_name INTO v_desc FROM public.customers WHERE id = NEW.customer_id;
    ELSIF TG_TABLE_NAME = 'fittings' THEN v_action := 'Prova oluşturdu'; SELECT full_name INTO v_desc FROM public.customers WHERE id = NEW.customer_id;
    ELSE v_action := 'Kayıt ekledi'; v_desc := TG_TABLE_NAME;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    IF TG_TABLE_NAME = 'customers' THEN v_action := 'Müşteri güncelledi'; v_desc := NEW.full_name;
    ELSIF TG_TABLE_NAME = 'products' THEN v_action := 'Ürün güncelledi'; v_desc := NEW.name;
    ELSIF TG_TABLE_NAME = 'rentals' THEN v_action := 'Kiralama güncelledi'; SELECT full_name INTO v_desc FROM public.customers WHERE id = NEW.customer_id;
    ELSE v_action := 'Kayıt güncelledi'; v_desc := TG_TABLE_NAME;
    END IF;
  END IF;
  INSERT INTO public.activity_logs (user_id, action, table_name, record_id, description)
  VALUES (v_user_id, v_action, TG_TABLE_NAME, CASE WHEN TG_OP = 'DELETE' THEN OLD.id ELSE NEW.id END, v_desc);
  RETURN NEW;
END;
$$;

-- TRİGGERLAR

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS trg_log_customers ON public.customers;
CREATE TRIGGER trg_log_customers AFTER INSERT OR UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.log_activity();

DROP TRIGGER IF EXISTS trg_log_products ON public.products;
CREATE TRIGGER trg_log_products AFTER INSERT OR UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.log_activity();

DROP TRIGGER IF EXISTS trg_log_rentals ON public.rentals;
CREATE TRIGGER trg_log_rentals AFTER INSERT OR UPDATE ON public.rentals FOR EACH ROW EXECUTE FUNCTION public.log_activity();

DROP TRIGGER IF EXISTS trg_log_sales ON public.sales;
CREATE TRIGGER trg_log_sales AFTER INSERT OR UPDATE ON public.sales FOR EACH ROW EXECUTE FUNCTION public.log_activity();

DROP TRIGGER IF EXISTS trg_log_fittings ON public.fittings;
CREATE TRIGGER trg_log_fittings AFTER INSERT OR UPDATE ON public.fittings FOR EACH ROW EXECUTE FUNCTION public.log_activity();

-- RLS ETKİNLEŞTİR

ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rentals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rental_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fittings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.beauty_appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alteration_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cleaning_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.damage_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sms_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.barcode_counters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounting_records ENABLE ROW LEVEL SECURITY;

-- POLİTİKALAR

CREATE POLICY "branches_select" ON public.branches FOR SELECT TO authenticated USING (true);
CREATE POLICY "branches_write" ON public.branches FOR ALL TO authenticated USING (is_admin());

CREATE POLICY "profiles_select" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles_insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE POLICY "products_select" ON public.products FOR SELECT TO authenticated USING (true);
CREATE POLICY "products_insert" ON public.products FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "products_update" ON public.products FOR UPDATE TO authenticated USING (true);
CREATE POLICY "products_delete" ON public.products FOR DELETE TO authenticated USING (is_admin());

CREATE POLICY "customers_select" ON public.customers FOR SELECT TO authenticated USING (true);
CREATE POLICY "customers_insert" ON public.customers FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "customers_update" ON public.customers FOR UPDATE TO authenticated USING (true);
CREATE POLICY "customers_delete" ON public.customers FOR DELETE TO authenticated USING (is_admin());

CREATE POLICY "rentals_select" ON public.rentals FOR SELECT TO authenticated USING (true);
CREATE POLICY "rentals_insert" ON public.rentals FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "rentals_update" ON public.rentals FOR UPDATE TO authenticated USING (true);
CREATE POLICY "rentals_delete" ON public.rentals FOR DELETE TO authenticated USING (is_admin());

CREATE POLICY "rental_items_all" ON public.rental_items FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "sales_select" ON public.sales FOR SELECT TO authenticated USING (true);
CREATE POLICY "sales_insert" ON public.sales FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "sales_update" ON public.sales FOR UPDATE TO authenticated USING (true);
CREATE POLICY "sales_delete" ON public.sales FOR DELETE TO authenticated USING (is_admin());

CREATE POLICY "sale_items_all" ON public.sale_items FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "fittings_select" ON public.fittings FOR SELECT TO authenticated USING (true);
CREATE POLICY "fittings_insert" ON public.fittings FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "fittings_update" ON public.fittings FOR UPDATE TO authenticated USING (true);
CREATE POLICY "fittings_delete" ON public.fittings FOR DELETE TO authenticated USING (is_admin());

CREATE POLICY "beauty_select" ON public.beauty_appointments FOR SELECT TO authenticated USING (true);
CREATE POLICY "beauty_insert" ON public.beauty_appointments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "beauty_update" ON public.beauty_appointments FOR UPDATE TO authenticated USING (true);
CREATE POLICY "beauty_delete" ON public.beauty_appointments FOR DELETE TO authenticated USING (is_admin());

CREATE POLICY "payments_select" ON public.payments FOR SELECT TO authenticated USING (true);
CREATE POLICY "payments_insert" ON public.payments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "payments_update" ON public.payments FOR UPDATE TO authenticated USING (true);
CREATE POLICY "payments_delete" ON public.payments FOR DELETE TO authenticated USING (is_admin());

CREATE POLICY "expenses_select" ON public.expenses FOR SELECT TO authenticated USING (true);
CREATE POLICY "expenses_insert" ON public.expenses FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "expenses_update" ON public.expenses FOR UPDATE TO authenticated USING (true);
CREATE POLICY "expenses_delete" ON public.expenses FOR DELETE TO authenticated USING (is_admin());

CREATE POLICY "alteration_select" ON public.alteration_records FOR SELECT TO authenticated USING (true);
CREATE POLICY "alteration_insert" ON public.alteration_records FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "alteration_update" ON public.alteration_records FOR UPDATE TO authenticated USING (true);
CREATE POLICY "alteration_delete" ON public.alteration_records FOR DELETE TO authenticated USING (is_admin());

CREATE POLICY "cleaning_select" ON public.cleaning_records FOR SELECT TO authenticated USING (true);
CREATE POLICY "cleaning_insert" ON public.cleaning_records FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "cleaning_update" ON public.cleaning_records FOR UPDATE TO authenticated USING (true);
CREATE POLICY "cleaning_delete" ON public.cleaning_records FOR DELETE TO authenticated USING (is_admin());

CREATE POLICY "damage_select" ON public.damage_reports FOR SELECT TO authenticated USING (true);
CREATE POLICY "damage_insert" ON public.damage_reports FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "damage_update" ON public.damage_reports FOR UPDATE TO authenticated USING (true);
CREATE POLICY "damage_delete" ON public.damage_reports FOR DELETE TO authenticated USING (is_admin());

CREATE POLICY "sms_select" ON public.sms_templates FOR SELECT TO authenticated USING (true);
CREATE POLICY "sms_write" ON public.sms_templates FOR ALL TO authenticated USING (is_admin());

CREATE POLICY "notifications_select" ON public.notifications FOR SELECT TO authenticated USING (true);
CREATE POLICY "notifications_insert" ON public.notifications FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "notifications_update" ON public.notifications FOR UPDATE TO authenticated USING (true);

CREATE POLICY "product_logs_select" ON public.product_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "product_logs_insert" ON public.product_logs FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "activity_select" ON public.activity_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "activity_insert" ON public.activity_logs FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "barcode_select" ON public.barcode_counters FOR SELECT TO authenticated USING (true);

CREATE POLICY "calendar_select" ON public.calendar_events FOR SELECT TO authenticated USING (true);
CREATE POLICY "calendar_insert" ON public.calendar_events FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "calendar_update" ON public.calendar_events FOR UPDATE TO authenticated USING (true);
CREATE POLICY "calendar_delete" ON public.calendar_events FOR DELETE TO authenticated USING (is_admin());

CREATE POLICY "accounting_select" ON public.accounting_records FOR SELECT TO authenticated USING (true);
CREATE POLICY "accounting_insert" ON public.accounting_records FOR INSERT TO authenticated WITH CHECK (is_admin());
CREATE POLICY "accounting_update" ON public.accounting_records FOR UPDATE TO authenticated USING (is_admin());
CREATE POLICY "accounting_delete" ON public.accounting_records FOR DELETE TO authenticated USING (is_admin());
