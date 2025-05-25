const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/authMiddleware');
const router = express.Router();
const checkRole =require('../middleware/roleMiddleware')
// Get user by email
router.get('/email/:email', auth, async (req, res) => {
  const user = await User.findOne({ email: req.params.email });
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
});

// ✅ Promote user (Only SuperAdmin)
router.put('/:id/role', auth, checkRole(['SuperAdmin']), async (req, res) => {
  const { role } = req.body;
  if (!['User', 'Admin'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }
  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ message: `User promoted to ${role}`, user });
});

module.exports = router;
