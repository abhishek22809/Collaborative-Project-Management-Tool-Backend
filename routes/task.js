const express = require('express');
const Task = require('../models/Task');
const Project = require('../models/Project');
const auth = require('../middleware/authMiddleware');
const router = express.Router();

// Create Task
router.post('/', auth, async (req, res) => {
  try {
    const { title, projectId, assignedTo } = req.body;
    const project = await Project.findById(projectId);
    if (!project || !project.members.includes(req.user.id))
      return res.status(403).json({ message: 'Not authorized' });

    const task = new Task({ title, project: projectId, assignedTo });
    await task.save();
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get tasks by project
router.get('/project/:id', auth, async (req, res) => {
  try {
    const tasks = await Task.find({ project: req.params.id }).populate('assignedTo', 'name');
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update task status
router.put('/:id', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const updatedTask = await Task.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json(updatedTask);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
