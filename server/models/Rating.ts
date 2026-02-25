import mongoose, { Schema, Document } from 'mongoose';

export interface IRating extends Document {
    activityId: mongoose.Types.ObjectId;
    userId: string;
    rating: number; // 1-5
    comment?: string;
}

const RatingSchema: Schema = new Schema({
    activityId: { type: Schema.Types.ObjectId, ref: 'Activity', required: true },
    userId: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, maxlength: 500 },
}, { timestamps: true });

// Prevent multiple ratings per user per activity
RatingSchema.index({ activityId: 1, userId: 1 }, { unique: true });

export default mongoose.model<IRating>('Rating', RatingSchema);
