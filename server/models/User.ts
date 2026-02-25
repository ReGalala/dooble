import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    email: string;
    password?: string; // Optional if using OAuth, but here we use email/pass
    role: 'visitor' | 'company';
    companyName?: string;
    createdAt: Date;
}

const UserSchema: Schema = new Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['visitor', 'company'], required: true },
    companyName: { type: String },
}, { timestamps: true });

UserSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.password;
    },
});

export default mongoose.model<IUser>('User', UserSchema);
