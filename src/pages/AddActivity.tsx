import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useActivityStore } from "@/contexts/ActivityStoreContext";
import { api } from "@/lib/api";
import { ArrowLeft, MapPin, Upload, X, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import TopBarVisitor from "@/components/TopBarVisitor";

const CATEGORIES = ["Yard sale", "Meetup", "Sports", "Food", "Other"];

const AddActivity = () => {
    const { user, logout } = useAuth();
    const { create } = useActivityStore();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [loading, setLoading] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        category: "",
        description: "",
        address: "",
        lat: 57.7089, // Default to Gothenburg center
        lng: 11.9746,
        availableUntil: "",
        price: 0,
        time: "", // Display string e.g. "10:00 - 15:00"
        ticketsRemaining: 1,
    });

    // Simple map for picking location
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);
    const markerRef = useRef<any>(null);

    useEffect(() => {
        if (!mapContainerRef.current || mapInstanceRef.current) return;
        const L = (window as any).L;
        if (!L) return;

        const map = L.map(mapContainerRef.current).setView([formData.lat, formData.lng], 13);
        L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
            attribution: '&copy; OpenStreetMap &copy; CARTO',
            maxZoom: 19,
        }).addTo(map);

        const marker = L.marker([formData.lat, formData.lng], { draggable: true }).addTo(map);

        marker.on("dragend", function (event: any) {
            const position = event.target.getLatLng();
            setFormData(prev => ({ ...prev, lat: position.lat, lng: position.lng }));
        });

        map.on("click", function (e: any) {
            marker.setLatLng(e.latlng);
            setFormData(prev => ({ ...prev, lat: e.latlng.lat, lng: e.latlng.lng }));
        });

        mapInstanceRef.current = map;
        markerRef.current = marker;

        return () => {
            map.remove();
            mapInstanceRef.current = null;
        };
    }, []);

    const [searching, setSearching] = useState(false);

    const handleSearchAddress = async () => {
        if (!formData.address) return;
        setSearching(true);
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(formData.address)}`);
            const data = await res.json();
            if (data && data.length > 0) {
                const lat = parseFloat(data[0].lat);
                const lon = parseFloat(data[0].lon);
                setFormData(prev => ({ ...prev, lat, lng: lon }));

                if (mapInstanceRef.current && markerRef.current) {
                    mapInstanceRef.current.setView([lat, lon], 16);
                    markerRef.current.setLatLng([lat, lon]);
                }
                toast({ title: "Location found", description: "Map pin updated." });
            } else {
                toast({ title: "Address not found", description: "Try a different search term.", variant: "destructive" });
            }
        } catch (e) {
            toast({ title: "Error", description: "Failed to search address.", variant: "destructive" });
        } finally {
            setSearching(false);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.category || !formData.availableUntil) {
            toast({ title: "Missing fields", description: "Please fill in all required fields.", variant: "destructive" });
            return;
        }

        setLoading(true);
        try {
            let imageUrl = "";
            if (imageFile) {
                imageUrl = await api.uploadImage(imageFile);
            }

            await create({
                ...formData,
                image: imageUrl,
                company: user?.companyName || "Community Member", // Should be handled by backend but good fallback
                companyEmail: user?.email || "",
                status: "active",
                lastMinute: false,
                startsAt: null,
                source: "community",
                isActive: true,
            });

            toast({ title: "Success!", description: "Your activity has been posted." });
            navigate("/map");
        } catch (error: any) {
            toast({ title: "Error", description: error.message || "Failed to create activity", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen flex-col bg-background">
            <TopBarVisitor logout={logout} />

            <main className="flex-1 overflow-y-auto">
                <div className="mx-auto max-w-2xl px-6 py-8">
                    <div className="flex items-center gap-4 mb-6">
                        <Button variant="ghost" size="icon" asChild>
                            <Link to="/map"><ArrowLeft className="h-5 w-5" /></Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold font-heading">Post an activity</h1>
                            <p className="text-muted-foreground">Share an event with the local community</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Info */}
                        <div className="space-y-4 rounded-xl border border-border bg-card p-6">
                            <h2 className="font-semibold text-lg">Details</h2>

                            <div className="grid gap-2">
                                <Label htmlFor="name">Title <span className="text-destructive">*</span></Label>
                                <Input
                                    id="name"
                                    placeholder="e.g. Backyard Yard Sale"
                                    value={formData.name}
                                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label>Category <span className="text-destructive">*</span></Label>
                                <div className="flex flex-wrap gap-2">
                                    {CATEGORIES.map(cat => (
                                        <button
                                            key={cat}
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, category: cat }))}
                                            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${formData.category === cat
                                                ? "bg-primary text-primary-foreground border-primary"
                                                : "bg-background border-input hover:bg-secondary"
                                                }`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="description">Description <span className="text-destructive">*</span></Label>
                                <Textarea
                                    id="description"
                                    placeholder="Describe your activity..."
                                    value={formData.description}
                                    onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                />
                            </div>
                        </div>

                        {/* Location & Time */}
                        <div className="space-y-4 rounded-xl border border-border bg-card p-6">
                            <h2 className="font-semibold text-lg">Location & Time</h2>

                            <div className="grid gap-2">
                                <Label htmlFor="address">Address text</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="address"
                                        placeholder="e.g. Storgatan 1, Gothenburg"
                                        value={formData.address}
                                        onChange={e => setFormData(prev => ({ ...prev, address: e.target.value }))}
                                    />
                                    <Button type="button" variant="secondary" onClick={handleSearchAddress} disabled={searching || !formData.address}>
                                        {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
                                    </Button>
                                </div>
                                <p className="text-xs text-muted-foreground">Click the pin button to find location on map.</p>
                            </div>

                            <div className="grid gap-2">
                                <Label>Pin location on map</Label>
                                <div ref={mapContainerRef} className="h-64 w-full rounded-md border border-input bg-muted/20" />
                                <p className="text-xs text-muted-foreground">Click on the map or drag the marker to set accurate location.</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="date">Date & Time <span className="text-destructive">*</span></Label>
                                    <Input
                                        id="date"
                                        type="datetime-local"
                                        value={formData.availableUntil}
                                        onChange={e => setFormData(prev => ({ ...prev, availableUntil: e.target.value }))}
                                        min={new Date().toISOString().slice(0, 16)}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="time">Display Time</Label>
                                    <Input
                                        id="time"
                                        placeholder="e.g. 10:00 - 16:00"
                                        value={formData.time}
                                        onChange={e => setFormData(prev => ({ ...prev, time: e.target.value }))}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Extras */}
                        <div className="space-y-4 rounded-xl border border-border bg-card p-6">
                            <h2 className="font-semibold text-lg">Extras</h2>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="price">Price (SEK)</Label>
                                    <Input
                                        id="price"
                                        type="number"
                                        min="0"
                                        value={formData.price}
                                        onChange={e => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                                    />
                                    <p className="text-xs text-muted-foreground">0 for free</p>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="spots">Total Spots / Items</Label>
                                    <Input
                                        id="spots"
                                        type="number"
                                        min="1"
                                        value={formData.ticketsRemaining}
                                        onChange={e => setFormData(prev => ({ ...prev, ticketsRemaining: Number(e.target.value) }))}
                                    />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label>Cover Image</Label>
                                <div className="flex items-center gap-4">
                                    {imagePreview ? (
                                        <div className="relative h-24 w-32 rounded-md overflow-hidden border border-border group">
                                            <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => { setImageFile(null); setImagePreview(null); }}
                                                className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="h-6 w-6 text-white" />
                                            </button>
                                        </div>
                                    ) : (
                                        <label className="h-24 w-32 flex flex-col items-center justify-center border-2 border-dashed border-input rounded-md cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors">
                                            <Upload className="h-6 w-6 text-muted-foreground" />
                                            <span className="text-xs text-muted-foreground mt-1">Upload</span>
                                            <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                                        </label>
                                    )}
                                </div>
                            </div>
                        </div>

                        <Button type="submit" size="lg" className="w-full font-bold" disabled={loading}>
                            {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Publishing...</> : "Post Activity"}
                        </Button>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default AddActivity;
