const request = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("../app");

jest.mock("../db", () => ({
  getDB: jest.fn(),
  connectDB: jest.fn().mockResolvedValue(),
}));

const { getDB } = require("../db");

const SECRET = "verysecretkey";

function token(uloga = "pacijent", id = 1) {
  return jwt.sign({ id, email: "test@test.hr", uloga }, SECRET);
}

describe("UT-7 do UT-10: Mjerenja", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getDB.mockReturnValue({ query: jest.fn() });
  });

  test("UT-7: Unos mjerenja kao pacijent", async () => {
    getDB().query
      .mockResolvedValueOnce([[{ id_pacijenta: 5 }]])
      .mockResolvedValueOnce([{ insertId: 1 }]);

    const res = await request(app)
      .post("/api/unosmjerenja")
      .set("Authorization", `Bearer ${token("pacijent")}`)
      .send({
        tlak_gornji: 120,
        tlak_donji: 80,
        puls: 72,
        temperatura: 36.6,
        vrijednost_glukoze: 5.5,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Spremljeno u bazu!");
  });

  test("UT-8: Unos mjerenja kao zdravstveni radnik", async () => {
    getDB().query.mockResolvedValueOnce([{ insertId: 1 }]);

    const res = await request(app)
      .post("/api/unosmjerenja")
      .set("Authorization", `Bearer ${token("zdravstveni_radnik")}`)
      .send({
        id_pacijent: 3,
        tlak_gornji: 130,
        tlak_donji: 85,
        puls: 68,
        temperatura: 37.0,
        vrijednost_glukoze: 6.0,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test("UT-9: Dohvat mjerenja kao pacijent", async () => {
    getDB().query.mockResolvedValueOnce([
      [
        {
          id_mjerenja: 1,
          ime_prezime_pacijenta: "Ivo Ivić",
          tlak_gornji: 120,
          tlak_donji: 80,
          ispis_datuma: "01.06.2026. 10:30",
        },
      ],
    ]);

    const res = await request(app)
      .get("/api/svaMjerenja")
      .set("Authorization", `Bearer ${token("pacijent")}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(1);
  });

  test("UT-10: Dohvat mjerenja kao zdravstveni radnik", async () => {
    getDB().query.mockResolvedValueOnce([
      [
        {
          id_mjerenja: 1,
          ime_prezime_pacijenta: "Ivo Ivić",
        },
        {
          id_mjerenja: 2,
          ime_prezime_pacijenta: "Ana Anić",
        },
      ],
    ]);

    const res = await request(app)
      .get("/api/svaMjerenja")
      .set("Authorization", `Bearer ${token("zdravstveni_radnik")}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(2);
  });
});
