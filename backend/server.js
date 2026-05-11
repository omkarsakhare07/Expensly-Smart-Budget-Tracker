// backend/server.js
// require('dotenv').config();
require('dotenv').config({ path: __dirname + '/../.env' });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
// CORS Configuration - Allow all Vercel deployments
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin
    if (!origin) return callback(null, true);
    
    // Allow localhost
    if (origin.includes('localhost')) {
      return callback(null, true);
    }
    
    // Allow all vercel.app URLs
    if (origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(express.json());

// MongoDB Connection
// const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/expensly';
// const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://expensly_admin:expensly123@cluster0.t1nfshd.mongodb.net/expensly?retryWrites=true&w=majority';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://expensly_admin:expensly123@cluster0.t1nfshd.mongodb.net/expensly?retryWrites=true&w=majority';

mongoose.connect(MONGODB_URI)
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Import Routes
const authRoutes = require('./routes/auth');
const transactionRoutes = require('./routes/transactions');
const budgetRoutes = require('./routes/budgets');
const savingsRoutes = require('./routes/savings');

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/savings', savingsRoutes);

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Expensly API is running' });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});


