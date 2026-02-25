import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { CATEGORIES } from "@/data/activities";
import { Flame, X, SlidersHorizontal } from "lucide-react";
import { Activity, isVisitorVisible } from "@/contexts/ActivityStoreContext";

// Haversine distance in km
function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export type SortOption = "nearest" | "cheapest" | "ending_soon" | "most_tickets";

export interface MapFilters {
  lastMinute: boolean;
  category: string; // "" = all
  priceMin: number;
  priceMax: number;
  distance: number; // km, 0 = any
  openNow: boolean;
  startingWithin: string; // "" | "30m" | "1h" | "3h" | "today"
  sort: SortOption;
  search: string;
}

export const DEFAULT_FILTERS: MapFilters = {
  lastMinute: false,
  category: "",
  priceMin: 0,
  priceMax: 9999,
  distance: 0,
  openNow: true,
  startingWithin: "",
  sort: "nearest",
  search: "",
};

const GBG_CENTER = { lat: 57.7089, lng: 11.9746 };

export function useUserLocation() {
  const [loc, setLoc] = useState<{ lat: number; lng: number }>(GBG_CENTER);
  const [asked, setAsked] = useState(false);

  const requestLocation = () => {
    if (asked) return;
    setAsked(true);
    navigator.geolocation?.getCurrentPosition(
      (pos) => setLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => { } // fallback to GBG center
    );
  };

  return { loc, requestLocation };
}

export function applyFilters(activities: Activity[], filters: MapFilters, userLoc: { lat: number; lng: number }): Activity[] {
  let result = activities.filter((a) => a.status === "active");

  // Open now
  if (filters.openNow) {
    result = result.filter(isVisitorVisible);
  }

  // Search
  if (filters.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q) ||
        a.company.toLowerCase().includes(q)
    );
  }

  // Last minute
  if (filters.lastMinute) {
    result = result.filter((a) => a.lastMinute);
  }

  // Category
  if (filters.category) {
    result = result.filter((a) => a.category === filters.category);
  }

  // Price range
  result = result.filter((a) => a.price >= filters.priceMin && a.price <= filters.priceMax);

  // Distance
  if (filters.distance > 0) {
    result = result.filter(
      (a) => haversine(userLoc.lat, userLoc.lng, a.lat, a.lng) <= filters.distance
    );
  }

  // Starting within
  if (filters.startingWithin && filters.startingWithin !== "") {
    const now = new Date();
    let cutoff: Date;
    switch (filters.startingWithin) {
      case "30m": cutoff = new Date(now.getTime() + 30 * 60000); break;
      case "1h": cutoff = new Date(now.getTime() + 60 * 60000); break;
      case "3h": cutoff = new Date(now.getTime() + 180 * 60000); break;
      case "today": cutoff = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59); break;
      default: cutoff = new Date(now.getTime() + 365 * 86400000);
    }
    result = result.filter((a) => {
      if (!a.startsAt) return false;
      const start = new Date(a.startsAt);
      return start >= now && start <= cutoff;
    });
  }

  // Sort
  switch (filters.sort) {
    case "nearest":
      result.sort((a, b) => haversine(userLoc.lat, userLoc.lng, a.lat, a.lng) - haversine(userLoc.lat, userLoc.lng, b.lat, b.lng));
      break;
    case "cheapest":
      result.sort((a, b) => a.price - b.price);
      break;
    case "ending_soon":
      result.sort((a, b) => new Date(a.availableUntil).getTime() - new Date(b.availableUntil).getTime());
      break;
    case "most_tickets":
      result.sort((a, b) => b.ticketsRemaining - a.ticketsRemaining);
      break;
  }

  return result;
}

function hasActiveFilters(f: MapFilters): boolean {
  return (
    f.lastMinute ||
    f.category !== "" ||
    f.priceMin > 0 ||
    f.priceMax < 9999 ||
    f.distance > 0 ||
    !f.openNow ||
    f.startingWithin !== ""
  );
}

interface Props {
  filters: MapFilters;
  onChange: (f: MapFilters) => void;
  resultCount: number;
}

export default function MapFilterBar({ filters, onChange, resultCount }: Props) {
  const [expanded, setExpanded] = useState(false);
  const set = (patch: Partial<MapFilters>) => onChange({ ...filters, ...patch });
  const activeChips = getActiveChips(filters);

  return (
    <div className="sticky top-0 z-20 mx-4 mt-4 mb-2 rounded-2xl border border-border/60 bg-white/90 backdrop-blur-md shadow-card">
      {/* Row 1: search + last-minute + expand */}
      <div className="flex items-center gap-2 px-4 py-3 flex-wrap">
        {/* Last Minute CTA */}
        <button
          onClick={() => set({ lastMinute: !filters.lastMinute })}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 shadow-sm border ${filters.lastMinute
            ? "bg-primary text-primary-foreground border-primary shadow-primary/20"
            : "bg-white text-foreground border-border hover:bg-accent hover:border-accent-foreground/20"
            }`}
        >
          <Flame className={`h-3.5 w-3.5 ${filters.lastMinute ? "fill-current" : "text-primary fill-primary"}`} />
          Last-minute
        </button>

        {/* Sort */}
        <Select value={filters.sort} onValueChange={(v) => set({ sort: v as SortOption })}>
          <SelectTrigger className="w-[130px] h-8 text-xs bg-white border-border rounded-full shadow-sm hover:border-primary/50 transition-colors">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-white border-border z-50 rounded-xl shadow-xl">
            <SelectItem value="nearest">Nearest</SelectItem>
            <SelectItem value="cheapest">Cheapest</SelectItem>
            <SelectItem value="ending_soon">Ending soon</SelectItem>
            <SelectItem value="most_tickets">Most tickets</SelectItem>
          </SelectContent>
        </Select>

        {/* Expand filters */}
        <Button
          variant={expanded ? "default" : "outline"}
          size="sm"
          onClick={() => setExpanded(!expanded)}
          className={`gap-1.5 text-xs shrink-0 rounded-full h-8 border shadow-sm ${expanded ? "bg-secondary text-foreground border-secondary" : "bg-white border-border text-muted-foreground hover:bg-accent/50"
            }`}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          More
          {hasActiveFilters(filters) && (
            <span className="ml-1 bg-primary text-primary-foreground rounded-full w-4 h-4 flex items-center justify-center text-[10px]">
              {activeChips.length}
            </span>
          )}
        </Button>

        {/* Open Now toggle */}
        <div className="flex items-center gap-2 ml-auto shrink-0 bg-white/50 px-3 py-1.5 rounded-full border border-border/50 max-w-full overflow-hidden">
          <span className="text-[11px] font-medium text-muted-foreground whitespace-nowrap overflow-hidden text-ellipsis">Open now</span>
          <Switch checked={filters.openNow} onCheckedChange={(v) => set({ openNow: v })} className="scale-75 origin-right shrink-0" />
        </div>

        <span className="text-[11px] font-medium text-muted-foreground shrink-0 hidden sm:inline-block w-full text-right sm:w-auto mt-1 sm:mt-0">{resultCount} results</span>
      </div>

      {/* Row 2: expanded filters */}
      {expanded && (
        <div className="flex items-center gap-3 px-4 py-2 border-t border-border/50 flex-wrap">
          {/* Category */}
          <Select value={filters.category} onValueChange={(v) => set({ category: v === "all" ? "" : v })}>
            <SelectTrigger className="w-[130px] h-8 text-xs bg-secondary border-border">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border z-50">
              <SelectItem value="all">All categories</SelectItem>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Price range */}
          <div className="flex items-center gap-1">
            <Input
              type="number"
              min={0}
              placeholder="Min"
              value={filters.priceMin || ""}
              onChange={(e) => set({ priceMin: Number(e.target.value) || 0 })}
              className="w-16 h-8 text-xs bg-secondary border-border"
            />
            <span className="text-muted-foreground text-xs">–</span>
            <Input
              type="number"
              min={0}
              placeholder="Max"
              value={filters.priceMax < 9999 ? filters.priceMax : ""}
              onChange={(e) => set({ priceMax: Number(e.target.value) || 9999 })}
              className="w-16 h-8 text-xs bg-secondary border-border"
            />
            <span className="text-[10px] text-muted-foreground">SEK</span>
          </div>

          {/* Distance */}
          <Select value={String(filters.distance)} onValueChange={(v) => set({ distance: Number(v) })}>
            <SelectTrigger className="w-[100px] h-8 text-xs bg-secondary border-border">
              <SelectValue placeholder="Distance" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border z-50">
              <SelectItem value="0">Any distance</SelectItem>
              <SelectItem value="1">Within 1 km</SelectItem>
              <SelectItem value="3">Within 3 km</SelectItem>
              <SelectItem value="5">Within 5 km</SelectItem>
              <SelectItem value="10">Within 10 km</SelectItem>
            </SelectContent>
          </Select>

          {/* Starting within */}
          <Select value={filters.startingWithin || "any"} onValueChange={(v) => set({ startingWithin: v === "any" ? "" : v })}>
            <SelectTrigger className="w-[130px] h-8 text-xs bg-secondary border-border">
              <SelectValue placeholder="Starting within" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border z-50">
              <SelectItem value="any">Any time</SelectItem>
              <SelectItem value="30m">Within 30 min</SelectItem>
              <SelectItem value="1h">Within 1 hour</SelectItem>
              <SelectItem value="3h">Within 3 hours</SelectItem>
              <SelectItem value="today">Today</SelectItem>
            </SelectContent>
          </Select>

          {hasActiveFilters(filters) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onChange({ ...DEFAULT_FILTERS, search: filters.search, sort: filters.sort })}
              className="text-xs text-muted-foreground hover:text-foreground gap-1"
            >
              <X className="h-3 w-3" /> Clear filters
            </Button>
          )}
        </div>
      )}

      {/* Row 3: active filter chips */}
      {activeChips.length > 0 && !expanded && (
        <div className="flex items-center gap-1.5 px-4 pb-2 flex-wrap">
          {activeChips.map((chip) => (
            <button
              key={chip.key}
              onClick={() => chip.onRemove()}
              className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/15 text-primary text-[11px] font-medium hover:bg-primary/25 transition-colors"
            >
              {chip.label}
              <X className="h-2.5 w-2.5" />
            </button>
          ))}
          <button
            onClick={() => onChange({ ...DEFAULT_FILTERS, search: filters.search, sort: filters.sort })}
            className="text-[11px] text-muted-foreground hover:text-foreground ml-1"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}

function getActiveChips(f: MapFilters) {
  const chips: { key: string; label: string; onRemove: () => void }[] = [];
  // We can't call onChange here directly, so we return partial patches
  // The parent will handle them. For now, store the filter key to reset.
  if (f.lastMinute) chips.push({ key: "lm", label: "🔥 Last-minute", onRemove: () => { } });
  if (f.category) chips.push({ key: "cat", label: f.category, onRemove: () => { } });
  if (f.priceMin > 0) chips.push({ key: "pmin", label: `Min ${f.priceMin} SEK`, onRemove: () => { } });
  if (f.priceMax < 9999) chips.push({ key: "pmax", label: `Max ${f.priceMax} SEK`, onRemove: () => { } });
  if (f.distance > 0) chips.push({ key: "dist", label: `Within ${f.distance} km`, onRemove: () => { } });
  if (!f.openNow) chips.push({ key: "open", label: "Including closed", onRemove: () => { } });
  if (f.startingWithin) chips.push({ key: "start", label: `Starting: ${f.startingWithin}`, onRemove: () => { } });
  return chips;
}
