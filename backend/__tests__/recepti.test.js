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

describe("UT-14 do UT-16: Recepti", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getDB.mockReturnValue({ query: jest.fn() });
  });

  test("UT-14: Izdavanje recepta kao zdravstveni radnik", async () => {
    getDB().query.mockResolvedValueOnce([{ insertId: 1 }]);

    const res = await request(app)
      .post("/api/unosrecepta")
      .set("Authorization", `Bearer ${token("zdravstveni_radnik")}`)
      .send({
        id_pacijent: 1,
        naziv_lijeka: "Paracetamol",
        doziranje: "2x dnevno",
        napomena: "Poslije jela",
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Recept uspješno izdan!");
  });

  test("UT-15: Dohvat recepata kao zdravstveni radnik", async () => {
    getDB().query.mockResolvedValueOnce([
      [
        { ID_RECEPTA: 1, naziv_lijeka: "Paracetamol" },
        { ID_RECEPTA: 2, naziv_lijeka: "Ibuprofen" },
      ],
    ]);

    const res = await request(app)
      .get("/api/mojiRecepti")
      .set("Authorization", `Bearer ${token("zdravstveni_radnik")}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(2);
  });

  test("UT-16: Dohvat recepata kao pacijent", async () => {
    getDB().query.mockResolvedValueOnce([
      [
        { ID_RECEPTA: 1, naziv_lijeka: "Paracetamol" },
      ],
    ]);

    const res = await request(app)
      .get("/api/mojiRecepti")
      .set("Authorization", `Bearer ${token("pacijent")}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(1);
  });
});
