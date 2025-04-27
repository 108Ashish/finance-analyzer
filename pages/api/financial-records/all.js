import { connectToDatabase, FinancialRecordModel } from '../../../api/index.js';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Connecting to database...');
    await connectToDatabase();
    console.log('Connected! Fetching all records...');
    
    const records = await FinancialRecordModel.find({})
      .lean()
      .limit(100)
      .sort({ date: -1 })
      .exec();
    
    console.log(`Found ${records.length} records`);
    res.status(200).json(records);
  } catch (error) {
    console.error('Error in /api/financial-records/all:', error);
    res.status(500).json({ error: error.message });
  }
}