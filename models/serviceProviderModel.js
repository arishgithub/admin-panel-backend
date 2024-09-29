import mongoose from 'mongoose';

const serviceProviderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: String,
    required: true,
  },
  serviceType: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    default: 0,
  },
  reviews: [{
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
    },
    reviewDate: {
      type: Date,
      default: Date.now,
    }
  }],
  registrationDate: {
    type: Date,
    default: Date.now,
  }
});

export default mongoose.model('ServiceProvider', serviceProviderSchema);
