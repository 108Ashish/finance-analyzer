import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import financialRecordRouter from './routes/financial-records.js';
import { connectToDatabase } from './utils/mongodb.js';

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

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    // Connect to database
    const mongoose = await connectToDatabase();
    const isConnected = mongoose.connection.readyState === 1;
    
    res.status(200).json({
      status: 'ok',
      environment: process.env.NODE_ENV || 'development',
      mongodb: isConnected ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
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

// Initialize connection on startup for non-serverless environments
if (process.env.NODE_ENV !== 'production') {
  connectToDatabase().then(() => {
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  });
}

export default app;