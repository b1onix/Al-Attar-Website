-- Create a schema for our products
CREATE TABLE public.products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    compare_at_price DECIMAL(10, 2),
    category TEXT NOT NULL,
    image_url TEXT,
    images TEXT[] DEFAULT '{}',
    stock INTEGER NOT NULL DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    notes TEXT,
    intensity TEXT,
    occasion TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Allow public read access on products" 
ON public.products 
FOR SELECT 
USING (true);

-- Create a storage bucket for product images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Enable public access to the product-images bucket
CREATE POLICY "Public Access" 
ON storage.objects 
FOR SELECT 
USING ( bucket_id = 'product-images' );

-- Insert some dummy data
INSERT INTO public.products (name, description, price, compare_at_price, category, image_url, stock, is_featured)
VALUES 
    ('Oud Al Amir', 'Premium aged oud wood with rich, woody, and slightly sweet notes.', 250.00, 300.00, 'Oud', 'https://picsum.photos/seed/oud1/800/800', 50, true),
    ('Rose Damascena', 'Pure rose extract from the valleys of Taif, known for its intense floral aroma.', 150.00, NULL, 'Attar', 'https://picsum.photos/seed/rose1/800/800', 100, true),
    ('Musk Rijali', 'A classic, clean musk fragrance perfect for everyday wear.', 80.00, 100.00, 'Mošus', 'https://picsum.photos/seed/musk1/800/800', 200, false),
    ('Amber Night', 'Warm and inviting amber blended with subtle spices.', 120.00, NULL, 'Attar', 'https://picsum.photos/seed/amber1/800/800', 75, true);
