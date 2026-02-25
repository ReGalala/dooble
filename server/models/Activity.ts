import mongoose, { Schema, Document } from 'mongoose';

export interface IActivity extends Document {
    name: string;
    category: string;
    rating: number;
    time: string;
    address: string;
    lat: number;
    lng: number;
    description: string;
    company: string;
    companyEmail: string;
    price: number;
    ticketsRemaining: number;
    availableUntil: string;
    status: 'active' | 'inactive';
    lastMinute: boolean;
    startsAt: string | null;
    image?: string;
    source: 'company' | 'community';
    ownerUserId?: string;
    isActive: boolean;
}

const ActivitySchema: Schema = new Schema({
    name: { type: String, required: true },
    category: { type: String, required: true },
    rating: { type: Number, required: true, default: 0 },
    time: { type: String, required: true },
    address: { type: String, required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    description: { type: String, required: true },
    company: { type: String, required: true },
    companyEmail: { type: String, required: true },
    price: { type: Number, required: true },
    ticketsRemaining: { type: Number, required: true },
    availableUntil: { type: String, required: true },
    status: { type: String, enum: ['active', 'inactive'], required: true },
    lastMinute: { type: Boolean, default: false },
    startsAt: { type: String, default: null },
    image: { type: String, required: false },
    source: { type: String, enum: ['company', 'community'], default: 'company' },
    ownerUserId: { type: String, required: false },
    isActive: { type: Boolean, default: true },
    ratingCount: { type: Number, default: 0 },
}, { timestamps: true });

// Ensure virtuals are included to allow _id to map to id easier if needed
ActivitySchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: (doc, ret) => {
        ret.id = ret._id.toString(); // Map _id to id string
        delete ret._id;
    },
});

export default mongoose.model<IActivity>('Activity', ActivitySchema);
