
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import Activity from './models/Activity';
import { SEED_ACTIVITIES } from '../src/data/activities';

dotenv.config();

const seedImages = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI as string);
        console.log('MongoDB connected for seeding images');

        const existingActivities = await Activity.find({}, 'name');
        console.log('Existing activities in DB:', existingActivities.map(a => a.name));

        for (const seed of SEED_ACTIVITIES) {
            if (seed.image) {
                // Try to find by name
                let match = await Activity.findOne({ name: seed.name });

                // Handle name variations if needed (e.g. Center vs Centre)
                if (!match && seed.name === "Universeum Science Center") {
                    match = await Activity.findOne({ name: "Universeum Science Centre" });
                }

                if (match) {
                    match.image = seed.image;
                    // Update other fields to match our better seed data
                    match.description = seed.description;
                    match.category = seed.category;
                    match.price = seed.price;
                    match.time = seed.time;
                    await match.save();
                    console.log(`Updated existing activity: ${match.name}`);
                } else {
                    // Create new activity
                    const { id, ...activityData } = seed as any;
                    const newActivity = new Activity(activityData);
                    await newActivity.save();
                    console.log(`Created new activity: ${seed.name}`);
                }
            }
        }

        // Also try to map images to existing DB items that might not be in our seed list but are close
        await Activity.findOneAndUpdate({ name: "Haga Cinnamon Bun Workshop" }, { image: "/images/haga.jpg" });
        await Activity.findOneAndUpdate({ name: "Gothenburg Archipelago Trip" }, { image: "/images/archipelago.jpg" });
        await Activity.findOneAndUpdate({ name: "Feskekorka Seafood Tasting" }, { image: "/images/seafood.jpg" });
        // Map images for new activities
        await Activity.findOneAndUpdate({ name: "Paddan Boat Tour" }, { image: "/images/paddan.jpg" });
        // Note: Volvo, Slottsskogen, and Botanical Garden images pending generation (quota limit)

        console.log('Image seeding completed');
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
};

seedImages();
