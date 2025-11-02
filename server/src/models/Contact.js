import mongoose from "mongoose";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const contactSchema = new mongoose.Schema({
  firstName: {
    type: String,
    index: true,
    required: [true, "firstName is required"]
  },
  lastName: {
    type: String,
    index: true,
    required: [true, "lastName is required"]
  },
  job: {
    type: String,
    index: true,
    required: [true, "job is required"]
  },
  email: {
    type: String,
    index: true,
    unique: true,
    sparse: true,
    lowercase: true,
    trim: true,
    required: [true, "email is required"],
    validate: {
      validator: v => !v || emailRegex.test(v),
      message: props => `${props.value} is not a valid email`
    }
  },
  comment: {
    type: String, index: true
  },
  createdAt: {
    type: Date, default: Date.now
  }
});

const Contact = mongoose.model('Contact', contactSchema);

export default Contact;