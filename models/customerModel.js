import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
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
  registrationDate: {
    type: Date,
    default: Date.now,
  }
});

export default mongoose.model('Customer', customerSchema);
