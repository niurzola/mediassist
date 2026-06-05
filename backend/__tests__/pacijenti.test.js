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

describe("UT-11 do UT-13: Pacijenti", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getDB.mockReturnValue({ query: jest.fn() });
  });

  test("UT-11: Dohvat pacijenata kao zdravstveni radnik", async () => {
    const mockPacijenti = [
      { ID_Pacijenta: 1, Ime_pacijent: "Ivo", Prezime_pacijenta: "Ivić" },
      { ID_Pacijenta: 2, Ime_pacijent: "Ana", Prezime_pacijenta: "Anić" },
    ];
    getDB().query.mockResolvedValueOnce([mockPacijenti]);

    const res = await request(app)
      .get("/api/pacijenti")
      .set("Authorization", `Bearer ${token("zdravstveni_radnik")}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(2);
    expect(res.body[0].Ime_pacijent).toBe("Ivo");
    expect(res.body[1].Prezime_pacijenta).toBe("Anić");
  });

  test("UT-12: Dohvat pacijenata kao pacijent - zabranjen pristup", async () => {
    const res = await request(app)
      .get("/api/pacijenti")
      .set("Authorization", `Bearer ${token("pacijent")}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toBe("Nemate ovlasti za ovu akciju.");
  });

  test("UT-13: Unos pacijenta kao zdravstveni radnik", async () => {
    getDB().query.mockResolvedValueOnce([{ insertId: 3, affectedRows: 1 }]);

    const res = await request(app)
      .post("/api/unospacijenta")
      .set("Authorization", `Bearer ${token("zdravstveni_radnik")}`)
      .send({ ime: "Marko", prezime: "Markić", dob: "1985-05-15", spol: "M" });

    expect(res.status).toBe(200);
  });
});
