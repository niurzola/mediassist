const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const bcrypt =require("bcrypt");
const { getDB, connectDB } = require("./db");
const jwt = require("jsonwebtoken");

const SECRET = "verysecretkey";

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

(async () => {
  await connectDB();
})();

// funkcija za provjeru JWT-a
const provjeriToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: "Pristup odbijen. Token nedostaje." });

  jwt.verify(token, SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Neispravan ili istekao token." });
    
    req.korisnik = user; 
    next();
  });
};



app.post("/api/unosmjerenja", provjeriToken, async (req, res) => {
  const db = getDB();

  const { id_pacijent, tlak_gornji, tlak_donji, puls, temperatura } = req.body;

  const id_korisnik = req.korisnik.id; 

  console.log(`Spremam mjerenje: Pacijent ${id_pacijent}, Korisnik ${id_korisnik}`);

  const sql = `INSERT INTO MJERENJA (id_pacijent, id_korisnik, tlak_gornji, tlak_donji, puls, temperatura, datum) 
               VALUES (?, ?, ?, ?, ?, ?, NOW())`;

  try {
    await db.query(sql, [id_pacijent, id_korisnik, tlak_gornji, tlak_donji, puls, temperatura]);
    res.json({ success: true, message: "Spremljeno u bazu!" });
  } catch (err) {
    console.error("Greška pri unosu:", err.sqlMessage);
    res.status(500).json({ message: "Greška u bazi", detalji: err.sqlMessage });
  }
});

app.get("/api/pacijenti", async (req, res) => {
  const db = getDB();
  try {
    const [results] = await db.query("SELECT * FROM PACIJENT");
    res.send(results);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.get("/api/svaMjerenja", async (req, res) => {
  const db = getDB();
  try {
    const [results] = await db.query("SELECT * FROM MJERENJA");
    res.send(results);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.post("/api/unosrecepta", provjeriToken, async (req, res) => {
  const { id_pacijent, naziv_lijeka, doziranje, napomena } = req.body;
  const id_korisnik = req.korisnik.id;
  const db = getDB();

  try {
    const sql = `INSERT INTO RECEPTI (id_pacijent, id_korisnik, naziv_lijeka, doziranje, napomena) 
                 VALUES (?, ?, ?, ?, ?)`;
    
    await db.query(sql, [id_pacijent, id_korisnik, naziv_lijeka, doziranje, napomena]);
    res.json({ success: true, message: "Recept uspješno izdan!" });
  } catch (error) {
    console.error("SQL GREŠKA:", error.sqlMessage);
    res.status(500).json({ message: "Greška pri spremanju recepta", detalji: error.sqlMessage });
  }
});

app.post("/api/unospacijenta", async (request, response) => {
  const data = request.body;
  pacijent = [[data.ime, data.prezime, data.dob, data.spol]]
  const db = getDB();
  try {
    const [results] = await db.query("INSERT INTO PACIJENT (Ime_pacijent, Prezime_pacijenta, DOB_Pacijent, Spol_pacijent) VALUES ?", [pacijent]);
    response.send(results);
  } catch (error) {
    response.status(500).send(error);
  }
});

app.post("/api/registracija", async (req, res) => {
  try {
    console.log("Incoming data:", req.body);

    const { ime, prezime, email, lozinka } = req.body;

    if (!email || !lozinka) {
      return res.status(400).json({ message: "Email i lozinka su obavezni" });
    }

    const db = getDB();

    const [exists] = await db.query(
      "SELECT * FROM korisnici WHERE email = ?",
      [email]
    );

    if (exists.length > 0) {
      return res.status(400).json({ message: "Korisnik već postoji" });
    }

    const hashed = await bcrypt.hash(lozinka, 10);

    await db.query(
      "INSERT INTO korisnici (ime, prezime, email, password) VALUES (?, ?, ?, ?)",
      [ime, prezime, email, hashed]
    );

    res.json({ message: "Registracija uspješna" });

  } catch (error) {
    console.error("Error hashing password:", error);
    res.status(500).json({ message: "Greška na serveru" });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { email, lozinka } = req.body;
    const db = getDB();

    const [rows] = await db.query(
      "SELECT * FROM korisnici WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return res.status(400).json({ message: "Neispravan email ili lozinka" });
    }

    const user = rows[0];

    const valid = await bcrypt.compare(lozinka, user.password);

    if (!valid) {
      return res.status(400).json({ message: "Neispravan email ili lozinka" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      SECRET,
      { expiresIn: "1h" }
    );

    res.json({ message: "Prijava uspješna", token });//Vraćanje tokena klijentu
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Greška na serveru" });
  }

});



app.listen(port, () => {
    console.log("Server running at port: " + port);
});