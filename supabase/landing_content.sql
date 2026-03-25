-- Create a table for Hero Slider content
CREATE TABLE IF NOT EXISTS hero_slides (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    display_order INTEGER NOT NULL,
    eyebrow TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT NOT NULL,
    stat_label TEXT NOT NULL,
    stat_value TEXT NOT NULL,
    card_title TEXT NOT NULL,
    card_copy TEXT NOT NULL,
    notes TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE hero_slides ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Enable read access for all users on hero_slides" ON hero_slides FOR SELECT USING (true);
CREATE POLICY "Enable all access for authenticated users on hero_slides" ON hero_slides FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Insert default data (matching your current static data)
INSERT INTO hero_slides (display_order, eyebrow, title, description, image_url, stat_label, stat_value, card_title, card_copy, notes) VALUES
(1, 'Atelier collection', 'Mirisi sa prisustvom, oblikovani kao savremeni luksuz.', 'Slojevite kompozicije za one koji žele miris koji djeluje skupo, precizno i nezaboravno.', '/1.png', 'Fokus kolekcije', 'Oud / Rose / Musk', 'Slojevita dubina', 'Dramatičan kadar inspirisan dimom, kožom i toplinom začina.', ARRAY['Oud', 'Tamjan', 'Šafran']),
(2, 'Signature rituals', 'Od dnevne elegancije do večernje dubine, bez ijedne banalne note.', 'Svaki kadar u slideru sada predstavlja jedan karakter mirisa i daje stranici ozbiljniji premium osjećaj.', '/2.png', 'Nosivost', 'Dan i noć', 'Tihi luksuz', 'Čista, moderna kompozicija koja djeluje profinjeno bez previše buke.', ARRAY['Mošus', 'Bijela ruža', 'Sandalovina']),
(3, 'Curated atmosphere', 'Vizuelni identitet koji sada izgleda kao fragrance campaign, ne kao template landing page.', 'Pun ekran, uredniji layering, jača tipografija i elegantno kretanje daju hero sekciji mnogo više prisustva.', '/3.png', 'Art direction', 'Editorial luxury', 'Baršunasti kontrast', 'Bogata noćna atmosfera sa tamnijim cvjetnim karakterom i filmskim završetkom.', ARRAY['Damask ruža', 'Pačuli', 'Amber']);


-- Create a table for general landing page text sections
CREATE TABLE IF NOT EXISTS page_content (
    id TEXT PRIMARY KEY, -- using string ID like 'narrative_section', 'atelier_details'
    content JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE page_content ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Enable read access for all users on page_content" ON page_content FOR SELECT USING (true);
CREATE POLICY "Enable all access for authenticated users on page_content" ON page_content FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Insert default data for the Narrative section
INSERT INTO page_content (id, content) VALUES
('narrative_header', '{"eyebrow": "Mirisna kompozicija", "title": "Parfem koji ne izgleda kao sekcija, nego kao scena.", "description": "Umjesto generičnog rasporeda sa nekoliko kartica, ovaj kadar sada radi kao editorial spread: jaka headline tipografija, različiti moduli, kontrolisan negativni prostor i slojevi koji se otkrivaju kao miris na koži."}'::jsonb),
('atelier_details', '[
    {"label": "Kurirana kompozicija", "title": "Slojevi koji se razvijaju postepeno", "description": "Svaka nota ulazi u kadar u svoje vrijeme, bez buke i bez prenaglašenih akorda."},
    {"label": "Taktilni osjećaj", "title": "Miris kao produžetak stila", "description": "Teksture, tonovi i trag parfema oblikovani su da djeluju jednako luksuzno kao i izgled bočice."},
    {"label": "Savremeni ritual", "title": "Diskretan, ali upečatljiv potpis", "description": "Umjesto generičnog statementa, kompozicija ostavlja precizan, elegantan utisak."}
]'::jsonb),
('scent_journey', '[
    {"phase": "Otvaranje", "notes": "Šafran, bergamot, suho voće", "description": "Prvi utisak je čist i svjetlucav, sa toplinom koja dolazi postepeno."},
    {"phase": "Srce", "notes": "Damask ruža, oud, tamjan", "description": "Sredina donosi dubinu i karakter, bez težine koja guši prostor."},
    {"phase": "Trag", "notes": "Amber, mošus, sandalovina", "description": "Završnica ostaje blizu kože i stvara profinjen, dugotrajan potpis."}
]'::jsonb),
('iconic_scents_header', '{"eyebrow": "Ikonični mirisi", "title": "Tri hero proizvoda prikazana kao premium selekcija, ne kao običan grid.", "description": "Ovdje proizvodi sada dobijaju više identiteta: jasnu ulogu, luksuzniji kadar i elegantniji raspored koji izgleda bliže high-end fragrance brandu nego generičnoj ecommerce listi."}'::jsonb);