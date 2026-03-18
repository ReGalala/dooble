export interface Activity {
  id: string | number;
  name: string;
  category: string;
  rating: number;
  time: string;
  address: string;
  lat: number;
  lng: number;
  description: string;
  company: string;
  companyEmail: string;
  price: number;
  ticketsRemaining: number;
  availableUntil: string;
  status: "active" | "inactive";
  image?: string;
}

export const CATEGORIES = [
  "Entertainment",
  "Museum",
  "Outdoors",
  "Adventure",
  "Fitness",
  "Food",
  "Nightlife",
  "Workshop",
  "Tour",
] as const;

export const SEED_ACTIVITIES: Activity[] = [
  // --- Liseberg AB (theme park) ---
  { id: 1, name: "Liseberg Amusement Park", category: "Entertainment", rating: 4.7, time: "10:00–22:00", address: "Örgrytevägen 5", lat: 57.6953, lng: 11.9924, description: "Scandinavia's largest amusement park with thrilling rides, live shows, and seasonal events in the heart of Gothenburg.", company: "Liseberg AB", companyEmail: "info@liseberg.se", price: 395, ticketsRemaining: 142, availableUntil: "2026-09-30", status: "active", image: "/images/liseberg.jpg" },
  { id: 2, name: "Liseberg Halloween Night", category: "Nightlife", rating: 4.6, time: "18:00–23:00", address: "Örgrytevägen 5", lat: 57.6950, lng: 11.9930, description: "Haunted houses, scare zones, and live horror performances throughout the park after dark.", company: "Liseberg AB", companyEmail: "info@liseberg.se", price: 495, ticketsRemaining: 60, availableUntil: "2026-11-01", status: "active", image: "/images/night_walk.jpg" },

  // --- Universeum AB (science center) ---
  { id: 3, name: "Universeum Science Center", category: "Museum", rating: 4.5, time: "10:00–18:00", address: "Södra Vägen 50", lat: 57.6967, lng: 11.9893, description: "Interactive science museum with a tropical rainforest, aquarium, and six climate zones filled with exotic animals.", company: "Universeum AB", companyEmail: "info@universeum.se", price: 295, ticketsRemaining: 78, availableUntil: "2026-12-31", status: "active", image: "/images/universeum.jpg" },

  // --- Göteborg Tours (walking tours) ---
  { id: 4, name: "Haga District Walking Tour", category: "Tour", rating: 4.8, time: "11:00–13:00", address: "Haga Nygata 1", lat: 57.6985, lng: 11.9530, description: "Explore Gothenburg's oldest suburb: cobblestone streets, vintage shops, and the famous giant cinnamon buns at Café Husaren.", company: "Göteborg Tours", companyEmail: "info@gbgtours.se", price: 150, ticketsRemaining: 24, availableUntil: "2026-06-15", status: "active", image: "/images/haga.jpg" },
  { id: 5, name: "Gothenburg By Night Walk", category: "Tour", rating: 4.4, time: "20:00–22:00", address: "Kungsportsplatsen 1", lat: 57.7030, lng: 11.9700, description: "Discover hidden stories and haunted history as you walk Gothenburg's atmospheric streets after dark.", company: "Göteborg Tours", companyEmail: "info@gbgtours.se", price: 200, ticketsRemaining: 18, availableUntil: "2026-08-31", status: "active", image: "/images/night_walk.jpg" },

  // --- Strömma Turism (boat tours) ---
  { id: 6, name: "Southern Archipelago Boat Tour", category: "Adventure", rating: 4.9, time: "09:00–17:00", address: "Saltholmen Terminal", lat: 57.6590, lng: 11.8690, description: "Full-day ferry adventure through the stunning southern archipelago — swim, hike car-free islands, and enjoy seaside seafood.", company: "Strömma Turism", companyEmail: "info@stromma.se", price: 450, ticketsRemaining: 16, availableUntil: "2026-08-31", status: "active", image: "/images/archipelago.jpg" },

  // --- Röhsska Museet (design museum) ---
  { id: 7, name: "Röhsska Museum of Design", category: "Museum", rating: 4.3, time: "12:00–17:00", address: "Vasagatan 37–39", lat: 57.6990, lng: 11.9700, description: "Sweden's only museum of design, fashion, and decorative arts. Centuries of Scandinavian craft and modern design.", company: "Röhsska Museet", companyEmail: "info@rohsska.se", price: 60, ticketsRemaining: 200, availableUntil: "2026-12-31", status: "active", image: "/images/museum.jpg" },

  // --- Hagabadet (spa & wellness) ---
  { id: 8, name: "Hagabadet Floating Sauna", category: "Fitness", rating: 4.6, time: "07:00–21:00", address: "Södra Allégatan 3", lat: 57.6960, lng: 11.9570, description: "Historic bathhouse dating from 1876. Relax in wood-fired saunas, plunge pools, and rooftop hot tubs overlooking the city.", company: "Hagabadet", companyEmail: "info@hagabadet.se", price: 350, ticketsRemaining: 30, availableUntil: "2026-12-31", status: "active", image: "/images/sauna.jpg" },
  { id: 9, name: "Morning Yoga at Hagabadet", category: "Fitness", rating: 4.5, time: "06:30–07:30", address: "Södra Allégatan 3", lat: 57.6962, lng: 11.9568, description: "Start your day with a guided vinyasa session in the beautiful Art Nouveau spa hall, followed by cold plunge access.", company: "Hagabadet", companyEmail: "info@hagabadet.se", price: 180, ticketsRemaining: 12, availableUntil: "2026-10-31", status: "active", image: "/images/yoga.jpg" },

  // --- Gothenburg Comedy Club ---
  { id: 10, name: "Stand-Up Comedy Night", category: "Entertainment", rating: 4.4, time: "19:30–22:00", address: "Stigbergsliden 8", lat: 57.6980, lng: 11.9350, description: "Weekly live comedy with a mix of established acts and rising stars from the Swedish comedy scene. Full bar available.", company: "Gothenburg Comedy Club", companyEmail: "info@gbgcomedy.se", price: 220, ticketsRemaining: 45, availableUntil: "2026-12-31", status: "active", image: "/images/night_walk.jpg" },

  // --- Vertical GBG (climbing gym) ---
  { id: 11, name: "Indoor Bouldering Session", category: "Fitness", rating: 4.7, time: "08:00–22:00", address: "Importgatan 2", lat: 57.7180, lng: 12.0130, description: "Gothenburg's largest bouldering gym with 1,200 m² of climbing surface. Routes for all levels, gear rental included.", company: "Vertical GBG", companyEmail: "info@verticalgbg.se", price: 180, ticketsRemaining: 80, availableUntil: "2026-12-31", status: "active", image: "/images/yoga.jpg" },

  // --- Smaka på Göteborg (food experiences) ---
  { id: 12, name: "West Coast Seafood Tasting", category: "Food", rating: 4.8, time: "12:00–14:00", address: "Feskekôrka, Fisktorget 4", lat: 57.6990, lng: 11.9590, description: "Guided tasting of the finest catches from the Swedish west coast inside the iconic Feskekôrka fish market.", company: "Smaka på Göteborg", companyEmail: "info@smakapagbg.se", price: 490, ticketsRemaining: 10, availableUntil: "2026-07-31", status: "active", image: "/images/seafood.jpg" },
  { id: 13, name: "Craft Beer & Street Food Walk", category: "Food", rating: 4.5, time: "16:00–19:00", address: "Magasinsgatan 17", lat: 57.7040, lng: 11.9640, description: "Sample five craft breweries and local street food vendors along Gothenburg's trendiest food street.", company: "Smaka på Göteborg", companyEmail: "info@smakapagbg.se", price: 395, ticketsRemaining: 20, availableUntil: "2026-09-30", status: "active", image: "/images/haga.jpg" },

  // --- Keramikverkstaden (ceramic workshop) ---
  { id: 14, name: "Beginner Pottery Workshop", category: "Workshop", rating: 4.6, time: "14:00–17:00", address: "Tredje Långgatan 9", lat: 57.6970, lng: 11.9460, description: "Learn hand-building and wheel-throwing techniques in a relaxed studio setting. All materials included, take your creation home.", company: "Keramikverkstaden", companyEmail: "info@keramik.se", price: 650, ticketsRemaining: 6, availableUntil: "2026-06-30", status: "active", image: "/images/museum.jpg" },

  // --- Kayak GBG (outdoor adventures) ---
  { id: 15, name: "Sunset Kayaking in Gothenburg", category: "Adventure", rating: 4.7, time: "18:00–20:30", address: "Lilla Bommen 1", lat: 57.7120, lng: 11.9680, description: "Paddle through the inner harbour at golden hour, passing the Opera House and Göta Älv bridge. No experience needed.", company: "Kayak GBG", companyEmail: "info@kayakgbg.se", price: 420, ticketsRemaining: 8, availableUntil: "2026-08-31", status: "active", image: "/images/archipelago.jpg" },
  { id: 16, name: "Archipelago Sea Kayak Day Trip", category: "Outdoors", rating: 4.9, time: "08:00–16:00", address: "Saltholmen Brygga", lat: 57.6585, lng: 11.8700, description: "Full-day sea kayaking among the islands of Gothenburg's southern archipelago. Includes lunch on a private beach.", company: "Kayak GBG", companyEmail: "info@kayakgbg.se", price: 890, ticketsRemaining: 4, availableUntil: "2026-08-15", status: "active", image: "/images/archipelago.jpg" },
  // --- Paddan Tours ---
  { id: 17, name: "Paddan Boat Tour", category: "Tour", rating: 4.7, time: "10:00–18:00", address: "Kungsportsplatsen", lat: 57.7035, lng: 11.9705, description: "The classic sightseeing boat tour of Gothenburg. Travel under low bridges and out into the harbor on these iconic flat-bottomed boats.", company: "Strömma Turism", companyEmail: "info@stromma.se", price: 235, ticketsRemaining: 50, availableUntil: "2026-10-15", status: "active", image: "/images/paddan.jpg" },

  // --- Volvo Museum (placeholder image until generated) ---
  { id: 18, name: "Volvo Museum Experience", category: "Museum", rating: 4.8, time: "10:00–17:00", address: "Arendals Skans", lat: 57.6950, lng: 11.8200, description: "A journey through history and into the future. See everything from the first ÖV4 to the latest concept cars.", company: "World of Volvo", companyEmail: "info@worldofvolvo.com", price: 180, ticketsRemaining: 100, availableUntil: "2026-12-31", status: "active" },

  // --- Slottsskogen (placeholder) ---
  { id: 19, name: "Slottsskogen Picnic & Zoo", category: "Outdoors", rating: 4.9, time: "00:00–23:59", address: "Slottsskogen", lat: 57.6850, lng: 11.9400, description: "Gothenburg's main park with a free zoo featuring elks, seals, and penguins. Perfect for picnics and walks.", company: "Gothenburg City", companyEmail: "kontakt@goteborg.se", price: 0, ticketsRemaining: 999, availableUntil: "2026-12-31", status: "active" },

  // --- Botanical Garden (placeholder) ---
  { id: 20, name: "Botanical Garden Walk", category: "Outdoors", rating: 4.8, time: "09:00–21:00", address: "Carl Skottsbergs gata 22A", lat: 57.6830, lng: 11.9500, description: "One of the larger botanical gardens in Europe. Explore the rock garden, the rhododendron valley, and the Japanese glade.", company: "Botaniska", companyEmail: "info@botaniska.se", price: 30, ticketsRemaining: 500, availableUntil: "2026-12-31", status: "active" },
];

export const CATEGORY_COLORS: Record<string, string> = {
  Entertainment: "bg-purple-500/20 text-purple-300",
  Museum: "bg-blue-500/20 text-blue-300",
  Outdoors: "bg-emerald-500/20 text-emerald-300",
  Adventure: "bg-orange-500/20 text-orange-300",
  Fitness: "bg-rose-500/20 text-rose-300",
  Food: "bg-amber-500/20 text-amber-300",
  Nightlife: "bg-indigo-500/20 text-indigo-300",
  Workshop: "bg-cyan-500/20 text-cyan-300",
  Tour: "bg-teal-500/20 text-teal-300",
};
