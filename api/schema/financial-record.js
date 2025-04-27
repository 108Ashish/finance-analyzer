import mongoose from 'mongoose';

const financialRecordSchema = new mongoose.Schema({
  userId: { 
    type: String, 
    required: true, 
    default: "default-user" 
  },
  date: { 
    type: Date, 
    required: true, 
    default: Date.now 
  },
  description: { 
    type: String, 
    required: true 
  },
  amount: { 
    type: Number, 
    required: true 
  },
  category: { 
    type: String, 
    required: true 
  },
  paymentMethod: { 
    type: String, 
    required: true 
  },
}, {
  timestamps: true
});

// Add validation pre-save hook
financialRecordSchema.pre('save', function(next) {
  if (this.amount === 0) {
    const err = new Error('Amount cannot be zero');
    return next(err);
  }
  next();
});

// Check if model already exists to prevent duplicate model error
const FinancialRecordModel = mongoose.models.FinancialRecord || 
  mongoose.model("FinancialRecord", financialRecordSchema);

export default FinancialRecordModel;