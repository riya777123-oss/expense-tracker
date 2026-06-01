const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const expenseRoutes = require('./routes/expenseRoutes'); // 1. Import routes

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// 2. Link your expense routes
app.use('/api/expenses', expenseRoutes);

app.get('/', (req, res) => {
    res.send('Expense Tracker API is running...');
});

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('Successfully connected to MongoDB');
        app.listen(PORT, () => {
            console.log(`Server is running on port: ${PORT}`);
        });
    })
    .catch((error) => {
        console.error('MongoDB connection error:', error.message);
    });