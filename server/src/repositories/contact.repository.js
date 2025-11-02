import Contact from "../models/Contact.js";

export const ContactRepository = {
  count(query) {
    return Contact.countDocuments(query);
  },

  find(query, { skip = 0, limit = 50, sort = { createdAt: -1 } } = {}) {
    return Contact.find(query).sort(sort).skip(skip).limit(limit);
  },

  findById(id) {
    return Contact.findById(id);
  },

  create(payload) {
    return Contact.create(payload);
  },

  findByIdAndUpdate(id, updates, opts = { new: true, runValidators: true }) {
    return Contact.findByIdAndUpdate(id, updates, opts);
  },

  findByIdAndDelete(id) {
    return Contact.findByIdAndDelete(id);
  },

  findEmailsByJob(job) {
    return Contact.find({ job }, { email: 1, _id: 0 }).lean();
  }
};

export default ContactRepository;