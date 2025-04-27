import mongoose from 'mongoose';
import FinancialRecordModel from './financial-record.js';
import dotenv from 'dotenv';

dotenv.config();

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI;

// Categories for financial records
const categories = ['Food', 'Utilities', 'Entertainment', 'Transportation', 'Housing', 'Healthcare', 'Education', 'Shopping'];
const paymentMethods = ['Cash', 'Credit Card', 'Debit Card', 'Bank Transfer', 'Digital Wallet'];

// Generate random amount between min and max
const randomAmount = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

// Generate sample data for each month of 2025
const generateMonthlyData = () => {
  const sampleData = [];
  
  for (let month = 0; month < 12; month++) {
    // Generate between 3-7 records per month
    const recordsCount = randomAmount(3, 7);
    
    for (let i = 0; i < recordsCount; i++) {
      // Create a random date within the month
      const day = randomAmount(1, 28);
      const date = new Date(2025, month, day);
      
      // Create the record
      sampleData.push({
        userId: 'default-user',
        date,
        description: `Expense for ${date.toLocaleString('default', { month: 'long' })}`,
        amount: randomAmount(50, 500),
        category: categories[Math.floor(Math.random() * categories.length)],
        paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)]
      });
    }
  }
  
  return sampleData;
};

// Export function for seeding
export async function seedDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Clear existing records for default user
    await FinancialRecordModel.deleteMany({ userId: 'default-user' });
    console.log('Cleared existing records');
    
    // Generate and insert sample data
    const sampleData = generateMonthlyData();
    const result = await FinancialRecordModel.insertMany(sampleData);
    
    console.log(`Successfully inserted ${result.length} records`);
    return { success: true, count: result.length };
  } catch (error) {
    console.error('Error seeding database:', error);
    return { success: false, error: error.message };
  }
}

// Call directly if run as script
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  seedDatabase().then(() => mongoose.disconnect());
}