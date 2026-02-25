import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useTicketStore } from "@/contexts/TicketStoreContext";
import { ArrowLeft, QrCode, Ticket, MapPin, Download } from "lucide-react";
import TopBarVisitor from "@/components/TopBarVisitor";

const TicketView = () => {
  const { ticketId } = useParams<{ ticketId: string }>();
  const { user, logout } = useAuth();
  const { getTicketById } = useTicketStore();
  const ticket = getTicketById(ticketId || "");

  if (!ticket) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <TopBarVisitor logout={logout} />
        <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4">
          <h1 className="text-2xl font-bold text-foreground">Ticket not found</h1>
          <Button asChild><Link to="/map" className="gap-2"><ArrowLeft className="h-4 w-4" /> Back to map</Link></Button>
        </main>
      </div>
    );
  }

  const statusColor = ticket.status === "Valid"
    ? "bg-primary/20 text-primary border-primary/30"
    : ticket.status === "Used"
      ? "bg-muted text-muted-foreground border-border"
      : "bg-destructive/20 text-destructive border-destructive/30";

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <TopBarVisitor logout={logout} />
      <main className="flex-1 flex items-start justify-center py-10 px-4">
        <div className="w-full max-w-md">
          {/* Ticket card */}
          <div className="rounded-lg border border-border/60 bg-white shadow-card overflow-hidden relative">
            {/* Decorative punch holes */}
            <div className="absolute top-[68px] -left-3 w-6 h-6 bg-background rounded-full"></div>
            <div className="absolute top-[68px] -right-3 w-6 h-6 bg-background rounded-full"></div>

            {/* Header strip */}
            <div className="bg-primary/5 border-b border-dashed border-primary/20 p-6 pb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Ticket className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-xs font-mono font-medium text-muted-foreground uppercase opacity-70">#{ticket.ticketId.slice(-8)}</span>
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${statusColor}`}>
                  {ticket.status}
                </span>
              </div>
              <h1 className="text-2xl font-heading font-bold text-foreground leading-tight">{ticket.activityTitle}</h1>
              <p className="text-sm font-medium text-muted-foreground mt-1">{ticket.companyName}</p>
            </div>

            {/* Body */}
            <div className="p-6 pt-8 space-y-6">
              {/* QR placeholder */}
              <div className="flex flex-col items-center justify-center">
                <div className="p-3 bg-white rounded-2xl border-2 border-primary/20 shadow-sm mb-3">
                  <div className="w-40 h-40 bg-white flex items-center justify-center">
                    <QrCode className="h-full w-full text-foreground" />
                  </div>
                </div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">{ticket.qrCodeData}</span>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm border-t border-border/50 pt-5">
                <div>
                  <span className="text-muted-foreground text-xs uppercase tracking-wider font-bold">Quantity</span>
                  <p className="font-heading font-bold text-lg text-foreground">{ticket.quantity} <span className="text-sm font-medium text-muted-foreground">items</span></p>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs uppercase tracking-wider font-bold">Paid</span>
                  <p className="font-heading font-bold text-lg text-foreground">{ticket.totalPaid === 0 ? "Free" : `${ticket.totalPaid} SEK`}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground text-xs uppercase tracking-wider font-bold">Purchased</span>
                  <p className="font-mono text-sm text-foreground mt-0.5">
                    {new Date(ticket.purchasedAt).toLocaleString("en-SE", {
                      year: "numeric", month: "short", day: "numeric",
                      hour: "2-digit", minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-secondary/30 border-t border-border px-6 py-4">
              <Button
                variant="ghost"
                size="sm"
                className="w-full gap-2 text-primary font-bold hover:bg-primary/5 hover:text-primary"
                onClick={() => {
                  const blob = new Blob([
                    `DOOBLE TICKET\n${"=".repeat(30)}\nRef: ${ticket.ticketId}\nActivity: ${ticket.activityTitle}\nCompany: ${ticket.companyName}\nQty: ${ticket.quantity}\nPaid: ${ticket.totalPaid === 0 ? "Free" : ticket.totalPaid + " SEK"}\nDate: ${new Date(ticket.purchasedAt).toLocaleString()}\nQR: ${ticket.qrCodeData}\nStatus: ${ticket.status}\n`
                  ], { type: "text/plain" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `ticket-${ticket.ticketId}.txt`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
              >
                <Download className="h-4 w-4" /> Save to Photos / PDF
              </Button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-6 space-y-2">
            <Button asChild className="w-full font-semibold">
              <Link to="/account">Go to My Tickets</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link to="/map" className="gap-2"><MapPin className="h-4 w-4" /> Back to map</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TicketView;
