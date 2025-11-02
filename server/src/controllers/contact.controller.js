import Contact from "../models/Contact.js";
import ContactService from "../services/contact.service.js";

export async function getAllContacts(req, res) {
  try {
    const result = await ContactService.list({
      page: req.query.page,
      limit: req.query.limit,
      search: req.query.search ? req.query.search.trim() : null
    });

    res.json(result);
  } catch (err) {
    console.error("Error while getting contacts list", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function getContactById(req, res) {
  try {
    const contact = await ContactService.getById(req.params.id);
    if (!contact) return res.status(404).json({ error: "Contact not found" });
    res.json(contact);
  } catch (err) {
    console.error("Error while getting contact by ID", err);
    if (err && err.name === "CastError" && err.kind === "ObjectId") {
      return res.status(400).json({ error: "Invalid contact id" });
    }
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function createContact(req, res) {
  try {
    const { firstName, lastName, email, job, comment } = req.body;

    if (!firstName || !lastName || !email || !job) {
      return res.status(400).json({ error: "Provide required information" });
    }

    const contact = await ContactService.create({ firstName, lastName, email, job, comment });
    res.status(201).json(contact);
  } catch (err) {
    console.error("Error while creating contact", err);
    if (err.code === 11000) {
      return res.status(409).json({ error: "Email already exists" });
    }
    if (err && err.name === "ValidationError") {
      const details = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ error: "Validation failed", details });
    }
    res.status(500).json({ error: "Internal server error" });
  }
}