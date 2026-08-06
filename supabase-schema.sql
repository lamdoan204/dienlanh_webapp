-- Tạo bảng bookings
CREATE TABLE IF NOT EXISTS public.bookings (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  address TEXT NOT NULL,
  device TEXT NOT NULL,
  service_package TEXT NOT NULL,
  selected_date TEXT NOT NULL,
  selected_time_slot TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  status TEXT NOT NULL,
  technician_name TEXT,
  technician_phone TEXT,
  estimated_cost NUMERIC,
  final_cost NUMERIC
);

-- Tạo bảng reviews
CREATE TABLE IF NOT EXISTS public.reviews (
  id TEXT PRIMARY KEY,
  author TEXT NOT NULL,
  avatar TEXT,
  rating NUMERIC NOT NULL,
  date TEXT NOT NULL,
  service_type TEXT NOT NULL,
  comment TEXT NOT NULL,
  verified BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tắt RLS (Row Level Security) cho mục đích phát triển (hoặc bạn có thể cấu hình RLS policy cho phép anon key đọc/ghi)
ALTER TABLE public.bookings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews DISABLE ROW LEVEL SECURITY;
