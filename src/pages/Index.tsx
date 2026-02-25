import { Link, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-pulse text-4xl font-black" style={{ fontFamily: "'Nunito', sans-serif" }}>
          <span className="text-foreground">doo</span>
          <span className="text-primary">b</span>
          <span className="text-foreground">le</span>
        </div>
      </div>
    );
  }

  if (user) {
    return <Navigate to={user.type === "visitor" ? "/map" : "/dashboard"} replace />;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background relative overflow-hidden">
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: `linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)`,
        backgroundSize: '60px 60px'
      }} />

      {/* Glow effect */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-10 blur-3xl"
        style={{ background: `radial-gradient(circle, hsl(var(--primary)), transparent 70%)` }} />

      <div className="relative z-10 flex flex-col items-center gap-8">
        <h1 className="text-8xl font-heading font-black tracking-tighter hover:scale-105 transition-transform duration-500">
          <span className="text-foreground">doo</span><span className="text-primary">b</span><span className="text-foreground">le</span>
        </h1>

        <p className="text-xl text-muted-foreground max-w-md text-center">
          Find things to do around you
        </p>

        <div className="flex gap-4 mt-4">
          <Button asChild size="lg" variant="outline" className="px-8 text-base border-border hover:bg-secondary">
            <Link to="/login">Log in</Link>
          </Button>
          <Button asChild size="lg" className="px-8 text-base font-semibold">
            <Link to="/signup">Sign up</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
