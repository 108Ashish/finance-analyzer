import express from 'express';
import FinancialRecordModel from '../schema/financial-record.js';

const router = express.Router();

// Debug middleware for this route
router.use((req, res, next) => {
  console.log(`Financial Records API: ${req.method} ${req.url}`);
  next();
});

// Helper function to handle MongoDB timeouts
const withTimeout = async (promise, timeoutMs = 15000, errorMessage = 'Operation timed out') => {
  let timer;
  
  const timeoutPromise = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(errorMessage)), timeoutMs);
  });
  
  try {
    const result = await Promise.race([promise, timeoutPromise]);
    clearTimeout(timer);
    return result;
  } catch (error) {
    clearTimeout(timer);
    throw error;
  }
};

router.get("/getAllByUserID/:userId", async (req, res, next) => {
  try {
    const userId = req.params.userId;
    console.log(`Fetching records for user: ${userId}`);
    const records = await withTimeout(
      FinancialRecordModel.find({ userId }).lean().exec(),
      20000,
      'Database query timed out after 20 seconds'
    );
    
    console.log(`Found ${records.length} records for user ${userId}`);
    res.status(200).json(records);
  } catch (err) {
    console.error("Error fetching records by user ID:", err);
    next(err);
  }
});

router.get("/all", async (req, res, next) => {
  try {
    console.log("Fetching all financial records");
    
    const records = await withTimeout(
      FinancialRecordModel.find({}).lean().exec(),
      20000,
      'Database query timed out after 20 seconds'
    );
    
    console.log(`Found ${records.length} records`);
    res.status(200).json(records);
  } catch (err) {
    console.error("Error fetching all records:", err);
    next(err);
  }
});

// Fixed monthlyTotals route
router.get("/monthlyTotals", async (req, res, next) => {
  try {
    const userId = req.query.userId || "default-user";
    const year = parseInt(req.query.year) || 2025;
    
    console.log(`Getting monthly totals for user ${userId}, year ${year}`);
    
    // Aggregate pipeline to get monthly totals
    const monthlyTotals = await withTimeout(
      FinancialRecordModel.aggregate([
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
      ]),
      20000,
      'Database query timed out after 20 seconds'
    );
    
    console.log("Monthly totals:", monthlyTotals);
    
    // Create an array with all months, filling in zeros for months with no data
    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    
    const formattedResponse = monthNames.map((monthName) => {
      const existingData = monthlyTotals.find(item => item.month === monthName);
      return existingData || { month: monthName, amount: 0, count: 0 };
    });
    
    res.status(200).json(formattedResponse);
  } catch (err) {
    console.error("Error getting monthly totals:", err);
    next(err);
  }
});

// Fix the POST endpoint to create a new record
router.post("/", async (req, res, next) => {
  try {
    console.log("Creating new financial record:", req.body);
    
    // Ensure there's a userId, use default if not provided
    const recordData = {
      ...req.body,
      userId: req.body.userId || "default-user"
    };
    
    const newRecord = new FinancialRecordModel(recordData);
    const savedRecord = await withTimeout(
      newRecord.save(),
      20000,
      'Database query timed out after 20 seconds'
    );
    
    console.log("Record saved:", savedRecord);
    res.status(201).json(savedRecord);
  } catch (err) {
    console.error("Error creating record:", err);
    next(err);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    console.log(`Updating record ${req.params.id}:`, req.body);
    const updatedRecord = await withTimeout(
      FinancialRecordModel.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      ).lean().exec(),
      20000,
      'Database query timed out after 20 seconds'
    );
    
    if (!updatedRecord) {
      return res.status(404).json({ error: "Record not found" });
    }
    
    console.log("Record updated:", updatedRecord);
    res.status(200).json(updatedRecord);
  } catch (err) {
    console.error("Error updating record:", err);
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    console.log(`Deleting record ${req.params.id}`);
    const deletedRecord = await withTimeout(
      FinancialRecordModel.findByIdAndDelete(req.params.id).lean().exec(),
      20000,
      'Database query timed out after 20 seconds'
    );
    
    if (!deletedRecord) {
      return res.status(404).json({ error: "Record not found" });
    }
    
    console.log("Record deleted successfully");
    res.status(200).json({ message: "Record deleted successfully" });
  } catch (err) {
    console.error("Error deleting record:", err);
    next(err);
  }
});

export default router;