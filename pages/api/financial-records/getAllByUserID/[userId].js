import { connectToDatabase, FinancialRecordModel } from '../../../../api/index.js';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    console.log(`Fetching records for user: ${userId}`);
    await connectToDatabase();
    
    const records = await FinancialRecordModel.find({ userId })
      .lean()
      .limit(100)
      .sort({ date: -1 })
      .exec();
    
    console.log(`Found ${records.length} records for user ${userId}`);
    res.status(200).json(records);
  } catch (error) {
    console.error(`Error in /api/financial-records/getAllByUserID/[userId]:`, error);
    res.status(500).json({ error: error.message });
  }
}