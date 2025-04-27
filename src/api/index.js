import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import financialRecordRouter from './routes/financial-records.js';

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://singhashishsuttle:su1fF8bLAR6OOPDY@financetracker.alicd3x.mongodb.net/financetracker?retryWrites=true&w=majority";

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("Connected to MongoDB!"))
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err);
  });

// API routes
app.use('/api/financial-records', financialRecordRouter);

// For local development
const PORT = process.env.PORT || 3001;
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export for Vercel
export default app;