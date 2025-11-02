import { beforeAll, afterAll, beforeEach, describe, it, expect } from "@jest/globals";
import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../src/app.js";
import Contact from "../src/models/Contact.js";

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
  await Contact.createCollection().catch(() => {});
  await Contact.syncIndexes();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Contact.deleteMany({});
});

describe("Contacts API", () => {
  it("creates a contact and persists (201)", async () => {
    const res = await request(app).post("/contacts").send({
      firstName: "Alice",
      lastName: "Tester",
      email: "alice.test@example.com",
      job: "Agent"
    });
    expect(res.status).toBe(201);
    expect(res.body._id).toBeDefined();
    const db = await Contact.findOne({ email: "alice.test@example.com" });
    expect(db).not.toBeNull();
  });

  it("returns 400 for empty create payload", async () => {
    const res = await request(app).post("/contacts").send({});
    expect(res.status).toBe(400);
  });

  it("returns 409 for duplicate email on create", async () => {
    await Contact.create({
      firstName: "Dup",
      lastName: "User",
      email: "dup@example.com",
      job: "Agent"
    });
    const res = await request(app).post("/contacts").send({
      firstName: "Dup2",
      lastName: "User2",
      email: "dup@example.com",
      job: "Agent"
    });
    expect(res.status).toBe(409);
  });

  it("gets a contact by id (200) and 404 for missing id", async () => {
    const contact = await Contact.create({
      firstName: "Bob",
      lastName: "Builder",
      email: "bob@example.com",
      job: "Agent"
    });
    const getRes = await request(app).get(`/contacts/${contact._id}`);
    expect(getRes.status).toBe(200);
    expect(getRes.body.email).toBe("bob@example.com");

    const missingId = new mongoose.Types.ObjectId();
    const notFound = await request(app).get(`/contacts/${missingId}`);
    expect(notFound.status).toBe(404);
  });

  it("returns non-200 for invalid id format", async () => {
    const res = await request(app).get("/contacts/invalid-id");
    expect(res.status).not.toBe(200);
  });

  it("lists contacts with pagination", async () => {
    await Contact.insertMany(
      Array.from({ length: 5 }).map((_, i) => ({
        firstName: `n${i}`,
        lastName: `ln${i}`,
        email: `u${i}@ex.com`,
        job: "Agent"
      }))
    );
    const res = await request(app).get("/contacts?page=1&limit=3");
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(3);
    expect(res.body.total).toBe(5);
  });

  it("updates a contact (200) and persists changes", async () => {
    const contact = await Contact.create({
      firstName: "Eve",
      lastName: "Evans",
      email: "eve@example.com",
      job: "Agent"
    });
    const upd = await request(app).put(`/contacts/${contact._id}`).send({ job: "Senior" });
    expect(upd.status).toBe(200);
    expect(upd.body.job).toBe("Senior");

    const db = await Contact.findById(contact._id);
    expect(db.job).toBe("Senior");
  });

  it("returns 409 when update causes duplicate email", async () => {
    const a = await Contact.create({
      firstName: "A",
      lastName: "One",
      email: "a@example.com",
      job: "Agent"
    });
    const b = await Contact.create({
      firstName: "B",
      lastName: "Two",
      email: "b@example.com",
      job: "Agent"
    });

    const res = await request(app).put(`/contacts/${b._id}`).send({ email: "a@example.com" });
    expect(res.status).toBe(409);
  });

  it("deletes a contact (204) and 404 when deleting non-existing", async () => {
    const contact = await Contact.create({
      firstName: "Del",
      lastName: "Me",
      email: "del@example.com",
      job: "Agent"
    });
    const del = await request(app).delete(`/contacts/${contact._id}`);
    expect(del.status).toBe(204);
    const after = await request(app).get(`/contacts/${contact._id}`);
    expect(after.status).toBe(404);

    const missingId = new mongoose.Types.ObjectId();
    const delMissing = await request(app).delete(`/contacts/${missingId}`);
    expect(delMissing.status).toBe(404);
  });

  it("searches by job (search param) and returns matches", async () => {
    await Contact.insertMany([
      { firstName: "S1", lastName: "One", job: "Agent", email: "s1@example.com" },
      { firstName: "S2", lastName: "Two", job: "Manager", email: "s2@example.com" },
      { firstName: "S3", lastName: "Three", job: "Agent", email: "s3@example.com" }
    ]);
    const res = await request(app).get("/contacts?search=Agent");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.every((d) => /Agent/i.test(d.job))).toBe(true);
  });
});

describe("GET /contacts/emails", () => {
  it("returns email list for a given job (200)", async () => {
    await Contact.insertMany([
      { firstName: "A", lastName: "One", email: "a1@example.com", job: "Agent" },
      { firstName: "B", lastName: "Two", email: "b1@example.com", job: "Agent" },
      { firstName: "C", lastName: "Three", email: "c1@example.com", job: "Manager" }
    ]);

    const res = await request(app).get("/contacts/emails?job=Agent");
    expect(res.status).toBe(200);
    expect(res.body.job).toBe("Agent");
    expect(res.body.count).toBe(2);
    expect(Array.isArray(res.body.emails)).toBe(true);
    expect(res.body.emails).toContain("a1@example.com");
    expect(res.body.emails).toContain("b1@example.com");
  });

  it("returns 400 when job query is missing", async () => {
    const res = await request(app).get("/contacts/emails");
    expect(res.status).toBe(400);
  });
});
