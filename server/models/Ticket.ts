import mongoose, { Schema, Document } from 'mongoose';

export interface ITicket extends Document {
    user: mongoose.Types.ObjectId;
    activity: mongoose.Types.ObjectId;
    activityTitle: string;
    companyName: string;
    qrCodeData: string;
    purchasedAt: Date;
    quantity: number;
    totalPaid: number;
    status: 'Valid' | 'Used' | 'Expired';
}

const TicketSchema: Schema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    activity: { type: Schema.Types.ObjectId, ref: 'Activity', required: true },
    activityTitle: { type: String, required: true },
    companyName: { type: String, required: true },
    qrCodeData: { type: String, required: true },
    purchasedAt: { type: Date, default: Date.now },
    quantity: { type: Number, required: true },
    totalPaid: { type: Number, required: true },
    status: { type: String, enum: ['Valid', 'Used', 'Expired'], default: 'Valid' },
}, { timestamps: true });

TicketSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: (doc, ret) => {
        ret.id = ret._id.toString();
        ret.userId = ret.user ? ret.user.toString() : null;
        ret.activityId = ret.activity ? ret.activity.toString() : null;
        delete ret._id;
        delete ret.user;
        // delete ret.activity; // Keep activityId distinct
    },
});

export default mongoose.model<ITicket>('Ticket', TicketSchema);
