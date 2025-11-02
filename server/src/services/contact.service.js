import mongoose from "mongoose";
import ContactRepository from "../repositories/contact.repository.js";

export const ContactService = {
  async list({ page = 1, limit = 50, search = null } = {}) {
    const parsedPage = Math.max(1, parseInt(String(page), 10) || 1);
    const parsedLimit = Math.min(100, Math.max(1, parseInt(String(limit), 10) || 50));
    const skip = (parsedPage - 1) * parsedLimit;

    const query = {};
    if (search) {
      const regex = new RegExp(search, "i");
      query.$or = [{ job: regex }];
    }

    const [total, data] = await Promise.all([
      ContactRepository.count(query),
      ContactRepository.find(query, { skip, limit: parsedLimit })
    ]);

    return {
      page: parsedPage,
      limit: parsedLimit,
      total,
      pages: Math.ceil(total / parsedLimit),
      data
    };
  },

  async getById(id) {
    if (!mongoose.Types.ObjectId.isValid(String(id))) {
      const err = new Error("Invalid contact id");
      err.name = "CastError";
      err.kind = "ObjectId";
      throw err;
    }
    return ContactRepository.findById(id);
  },

  async create(payload) {
    return ContactRepository.create(payload);
  },
};

export default ContactService;