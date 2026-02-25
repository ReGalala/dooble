
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import Activity from './models/Activity';
import User from './models/User';
import Ticket from './models/Ticket';
import Rating from './models/Rating';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI || "";

if (!MONGO_URI) {
    console.error("Missing MONGO_URI in environment variables.");
    process.exit(1);
}

const seedDemoData = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('MongoDB connected');

        // 1. Find a Visitor User
        let visitorUser = await User.findOne({ role: 'visitor' });

        if (!visitorUser) {
            console.error("No visitor user found! Please sign up as a visitor first.");
            process.exit(1);
        }

        console.log(`Seeding data for visitor: ${visitorUser.email} (${visitorUser._id})`);

        // 2. Find Activities
        const activities = await Activity.find({});
        if (activities.length < 5) {
            console.log("Not enough activities to seed. Please run seedImages first or create some.");
        }

        // 3. Create Past Tickets (Activities I went to)
        const pastActivities = activities.slice(0, 5);

        console.log("Creating past tickets...");
        await Ticket.deleteMany({ user: visitorUser._id });

        const ticketsToCreate = pastActivities.map((activity, index) => {
            const daysAgo = (index + 1) * 7;
            const purchasedAt = new Date();
            purchasedAt.setDate(purchasedAt.getDate() - daysAgo);

            return {
                user: visitorUser!._id,
                activity: activity._id,
                activityTitle: activity.name,
                companyName: activity.company,
                qrCodeData: `demo-qr-${activity._id}-${Date.now()}`,
                purchasedAt: purchasedAt,
                quantity: 1,
                totalPaid: activity.price,
                status: 'Used',
            };
        });

        await Ticket.insertMany(ticketsToCreate);
        console.log(`Created ${ticketsToCreate.length} past tickets.`);

        // 4. Create Ratings & Reviews with detailed comments
        console.log("Seeding reviews...");

        await Rating.deleteMany({});

        const reviewTexts = [
            "Really fun experience, would definitely go again! The atmosphere was perfect.",
            "Great vibe and friendly staff. Highly recommend for families.",
            "Nice activity, maybe a bit crowded but overall good value for money.",
            "Had a blast! The instructor was knowledgeable and patient.",
            "A bit expensive for what it is, but still enjoyable. Worth trying once.",
            "Wonderful atmosphere and well-organized. Will bring friends next time!",
            "The best activity I've done in Gothenburg. Amazing experience!",
            "Perfect for a weekend outing. Kids loved it!",
            "Good but not great. Expected a bit more for the price.",
            "Absolutely loved it! Can't wait to come back.",
            "Decent activity, though the location was hard to find.",
            "Fantastic! The staff went above and beyond.",
            "Pretty good overall. A few minor issues but nothing major.",
            "Exceeded my expectations. Truly memorable experience.",
            "Fun but a bit short. Wish it lasted longer!"
        ];

        const ratingsToCreate = [];

        // Distribute 10-15 reviews across multiple activities
        const activitiesWithReviews = activities.slice(0, 6); // Use 6 activities

        for (const activity of activitiesWithReviews) {
            // Add 2-3 reviews per activity
            const numReviews = Math.floor(Math.random() * 2) + 2; // 2 or 3 reviews

            for (let i = 0; i < numReviews; i++) {
                // Mostly 4-5 stars, occasionally 3
                const randomRating = Math.random() < 0.8 ? (Math.random() < 0.6 ? 5 : 4) : 3;
                const randomReview = reviewTexts[Math.floor(Math.random() * reviewTexts.length)];

                // Create date in the past (1-30 days ago)
                const createdAt = new Date();
                createdAt.setDate(createdAt.getDate() - Math.floor(Math.random() * 30 + 1));

                ratingsToCreate.push({
                    activityId: activity._id,
                    userId: new mongoose.Types.ObjectId().toString(),
                    rating: randomRating,
                    comment: randomReview,
                    createdAt: createdAt
                });
            }
        }

        // Add the demo visitor's review for their first past activity
        if (pastActivities.length > 0) {
            const createdAt = new Date();
            createdAt.setDate(createdAt.getDate() - 5);

            ratingsToCreate.push({
                activityId: pastActivities[0]._id,
                userId: visitorUser._id.toString(),
                rating: 5,
                comment: "I loved it! One of the best experiences in the city. (Demo user review)",
                createdAt: createdAt
            });
        }

        await Rating.insertMany(ratingsToCreate);
        console.log(`Created ${ratingsToCreate.length} ratings with detailed comments.`);

        // 5. Update Activity Aggregates
        console.log("Updating activity rating aggregates...");

        for (const activity of activities) {
            const stats = await Rating.aggregate([
                { $match: { activityId: activity._id } },
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
                await Activity.findByIdAndUpdate(activity._id, {
                    rating: avg,
                    ratingCount: stats[0].count
                });
            } else {
                await Activity.findByIdAndUpdate(activity._id, {
                    rating: 0,
                    ratingCount: 0
                });
            }
        }

        console.log("Done!");
        process.exit(0);

    } catch (error) {
        console.error("Seeding error:", error);
        process.exit(1);
    }
};

seedDemoData();
