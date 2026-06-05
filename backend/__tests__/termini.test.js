const request = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("../app");

jest.mock("../db", () => ({
  getDB: jest.fn(),
  connectDB: jest.fn().mockResolvedValue(),
}));

const { getDB } = require("../db");

const SECRET = "verysecretkey";

function token(uloga, id = 1) {
  return jwt.sign({ id, email: "test@test.hr", uloga }, SECRET);
}

describe("UT-17 do UT-19: Termini", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getDB.mockReturnValue({ query: jest.fn() });
  });

  test("UT-17: Zakazivanje termina kao pacijent", async () => {
    getDB().query
      .mockResolvedValueOnce([[{ ID_Pacijenta: 10 }]])
      .mockResolvedValueOnce([{ insertId: 1 }]);

    const res = await request(app)
      .post("/api/unostermina")
      .set("Authorization", `Bearer ${token("pacijent")}`)
      .send({ datum: "2026-06-15", vrijeme: "10:00" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Termin uspješno dodan!");
  });

  test("UT-18: Dohvat termina kao pacijent", async () => {
    getDB().query.mockResolvedValueOnce([
      [
        { ID_Termina: 1, datum_ispis: "15.06.2026.", vrijeme_ispis: "10:00" },
      ],
    ]);

    const res = await request(app)
      .get("/api/termini")
      .set("Authorization", `Bearer ${token("pacijent")}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(1);
  });

  test("UT-19: Dohvat termina kao zdravstveni radnik", async () => {
    getDB().query.mockResolvedValueOnce([
      [
        { ID_Termina: 1, datum_ispis: "15.06.2026.", vrijeme_ispis: "10:00" },
        { ID_Termina: 2, datum_ispis: "16.06.2026.", vrijeme_ispis: "11:00" },
      ],
    ]);

    const res = await request(app)
      .get("/api/termini")
      .set("Authorization", `Bearer ${token("zdravstveni_radnik")}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(2);
  });
});
