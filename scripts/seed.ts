import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import Activity from '../server/models/Activity.js'; // Ensure correct import path relative to script execution

dotenv.config();

const activities = [
    {
        name: "Liseberg Amusement Park",
        category: "Entertainment",
        rating: 4.8,
        time: "11:00 - 23:00",
        address: "Örgrytevägen 5, 402 22 Göteborg",
        lat: 57.6961,
        lng: 11.9897,
        description: "Experience the thrill of Scandinavia's largest amusement park with roller coasters and attractions for all ages.",
        company: "Liseberg AB",
        companyEmail: "info@liseberg.se",
        price: 395,
        ticketsRemaining: 150,
        availableUntil: "2026-12-31",
        status: "active",
        lastMinute: false,
        startsAt: null
    },
    {
        name: "Universeum Science Centre",
        category: "Edutainment",
        rating: 4.5,
        time: "10:00 - 18:00",
        address: "Södra Vägen 50, 400 20 Göteborg",
        lat: 57.6956,
        lng: 11.9905,
        description: "Explore rainforests, aquariums, and space exhibits at this interactive science centre.",
        company: "Universeum",
        companyEmail: "info@universeum.se",
        price: 265,
        ticketsRemaining: 80,
        availableUntil: "2026-12-31",
        status: "active",
        lastMinute: true,
        startsAt: null
    },
    {
        name: "Paddan Boat Tour",
        category: "Sightseeing",
        rating: 4.6,
        time: "10:30 - 19:30",
        address: "Kungsportsplatsen, 411 10 Göteborg",
        lat: 57.7034,
        lng: 11.9685,
        description: "See Gothenburg from the water with a guided boat tour through the canals and harbor.",
        company: "Stromma",
        companyEmail: "info@stromma.se",
        price: 220,
        ticketsRemaining: 50,
        availableUntil: "2026-10-31",
        status: "active",
        lastMinute: false,
        startsAt: null
    },
    {
        name: "Haga Cinnamon Bun Workshop",
        category: "Food",
        rating: 4.9,
        time: "14:00 - 16:00",
        address: "Haga Nygata, 413 01 Göteborg",
        lat: 57.6975,
        lng: 11.9567,
        description: "Learn to bake the famous giant cinnamon buns of Haga in this cozy workshop.",
        company: "Haga Buns",
        companyEmail: "workshop@hagabuns.se",
        price: 450,
        ticketsRemaining: 12,
        availableUntil: "2026-12-31",
        status: "active",
        lastMinute: false,
        startsAt: "2026-06-15T14:00:00"
    },
    {
        name: "Gothenburg Archipelago Trip",
        category: "Nature",
        rating: 4.7,
        time: "09:00 - 17:00",
        address: "Saltholmen Ferry Terminal, 426 76 Västra Frölunda",
        lat: 57.6601,
        lng: 11.8407,
        description: "A full day trip exploring the beautiful southern archipelago islands.",
        company: "Styrsöbolaget",
        companyEmail: "info@styrsobolaget.se",
        price: 0, // Public transport ticket covers it usually, or specialized tour price
        ticketsRemaining: 200,
        availableUntil: "2026-09-30",
        status: "active",
        lastMinute: false,
        startsAt: null
    },
    {
        name: "Botanical Garden Walk",
        category: "Nature",
        rating: 4.8,
        time: "09:00 - 21:00",
        address: "Carl Skottsbergs gata 22A, 413 19 Göteborg",
        lat: 57.6835,
        lng: 11.9507,
        description: "Guided walk through one of Europe's largest and most beautiful botanical gardens.",
        company: "Botaniska",
        companyEmail: "info@botaniska.se",
        price: 0, // Often free/donation
        ticketsRemaining: 300,
        availableUntil: "2026-10-31",
        status: "active",
        lastMinute: false,
        startsAt: null
    },
    {
        name: "Volvo Museum Experience",
        category: "Culture",
        rating: 4.4,
        time: "10:00 - 17:00",
        address: "Arendals Skans, 405 08 Göteborg",
        lat: 57.6946, // Moved to World of Volvo location effectively or approximate
        lng: 11.9930,
        description: "Discover the history and future of Volvo at their impressive museum.",
        company: "Volvo Cars",
        companyEmail: "museum@volvocars.com",
        price: 160,
        ticketsRemaining: 60,
        availableUntil: "2026-12-31",
        status: "active",
        lastMinute: false,
        startsAt: null
    },
    {
        name: "Feskekorka Seafood Tasting",
        category: "Food",
        rating: 4.6,
        time: "11:30 - 14:00",
        address: "Fisktorget 4, 411 20 Göteborg",
        lat: 57.7013,
        lng: 11.9577,
        description: "Taste fresh seafood delicacies in the iconic 'Fish Church' market hall.",
        company: "Gothenburg Food Tours",
        companyEmail: "tours@goteborg.com",
        price: 550,
        ticketsRemaining: 20,
        availableUntil: "2026-12-31",
        status: "active",
        lastMinute: true,
        startsAt: "2026-06-20T11:30:00"
    },
    {
        name: "Slottsskogen Picnic & Zoo",
        category: "Nature",
        rating: 4.7,
        time: "08:00 - 22:00",
        address: "Slottsskogen, 413 19 Göteborg",
        lat: 57.6875,
        lng: 11.9442,
        description: "Enjoy a relaxing day in the park and see elks and penguins at the free zoo.",
        company: "City of Gothenburg",
        companyEmail: "park@goteborg.se",
        price: 0,
        ticketsRemaining: 500,
        availableUntil: "2026-12-31",
        status: "active",
        lastMinute: false,
        startsAt: null
    },
    {
        name: "Konstmuseet Art Tour",
        category: "Culture",
        rating: 4.6,
        time: "11:00 - 17:00",
        address: "Götaplatsen 6, 412 56 Göteborg",
        lat: 57.6967,
        lng: 11.9806,
        description: "Guided tour through the Gothenburg Museum of Art's finest Nordic collections.",
        company: "Konstmuseet",
        companyEmail: "info@konstmuseet.se",
        price: 65,
        ticketsRemaining: 40,
        availableUntil: "2026-12-31",
        status: "active",
        lastMinute: false,
        startsAt: null
    }
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI as string);
        console.log('Connected to MongoDB');

        // Clear existing activities
        await Activity.deleteMany({});
        console.log('Cleared existing activities');

        // Insert new activities
        await Activity.insertMany(activities);
        console.log('Inserted 10 activities');

        mongoose.disconnect();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedDB();
