import express from "express";
import { createContact, deleteContact, getAllContacts, getContactById, getEmailsByJob, updateContact } from '../controllers/contact.controller.js';

const router = express.Router();

router.get("/", getAllContacts);
router.get("/emails", getEmailsByJob);
router.get("/:id", getContactById);
router.post("/", createContact);
router.put("/:id", updateContact);
router.delete("/:id", deleteContact);

export default router;