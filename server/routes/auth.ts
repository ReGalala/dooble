import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

router.post('/signup', async (req, res) => {
    const { email, password, role, companyName } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'User already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ email, password: hashedPassword, role, companyName });
        await newUser.save();

        const token = jwt.sign({ id: newUser._id, role: newUser.role, email: newUser.email }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
        res.status(201).json({ token, user: { id: newUser._id, email: newUser.email, role: newUser.role, companyName: newUser.companyName } });
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const isPasswordCorrect = await bcrypt.compare(password, user.password as string);
        if (!isPasswordCorrect) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id, role: user.role, email: user.email }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
        res.status(200).json({ token, user: { id: user._id, email: user.email, role: user.role, companyName: user.companyName } });
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
});

router.get('/me', authenticateToken, async (req: AuthRequest, res) => {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ id: user._id, email: user.email, role: user.role, companyName: user.companyName });
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
});

export default router;
