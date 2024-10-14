import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Basic route to check if the server is running
app.get('/', (req, res) => {
  res.send('Admin Panel Backend is running');
});

// Use the imported routes, with a prefix for the route path
app.use('/api/auth', authRoutes);  // All auth routes will be prefixed with /api/auth
app.use('/api/admin', adminRoutes);


// MongoDB connection
connectDB()
  

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
