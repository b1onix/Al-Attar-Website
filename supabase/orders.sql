-- Create a schema for our orders
CREATE TABLE public.orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_name TEXT NOT NULL,
    email TEXT,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    zip_code TEXT,
    notes TEXT,
    total_amount DECIMAL(10, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'Na čekanju', -- 'Na čekanju', 'U obradi', 'Poslano', 'Dostavljeno', 'Otkazano'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create order items table
CREATE TABLE public.order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    price_at_time DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (temporarily public for demo purposes, in production should be restricted)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Allow public insert to orders (so customers can checkout)
CREATE POLICY "Allow public insert on orders" 
ON public.orders FOR INSERT WITH CHECK (true);

-- Allow public insert to order_items
CREATE POLICY "Allow public insert on order_items" 
ON public.order_items FOR INSERT WITH CHECK (true);

-- Allow public read/update on orders (for admin panel demo purposes without auth)
CREATE POLICY "Allow public read/update on orders" 
ON public.orders FOR SELECT USING (true);
CREATE POLICY "Allow public update on orders" 
ON public.orders FOR UPDATE USING (true);

-- Allow public read on order_items
CREATE POLICY "Allow public read on order_items" 
ON public.order_items FOR SELECT USING (true);

-- Ensure storage bucket exists for product images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for the bucket
-- Allow public select
CREATE POLICY "Public read access for product images"
ON storage.objects FOR SELECT USING ( bucket_id = 'product-images' );

-- Allow public insert (for admin panel demo purposes without auth)
CREATE POLICY "Public insert access for product images"
ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'product-images' );

-- Allow public update/delete (for admin panel demo purposes without auth)
CREATE POLICY "Public update access for product images"
ON storage.objects FOR UPDATE USING ( bucket_id = 'product-images' );
CREATE POLICY "Public delete access for product images"
ON storage.objects FOR DELETE USING ( bucket_id = 'product-images' );