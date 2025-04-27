import { connectToDatabase, FinancialRecordModel } from '../../../api/index.js';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { id } = req.query;
    
    if (!id) {
      return res.status(400).json({ error: 'Record ID is required' });
    }
    
    await connectToDatabase();
    
    if (req.method === 'PUT') {
      // Update record
      const updatedRecord = await FinancialRecordModel.findByIdAndUpdate(
        id,
        req.body,
        { new: true, runValidators: true }
      );
      
      if (!updatedRecord) {
        return res.status(404).json({ error: 'Record not found' });
      }
      
      res.status(200).json(updatedRecord);
    } else if (req.method === 'DELETE') {
      // Delete record
      const deletedRecord = await FinancialRecordModel.findByIdAndDelete(id);
      
      if (!deletedRecord) {
        return res.status(404).json({ error: 'Record not found' });
      }
      
      res.status(200).json({ message: 'Record deleted successfully' });
    } else if (req.method === 'GET') {
      // Get single record
      const record = await FinancialRecordModel.findById(id);
      
      if (!record) {
        return res.status(404).json({ error: 'Record not found' });
      }
      
      res.status(200).json(record);
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error(`Error in /api/financial-records/[id]:`, error);
    res.status(500).json({ error: error.message });
  }
}