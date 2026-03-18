import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from "react";
import { api } from "@/lib/api";

export interface Activity {
  id: string;
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
  lastMinute: boolean;
  startsAt: string | null;
  source: "company" | "community";
  ownerUserId?: string;
  isActive: boolean;
  ratingCount: number;
}

/** Check if an activity is expired (past date or no tickets) */
export function isExpired(a: Activity): boolean {
  if (a.ticketsRemaining <= 0) return true;
  const now = new Date();
  let untilStr = a.availableUntil;
  if (!untilStr.includes("T") && !untilStr.includes(":")) {
    untilStr += "T23:59:59";
  }
  const until = new Date(untilStr);
  return now > until;
}

/** Check if activity is visible to visitors (active + not expired) */
export function isVisitorVisible(a: Activity): boolean {
  return a.status === "active" && !isExpired(a);
}

// No longer needed as API should return clean objects, but let's keep it if we need transformation
function mapRow(row: any): Activity {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    rating: Number(row.rating),
    time: row.time,
    address: row.address,
    lat: row.lat,
    lng: row.lng,
    description: row.description,
    company: row.company,
    companyEmail: row.companyEmail, // Changed from company_email
    price: row.price,
    ticketsRemaining: row.ticketsRemaining, // Changed from tickets_remaining
    availableUntil: row.availableUntil, // Changed from available_until (handled by backend transformation if needed, or matched)
    status: row.status as "active" | "inactive",
    lastMinute: row.lastMinute ?? false,
    startsAt: row.startsAt ?? null,
    image: row.image,
    source: row.source || "company",
    ownerUserId: row.ownerUserId,
    isActive: row.isActive ?? true,
    ratingCount: row.ratingCount || 0,
  };
}

interface ActivityStoreContextType {
  activities: Activity[];
  activeActivities: Activity[];
  loading: boolean;
  getCompanyActivities: (email: string) => Activity[];
  getById: (id: string) => Activity | undefined;
  create: (activity: Omit<Activity, "id" | "rating">) => Promise<Activity | null>;
  update: (id: string, patch: Partial<Activity>) => Promise<void>;
  toggleStatus: (id: string) => Promise<void>;
  decrementTickets: (id: string, qty: number) => Promise<void>;
  refresh: () => Promise<void>;
}

const ActivityStoreContext = createContext<ActivityStoreContextType | null>(null);

export const ActivityStoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActivities = useCallback(async () => {
    try {
      const data = await api.get('/activities');
      setActivities(data as any); // Assuming API returns data in correct format
    } catch (error) {
      console.error("Failed to fetch activities", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const activeActivities = useMemo(
    () => activities.filter(isVisitorVisible),
    [activities]
  );

  const getCompanyActivities = useCallback(
    (email: string) => activities.filter((a) => a.companyEmail === email),
    [activities]
  );

  const getById = useCallback(
    (id: string) => activities.find((a) => String(a.id) === String(id)),
    [activities]
  );

  const create = useCallback(async (data: Omit<Activity, "id" | "rating">): Promise<Activity | null> => {
    try {
      const newActivity = await api.post('/activities', data);
      setActivities((prev) => [...prev, newActivity]);
      return newActivity;
    } catch (error) {
      console.error("Failed to create activity", error);
      return null;
    }
  }, []);

  const update = useCallback(async (id: string, patch: Partial<Activity>) => {
    try {
      await api.patch(`/activities/${id}`, patch);
      setActivities((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));
    } catch (error) {
      console.error("Failed to update activity", error);
    }
  }, []);

  const toggleStatus = useCallback(async (id: string) => {
    const activity = activities.find((a) => String(a.id) === String(id));
    if (!activity) return;
    const newStatus = activity.status === "active" ? "inactive" : "active";
    await update(id, { status: newStatus });
  }, [activities, update]);

  const decrementTickets = useCallback(async (id: string, qty: number) => {
    const activity = activities.find((a) => String(a.id) === String(id));
    if (!activity) return;
    const newCount = Math.max(0, activity.ticketsRemaining - qty);
    await update(id, { ticketsRemaining: newCount });
  }, [activities, update]);

  return (
    <ActivityStoreContext.Provider
      value={{ activities, activeActivities, loading, getCompanyActivities, getById, create, update, toggleStatus, decrementTickets, refresh: fetchActivities }}
    >
      {children}
    </ActivityStoreContext.Provider>
  );
};

export function useActivityStore() {
  const ctx = useContext(ActivityStoreContext);
  if (!ctx) throw new Error("useActivityStore must be used within ActivityStoreProvider");
  return ctx;
}
