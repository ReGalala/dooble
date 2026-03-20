import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useTicketStore, Ticket } from "@/contexts/TicketStoreContext";
import { useActivityStore } from "@/contexts/ActivityStoreContext";
import { Ticket as TicketIcon, MapPin, QrCode, Star, Calendar, Clock } from "lucide-react";
import TopBarVisitor from "@/components/TopBarVisitor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RatingModal } from "@/components/RatingModal";

const Account = () => {
  const { user, logout } = useAuth();
  const { getUserTickets } = useTicketStore();
  const tickets = getUserTickets();

  const now = new Date();
  const upcomingTickets = tickets.filter(t => new Date(t.purchasedAt) > new Date(now.setMonth(now.getMonth() - 1))); // Simple mock logic for "upcoming" as purchased recently, or use activity date if available
  // Better logic: use activity date. But ticket doesn't have activity date. 
  // We should fetch activity date. For now, let's just show all tickets as simple list split by some logic or just one list.
  // User requested: "Show upcoming + past tickets".
  // Since we don't store activity date on ticket easily without lookup, let's look it up.

  // Actually, let's just render them all for now to keep it simple, or improved logic:
  // We can join with activity store.
  const { activities } = useActivityStore();

  const ticketsWithDate = tickets.map(t => {
    // Use String() coercion: seed activities have numeric IDs, ticket activityIds are strings
    const activity = activities.find(a => String(a.id) === String(t.activityId));
    // Use the activity's availableUntil as the "event date" when available;
    // only fall back to purchasedAt if we genuinely cannot find the activity
    const activityDate = activity
      ? new Date(activity.availableUntil)
      : new Date(t.purchasedAt);
    return {
      ...t,
      activityDate,
      description: activity?.description,
      activityImage: activity?.image
    };
  });

  const now2 = new Date();
  const upcoming = ticketsWithDate.filter(t => t.activityDate >= now2);
  const past = ticketsWithDate.filter(t => t.activityDate < now2);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <TopBarVisitor logout={logout} />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl px-6 py-8 space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold font-heading">My Page</h1>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>

          <Tabs defaultValue="tickets" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="tickets">My Tickets</TabsTrigger>
              <TabsTrigger value="activities">My Activities</TabsTrigger>
            </TabsList>

            {/* My Tickets Tab */}
            <TabsContent value="tickets" className="space-y-8">
              {/* Upcoming */}
              <div className="space-y-4">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" /> Upcoming
                </h2>
                {upcoming.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">No upcoming activities.</p>
                ) : (
                  <div className="space-y-3">
                    {upcoming.map(ticket => (
                      <TicketCard key={ticket.ticketId} ticket={ticket} />
                    ))}
                  </div>
                )}
              </div>

              {/* Past */}
              <div className="space-y-4">
                <h2 className="text-lg font-bold flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-5 w-5" /> Past
                </h2>
                {past.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">No past activities.</p>
                ) : (
                  <div className="space-y-3">
                    {past.map(ticket => (
                      <TicketCard key={ticket.ticketId} ticket={ticket} isPast />
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* My Activities Tab */}
            <TabsContent value="activities">
              <MyCommunityActivities />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

function TicketCard({ ticket, isPast }: { ticket: any, isPast?: boolean }) {
  const [ratingOpen, setRatingOpen] = useState(false);

  const statusColor = ticket.status === "Valid"
    ? "bg-primary/20 text-primary border-primary/30"
    : ticket.status === "Used"
      ? "bg-muted text-muted-foreground border-border"
      : "bg-destructive/20 text-destructive border-destructive/30";

  return (
    <>
      <div className={`block rounded-xl border border-border bg-card transition-all overflow-hidden ${isPast ? 'opacity-80 hover:opacity-100' : 'hover:shadow-md'}`}>
        <Link to={`/ticket/${ticket.ticketId}`} className="block">
          <div className="flex items-stretch">
            <div className={`w-1.5 shrink-0 ${isPast ? 'bg-muted-foreground' : 'bg-primary'}`} />
            <div className="flex-1 px-5 py-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-semibold text-foreground truncate">{ticket.activityTitle}</h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    <span>{new Date(ticket.activityDate).toLocaleDateString("en-SE")}</span>
                    <span>•</span>
                    <span>{ticket.companyName}</span>
                  </div>
                </div>
                {!isPast && (
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border shrink-0 ${statusColor}`}>
                    {ticket.status}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{ticket.quantity} tix</span>
                  <span>{ticket.totalPaid === 0 ? "Free" : `${ticket.totalPaid} kr`}</span>
                </div>
              </div>
            </div>
          </div>
        </Link>

        {/* Action Bar for Past Tickets */}
        {isPast && (
          <div className="bg-secondary/30 px-5 py-2 border-t border-border flex justify-end">
            <Button variant="outline" size="sm" className="h-8 gap-2 text-xs" onClick={() => setRatingOpen(true)}>
              <Star className="h-3 w-3" /> Rate this activity
            </Button>
          </div>
        )}
      </div>

      <RatingModal
        isOpen={ratingOpen}
        onClose={() => setRatingOpen(false)}
        activityId={ticket.activityId}
        activityName={ticket.activityTitle}
        onSuccess={() => setRatingOpen(false)}
      />
    </>
  );
}

function MyCommunityActivities() {
  const { user } = useAuth();
  const { activities, toggleStatus } = useActivityStore();
  const myActivities = activities.filter(a => a.ownerUserId === user?.id && a.source === "community");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 bg-primary/5 rounded-xl border border-primary/10">
        <div>
          <h2 className="font-bold text-foreground">Community Posts</h2>
          <p className="text-xs text-muted-foreground">Manage your activities visible on the map.</p>
        </div>
        <Button asChild size="sm" className="gap-2">
          <Link to="/add-activity">Post Activity</Link>
        </Button>
      </div>

      {myActivities.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>You haven't posted any activities yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {myActivities.map(activity => (
            <div key={activity.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-foreground">{activity.name}</h3>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                    <span className={`flex items-center gap-1 ${activity.isActive ? "text-green-600 font-medium" : "text-destructive"}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${activity.isActive ? "bg-green-600" : "bg-destructive"}`} />
                      {activity.isActive ? "Active" : "Hidden"}
                    </span>
                    <span>{activity.ratingCount} ratings</span>
                    <span>•</span>
                    <span>{activity.ticketsRemaining} reserved</span>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => toggleStatus(activity.id)}>
                  {activity.isActive ? "Hide" : "Show"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Account;
