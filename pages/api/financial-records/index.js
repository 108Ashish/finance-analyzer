import { connectToDatabase, FinancialRecordModel } from '../../../api/index.js';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    await connectToDatabase();
    
    if (req.method === 'POST') {
      // Create new record
      const recordData = req.body;
      
      if (!recordData.userId) {
        recordData.userId = 'default-user';
      }
      
      const newRecord = new FinancialRecordModel(recordData);
      const savedRecord = await newRecord.save();
      
      res.status(201).json(savedRecord);
    } else if (req.method === 'GET') {
      // Get all records - this should redirect to the /all endpoint
      res.redirect(307, '/api/financial-records/all');
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error in /api/financial-records:', error);
    res.status(500).json({ error: error.message });
  }
}