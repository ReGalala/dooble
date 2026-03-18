import { useState, useEffect, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, Search, MapPin, Clock, Star, Timer, Ticket, Flame } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { CATEGORY_COLORS } from "@/data/activities";
import { useActivityStore } from "@/contexts/ActivityStoreContext";
import { getTimeLeft } from "@/lib/timeLeft";
import MapFilterBar, { MapFilters, DEFAULT_FILTERS, applyFilters, useUserLocation } from "@/components/MapFilterBar";
import { getImageUrl } from "@/lib/utils";

// Vanilla Leaflet map hook (Leaflet loaded from index.html)
function useLeafletMap(containerRef: React.RefObject<HTMLDivElement | null>) {
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const L = (window as any).L;
    if (!L) return;

    const map = L.map(containerRef.current, { zoomControl: true }).setView([57.7089, 11.9746], 12);
    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      maxZoom: 19,
    }).addTo(map);
    mapRef.current = map;

    setTimeout(() => {
      map.invalidateSize();
      containerRef.current?.dispatchEvent(new Event("map-ready"));
    }, 200);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [containerRef]);

  return { mapRef, markersRef };
}

const MapPage = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { activities } = useActivityStore();
  const [filters, setFilters] = useState<MapFilters>(DEFAULT_FILTERS);
  const [selected, setSelected] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { mapRef, markersRef } = useLeafletMap(containerRef);
  const { loc: userLoc, requestLocation } = useUserLocation();

  // Request user location on mount
  useEffect(() => { requestLocation(); }, []);

  const filtered = useMemo(
    () => applyFilters(activities, filters, userLoc),
    [activities, filters, userLoc]
  );

  // Listen for map ready
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = () => setMapReady(true);
    el.addEventListener("map-ready", handler);
    return () => el.removeEventListener("map-ready", handler);
  }, []);

  // Update markers when filtered or selected changes
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    const L = (window as any).L;
    if (!L) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    filtered.forEach((a) => {
      const isSelected = selected === a.id;
      const priceLabel = a.price === 0 ? "Free" : `${a.price} kr`;
      const isLM = a.lastMinute;
      const icon = L.divIcon({
        className: "",
        html: `<div style="
          position: relative;
          z-index: ${isSelected ? 1000 : 500};
        ">
          <div style="
            background: ${isSelected ? "hsl(24 66% 54%)" : isLM ? "hsl(24 66% 54%)" : "white"};
            color: ${isSelected || isLM ? "white" : "hsl(0 0% 17%)"};
            border: 1px solid ${isSelected || isLM ? "hsl(24 66% 45%)" : "hsl(34 28% 80%)"};
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 13px;
            font-weight: 700;
            white-space: nowrap;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.1);
            cursor: pointer;
            font-family: 'Space Grotesk', sans-serif;
            letter-spacing: -0.01em;
            display: flex; align-items: center; gap: 6px;
            transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
            transform-origin: center bottom;
          ">
            ${isLM ? '<span style="font-size:11px;">🔥</span>' : ""}
            ${a.source === "community" ? '<span style="font-size:10px;background:blue;color:white;padding:1px 3px;border-radius:4px;margin-right:2px;">C</span>' : ""}
            <span style="font-size: 12px;">${priceLabel}</span>
          </div>
          <div style="
            width: 8px; height: 8px;
            background: ${isSelected ? "hsl(24 66% 54%)" : isLM ? "hsl(24 66% 54%)" : "white"};
            border-right: 1px solid ${isSelected || isLM ? "hsl(24 66% 45%)" : "hsl(34 28% 80%)"};
            border-bottom: 1px solid ${isSelected || isLM ? "hsl(24 66% 45%)" : "hsl(34 28% 80%)"};
            transform: rotate(45deg);
            position: absolute;
            bottom: -5px;
            left: 50%;
            margin-left: -4px;
            z-index: 10;
          "></div>
        </div>`,
        iconSize: [70, 38],
        iconAnchor: [35, 38],
      });

      const marker = L.marker([a.lat, a.lng], { icon }).addTo(mapRef.current);
      marker.on("click", () => {
        setSelected(a.id);
        navigate(`/activity/${a.id}`);
      });

      const tooltipContent = `
        <div style="font-family:'Space Grotesk',sans-serif;min-width:240px;max-width:280px;overflow:hidden;">
          ${a.image ? `<div style="height:140px;width:100%;background-image:url('${getImageUrl(a.image)}');background-size:cover;background-position:center;border-radius:12px 12px 0 0;margin:-14px -16px 12px -16px;"></div>` : ""}
          <strong style="font-size:15px;display:block;margin-bottom:4px;line-height:1.2;">${a.lastMinute ? "🔥 " : ""}${a.name}</strong>
          <div style="font-size:12px;opacity:0.7;margin-bottom:8px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${a.company}</div>
          <div style="display:flex;gap:12px;font-size:12px;opacity:0.8;font-weight:500;align-items:center;">
             <span style="display:flex;align-items:center;gap:4px;">⭐ ${a.rating} <span style="font-size:10px;opacity:0.6;">(${a.ratingCount})</span></span>
             <span style="display:flex;align-items:center;gap:4px;">🕐 ${a.time}</span>
          </div>
          <div style="margin-top:8px;padding-top:8px;border-top:1px solid #eee;display:flex;justify-content:space-between;align-items:center;">
             <span style="font-size:11px;opacity:0.6;font-weight:600;color:green;">${a.ticketsRemaining} tickets left</span>
             <span style="font-size:14px;font-weight:700;color:hsl(24 66% 54%);">
               ${a.price === 0 ? "Free" : `${a.price} SEK`}
             </span>
          </div>
        </div>
      `;

      marker.bindTooltip(tooltipContent, {
        direction: "top",
        offset: [0, -40],
        opacity: 1,
        className: "map-activity-tooltip",
      });

      markersRef.current.push(marker);
    });
  }, [filtered, selected, mapReady, mapRef, markersRef]);

  // Fly to selected
  useEffect(() => {
    if (!mapReady || !mapRef.current || !selected) return;
    const a = activities.find((x) => x.id === selected);
    if (a) mapRef.current.flyTo([a.lat, a.lng], 14, { duration: 0.8 });
  }, [selected, mapReady, mapRef]);

  return (
    <div className="flex h-screen flex-col bg-background overflow-hidden">
      {/* Top bar */}
      <header className="flex items-center gap-4 border-b border-border px-5 py-3 shrink-0">
        <Link to="/map" className="text-xl font-black tracking-tight shrink-0" style={{ fontFamily: "'Nunito', sans-serif" }}>
          <span className="text-foreground">doo</span><span className="text-primary">b</span><span className="text-foreground">le</span>
        </Link>

        <div className="relative flex-1 max-w-lg">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={filters.search}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
            placeholder="Search by title, category, company…"
            className="pl-9 bg-secondary border-border"
          />
        </div>

        <Button asChild variant="ghost" size="sm" className="gap-2 text-muted-foreground shrink-0">
          <Link to="/account"><Ticket className="h-4 w-4" /> <span className="hidden sm:inline">My Page</span></Link>
        </Button>

        <Button variant="ghost" size="sm" onClick={logout} className="gap-2 text-muted-foreground shrink-0">
          <LogOut className="h-4 w-4" /> <span className="hidden sm:inline">Log out</span>
        </Button>
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Activity list */}
        <aside className="w-[420px] shrink-0 border-r border-border flex flex-col overflow-hidden">
          {/* Filter bar */}
          <MapFilterBar filters={filters} onChange={setFilters} resultCount={filtered.length} />

          {/* List */}
          <div className="flex-1 overflow-y-auto px-4 pb-4 pt-2">
            <div className="flex flex-col gap-3">
              {filtered.map((activity) => {
                const timeLeft = getTimeLeft(activity.availableUntil);
                const isExpiredItem = timeLeft === "Expired";
                const isSelected = selected === activity.id;

                return (
                  <button
                    key={activity.id}
                    onClick={() => {
                      setSelected(activity.id);
                      navigate(`/activity/${activity.id}`);
                    }}
                    className={`group w-full text-left p-0 rounded-2xl border transition-all duration-300 relative overflow-hidden flex flex-col
                      ${isSelected
                        ? "bg-white border-primary shadow-card ring-1 ring-primary/20 scale-[1.02]"
                        : "bg-white border-border/60 shadow-sm hover:shadow-card-hover hover:border-primary/20 hover:-translate-y-1"
                      } ${isExpiredItem ? "opacity-60 grayscale" : ""}`}
                  >
                    {/* Image Section - Top of Card */}
                    <div className="relative h-48 w-full shrink-0 overflow-hidden bg-gray-100">
                      {activity.image ? (
                        <img src={getImageUrl(activity.image)} alt={activity.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-muted-foreground/20">
                          <MapPin className="h-12 w-12" />
                        </div>
                      )}

                      {/* Category Badge on Image */}
                      <span className={`absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border shadow-sm ${CATEGORY_COLORS[activity.category] ? "border-transparent " + CATEGORY_COLORS[activity.category] : "bg-white text-muted-foreground"}`}>
                        {activity.category}
                      </span>

                      {/* Status Badges */}
                      <div className="absolute top-3 right-3 flex gap-2">
                        {activity.lastMinute && (
                          <span className="flex items-center gap-1 bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">
                            <Flame className="h-3 w-3 fill-white" /> Last Minute
                          </span>
                        )}
                        {activity.source === "community" && (
                          <span className="flex items-center gap-1 bg-blue-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">
                            Community
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-4 flex flex-col gap-2">
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex flex-col gap-0.5 min-w-0">
                          <h3 className={`font-heading font-bold text-lg leading-tight line-clamp-2 ${isSelected ? "text-primary" : "text-foreground"}`}>{activity.name}</h3>
                          <span className="text-xs font-medium text-muted-foreground truncate">{activity.company}</span>
                        </div>
                        <div className={`shrink-0 font-heading font-bold text-lg ${activity.price === 0 ? "text-green-600" : "text-foreground"}`}>
                          {activity.price === 0 ? "Free" : `${activity.price} :-`}
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground line-clamp-2 font-sans leading-relaxed min-h-[2.5rem]">{activity.description}</p>

                      <div className="flex items-center gap-3 mt-2 pt-3 border-t border-border/40 text-xs text-muted-foreground font-medium">
                        <span className="flex items-center gap-1.5 bg-secondary/50 px-2 py-1 rounded-md shrink-0">
                          <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />{activity.rating}
                        </span>
                        <span className="flex items-center gap-1.5 bg-secondary/50 px-2 py-1 rounded-md shrink-0">
                          <Clock className="h-3 w-3" />{activity.time}
                        </span>
                        {isExpiredItem ? (
                          <span className="flex items-center gap-1.5 bg-destructive/10 text-destructive px-2 py-1 rounded-md ml-auto">Ended</span>
                        ) : (
                          <span className="flex items-center gap-1.5 bg-green-500/10 text-green-700 px-2 py-1 rounded-md ml-auto">
                            <Ticket className="h-3 w-3" />{activity.ticketsRemaining} left
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}

              {filtered.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-3">
                  <div className="h-16 w-16 rounded-full bg-secondary/50 flex items-center justify-center">
                    <Search className="h-8 w-8 opacity-40" />
                  </div>
                  <p className="text-sm font-semibold">No activities found</p>
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => setFilters({ ...DEFAULT_FILTERS })}
                    className="text-primary"
                  >
                    Clear all filters
                  </Button>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Leaflet map (vanilla) */}
        <div ref={containerRef} className="flex-1" />
      </div>
    </div>
  );
};

export default MapPage;
