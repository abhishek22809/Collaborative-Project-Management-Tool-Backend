const express = require('express');
const Project = require('../models/Project');
const Task = require('../models/Task');
const auth = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Projects where user is a member
    const projectCount = await Project.countDocuments({ members: userId });

    // Tasks assigned to user (across all projects)
    const tasks = await Task.find({ assignedTo: userId });

    const totalTasks = tasks.length;
    const statusCounts = {
      Todo: tasks.filter(t => t.status === 'Todo').length,
      InProgress: tasks.filter(t => t.status === 'In Progress').length,
      Completed: tasks.filter(t => t.status === 'Completed').length,
    };

    res.json({
      totalProjects: projectCount,
      totalTasks,
      ...statusCounts,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
