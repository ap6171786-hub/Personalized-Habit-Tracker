import { afterAll, beforeAll, describe, expect, it } from "@jest/globals";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";
import app from "../server.js";

let mongo;
let token;
let habitId;

beforeAll(async () => {
  process.env.JWT_SECRET = "test-secret";
  process.env.JWT_EXPIRES_IN = "1d";
  mongo = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongo.getUri();
  await mongoose.connect(process.env.MONGO_URI);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

describe("authentication", () => {
  it("registers a user and returns a token", async () => {
    const response = await request(app).post("/api/auth/register").send({
      name: "Taylor",
      email: "taylor@example.com",
      password: "secret123",
    });
    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.token).toBeTruthy();
    expect(response.body.user.email).toBe("taylor@example.com");
    token = response.body.token;
  });

  it("rejects duplicate email addresses", async () => {
    const response = await request(app).post("/api/auth/register").send({
      name: "Taylor",
      email: "taylor@example.com",
      password: "secret123",
    });
    expect(response.status).toBe(400);
    expect(response.body.message).toBe("User already exists");
  });

  it("logs in and rejects an incorrect password", async () => {
    const login = await request(app).post("/api/auth/login").send({
      email: "taylor@example.com",
      password: "secret123",
    });
    expect(login.status).toBe(200);
    expect(login.body.token).toBeTruthy();

    const rejected = await request(app).post("/api/auth/login").send({
      email: "taylor@example.com",
      password: "incorrect",
    });
    expect(rejected.status).toBe(401);
    expect(rejected.body.message).toBe("Invalid credentials");
  });

  it("returns the signed-in user from the protected profile route", async () => {
    const response = await request(app).get("/api/auth/me").set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(response.body.email).toBe("taylor@example.com");
    expect(response.body.password).toBeUndefined();
  });
});

describe("habits", () => {
  it("requires authentication and supports create, list, and delete", async () => {
    const unauthorized = await request(app).post("/api/habits").send({ name: "Read" });
    expect(unauthorized.status).toBe(401);

    const created = await request(app)
      .post("/api/habits")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Read", description: "Read a little", frequency: "daily" });
    expect(created.status).toBe(201);
    habitId = created.body._id;

    const list = await request(app).get("/api/habits").set("Authorization", `Bearer ${token}`);
    expect(list.status).toBe(200);
    expect(list.body).toHaveLength(1);
    expect(list.body[0].todayCompleted).toBe(false);

    const toggled = await request(app)
      .post("/api/logs/toggle")
      .set("Authorization", `Bearer ${token}`)
      .send({ habitId });
    expect(toggled.status).toBe(200);
    expect(toggled.body.completed).toBe(true);

    const logs = await request(app)
      .get(`/api/logs/${habitId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(logs.status).toBe(200);
    expect(logs.body.logs).toHaveLength(1);
    expect(logs.body.currentStreak).toBe(1);

    const stats = await request(app).get("/api/stats").set("Authorization", `Bearer ${token}`);
    expect(stats.status).toBe(200);
    expect(stats.body.totalHabits).toBe(1);
    expect(stats.body.completedToday).toBe(1);

    const deleted = await request(app)
      .delete(`/api/habits/${habitId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(deleted.status).toBe(200);
    expect(deleted.body.success).toBe(true);
  });
});
