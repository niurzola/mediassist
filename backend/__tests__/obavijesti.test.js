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

describe("UT-29 do UT-31: Obavijesti", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getDB.mockReturnValue({ query: jest.fn() });
  });

  test("UT-29: Dohvat obavijesti kao pacijent", async () => {
    getDB().query.mockResolvedValueOnce([
      [
        { ID_Termina: 1, datum_ispis: "15.06.2026.", vrijeme_ispis: "10:00" },
      ],
    ]);

    const res = await request(app)
      .get("/api/obavijesti")
      .set("Authorization", `Bearer ${token("pacijent")}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("UT-30: Dohvat obavijesti kao zdravstveni radnik", async () => {
    getDB().query.mockResolvedValueOnce([
      [
        { ID_Termina: 1, datum_ispis: "15.06.2026.", vrijeme_ispis: "10:00" },
        { ID_Termina: 2, datum_ispis: "16.06.2026.", vrijeme_ispis: "11:00" },
      ],
    ]);

    const res = await request(app)
      .get("/api/obavijesti")
      .set("Authorization", `Bearer ${token("zdravstveni_radnik")}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(2);
  });

  test("UT-31: Dohvat obavijesti bez tokena", async () => {
    const res = await request(app).get("/api/obavijesti");

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Pristup odbijen. Token nedostaje.");
  });
});
