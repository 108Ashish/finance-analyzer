import express from 'express';
import FinancialRecordModel from '../schema/financial-record.js';

const router = express.Router();

router.get("/getAllByUserID/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const records = await FinancialRecordModel.find({ userId });
    if (records.length === 0) {
      return res.status(404).send("No records found for the user.");
    }
    res.status(200).send(records);
  } catch (err) {
    res.status(500).send(err);
  }
});

router.get("/all", async (req, res) => {
  try {
    const records = await FinancialRecordModel.find({});
    res.status(200).send(records);
  } catch (err) {
    res.status(500).send(err);
  }
});

router.get("/monthlyTotals", async (req, res) => {
  try {
    const userId = req.query.userId || "default-user";
    const year = parseInt(req.query.year) || 2025;
    
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
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id": 1 }
      },
      {
        $project: {
          month: "$_id",
          totalAmount: 1,
          count: 1,
          _id: 0
        }
      }
    ]);
    
    // Convert month numbers to names
    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    
    // Format response with all 12 months (including zeros for months with no data)
    const formattedResponse = monthNames.map((name, idx) => {
      const monthData = monthlyTotals.find(item => item.month === idx + 1);
      return {
        month: name,
        amount: monthData ? monthData.totalAmount : 0,
        count: monthData ? monthData.count : 0
      };
    });
    
    res.status(200).json(formattedResponse);
  } catch (err) {
    console.error("Error getting monthly totals:", err);
    res.status(500).send({ error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    console.log("Received data:", req.body);
    // Ensure there's a userId, use default if not provided
    const recordData = {
      ...req.body,
      userId: req.body.userId || "default-user"
    };
    
    const newRecord = new FinancialRecordModel(recordData);
    const savedRecord = await newRecord.save();
    
    res.status(200).send(savedRecord);
  } catch (err) {
    console.error("Error saving record:", err.message);
    res.status(500).send({ error: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const updatedRecord = await FinancialRecordModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedRecord) return res.status(404).send("Record not found.");
    res.status(200).send(updatedRecord);
  } catch (err) {
    res.status(500).send(err);
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const deleted = await FinancialRecordModel.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).send("Record not found.");
    res.status(200).send(deleted);
  } catch (err) {
    res.status(500).send(err);
  }
});

export default router;