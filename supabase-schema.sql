-- =====================================================
-- ZÜLFİYE CANBOLAT GELİNLİK - Supabase Schema
-- Mauna Couture'den kopyalandı
-- =====================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLOLAR
-- =====================================================

CREATE TABLE public.branches (
  id uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  name text DEFAULT 'Merkez',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  branch_id uuid REFERENCES public.branches(id),
  full_name text,
  phone text,
  role text DEFAULT 'personel',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  avatar_url text,
  pin_code text,
  profile_completed boolean DEFAULT false,
  duty text,
  emergency_note text
);

CREATE TABLE public.products (
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

CREATE TABLE public.customers (
  id uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  branch_id uuid REFERENCES public.branches(id),
  full_name text NOT NULL,
  phone text NOT NULL,
  instagram text,
  address text,
  wedding_date date,
  measurements text,
  notes text,
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamptz DEFAULT now(),
  photo_video text,
  birth_date date,
  engagement_date date,
  waist integer,
  hip integer,
  bust integer,
  fitting_date_1 date,
  fitting_date_2 date,
  fitting_date_3 date,
  engagement_time time,
  wedding_time time,
  fitting_time_1 time,
  fitting_time_2 time,
  fitting_time_3 time
);

CREATE TABLE public.rentals (
  id uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  branch_id uuid REFERENCES public.branches(id),
  product_id uuid REFERENCES public.products(id),
  customer_id uuid REFERENCES public.customers(id),
  rental_date date DEFAULT CURRENT_DATE,
  delivery_date date,
  return_date date,
  total_amount numeric DEFAULT 0,
  deposit_amount numeric DEFAULT 0,
  remaining_amount numeric DEFAULT 0,
  status text DEFAULT 'aktif',
  notes text,
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamptz DEFAULT now(),
  event_date date,
  event_time time,
  event_type text,
  delivery_time time,
  return_time time
);

CREATE TABLE public.rental_items (
  id uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  rental_id uuid REFERENCES public.rentals(id),
  product_id uuid REFERENCES public.products(id),
  price numeric DEFAULT 0 NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.sales (
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

CREATE TABLE public.sale_items (
  id uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  sale_id uuid REFERENCES public.sales(id),
  product_id uuid REFERENCES public.products(id),
  price numeric DEFAULT 0 NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.fittings (
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

CREATE TABLE public.payments (
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

CREATE TABLE public.expenses (
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

CREATE TABLE public.alteration_records (
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

CREATE TABLE public.cleaning_records (
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

CREATE TABLE public.damage_reports (
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

CREATE TABLE public.sms_templates (
  id uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  branch_id uuid REFERENCES public.branches(id),
  title text NOT NULL,
  message text NOT NULL,
  type text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.notifications (
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

CREATE TABLE public.product_logs (
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

CREATE TABLE public.activity_logs (
  id uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  branch_id uuid REFERENCES public.branches(id),
  user_id uuid REFERENCES public.profiles(id),
  action text NOT NULL,
  table_name text,
  record_id uuid,
  description text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.barcode_counters (
  id uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  category_code text NOT NULL,
  year integer NOT NULL,
  last_number integer DEFAULT 0
);

CREATE TABLE public.calendar_events (
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

CREATE TABLE public.accounting_records (
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

-- =====================================================
-- VARSAYILAN VERİ
-- =====================================================
INSERT INTO public.branches (name, is_active) VALUES ('Merkez', true);

-- =====================================================
-- FONKSİYONLAR
-- =====================================================

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
    IF TG_TABLE_NAME = 'customers' THEN
      v_action := 'Müşteri ekledi';
      v_desc   := NEW.full_name;
    ELSIF TG_TABLE_NAME = 'products' THEN
      v_action := 'Ürün ekledi';
      v_desc   := NEW.name || ' (' || NEW.category || ')';
    ELSIF TG_TABLE_NAME = 'rentals' THEN
      v_action := 'Kiralama oluşturdu';
      SELECT full_name INTO v_desc FROM public.customers WHERE id = NEW.customer_id;
    ELSIF TG_TABLE_NAME = 'sales' THEN
      v_action := 'Satış yaptı';
      SELECT full_name INTO v_desc FROM public.customers WHERE id = NEW.customer_id;
    ELSIF TG_TABLE_NAME = 'fittings' THEN
      v_action := 'Prova oluşturdu';
      SELECT full_name INTO v_desc FROM public.customers WHERE id = NEW.customer_id;
    ELSIF TG_TABLE_NAME = 'expenses' THEN
      v_action := 'Gider ekledi';
      v_desc   := NEW.title || ' — ' || NEW.amount || ' ₺';
    ELSIF TG_TABLE_NAME = 'payments' THEN
      v_action := 'Ödeme kaydetti';
      v_desc   := NEW.amount || ' ₺';
    ELSE
      v_action := 'Kayıt ekledi';
      v_desc   := TG_TABLE_NAME;
    END IF;

  ELSIF TG_OP = 'UPDATE' THEN
    IF TG_TABLE_NAME = 'rentals' THEN
      IF OLD.status IS DISTINCT FROM NEW.status THEN
        v_action := 'Kiralama durumu değiştirdi';
        SELECT full_name INTO v_desc FROM public.customers WHERE id = NEW.customer_id;
        v_desc   := v_desc || ': ' || COALESCE(OLD.status,'?') || ' → ' || COALESCE(NEW.status,'?');
      ELSE
        v_action := 'Kiralama güncelledi';
        SELECT full_name INTO v_desc FROM public.customers WHERE id = NEW.customer_id;
      END IF;
    ELSIF TG_TABLE_NAME = 'fittings' THEN
      IF OLD.status IS DISTINCT FROM NEW.status THEN
        v_action := 'Prova durumu değiştirdi';
        SELECT full_name INTO v_desc FROM public.customers WHERE id = NEW.customer_id;
        v_desc   := v_desc || ': ' || COALESCE(OLD.status,'?') || ' → ' || COALESCE(NEW.status,'?');
      ELSE
        v_action := 'Prova güncelledi';
        SELECT full_name INTO v_desc FROM public.customers WHERE id = NEW.customer_id;
      END IF;
    ELSIF TG_TABLE_NAME = 'customers' THEN
      v_action := 'Müşteri güncelledi';
      v_desc   := NEW.full_name;
    ELSIF TG_TABLE_NAME = 'products' THEN
      IF OLD.status IS DISTINCT FROM NEW.status THEN
        v_action := 'Ürün durumu değiştirdi';
        v_desc   := NEW.name || ': ' || COALESCE(OLD.status,'?') || ' → ' || COALESCE(NEW.status,'?');
      ELSE
        v_action := 'Ürün güncelledi';
        v_desc   := NEW.name;
      END IF;
    ELSE
      v_action := 'Kayıt güncelledi';
      v_desc   := TG_TABLE_NAME;
    END IF;
  END IF;

  INSERT INTO public.activity_logs (user_id, action, table_name, record_id, description)
  VALUES (
    v_user_id, v_action, TG_TABLE_NAME,
    CASE WHEN TG_OP = 'DELETE' THEN OLD.id ELSE NEW.id END,
    v_desc
  );
  RETURN NEW;
END;
$$;

-- =====================================================
-- TRIGGER
-- =====================================================

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER trg_log_customers
  AFTER INSERT OR UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.log_activity();

CREATE TRIGGER trg_log_products
  AFTER INSERT OR UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.log_activity();

CREATE TRIGGER trg_log_rentals
  AFTER INSERT OR UPDATE ON public.rentals
  FOR EACH ROW EXECUTE FUNCTION public.log_activity();

CREATE TRIGGER trg_log_sales
  AFTER INSERT OR UPDATE ON public.sales
  FOR EACH ROW EXECUTE FUNCTION public.log_activity();

CREATE TRIGGER trg_log_fittings
  AFTER INSERT OR UPDATE ON public.fittings
  FOR EACH ROW EXECUTE FUNCTION public.log_activity();

CREATE TRIGGER trg_log_expenses
  AFTER INSERT ON public.expenses
  FOR EACH ROW EXECUTE FUNCTION public.log_activity();

CREATE TRIGGER trg_log_payments
  AFTER INSERT ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.log_activity();

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rentals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rental_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fittings ENABLE ROW LEVEL SECURITY;
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

-- branches
CREATE POLICY "authenticated_branches_select" ON public.branches FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_branches_write" ON public.branches FOR ALL TO authenticated USING (is_admin());

-- profiles
CREATE POLICY "profiles select authenticated" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles insert own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles update own" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- products
CREATE POLICY "authenticated_can_select_products" ON public.products FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_can_insert_products" ON public.products FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "authenticated_can_update_products" ON public.products FOR UPDATE TO authenticated USING (true);
CREATE POLICY "admin_delete_products" ON public.products FOR DELETE TO authenticated USING (is_admin());

-- customers
CREATE POLICY "authenticated_can_select_customers" ON public.customers FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_can_insert_customers" ON public.customers FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "authenticated_can_update_customers" ON public.customers FOR UPDATE TO authenticated USING (true);
CREATE POLICY "admin_delete_customers" ON public.customers FOR DELETE TO authenticated USING (is_admin());

-- rentals
CREATE POLICY "authenticated_can_select_rentals" ON public.rentals FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_can_insert_rentals" ON public.rentals FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "staff_update_same_day_rentals" ON public.rentals FOR UPDATE TO authenticated USING (is_admin() OR (date((created_at AT TIME ZONE 'Europe/Istanbul')) = CURRENT_DATE));
CREATE POLICY "admin_delete_rentals" ON public.rentals FOR DELETE TO authenticated USING (is_admin());

-- rental_items
CREATE POLICY "authenticated_rental_items" ON public.rental_items FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "admin_delete_rental_items" ON public.rental_items FOR DELETE TO authenticated USING (is_admin());

-- sales
CREATE POLICY "authenticated_can_select_sales" ON public.sales FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_can_insert_sales" ON public.sales FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "staff_update_same_day_sales" ON public.sales FOR UPDATE TO authenticated USING (is_admin() OR (date((created_at AT TIME ZONE 'Europe/Istanbul')) = CURRENT_DATE));
CREATE POLICY "admin_delete_sales" ON public.sales FOR DELETE TO authenticated USING (is_admin());

-- sale_items
CREATE POLICY "authenticated_sale_items" ON public.sale_items FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "admin_delete_sale_items" ON public.sale_items FOR DELETE TO authenticated USING (is_admin());

-- fittings
CREATE POLICY "authenticated_can_select_fittings" ON public.fittings FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_can_insert_fittings" ON public.fittings FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "authenticated_can_update_fittings" ON public.fittings FOR UPDATE TO authenticated USING (true);
CREATE POLICY "admin_delete_fittings" ON public.fittings FOR DELETE TO authenticated USING (is_admin());

-- payments
CREATE POLICY "authenticated_payments_select" ON public.payments FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_payments_insert" ON public.payments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "authenticated_payments_update" ON public.payments FOR UPDATE TO authenticated USING (true);
CREATE POLICY "admin_payments_delete" ON public.payments FOR DELETE TO authenticated USING (is_admin());

-- expenses
CREATE POLICY "authenticated_expenses_select" ON public.expenses FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_expenses_insert" ON public.expenses FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "authenticated_expenses_update" ON public.expenses FOR UPDATE TO authenticated USING (true);
CREATE POLICY "admin_expenses_delete" ON public.expenses FOR DELETE TO authenticated USING (is_admin());

-- alteration_records
CREATE POLICY "authenticated_alteration_select" ON public.alteration_records FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_alteration_insert" ON public.alteration_records FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "authenticated_alteration_update" ON public.alteration_records FOR UPDATE TO authenticated USING (true);
CREATE POLICY "admin_alteration_delete" ON public.alteration_records FOR DELETE TO authenticated USING (is_admin());

-- cleaning_records
CREATE POLICY "authenticated_cleaning_select" ON public.cleaning_records FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_cleaning_insert" ON public.cleaning_records FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "authenticated_cleaning_update" ON public.cleaning_records FOR UPDATE TO authenticated USING (true);
CREATE POLICY "admin_cleaning_delete" ON public.cleaning_records FOR DELETE TO authenticated USING (is_admin());

-- damage_reports
CREATE POLICY "authenticated_damage_select" ON public.damage_reports FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_damage_insert" ON public.damage_reports FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "authenticated_damage_update" ON public.damage_reports FOR UPDATE TO authenticated USING (true);
CREATE POLICY "admin_damage_delete" ON public.damage_reports FOR DELETE TO authenticated USING (is_admin());

-- sms_templates
CREATE POLICY "authenticated_sms_templates_select" ON public.sms_templates FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_sms_templates_write" ON public.sms_templates FOR ALL TO authenticated USING (is_admin());

-- notifications
CREATE POLICY "authenticated_notifications_select" ON public.notifications FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_notifications_insert" ON public.notifications FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "authenticated_notifications_update" ON public.notifications FOR UPDATE TO authenticated USING (true);

-- product_logs
CREATE POLICY "authenticated_product_logs_select" ON public.product_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_product_logs_insert" ON public.product_logs FOR INSERT TO authenticated WITH CHECK (true);

-- activity_logs
CREATE POLICY "authenticated_activity_select" ON public.activity_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_activity_insert" ON public.activity_logs FOR INSERT TO authenticated WITH CHECK (true);

-- barcode_counters
CREATE POLICY "authenticated_barcode_select" ON public.barcode_counters FOR SELECT TO authenticated USING (true);

-- calendar_events
CREATE POLICY "authenticated_select_calendar_events" ON public.calendar_events FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_insert_calendar_events" ON public.calendar_events FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "authenticated_update_calendar_events" ON public.calendar_events FOR UPDATE TO authenticated USING (true);
CREATE POLICY "admin_delete_calendar_events" ON public.calendar_events FOR DELETE TO authenticated USING (is_admin());

-- accounting_records
CREATE POLICY "authenticated_accounting_select" ON public.accounting_records FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_only_accounting_insert" ON public.accounting_records FOR INSERT TO authenticated WITH CHECK (is_admin());
CREATE POLICY "admin_only_accounting_update" ON public.accounting_records FOR UPDATE TO authenticated USING (is_admin());
CREATE POLICY "admin_accounting_delete" ON public.accounting_records FOR DELETE TO authenticated USING (is_admin());
