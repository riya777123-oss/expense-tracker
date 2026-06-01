const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');

// GET all expenses
router.get('/', async (req, res) => {
    try {
        const expenses = await Expense.find().sort({ date: -1 });
        res.status(200).json(expenses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST a new expense
router.post('/', async (req, res) => {
    const { title, amount, category, date } = req.body;

    try {
        const newExpense = new Expense({ title, amount, category, date });
        const savedExpense = await newExpense.save();
        res.status(201).json(savedExpense);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// DELETE an expense by ID
router.delete('/:id', async (req, res) => {
    try {
        const expense = await Expense.findById(req.params.id);
        if (!expense) return res.status(404).json({ message: 'Expense not found' });

        await expense.deleteOne();
        res.status(200).json({ message: 'Expense deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;