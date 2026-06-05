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

describe("UT-20 do UT-28: Tiketi", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getDB.mockReturnValue({ query: jest.fn() });
  });

  test("UT-20: Kreiranje tiketa kao pacijent", async () => {
    getDB().query
      .mockResolvedValueOnce([{ insertId: 1 }])
      .mockResolvedValueOnce([{ insertId: 1 }]);

    const res = await request(app)
      .post("/api/tiketi")
      .set("Authorization", `Bearer ${token("pacijent")}`)
      .send({ naslov_upita: "Problem s nalazom", tekst_poruke: "Molim pomoć" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.id_tiketa).toBe(1);
  });

  test("UT-21: Kreiranje tiketa kao zdravstveni radnik - zabranjeno", async () => {
    const res = await request(app)
      .post("/api/tiketi")
      .set("Authorization", `Bearer ${token("zdravstveni_radnik")}`)
      .send({ naslov_upita: "Test", tekst_poruke: "Test" });

    expect(res.status).toBe(403);
    expect(res.body.message).toBe("Samo pacijenti mogu otvoriti novi tiket.");
  });

  test("UT-22: Dohvat tiketa kao pacijent", async () => {
    getDB().query.mockResolvedValueOnce([
      [{ id_tiketa: 1, naslov_upita: "Problem", status: "OTVORENO" }],
    ]);

    const res = await request(app)
      .get("/api/tiketi")
      .set("Authorization", `Bearer ${token("pacijent")}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(1);
  });

  test("UT-23: Dohvat tiketa kao zdravstveni radnik", async () => {
    getDB().query.mockResolvedValueOnce([
      [
        { id_tiketa: 1, naslov_upita: "Problem 1", status: "OTVORENO" },
        { id_tiketa: 2, naslov_upita: "Problem 2", status: "U OBRADI" },
      ],
    ]);

    const res = await request(app)
      .get("/api/tiketi")
      .set("Authorization", `Bearer ${token("zdravstveni_radnik")}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(2);
  });

  test("UT-24: Kreiranje tiketa bez naslova", async () => {
    const res = await request(app)
      .post("/api/tiketi")
      .set("Authorization", `Bearer ${token("pacijent")}`)
      .send({ naslov_upita: "" });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Naslov upita je obavezan.");
  });

  test("UT-25: Dohvat poruka tiketa", async () => {
    getDB().query
      .mockResolvedValueOnce([[{ id_korisnika: 1 }]])
      .mockResolvedValueOnce([
        [
          {
            id_poruke: 1,
            tekst_poruke: "Pomoć",
            vrijeme_slanja_ispis: "01.06.2026. 12:00",
            autor: "Ivo Ivić",
          },
        ],
      ]);

    const res = await request(app)
      .get("/api/tiketi/1/poruke")
      .set("Authorization", `Bearer ${token("pacijent", 1)}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(1);
  });

  test("UT-27: Slanje poruke u tiket", async () => {
    getDB().query
      .mockResolvedValueOnce([[{ id_korisnika: 1, status: "OTVORENO" }]])
      .mockResolvedValueOnce([{ insertId: 2 }]);

    const res = await request(app)
      .post("/api/tiketi/1/poruke")
      .set("Authorization", `Bearer ${token("pacijent", 1)}`)
      .send({ tekst_poruke: "Nova poruka" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test("UT-28: Promjena statusa tiketa kao zdravstveni radnik", async () => {
    getDB().query.mockResolvedValueOnce([{ affectedRows: 1 }]);

    const res = await request(app)
      .put("/api/tiketi/1/status")
      .set("Authorization", `Bearer ${token("zdravstveni_radnik")}`)
      .send({ status: "U OBRADI" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
