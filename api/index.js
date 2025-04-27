import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import financialRecordRouter from './routes/financial-records.js';

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: '*', // Allow all origins in production (you can restrict this later)
  credentials: true
}));

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// MongoDB connection with improved options
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://singhashishsuttle:su1fF8bLAR6OOPDY@financetracker.alicd3x.mongodb.net/financetracker?retryWrites=true&w=majority";

// Better MongoDB connection options to avoid timeouts
mongoose
  .connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 30000, // Increase timeout to 30 seconds
    socketTimeoutMS: 45000, // Increase socket timeout
    family: 4, // Use IPv4, skip trying IPv6
    maxPoolSize: 10, // Maintain up to 10 socket connections
    connectTimeoutMS: 30000, // Give up initial connection after 30 seconds
  })
  .then(() => console.log("Connected to MongoDB!"))
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err);
  });

// Handle MongoDB connection errors
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected, attempting to reconnect...');
});

mongoose.connection.on('reconnected', () => {
  console.log('MongoDB reconnected!');
});

// Add this inside your express app setup in index.js, before other routes
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    environment: process.env.NODE_ENV || 'development',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api/financial-records', financialRecordRouter);

// Improved error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: err.message || 'Something went wrong on the server',
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
  });
});

// Catch-all handler for routes that don't exist
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// For local development
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;