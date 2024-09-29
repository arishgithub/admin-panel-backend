import express from 'express';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

// @route   GET /api/admin/dashboard
// @desc    Admin dashboard (protected)
// @access  Private
router.get('/dashboard', protect, (req, res) => {
  res.json({ message: 'Welcome to the admin dashboard' });
});

export default router;
