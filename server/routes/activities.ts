import express from 'express';
import Activity from '../models/Activity';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const activities = await Activity.find();
        res.json(activities);
    } catch (error) {
        res.status(500).json({ message: (error as any).message });
    }
});

router.post('/', authenticateToken, async (req: any, res) => {
    try {
        const user = req.user;
        const activityData = { ...req.body };

        if (user.role === 'visitor') {
            activityData.source = 'community';
            activityData.ownerUserId = user.id;
            activityData.company = user.companyName || 'Community'; // Fallback
            activityData.companyEmail = user.email;
        } else {
            activityData.source = 'company';
        }

        const activity = new Activity(activityData);
        const newActivity = await activity.save();
        res.status(201).json(newActivity);
    } catch (error) {
        res.status(400).json({ message: (error as any).message });
    }
});

router.patch('/:id', authenticateToken, async (req: any, res) => {
    try {
        const activity = await Activity.findById(req.params.id);
        if (!activity) return res.status(404).json({ message: 'Activity not found' });

        // Permission check
        if (activity.source === 'community') {
            if (activity.ownerUserId !== req.user.id) {
                return res.status(403).json({ message: 'You can only edit your own community activities' });
            }
        } else {
            // Company activity - assuming only companies can edit (and ideally only their own, but simplistic check for now)
            if (req.user.role !== 'company') {
                return res.status(403).json({ message: 'Visitors cannot edit company activities' });
            }
        }

        const updatedActivity = await Activity.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedActivity);
    } catch (error) {
        res.status(400).json({ message: (error as any).message });
    }
});

router.delete('/:id', authenticateToken, async (req: any, res) => {
    try {
        const activity = await Activity.findById(req.params.id);
        if (!activity) return res.status(404).json({ message: 'Activity not found' });

        // Permission check
        if (activity.source === 'community') {
            if (activity.ownerUserId !== req.user.id) {
                return res.status(403).json({ message: 'You can only delete your own community activities' });
            }
        } else {
            if (req.user.role !== 'company') {
                return res.status(403).json({ message: 'Visitors cannot delete company activities' });
            }
        }

        await Activity.findByIdAndDelete(req.params.id);
        res.json({ message: 'Activity deleted' });
    } catch (error) {
        res.status(500).json({ message: (error as any).message });
    }
});

export default router;
