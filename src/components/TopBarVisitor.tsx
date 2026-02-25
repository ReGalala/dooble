import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, Ticket, Map as MapIcon, PlusCircle } from "lucide-react";

export default function TopBarVisitor({ logout }: { logout: () => void | Promise<void> }) {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="flex items-center gap-6 border-b border-border/60 px-6 py-4 shrink-0 bg-white shadow-sm z-20 relative">
      <Link to="/map" className="text-2xl font-black tracking-tight shrink-0 flex items-center gap-1 hover:opacity-80 transition-opacity" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
        <span className="text-foreground">doo</span><span className="text-primary">b</span><span className="text-foreground">le</span>
      </Link>

      <nav className="flex items-center gap-1">
        <Link
          to="/map"
          className={`px-4 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${isActive('/map')
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
        >
          <MapIcon className="h-4 w-4" /> Explore
        </Link>

        <Link
          to="/add-activity"
          className={`px-4 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${isActive('/add-activity')
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
        >
          <PlusCircle className="h-4 w-4" /> Add activity
        </Link>
      </nav>

      <div className="flex-1" />

      <Button variant="ghost" size="sm" onClick={() => logout()} className="gap-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0 rounded-full px-4">
        <LogOut className="h-4 w-4" /> <span className="hidden sm:inline">Log out</span>
      </Button>
    </header>
  );
}
