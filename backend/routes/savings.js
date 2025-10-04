const express = require('express');
const router = express.Router();
const SavingsGoal = require('../models/SavingsGoal');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const goals = await SavingsGoal.find({ userId: req.userId })
      .sort({ deadline: 1 });
    res.json(goals);
  } catch (error) {
    console.error('Get savings goals error:', error);
    res.status(500).json({ error: 'Failed to fetch savings goals' });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { title, targetAmount, currentAmount, deadline } = req.body;

    if (!title || !targetAmount || !deadline) {
      return res.status(400).json({ error: 'Please provide title, target amount, and deadline' });
    }

    const goal = new SavingsGoal({
      userId: req.userId,
      title,
      targetAmount,
      currentAmount: currentAmount || 0,
      deadline
    });

    await goal.save();
    res.status(201).json(goal);
  } catch (error) {
    console.error('Create savings goal error:', error);
    res.status(500).json({ error: 'Failed to create savings goal' });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { currentAmount } = req.body;

    const goal = await SavingsGoal.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { currentAmount },
      { new: true }
    );

    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    res.json(goal);
  } catch (error) {
    console.error('Update savings goal error:', error);
    res.status(500).json({ error: 'Failed to update savings goal' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const goal = await SavingsGoal.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });

    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    res.json({ message: 'Goal deleted successfully' });
  } catch (error) {
    console.error('Delete savings goal error:', error);
    res.status(500).json({ error: 'Failed to delete savings goal' });
  }
});

module.exports = router;