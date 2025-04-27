import { connectToDatabase, FinancialRecordModel } from '../../../api/index.js';

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
    const userId = req.query.userId || "default-user";
    const year = parseInt(req.query.year) || 2025;
    
    console.log(`Getting monthly totals for user ${userId}, year ${year}`);
    
    await connectToDatabase();
    
    // Aggregate pipeline to get monthly totals
    const monthlyTotals = await FinancialRecordModel.aggregate([
      {
        $match: {
          userId: userId,
          date: {
            $gte: new Date(year, 0, 1),
            $lt: new Date(year + 1, 0, 1)
          }
        }
      },
      {
        $group: {
          _id: { $month: "$date" },
          amount: { $sum: "$amount" },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id": 1 }
      },
      {
        $project: {
          month: {
            $let: {
              vars: {
                monthsInString: [
                  "", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
                  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
                ]
              },
              in: { $arrayElemAt: ["$$monthsInString", "$_id"] }
            }
          },
          amount: 1,
          count: 1,
          _id: 0
        }
      }
    ]);
    
    // Create an array with all months, filling in zeros for months with no data
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const formattedResponse = monthNames.map((monthName) => {
      const existingData = monthlyTotals.find(item => item.month === monthName);
      return existingData || { month: monthName, amount: 0, count: 0 };
    });
    
    res.status(200).json(formattedResponse);
  } catch (error) {
    console.error('Error in /api/financial-records/monthlyTotals:', error);
    res.status(500).json({ error: error.message });
  }
}