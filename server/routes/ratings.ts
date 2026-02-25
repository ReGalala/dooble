import express from 'express';
import mongoose from 'mongoose';
import Rating from '../models/Rating';
import Activity from '../models/Activity';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Get ratings summary for an activity
router.get('/summary/:activityId', async (req, res) => {
    try {
        const { activityId } = req.params;
        const stats = await Rating.aggregate([
            { $match: { activityId: new mongoose.Types.ObjectId(activityId) } },
            {
                $group: {
                    _id: '$activityId',
                    averageRating: { $avg: '$rating' },
                    count: { $sum: 1 }
                }
            }
        ]);

        if (stats.length > 0) {
            // Return 1 decimal place for rating
            const avg = Math.round(stats[0].averageRating * 10) / 10;
            res.json({ averageRating: avg, count: stats[0].count });
        } else {
            res.json({ averageRating: 0, count: 0 });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error fetching rating summary' });
    }
});

// Post a rating (Upsert)
router.post('/', authenticateToken, async (req: any, res) => {
    try {
        const { activityId, rating, comment } = req.body;
        const userId = req.user.id;

        if (rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Rating must be between 1 and 5' });
        }

        const newRating = await Rating.findOneAndUpdate(
            { activityId, userId },
            { rating, comment },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        // Update Activity's cached rating
        const stats = await Rating.aggregate([
            { $match: { activityId: new mongoose.Types.ObjectId(activityId) } },
            {
                $group: {
                    _id: '$activityId',
                    averageRating: { $avg: '$rating' },
                    count: { $sum: 1 }
                }
            }
        ]);

        if (stats.length > 0) {
            const avg = Math.round(stats[0].averageRating * 10) / 10;
            await Activity.findByIdAndUpdate(activityId, {
                rating: avg,
                ratingCount: stats[0].count
            });
        }

        res.json(newRating);
    } catch (error) {
        res.status(400).json({ message: (error as any).message });
    }
});

// Get reviews for an activity (with user info)
router.get('/reviews/:activityId', async (req, res) => {
    try {
        const { activityId } = req.params;
        const ratings = await Rating.find({ activityId: new mongoose.Types.ObjectId(activityId) })
            .sort({ createdAt: -1 })
            .lean();

        // Fetch user info for each rating
        const User = mongoose.model('User');
        const reviewsWithUserInfo = await Promise.all(
            ratings.map(async (rating: any) => {
                const user: any = await User.findById(rating.userId).lean();
                return {
                    rating: rating.rating,
                    comment: rating.comment || '',
                    createdAt: rating.createdAt,
                    userName: user ? (user.companyName || user.email.split('@')[0]) : 'Anonymous'
                };
            })
        );

        res.json(reviewsWithUserInfo);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching reviews' });
    }
});

export default router;
