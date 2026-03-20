import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useActivityStore, isExpired } from "@/contexts/ActivityStoreContext";
import { CATEGORY_COLORS } from "@/data/activities";
import { LogOut, Plus, Pencil, ToggleLeft, ToggleRight, ImageIcon, BarChart3, Star, Ticket, Banknote } from "lucide-react";
import { getImageUrl } from "@/lib/utils";

// Stats for each past provider event (keyed by activity id)
const PAST_STATS: Record<number, { tickets: number; revenue: number }> = {
  910: { tickets: 42, revenue: 3780 },
  911: { tickets: 68, revenue: 8160 },
  912: { tickets: 55, revenue: 5500 },
};

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const { activities: allActivities, getCompanyActivities, toggleStatus } = useActivityStore();
  const activities = getCompanyActivities(user?.email || "");

  // Past activities: inactive, owned by this provider, have a stats entry
  const pastActivities = allActivities.filter(
    (a: any) =>
      a.companyEmail === user?.email &&
      a.status === "inactive" &&
      PAST_STATS[a.id as number]
  );
  const totalTickets = pastActivities.reduce((s: number, a: any) => s + (PAST_STATS[a.id as number]?.tickets ?? 0), 0);
  const totalRevenue = pastActivities.reduce((s: number, a: any) => s + (PAST_STATS[a.id as number]?.revenue ?? 0), 0);

  const getStatusInfo = (activity: { status: string; availableUntil: string; ticketsRemaining: number }) => {
    if (isExpired(activity as any)) return { label: "Expired", className: "bg-muted text-muted-foreground" };
    if (activity.status === "inactive") return { label: "Inactive", className: "bg-orange-500/20 text-orange-300" };
    return { label: "Active", className: "bg-emerald-500/20 text-emerald-300" };
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex items-center justify-between border-b border-border/60 bg-white/50 backdrop-blur-sm px-6 py-4 shrink-0 shadow-sm sticky top-0 z-20">
        <Link to="/dashboard" className="text-2xl font-heading font-black tracking-tight hover:opacity-80 transition-opacity">
          <span className="text-foreground">doo</span><span className="text-primary">b</span><span className="text-foreground">le</span>
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground hidden sm:inline">{user?.companyName}</span>
          <Button variant="ghost" size="sm" onClick={logout} className="gap-2 text-muted-foreground">
            <LogOut className="h-4 w-4" /> Log out
          </Button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-5xl px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">My activities</h1>
              <p className="text-sm text-muted-foreground mt-1">{activities.length} {activities.length === 1 ? "activity" : "activities"}</p>
            </div>
            <Button asChild className="gap-2 font-semibold shadow-lg shadow-primary/20">
              <Link to="/dashboard/new"><Plus className="h-4 w-4" /> New activity</Link>
            </Button>
          </div>

          {activities.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-12 flex flex-col items-center gap-4 text-center">
              <p className="text-muted-foreground">You haven't created any activities yet.</p>
              <Button asChild className="gap-2">
                <Link to="/dashboard/new"><Plus className="h-4 w-4" /> Create your first activity</Link>
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {activities.map((a: any) => {
                const statusInfo = getStatusInfo(a);
                const isExp = statusInfo.label === "Expired";
                return (
                  <div
                    key={a.id}
                    className={`group flex items-center justify-between p-5 rounded-lg border border-border bg-white shadow-card hover:shadow-card-hover hover:border-primary/20 transition-all duration-300 hover:-translate-y-0.5 ${isExp ? "opacity-60 grayscale" : ""}`}
                  >
                    <div className="flex items-center gap-6 flex-1 min-w-0">
                      {/* Activity Image Thumbnail */}
                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md bg-muted/50 border border-border/50 flex items-center justify-center">
                        {a.image ? (
                          <img src={getImageUrl(a.image)} alt={a.name} className="h-full w-full object-cover" />
                        ) : (
                          <ImageIcon className="h-8 w-8 text-muted-foreground/30" />
                        )}
                      </div>

                      <div className="flex flex-col gap-1.5 min-w-[200px]">
                        <h3 className="font-heading font-bold text-lg text-foreground truncate">{a.name}</h3>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full border ${CATEGORY_COLORS[a.category] ? "border-transparent " + CATEGORY_COLORS[a.category] : "bg-muted text-muted-foreground"}`}>{a.category}</span>
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full border ${statusInfo.className}`}>{statusInfo.label}</span>
                        </div>
                      </div>

                      <div className="hidden md:flex gap-8 text-sm font-medium text-muted-foreground">
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase tracking-wider font-bold opacity-70">Price</span>
                          <span className="text-foreground">{a.price === 0 ? "Free" : `${a.price} SEK`}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase tracking-wider font-bold opacity-70">Date</span>
                          <span>{new Date(a.availableUntil).toLocaleDateString("en-SE")}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase tracking-wider font-bold opacity-70">Tickets</span>
                          <span className={`${a.ticketsRemaining < 10 ? "text-orange-500 font-bold" : "text-foreground"}`}>{a.ticketsRemaining} left</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 group-hover:opacity-100 transition-opacity ml-4">
                      <Button asChild variant="outline" size="sm" className="h-9 w-9 p-0 rounded-sm border-border hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-colors shadow-sm">
                        <Link to={`/dashboard/edit/${a.id}`}><Pencil className="h-4 w-4" /></Link>
                      </Button>
                      {!isExp && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-9 w-9 p-0 rounded-sm border-border hover:border-primary/50 hover:bg-primary/5 transition-colors shadow-sm"
                          onClick={() => toggleStatus(a.id)}
                          title={a.status === "active" ? "Deactivate" : "Activate"}
                        >
                          {a.status === "active" ? <ToggleRight className="h-4 w-4 text-primary" /> : <ToggleLeft className="h-4 w-4 text-muted-foreground" />}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Activity Insights ── */}
          {pastActivities.length > 0 && (
            <div className="mt-10">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-bold text-foreground">Activity Insights</h2>
              </div>

              <div className="rounded-xl border border-border bg-card overflow-hidden shadow-card">
                {/* Column headers */}
                <div className="grid grid-cols-4 gap-4 px-5 py-2.5 bg-muted/40 border-b border-border text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  <span>Activity</span>
                  <span className="text-center">Tickets sold</span>
                  <span className="text-center">Revenue</span>
                  <span className="text-center">Rating</span>
                </div>

                {pastActivities.map((a: any) => {
                  const stats = PAST_STATS[a.id as number];
                  return (
                    <div key={a.id} className="grid grid-cols-4 gap-4 px-5 py-4 border-b border-border/60 last:border-0 hover:bg-muted/20 transition-colors">
                      <div className="min-w-0">
                        <p className="font-medium text-sm text-foreground truncate">{a.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{new Date(a.availableUntil).toLocaleDateString("en-SE")}</p>
                      </div>
                      <div className="flex items-center justify-center gap-1.5 text-sm font-semibold text-foreground">
                        <Ticket className="h-3.5 w-3.5 text-muted-foreground" />
                        {stats.tickets}
                      </div>
                      <div className="flex items-center justify-center gap-1.5 text-sm font-semibold text-foreground">
                        <Banknote className="h-3.5 w-3.5 text-muted-foreground" />
                        {stats.revenue.toLocaleString("sv-SE")} kr
                      </div>
                      <div className="flex items-center justify-center gap-1 text-sm font-semibold text-amber-500">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        {a.rating?.toFixed(1)}
                      </div>
                    </div>
                  );
                })}

                {/* Totals row */}
                <div className="grid grid-cols-4 gap-4 px-5 py-3.5 bg-primary/5 border-t border-primary/10">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total</span>
                  <span className="text-center text-sm font-bold text-foreground">{totalTickets}</span>
                  <span className="text-center text-sm font-bold text-foreground">{totalRevenue.toLocaleString("sv-SE")} kr</span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
