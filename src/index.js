const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const financialRecordRouter = require("./routes/financial-records");

const app = express();

app.use(express.json());
app.use(cors());

// Updated MongoDB URI with database name and connection options
const mongoURI =
  "mongodb+srv://singhashishsuttle:su1fF8bLAR6OOPDY@financetracker.alicd3x.mongodb.net/financetracker?retryWrites=true&w=majority";

// Remove deprecated options and add better timeout
mongoose
  .connect(mongoURI, {
    serverSelectionTimeoutMS: 5000 // Reduce timeout for faster error feedback
  })
  .then(() => console.log("CONNECTED TO MONGODB!"))
  .catch((err) => {
    console.error("Failed to Connect to MongoDB:", err.message);
    // Don't exit the process immediately in development
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  });

// Add basic route for testing
app.get("/", (req, res) => {
  res.send("Finance Tracker API is running");
});

app.use("/financial-records", financialRecordRouter);

app.listen(3001, () => {
  console.log("Server Running on Port 3001");
});