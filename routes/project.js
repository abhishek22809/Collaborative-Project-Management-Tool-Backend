const express = require('express');
const Project = require('../models/Project');
const auth = require('../middleware/authMiddleware');
const router = express.Router();

// Create a new project
router.post('/', auth, async (req, res) => {
  try {
    const { name, description } = req.body;
    const newProject = new Project({
      name,
      description,
      owner: req.user.id,
      members: [req.user.id]
    });
    await newProject.save();
    res.status(201).json(newProject);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all projects where user is a member
router.get('/', auth, async (req, res) => {
  try {
    const projects = await Project.find({ members: req.user.id }).populate('owner', 'name');
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update project (only by owner)
router.put('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project || project.owner.toString() !== req.user.id)
      return res.status(403).json({ message: 'Not authorized' });

    const updated = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete project (only by owner)
router.delete('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project || project.owner.toString() !== req.user.id)
      return res.status(403).json({ message: 'Not authorized' });

    await project.remove();
    res.json({ message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// Add member to project (only by owner)
router.post('/:id/add-member', auth, async (req, res) => {
  try {
    const { userId } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project || project.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only owner can add members' });
    }

    if (!project.members.includes(userId)) {
      project.members.push(userId);
      await project.save();
    }

    res.json({ message: 'Member added', project });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Remove member from project (only by owner)
router.post('/:id/remove-member', auth, async (req, res) => {
  try {
    const { userId } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project || project.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only owner can remove members' });
    }

    project.members = project.members.filter(member => member.toString() !== userId);
    await project.save();

    res.json({ message: 'Member removed', project });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get members of a project
router.get('/:id/members', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('members', 'name email');
    res.json(project.members);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
