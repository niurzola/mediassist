const request = require("supertest");
const bcrypt = require("bcrypt");
const app = require("../app");

jest.mock("../db", () => ({
  getDB: jest.fn(),
  connectDB: jest.fn().mockResolvedValue(),
}));

jest.mock("bcrypt");

const { getDB } = require("../db");

describe("UT-1 do UT-6: Auth (registracija, login)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getDB.mockReturnValue({ query: jest.fn() });
  });

  test("UT-1: Registracija pacijenta - uspješno", async () => {
    getDB().query
      .mockResolvedValueOnce([[]])
      .mockResolvedValueOnce([{ insertId: 1 }])
      .mockResolvedValueOnce([{ insertId: 1 }]);

    const res = await request(app)
      .post("/api/registracija")
      .send({
        ime: "Ivo",
        prezime: "Ivić",
        email: "ivo@test.hr",
        lozinka: "123456",
        uloga: "pacijent",
        dob: "1990-01-01",
        spol: "M",
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Registracija je u potpunosti uspješna!");
  });

  test("UT-2: Registracija zdravstvenog radnika - uspješno", async () => {
    getDB().query
      .mockResolvedValueOnce([[]])
      .mockResolvedValueOnce([{ insertId: 2 }])
      .mockResolvedValueOnce([{ insertId: 1 }]);

    const res = await request(app)
      .post("/api/registracija")
      .send({
        ime: "Liječnik",
        prezime: "Prvi",
        email: "lijecnik@test.hr",
        lozinka: "123456",
        uloga: "zdravstveni_radnik",
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Registracija je u potpunosti uspješna!");
  });

  test("UT-3: Registracija s postojećim emailom - greška", async () => {
    getDB().query.mockResolvedValueOnce([[{ id: 1 }]]);

    const res = await request(app)
      .post("/api/registracija")
      .send({
        ime: "Ivo",
        prezime: "Ivić",
        email: "postojeci@email.hr",
        lozinka: "123456",
        uloga: "pacijent",
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Korisnik s ovim emailom već postoji");
  });

  test("UT-4: Prijava - uspješna", async () => {
    getDB().query.mockResolvedValueOnce([
      [
        {
          id_korisnici: 1,
          email: "x@x.hr",
          password: "hashed_password",
          uloga: "pacijent",
          ime: "Ivo",
          prezime: "Ivić",
        },
      ],
    ]);
    bcrypt.compare.mockResolvedValue(true);

    const res = await request(app)
      .post("/api/login")
      .send({ email: "x@x.hr", lozinka: "123" });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Prijava uspješna");
    expect(res.body.token).toBeDefined();
    expect(res.body.uloga).toBe("pacijent");
    expect(res.body.ime).toBe("Ivo");
    expect(res.body.prezime).toBe("Ivić");
  });

  test("UT-5: Prijava s krivim mailom", async () => {
    getDB().query.mockResolvedValueOnce([[]]);

    const res = await request(app)
      .post("/api/login")
      .send({ email: "nepostojeci@x.hr", lozinka: "123" });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Neispravan email ili lozinka");
  });

  test("UT-6: Prijava s krivom lozinkom", async () => {
    getDB().query.mockResolvedValueOnce([
      [
        {
          id_korisnici: 1,
          email: "x@x.hr",
          password: "hashed",
          uloga: "pacijent",
          ime: "Ivo",
          prezime: "Ivić",
        },
      ],
    ]);
    bcrypt.compare.mockResolvedValue(false);

    const res = await request(app)
      .post("/api/login")
      .send({ email: "x@x.hr", lozinka: "kriva" });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Neispravan email ili lozinka");
  });
});
