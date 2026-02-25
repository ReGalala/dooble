import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useActivityStore, isExpired } from "@/contexts/ActivityStoreContext";
import { useTicketStore } from "@/contexts/TicketStoreContext";
import { CATEGORY_COLORS } from "@/data/activities";
import { ArrowLeft, MapPin, Clock, Star, Tag, Building2, Ticket, CalendarDays, ImageIcon, Minus, Plus, Timer, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getTimeLeft } from "@/lib/timeLeft";
import TopBarVisitor from "@/components/TopBarVisitor";
import { api } from "@/lib/api";

const ActivityDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { logout } = useAuth();
  const { getById, decrementTickets } = useActivityStore();
  const { createTicket } = useTicketStore();
  const navigate = useNavigate();
  const { toast } = useToast();
  const activity = getById(id || "");
  const [qty, setQty] = useState(1);
  const [booked, setBooked] = useState(false);
  const [bookedTicketId, setBookedTicketId] = useState<string | null>(null);
  const [booking, setBooking] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

  // Fetch reviews
  useEffect(() => {
    const fetchReviews = async () => {
      if (!id) return;
      try {
        const response = await api.get(`/ratings/reviews/${id}`);
        setReviews(Array.isArray(response) ? response : []);
      } catch (error) {
        console.error("Failed to fetch reviews:", error);
        setReviews([]); // Set empty array on error
      } finally {
        setLoadingReviews(false);
      }
    };
    fetchReviews();
  }, [id]);

  if (!activity) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <TopBarVisitor logout={logout} />
        <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4">
          <h1 className="text-2xl font-bold text-foreground">Activity not found</h1>
          <p className="text-muted-foreground">The activity you're looking for doesn't exist or has been removed.</p>
          <Button asChild><Link to="/map" className="gap-2"><ArrowLeft className="h-4 w-4" /> Back to map</Link></Button>
        </main>
      </div>
    );
  }

  const expired = isExpired(activity);
  const timeLeft = getTimeLeft(activity.availableUntil);
  const maxQty = Math.min(activity.ticketsRemaining, 10);
  const totalPrice = activity.price * qty;

  const handleBook = async () => {
    setBooking(true);
    await decrementTickets(activity.id, qty);
    const ticket = await createTicket({
      activityId: activity.id,
      activityTitle: activity.name,
      companyName: activity.company,
      quantity: qty,
      totalPaid: totalPrice,
    });
    setBooked(true);
    if (ticket) setBookedTicketId(ticket.ticketId);
    setBooking(false);
    toast({
      title: "Booking confirmed!",
      description: `You booked ${qty} ticket${qty > 1 ? "s" : ""} for "${activity.name}".`,
    });
  };

  const galleryPlaceholders = Array.from({ length: 4 });

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <TopBarVisitor logout={logout} />

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Left — Images */}
            <div className="space-y-4">
              <div className="aspect-[4/3] rounded-lg bg-white shadow-sm flex items-center justify-center border border-border/50 overflow-hidden relative group">
                {activity.image ? (
                  <img src={activity.image} alt={activity.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground/50">
                    <ImageIcon className="h-16 w-16" />
                    <span className="text-sm font-medium">Activity photo</span>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-4 gap-3">
                {galleryPlaceholders.map((_, i) => (
                  <div key={i} className="aspect-square rounded-lg bg-white shadow-sm flex items-center justify-center border border-border/50 overflow-hidden">
                    {activity.image ? (
                      <img src={activity.image} alt="Gallery" className="w-full h-full object-cover opacity-60 hover:opacity-100 transition-opacity cursor-pointer" />
                    ) : (
                      <ImageIcon className="h-6 w-6 text-muted-foreground/30" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Right — Details card */}
            <div className="rounded-lg border border-border/50 bg-white shadow-card p-8 space-y-6 h-fit relative overflow-hidden">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <h1 className="text-3xl font-heading font-bold text-foreground leading-tight">{activity.name}</h1>
                  <span className={`text-xs uppercase tracking-wider font-bold px-3 py-1.5 rounded-full shrink-0 border ${CATEGORY_COLORS[activity.category] ? "border-transparent " + CATEGORY_COLORS[activity.category] : "bg-muted text-muted-foreground"}`}>
                    {activity.category}
                  </span>
                  {activity.source === "community" && (
                    <span className="text-xs uppercase tracking-wider font-bold px-3 py-1.5 rounded-full shrink-0 bg-blue-500 text-white shadow-sm">
                      Community
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm font-medium">
                  <span className="flex items-center gap-1.5 text-muted-foreground"><Star className="h-4.5 w-4.5 text-yellow-500 fill-yellow-500" /><span className="text-foreground font-semibold">{activity.rating}</span> <span className="text-xs">({activity.ratingCount} reviews)</span></span>
                  <span className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full ${expired ? "bg-destructive/10 text-destructive" : "bg-green-100 text-green-700"}`}>
                    <Timer className="h-3.5 w-3.5" />{timeLeft}
                  </span>
                </div>
              </div>

              <div className="space-y-4 text-sm py-2">
                <DetailRow icon={Building2} label="Company" value={activity.company} />
                <DetailRow icon={MapPin} label="Location" value={`${activity.address}, Gothenburg`} />
                <DetailRow icon={Clock} label="Hours" value={activity.time} />
                <DetailRow icon={CalendarDays} label="Available until" value={new Date(activity.availableUntil).toLocaleDateString("en-SE", { year: "numeric", month: "long", day: "numeric" })} />
                <DetailRow icon={Tag} label="Price" value={activity.price === 0 ? "Free" : `${activity.price} SEK`} />
                <DetailRow icon={Ticket} label="Tickets" value={`${activity.ticketsRemaining} left`} highlight={activity.ticketsRemaining < 20} />
              </div>

              <div className="border-t border-border/60 pt-6">
                <h3 className="font-heading font-semibold text-lg mb-2">About</h3>
                <p className="text-base text-muted-foreground leading-relaxed font-sans">{activity.description}</p>
                {activity.source === "community" && (
                  <div className="mt-4 p-4 bg-blue-50/50 border border-blue-100 rounded-lg text-sm text-blue-800">
                    <strong>Community Activity:</strong> This activity was posted by a community member. Please verify details before booking.
                    <div className="mt-2">
                      <Button variant="link" size="sm" className="h-auto p-0 text-blue-600 hover:text-blue-800">
                        Report this activity
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Reviews Section */}
            <div className="border-t border-border/60 pt-6">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="h-5 w-5 text-primary" />
                <h3 className="font-heading font-semibold text-lg">Reviews</h3>
                <span className="text-sm text-muted-foreground">({activity.ratingCount})</span>
              </div>

              {loadingReviews ? (
                <p className="text-sm text-muted-foreground">Loading reviews...</p>
              ) : reviews.length === 0 ? (
                <div className="text-center py-8 bg-secondary/20 rounded-lg border border-border/50">
                  <Star className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No reviews yet. Be the first to review!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review, index) => (
                    <div key={index} className="bg-card border border-border/50 rounded-lg p-4 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-sm text-foreground">{review.userName}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(review.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3.5 w-3.5 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                            />
                          ))}
                        </div>
                      </div>
                      {review.comment && (
                        <p className="text-sm text-foreground leading-relaxed">{review.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>


            {/* Booking section */}
            {expired ? (
              <div className="rounded-xl bg-muted/30 border border-border p-6 text-center">
                <p className="font-medium text-muted-foreground">This activity is no longer available</p>
              </div>
            ) : booked ? (
              <div className="rounded-xl bg-primary/5 border border-primary/20 p-6 text-center space-y-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
                  <Ticket className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-lg font-bold text-foreground">Booking confirmed!</p>
                  <p className="text-sm text-muted-foreground mt-1">You have {qty} ticket{qty > 1 ? "s" : ""} for this activity.</p>
                </div>
                <div className="flex gap-3 pt-2">
                  {bookedTicketId && (
                    <Button asChild size="lg" className="flex-1 font-bold shadow-lg shadow-primary/20"><Link to={`/ticket/${bookedTicketId}`}>View Ticket</Link></Button>
                  )}
                  <Button asChild variant="outline" size="lg" className="flex-1 border-primary/20 hover:bg-primary/5"><Link to="/map">Back to map</Link></Button>
                </div>
              </div>
            ) : (
              <div className="bg-secondary/30 rounded-xl p-5 border border-border/50 space-y-5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Select tickets</span>
                  <div className="flex items-center gap-3 bg-white rounded-lg p-1 border border-border/50 shadow-sm">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md hover:bg-secondary" onClick={() => setQty(Math.max(1, qty - 1))} disabled={qty <= 1}>
                      <Minus className="h-3.5 w-3.5" />
                    </Button>
                    <span className="text-foreground font-bold w-8 text-center tabular-nums">{qty}</span>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md hover:bg-secondary" onClick={() => setQty(Math.min(maxQty, qty + 1))} disabled={qty >= maxQty}>
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total price</span>
                  <span className="text-2xl font-black text-foreground">{totalPrice === 0 ? "Free" : `${totalPrice} SEK`}</span>
                </div>

                <Button size="lg" className="w-full font-bold text-lg h-12 shadow-xl shadow-primary/20" onClick={handleBook} disabled={booking}>
                  {booking ? "Processing…" : activity.price === 0 ? "Book now" : "Confirm booking"}
                </Button>
                <Button asChild variant="ghost" size="sm" className="w-full text-muted-foreground hover:bg-transparent hover:text-foreground">
                  <Link to="/map">Cancel</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

function DetailRow({ icon: Icon, label, value, highlight }: { icon: any; label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
      <span className="text-muted-foreground w-32 shrink-0">{label}</span>
      <span className={`font-medium ${highlight ? "text-orange-400" : "text-foreground"}`}>{value}</span>
    </div>
  );
}


export default ActivityDetail;
