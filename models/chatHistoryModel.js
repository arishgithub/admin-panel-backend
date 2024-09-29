import mongoose from 'mongoose';

const chatHistorySchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
  },
  serviceProvider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceProvider',
    required: true,
  },
  messages: [{
    sender: {
      type: String,
      enum: ['customer', 'serviceProvider'],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    }
  }],
  lastUpdated: {
    type: Date,
    default: Date.now,
  }
});

export default mongoose.model('ChatHistory', chatHistorySchema);
