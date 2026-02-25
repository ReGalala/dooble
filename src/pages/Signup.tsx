import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import type { UserType } from "@/contexts/AuthContext";
import { User, Building2 } from "lucide-react";

const Signup = () => {
  const { user, loading, signup } = useAuth();
  const navigate = useNavigate();
  const [userType, setUserType] = useState<UserType>("visitor");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (loading) return null;
  if (user) {
    return <Navigate to={user.type === "visitor" ? "/map" : "/dashboard"} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError("All fields are required."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (userType === "company" && !companyName.trim()) { setError("Company name is required."); return; }

    setSubmitting(true);
    const err = await signup(email, password, userType, userType === "company" ? companyName.trim() : undefined);
    setSubmitting(false);
    if (err) { setError(err); return; }
    setTimeout(() => {
      navigate(userType === "visitor" ? "/map" : "/dashboard", { replace: true });
    }, 500);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link to="/" className="inline-block text-4xl font-heading font-black tracking-tight hover:opacity-80 transition-opacity">
            <span className="text-foreground">doo</span><span className="text-primary">b</span><span className="text-foreground">le</span>
          </Link>
          <p className="mt-2 text-muted-foreground">Create your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-3">
            {([
              { type: "visitor" as const, label: "Visitor", desc: "Find activities", Icon: User },
              { type: "company" as const, label: "Company", desc: "Post activities", Icon: Building2 },
            ]).map(({ type, label, desc, Icon }) => (
              <button
                key={type}
                type="button"
                onClick={() => setUserType(type)}
                className={`flex flex-col items-center gap-2 rounded-lg border-2 p-5 transition-all ${userType === type
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border bg-card text-muted-foreground hover:border-muted-foreground"
                  }`}
              >
                <Icon className="h-6 w-6" />
                <span className="font-semibold">{label}</span>
                <span className="text-xs opacity-70">{desc}</span>
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {userType === "company" && (
              <div className="space-y-2">
                <Label htmlFor="companyName">Company name</Label>
                <Input id="companyName" value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Acme Inc." />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" className="w-full font-semibold" size="lg" disabled={submitting}>
            {submitting ? "Creating account…" : "Create account"}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline">Log in</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Signup;
