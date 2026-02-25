import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface RatingModalProps {
    isOpen: boolean;
    onClose: () => void;
    activityId: string;
    activityName: string;
    onSuccess: () => void;
}

export function RatingModal({ isOpen, onClose, activityId, activityName, onSuccess }: RatingModalProps) {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const { toast } = useToast();

    const handleSubmit = async () => {
        if (rating === 0) {
            toast({ title: "Please select a rating", variant: "destructive" });
            return;
        }

        setSubmitting(true);
        try {
            await api.post("/ratings", { activityId, rating, comment });
            toast({ title: "Thank you!", description: "Your rating has been submitted." });
            onSuccess();
            onClose();
        } catch (error) {
            toast({ title: "Error", description: "Failed to submit rating.", variant: "destructive" });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Rate {activityName}</DialogTitle>
                    <DialogDescription>
                        How was your experience?
                    </DialogDescription>
                </DialogHeader>

                <div className="flex justify-center gap-2 py-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            onClick={() => setRating(star)}
                            className="focus:outline-none transition-transform hover:scale-110"
                        >
                            <Star
                                className={`h-8 w-8 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-input"}`}
                            />
                        </button>
                    ))}
                </div>

                <Textarea
                    placeholder="Write a short review (optional)..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="resize-none"
                    maxLength={200}
                />

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={submitting}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={submitting || rating === 0}>
                        {submitting ? "Submitting..." : "Submit Rating"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
