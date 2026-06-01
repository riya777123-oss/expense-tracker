const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a title or description'],
        trim: true
    },
    amount: {
        type: Number,
        required: [true, 'Please add a positive number']
    },
    category: {
        type: String,
        required: [true, 'Please select a category'],
        enum: ['Food', 'Entertainment', 'Rent', 'Utilities', 'Salary', 'Other'] // Restricted options
    },
    date: {
        type: Date,
        default: Date.now // Defaults to today's date if not specified
    }
}, {
    timestamps: true // Automatically adds createdAt and updatedAt fields
});

module.exports = mongoose.model('Expense', ExpenseSchema);
