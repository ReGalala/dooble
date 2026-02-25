import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import * as dotenv from 'dotenv';
import authRoutes from './routes/auth';
import activityRoutes from './routes/activities';
import ticketRoutes from './routes/tickets';
import ratingsRoutes from './routes/ratings';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI as string)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

import uploadRoutes from './routes/upload';

// ... (previous imports)

app.use('/auth', authRoutes);
app.use('/activities', activityRoutes);
app.use('/tickets', ticketRoutes);
app.use('/ratings', ratingsRoutes);
app.use('/api/uploads', uploadRoutes);

// Serve uploaded images statically
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
