require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorHandler');
const { notFound } = require('./middleware/notFound');

// Initialize app
const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Parse JSON bodies

// Connect to MongoDB
connectDB();

// Health-check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'LMS Backend API is running'
  });
});

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));

// Test routes for RBAC
const { protect } = require('./middleware/authMiddleware');
const { requireRole } = require('./middleware/roleMiddleware');

app.get('/api/test/student', protect, requireRole('student', 'instructor', 'admin'), (req, res) => {
  res.status(200).json({ success: true, message: 'Student access granted' });
});

app.get('/api/test/instructor', protect, requireRole('instructor', 'admin'), (req, res) => {
  res.status(200).json({ success: true, message: 'Instructor access granted' });
});

app.get('/api/test/admin', protect, requireRole('admin'), (req, res) => {
  res.status(200).json({ success: true, message: 'Admin access granted' });
});

// 404 Handler for unknown routes
app.use(notFound);

// Centralized Error Handling Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
