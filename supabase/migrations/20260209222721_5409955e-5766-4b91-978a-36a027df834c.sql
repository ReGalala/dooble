
-- User roles enum
CREATE TYPE public.user_role AS ENUM ('visitor', 'company');

-- Profiles table (linked to auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  email TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'visitor',
  company_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, role, company_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'visitor'),
    NEW.raw_user_meta_data->>'company_name'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Activities table
CREATE TABLE public.activities (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  rating NUMERIC(2,1) NOT NULL DEFAULT 0,
  time TEXT NOT NULL,
  address TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  description TEXT NOT NULL,
  company TEXT NOT NULL,
  company_email TEXT NOT NULL,
  price INTEGER NOT NULL DEFAULT 0,
  tickets_remaining INTEGER NOT NULL DEFAULT 0,
  available_until DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- Everyone can read active activities
CREATE POLICY "Anyone can read activities"
  ON public.activities FOR SELECT
  TO authenticated
  USING (true);

-- Companies can insert their own activities
CREATE POLICY "Companies can insert activities"
  ON public.activities FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid()
        AND role = 'company'
        AND email = company_email
    )
  );

-- Companies can update their own activities
CREATE POLICY "Companies can update own activities"
  ON public.activities FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid()
        AND role = 'company'
        AND email = company_email
    )
  );

-- Tickets table
CREATE TABLE public.tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  activity_id INTEGER NOT NULL REFERENCES public.activities(id),
  activity_title TEXT NOT NULL,
  company_name TEXT NOT NULL,
  purchased_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  quantity INTEGER NOT NULL DEFAULT 1,
  total_paid INTEGER NOT NULL DEFAULT 0,
  qr_code_data TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Valid',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own tickets"
  ON public.tickets FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tickets"
  ON public.tickets FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Seed activities data
INSERT INTO public.activities (name, category, rating, time, address, lat, lng, description, company, company_email, price, tickets_remaining, available_until, status) VALUES
('Liseberg Amusement Park', 'Entertainment', 4.7, '10:00–22:00', 'Örgrytevägen 5', 57.6953, 11.9924, 'Scandinavia''s largest amusement park with thrilling rides, live shows, and seasonal events in the heart of Gothenburg.', 'Liseberg AB', 'info@liseberg.se', 395, 142, '2026-09-30', 'active'),
('Liseberg Halloween Night', 'Nightlife', 4.6, '18:00–23:00', 'Örgrytevägen 5', 57.6950, 11.9930, 'Haunted houses, scare zones, and live horror performances throughout the park after dark.', 'Liseberg AB', 'info@liseberg.se', 495, 60, '2026-11-01', 'active'),
('Universeum Science Center', 'Museum', 4.5, '10:00–18:00', 'Södra Vägen 50', 57.6967, 11.9893, 'Interactive science museum with a tropical rainforest, aquarium, and six climate zones filled with exotic animals.', 'Universeum AB', 'info@universeum.se', 295, 78, '2026-12-31', 'active'),
('Haga District Walking Tour', 'Tour', 4.8, '11:00–13:00', 'Haga Nygata 1', 57.6985, 11.9530, 'Explore Gothenburg''s oldest suburb: cobblestone streets, vintage shops, and the famous giant cinnamon buns at Café Husaren.', 'Göteborg Tours', 'info@gbgtours.se', 150, 24, '2026-06-15', 'active'),
('Gothenburg By Night Walk', 'Tour', 4.4, '20:00–22:00', 'Kungsportsplatsen 1', 57.7030, 11.9700, 'Discover hidden stories and haunted history as you walk Gothenburg''s atmospheric streets after dark.', 'Göteborg Tours', 'info@gbgtours.se', 200, 18, '2026-08-31', 'active'),
('Southern Archipelago Boat Tour', 'Adventure', 4.9, '09:00–17:00', 'Saltholmen Terminal', 57.6590, 11.8690, 'Full-day ferry adventure through the stunning southern archipelago — swim, hike car-free islands, and enjoy seaside seafood.', 'Strömma Turism', 'info@stromma.se', 450, 16, '2026-08-31', 'active'),
('Röhsska Museum of Design', 'Museum', 4.3, '12:00–17:00', 'Vasagatan 37–39', 57.6990, 11.9700, 'Sweden''s only museum of design, fashion, and decorative arts. Centuries of Scandinavian craft and modern design.', 'Röhsska Museet', 'info@rohsska.se', 60, 200, '2026-12-31', 'active'),
('Hagabadet Floating Sauna', 'Fitness', 4.6, '07:00–21:00', 'Södra Allégatan 3', 57.6960, 11.9570, 'Historic bathhouse dating from 1876. Relax in wood-fired saunas, plunge pools, and rooftop hot tubs overlooking the city.', 'Hagabadet', 'info@hagabadet.se', 350, 30, '2026-12-31', 'active'),
('Morning Yoga at Hagabadet', 'Fitness', 4.5, '06:30–07:30', 'Södra Allégatan 3', 57.6962, 11.9568, 'Start your day with a guided vinyasa session in the beautiful Art Nouveau spa hall, followed by cold plunge access.', 'Hagabadet', 'info@hagabadet.se', 180, 12, '2026-10-31', 'active'),
('Stand-Up Comedy Night', 'Entertainment', 4.4, '19:30–22:00', 'Stigbergsliden 8', 57.6980, 11.9350, 'Weekly live comedy with a mix of established acts and rising stars from the Swedish comedy scene. Full bar available.', 'Gothenburg Comedy Club', 'info@gbgcomedy.se', 220, 45, '2026-12-31', 'active'),
('Indoor Bouldering Session', 'Fitness', 4.7, '08:00–22:00', 'Importgatan 2', 57.7180, 12.0130, 'Gothenburg''s largest bouldering gym with 1,200 m² of climbing surface. Routes for all levels, gear rental included.', 'Vertical GBG', 'info@verticalgbg.se', 180, 80, '2026-12-31', 'active'),
('West Coast Seafood Tasting', 'Food', 4.8, '12:00–14:00', 'Feskekôrka, Fisktorget 4', 57.6990, 11.9590, 'Guided tasting of the finest catches from the Swedish west coast inside the iconic Feskekôrka fish market.', 'Smaka på Göteborg', 'info@smakapagbg.se', 490, 10, '2026-07-31', 'active'),
('Craft Beer & Street Food Walk', 'Food', 4.5, '16:00–19:00', 'Magasinsgatan 17', 57.7040, 11.9640, 'Sample five craft breweries and local street food vendors along Gothenburg''s trendiest food street.', 'Smaka på Göteborg', 'info@smakapagbg.se', 395, 20, '2026-09-30', 'active'),
('Beginner Pottery Workshop', 'Workshop', 4.6, '14:00–17:00', 'Tredje Långgatan 9', 57.6970, 11.9460, 'Learn hand-building and wheel-throwing techniques in a relaxed studio setting. All materials included, take your creation home.', 'Keramikverkstaden', 'info@keramik.se', 650, 6, '2026-06-30', 'active'),
('Sunset Kayaking in Gothenburg', 'Adventure', 4.7, '18:00–20:30', 'Lilla Bommen 1', 57.7120, 11.9680, 'Paddle through the inner harbour at golden hour, passing the Opera House and Göta Älv bridge. No experience needed.', 'Kayak GBG', 'info@kayakgbg.se', 420, 8, '2026-08-31', 'active'),
('Archipelago Sea Kayak Day Trip', 'Outdoors', 4.9, '08:00–16:00', 'Saltholmen Brygga', 57.6585, 11.8700, 'Full-day sea kayaking among the islands of Gothenburg''s southern archipelago. Includes lunch on a private beach.', 'Kayak GBG', 'info@kayakgbg.se', 890, 4, '2026-08-15', 'active');
