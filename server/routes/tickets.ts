import express from 'express';
import Ticket from '../models/Ticket';
import Activity from '../models/Activity'; // Use if we need to decrement tickets directly
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

router.get('/', authenticateToken, async (req: AuthRequest, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(403);
        const tickets = await Ticket.find({ user: userId });
        res.json(tickets);
    } catch (error) {
        res.status(500).json({ message: (error as any).message });
    }
});

router.post('/', authenticateToken, async (req: AuthRequest, res) => {
    if (!req.user) return res.status(403);
    try {
        const { activityId, quantity } = req.body;
        // Decrement Activity ticketsRemaining
        const activity = await Activity.findById(activityId);
        if (!activity) return res.status(404).json({ message: "Activity not found" });
        if (activity.ticketsRemaining < quantity) return res.status(400).json({ message: "Not enough tickets" });

        activity.ticketsRemaining -= quantity;
        await activity.save();

        const ticket = new Ticket({
            ...req.body,
            user: req.user.id,
            activity: activityId
        });
        const newTicket = await ticket.save();
        res.status(201).json(newTicket);
    } catch (error) {
        res.status(400).json({ message: (error as any).message });
    }
});

export default router;
