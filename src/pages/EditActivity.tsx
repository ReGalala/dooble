import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useActivityStore } from "@/contexts/ActivityStoreContext";
import { CATEGORIES } from "@/data/activities";
import { LogOut, ArrowLeft, ImageIcon, Loader2, X } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn, getImageUrl } from "@/lib/utils";
import { useGeocode } from "@/hooks/use-geocode";

const EditActivity = () => {
  const { id } = useParams<{ id: string }>();
  const { user, logout } = useAuth();
  const { getById, update } = useActivityStore();
  const navigate = useNavigate();
  const { toast } = useToast();
  const activity = getById(id || "");

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [time, setTime] = useState("");
  const [availableUntil, setAvailableUntil] = useState<Date | undefined>();
  const [endTime, setEndTime] = useState("23:59");
  const [price, setPrice] = useState("");
  const [tickets, setTickets] = useState("");
  const [image, setImage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Image must be under 5MB", variant: "destructive" });
      return;
    }

    setUploading(true);
    try {
      const url = await api.uploadImage(file);
      setImage(url);
      toast({ title: "Image uploaded", description: "Image successfully attached." });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };
  const { geocodeAddress, geocoding } = useGeocode();

  const handleAddressBlur = async () => {
    if (!address.trim()) return;
    const result = await geocodeAddress(address);
    if (result) {
      setLat(String(result.lat));
      setLng(String(result.lng));
    }
  };

  useEffect(() => {
    if (activity) {
      setName(activity.name);
      setCategory(activity.category);
      setDescription(activity.description);
      setAddress(activity.address);
      setLat(String(activity.lat));
      setLng(String(activity.lng));
      setTime(activity.time);

      const auStr = activity.availableUntil || "";
      if (auStr.includes("T")) {
        setAvailableUntil(new Date(auStr.split("T")[0]));
        setEndTime(auStr.split("T")[1].substring(0, 5));
      } else {
        setAvailableUntil(new Date(auStr));
        setEndTime("23:59");
      }

      setPrice(String(activity.price));
      setTickets(String(activity.ticketsRemaining));
      setImage(activity.image || "");
    }
  }, [activity]);

  if (!activity) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header logout={logout} />
        <main className="flex flex-1 flex-col items-center justify-center gap-4">
          <h1 className="text-2xl font-bold text-foreground">Activity not found</h1>
          <Button asChild><Link to="/dashboard"><ArrowLeft className="h-4 w-4 mr-2" /> Back to dashboard</Link></Button>
        </main>
      </div>
    );
  }

  if (activity.companyEmail !== user?.email) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header logout={logout} />
        <main className="flex flex-1 flex-col items-center justify-center gap-4">
          <h1 className="text-2xl font-bold text-foreground">Access denied</h1>
          <p className="text-muted-foreground">You can only edit your own activities.</p>
          <Button asChild><Link to="/dashboard"><ArrowLeft className="h-4 w-4 mr-2" /> Back to dashboard</Link></Button>
        </main>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || !category || !description.trim() || !address.trim() || !availableUntil || tickets === "") {
      setError("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);
    await update(activity.id, {
      name: name.trim(),
      category,
      description: description.trim(),
      address: address.trim(),
      lat: parseFloat(lat) || activity.lat,
      lng: parseFloat(lng) || activity.lng,
      time: time.trim() || "All day",
      availableUntil: format(availableUntil, "yyyy-MM-dd") + "T" + (endTime || "23:59"),
      price: parseFloat(price) || 0,
      ticketsRemaining: parseInt(tickets) || 0,
      image: image || undefined,
    });
    setSubmitting(false);

    toast({ title: "Activity updated", description: `"${name}" has been saved.` });
    navigate("/dashboard");
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header logout={logout} />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl px-6 py-8">
          <div className="flex items-center gap-3 mb-6">
            <Button asChild variant="ghost" size="icon"><Link to="/dashboard"><ArrowLeft className="h-4 w-4" /></Link></Button>
            <h1 className="text-2xl font-bold text-foreground">Edit activity</h1>
          </div>

          <div className="rounded-lg border border-border bg-white shadow-card p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <Field label="Title *">
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Sunset Kayaking Tour" />
              </Field>

              <Field label="Category *">
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="bg-secondary/30 border-border"><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent className="bg-card border-border z-50">
                    {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Description *">
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="bg-secondary/10" />
              </Field>

              <Field label="Address *">
                <Input value={address} onChange={(e) => setAddress(e.target.value)} onBlur={handleAddressBlur} />
                {geocoding && <p className="text-xs text-muted-foreground">Looking up coordinates…</p>}
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Latitude (auto-filled)">
                  <Input value={lat} onChange={(e) => setLat(e.target.value)} className="bg-muted/50" />
                </Field>
                <Field label="Longitude (auto-filled)">
                  <Input value={lng} onChange={(e) => setLng(e.target.value)} className="bg-muted/50" />
                </Field>
              </div>

              <Field label="Opening hours (optional)">
                <Input value={time} onChange={(e) => setTime(e.target.value)} />
              </Field>

              <Field label="Available until *">
                <div className="flex gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("w-full justify-start text-left font-normal flex-1", !availableUntil && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {availableUntil ? format(availableUntil, "PPP") : "Pick an end date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-card border-border z-50" align="start">
                      <Calendar mode="single" selected={availableUntil} onSelect={setAvailableUntil} disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))} initialFocus className={cn("p-3 pointer-events-auto")} />
                    </PopoverContent>
                  </Popover>
                  <Input
                    type="time"
                    className="w-32"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                </div>
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Price (SEK)">
                  <Input type="number" min="0" value={price} onChange={(e) => setPrice(e.target.value)} />
                </Field>
                <Field label="Number of tickets *">
                  <Input type="number" min="1" value={tickets} onChange={(e) => setTickets(e.target.value)} />
                </Field>
              </div>

              <Field label="Activity Image">
                <div className="space-y-3">
                  {image ? (
                    <div className="relative aspect-video w-full max-w-sm rounded-lg overflow-hidden border border-border group">
                      <img src={getImageUrl(image)} alt="Preview" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setImage("")}
                        className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-full hover:bg-black/80 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4">
                      <label className="cursor-pointer flex flex-col items-center justify-center h-32 w-32 rounded-lg border-2 border-dashed border-border bg-secondary/30 hover:border-primary/50 hover:bg-secondary/50 transition-all">
                        {uploading ? (
                          <Loader2 className="h-8 w-8 text-primary animate-spin" />
                        ) : (
                          <>
                            <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
                            <span className="text-xs font-medium text-muted-foreground">Upload Image</span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageUpload}
                          disabled={uploading}
                        />
                      </label>
                      <div className="text-sm text-muted-foreground">
                        <p>Supported: JPG, PNG, WEBP</p>
                        <p>Max size: 5MB</p>
                      </div>
                    </div>
                  )}
                </div>
              </Field>

              {error && <p className="text-sm text-destructive font-medium">{error}</p>}

              <div className="flex gap-3 pt-4">
                <Button type="submit" size="lg" className="flex-1 font-semibold" disabled={submitting}>
                  {submitting ? "Saving…" : "Save changes"}
                </Button>
                <Button asChild variant="outline" size="lg"><Link to="/dashboard">Cancel</Link></Button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label className="text-sm text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function Header({ logout }: { logout: () => void }) {
  return (
    <header className="flex items-center justify-between border-b border-border/60 bg-white/50 backdrop-blur-sm px-6 py-4 shrink-0 shadow-sm sticky top-0 z-20">
      <Link to="/dashboard" className="text-2xl font-heading font-black tracking-tight hover:opacity-80 transition-opacity">
        <span className="text-foreground">doo</span><span className="text-primary">b</span><span className="text-foreground">le</span>
      </Link>
      <Button variant="ghost" size="sm" onClick={logout} className="gap-2 text-muted-foreground">
        <LogOut className="h-4 w-4" /> Log out
      </Button>
    </header>
  );
}

export default EditActivity;
