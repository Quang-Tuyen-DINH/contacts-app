import express from "express";
import cors from "cors";
import contactsRouter from "./routes/contact.route.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use("/contacts", contactsRouter);

export default app;