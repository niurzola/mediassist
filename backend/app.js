const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
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

// Funkcija za provjeru JWT-a
const provjeriToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: "Pristup odbijen. Token nedostaje." });

  jwt.verify(token, SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Neispravan ili istekao token." });
    
    req.korisnik = user; // Ovdje se spremaju id, email i uloga iz tokena
    next();
  });
};

// Middleware koji provjerava ima li korisnik pravo pristupa (Mora ići NAKON provjeriToken)
function provjeriUlogu(potrebnaUloga) {
  return (req, res, next) => {
    // FIX: Prilagođeno da čita iz 'req.korisnik' kojeg postavlja 'provjeriToken' middleware
    const korisnikUloga = req.korisnik?.uloga; 

    if (korisnikUloga !== potrebnaUloga) {
      return res.status(403).json({ message: "Nemate ovlasti za ovu akciju." });
    }

    next(); 
  };
}

app.post("/api/unosmjerenja", provjeriToken, async (req, res) => {
  const db = getDB();
  const { id_pacijent, tlak_gornji, tlak_donji, puls, temperatura, vrijednost_glukoze } = req.body;
  
  const id_korisnik_iz_tokena = req.korisnik.id; 
  const uloga_iz_tokena = req.korisnik.uloga ? req.korisnik.uloga.toLowerCase() : '';

  let stvarniIdPacijenta = id_pacijent;

  try {
    if (uloga_iz_tokena === 'pacijent') {
      const [pacijentRow] = await db.query(
        "SELECT id_pacijenta FROM PACIJENT WHERE id_korisnik = ?", 
        [id_korisnik_iz_tokena]
      );
      
      if (pacijentRow.length === 0) {
        return res.status(404).json({ message: "Profil pacijenta nije pronađen u podtablici." });
      }
      stvarniIdPacijenta = pacijentRow[0].id_pacijenta;
    }

    const sql = `INSERT INTO MJERENJA (id_pacijent, id_korisnik, tlak_gornji, tlak_donji, puls, temperatura, vrijednost_glukoze, datum_mjerenja) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`;

    await db.query(sql, [stvarniIdPacijenta, id_korisnik_iz_tokena, tlak_gornji, tlak_donji, puls, temperatura, vrijednost_glukoze]);
    res.json({ success: true, message: "Spremljeno u bazu!" });

  } catch (err) {
    console.error("SQL GREŠKA NA /api/unosmjerenja:", err.message);
    res.status(500).json({ message: "Greška u bazi", detalji: err.message });
  }
});

app.get("/api/pacijenti", provjeriToken, provjeriUlogu("zdravstveni_radnik"), async (req, res) => {
  const db = getDB();
  try {
    const [results] = await db.query("SELECT * FROM PACIJENT");
    res.send(results);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.post("/api/unosrecepta", provjeriToken, provjeriUlogu("zdravstveni_radnik"), async (req, res) => {
  const { id_pacijent, naziv_lijeka, doziranje, napomena } = req.body;
  const id_korisnik = req.korisnik.id;
  const db = getDB();

  let stvarniIdPacijenta = id_pacijent && typeof id_pacijent === 'object' 
    ? (id_pacijent.ID_Pacijenta || id_pacijent.id_pacijenta) 
    : id_pacijent;

  console.log("[BACKEND] Pokušaj unosa recepta:", {
    id_pacijent: stvarniIdPacijenta,
    id_korisnik,
    naziv_lijeka,
    doza_lijeka: doziranje,
    upute: napomena
  });

  try {
    const sql = `INSERT INTO RECEPTI (id_pacijent, id_korisnik, naziv_lijeka, doza_lijeka, upute) 
                 VALUES (?, ?, ?, ?, ?)`;
    
    await db.query(sql, [stvarniIdPacijenta, id_korisnik, naziv_lijeka, doziranje, napomena]);
    
    return res.json({ success: true, message: "Recept uspješno izdan!" });
  } catch (error) {
    console.error("SQL GREŠKA NA /api/unosrecepta:", error.sqlMessage || error.message);
    return res.status(500).json({ 
      message: "Greška pri spremanju recepta", 
      detalji: error.sqlMessage || error.message 
    });
  }
});

app.post("/api/unospacijenta", provjeriToken, provjeriUlogu("zdravstveni_radnik"), async (request, response) => {
  const data = request.body;
  const pacijent = [[data.ime, data.prezime, data.dob, data.spol]];
  const db = getDB();
  try {
    const [results] = await db.query("INSERT INTO PACIJENT (Ime_pacijent, Prezime_pacijenta, DOB_Pacijent, Spol_pacijent) VALUES ?", [pacijent]);
    response.send(results);
  } catch (error) {
    response.status(500).send(error);
  }
});
app.post("/api/unostermina", provjeriToken, async (request, response) => {
  const data = request.body;
  const id_korisnika = request.korisnik.id; 
  const db = getDB();
  
  try {
    const [pacijentRow] = await db.query(
      "SELECT ID_Pacijenta, id_pacijenta FROM PACIJENT WHERE id_korisnik = ?", 
      [id_korisnika]
    );

    if (pacijentRow.length === 0) {
      return response.status(404).json({ message: "Profil pacijenta nije pronađen." });
    }

    // Hvata bilo velika bilo mala slova, ovisno što baza vrati
    const stvarniIdPacijenta = pacijentRow[0].ID_Pacijenta || pacijentRow[0].id_pacijenta;

    // Popravljen standardni INSERT format koji je sigurniji od slanja dvostrukih nizova [[]]
    const sql = "INSERT INTO Termin (Datum, Vrijeme, ID_Pacijenta) VALUES (?, ?, ?)";
    await db.query(sql, [data.datum, data.vrijeme, stvarniIdPacijenta]);

    return response.json({ success: true, message: "Termin uspješno dodan!" });
  } catch (error) {
    console.error("SQL GREŠKA NA /api/unostermina:", error.sqlMessage || error.message);
    return response.status(500).json({ message: "Greška na serveru", detalji: error.sqlMessage || error.message });
  }
});

app.get("/api/termini", provjeriToken, async (req, res) => {
  const db = getDB();
  const id_korisnik_iz_tokena = req.korisnik?.id;
  const uloga_iz_tokena = req.korisnik?.uloga ? req.korisnik.uloga.toLowerCase() : '';

  console.log(`[BACKEND] Dohvaćanje termina -> Uloga: ${uloga_iz_tokena}, Korisnik ID: ${id_korisnik_iz_tokena}`);

  let sql = `
    SELECT 
      t.ID_Termina,
      DATE_FORMAT(t.Datum, '%d.%m.%Y.') AS datum_ispis,
      TIME_FORMAT(t.Vrijeme, '%H:%i') AS vrijeme_ispis,
      CONCAT(p.Ime_pacijent, ' ', p.Prezime_pacijenta) AS ime_prezime_pacijenta
    FROM Termin t
    JOIN PACIJENT p ON t.ID_Pacijenta = p.ID_Pacijenta
  `;

  let parametri = [];

  // Ako je ulogiran PACIJENT, filtriramo termine tako da vidi samo svoje preko id_korisnik
  if (uloga_iz_tokena === 'pacijent') {
    sql += ` WHERE p.id_korisnik = ? `;
    parametri.push(id_korisnik_iz_tokena);
  }

  // Zdravstveni radnik automatski vidi SVE termine
  sql += ` ORDER BY t.Datum ASC, t.Vrijeme ASC `;

  try {
    const [results] = await db.query(sql, parametri);
    return res.json(results);
  } catch (error) {
    console.error("❌ GREŠKA U /api/termini:", error.message);
    return res.status(500).json({ 
      message: "Greška na serveru pri dohvaćanju termina.", 
      detalji: error.message 
    });
  }
});

app.post("/api/registracija", async (req, res) => {
  try {
    console.log("Dolazni podaci za prilagođenu registraciju:", req.body);
    const { ime, prezime, email, lozinka, uloga, dob, spol } = req.body;

    if (!email || !lozinka || !ime || !prezime) {
      return res.status(400).json({ message: "Sva osnovna polja su obavezna" });
    }

    const db = getDB();

    // Provjera postoji li već korisnik s tim emailom
    const [rows] = await db.query("SELECT * FROM korisnici WHERE email = ?", [email]);
    if (rows.length > 0) {
      return res.status(400).json({ message: "Korisnik s ovim emailom već postoji" });
    }

    const hashed = await bcrypt.hash(lozinka, 10);

    const [userResult] = await db.query(
      "INSERT INTO korisnici (ime, prezime, email, password, uloga) VALUES (?, ?, ?, ?, ?)",
      [ime, prezime, email, hashed, uloga]
    );

    const noviKorisnikId = userResult.insertId;
    console.log("Korisnik spremljen u matičnu tablicu. Generirani ID:", noviKorisnikId);

    if (uloga === 'zdravstveni_radnik') {
      // Zdravstveni radnik - sprema samo ime, prezime i poveznicu na korisnika
      await db.query(
        "INSERT INTO ZDRAVSTVENI_RADNIK (Ime_zdravstveni_radnik, Prezime_zdravstveni_radnik, id_korisnici) VALUES (?, ?, ?)",
        [ime, prezime, noviKorisnikId]
      );
    } else if (uloga === 'pacijent') {
      // Pacijent - Uz ime i prezime, sada hvatamo i spremamo datum rođenja (dob) i spol!
      const sqlPacijent = `
        INSERT INTO PACIJENT (Ime_pacijent, Prezime_pacijenta, DOB_Pacijent, Spol_pacijent, id_korisnik) 
        VALUES (?, ?, ?, ?, ?)
      `;
      await db.query(sqlPacijent, [ime, prezime, dob, spol, noviKorisnikId]);
    }

    return res.json({ message: "Registracija je u potpunosti uspješna!" });

  } catch (error) {
    console.error("SQL GREŠKA NA /api/registracija:", error.sqlMessage || error.message);
    return res.status(500).json({ 
      message: "Došlo je do greške na serveru.", 
      detalji: error.sqlMessage || error.message 
    });
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
      { id: user.id_korisnici || user.id, email: user.email, uloga: user.uloga }, 
      SECRET,
      { expiresIn: "1h" }
    );

    res.json({ 
      message: "Prijava uspješna", 
      token, 
      uloga: user.uloga,
      ime: user.ime,
      prezime: user.prezime  
    });
  } catch (error) {
    console.error("SQL GREŠKA NA /api/login:", error.sqlMessage || error.message);
    res.status(500).json({ message: "Greška na serveru" });
  }
});

app.get("/api/svaMjerenja", provjeriToken, async (req, res) => {
  const db = getDB();
  
  const id_korisnik_iz_tokena = req.korisnik?.id;
  const uloga_iz_tokena = req.korisnik?.uloga ? req.korisnik.uloga.toLowerCase() : '';

  console.log(`[BACKEND] Zahtjev za mjerenja -> Uloga: ${uloga_iz_tokena}, ID: ${id_korisnik_iz_tokena}`);

  let sql = `
    SELECT 
      m.id_mjerenja,
      m.id_pacijent,
      IFNULL(CONCAT(p.Ime_pacijent, ' ', p.Prezime_pacijenta), 'Nenaveden pacijent') AS ime_prezime_pacijenta,
      m.tlak_gornji,
      m.tlak_donji,
      m.puls,
      m.temperatura,
      m.vrijednost_glukoze,
      DATE_FORMAT(m.datum_mjerenja, '%d.%m.%Y. %H:%i') AS ispis_datuma
    FROM MJERENJA m
    LEFT JOIN PACIJENT p ON m.id_pacijent = p.id_pacijenta
  `;

  let Calibri = [];
  let parametri = [];

  if (uloga_iz_tokena === 'pacijent') {
    sql += ` WHERE p.id_korisnik = ? `;
    parametri.push(id_korisnik_iz_tokena);
  }

  sql += ` ORDER BY m.datum_mjerenja DESC `;

  try {
    const [results] = await db.query(sql, parametri);
    return res.json(results);
  } catch (error) {
    console.error("SQL GREŠKA NA /api/svaMjerenja:", error.sqlMessage || error.message);
    return res.status(500).json({ 
      message: "Greška na serveru pri dohvaćanju mjerenja.", 
      detalji: error.sqlMessage || error.message 
    });
  }
});

app.get("/api/mojiRecepti", provjeriToken, async (req, res) => {
  const db = getDB();
  const id_korisnik_iz_tokena = req.korisnik?.id; 
  const uloga = req.korisnik?.uloga || '';

  console.log(`[BACKEND] Univerzalno dohvaćanje recepata za ulogu: ${uloga}`);

  // SQL koji sada obavezno povlači i ime pacijenta i ime liječnika
  let sql = `
    SELECT 
      r.ID_RECEPTA,
      r.naziv_lijeka,
      r.doza_lijeka,
      r.upute,
      DATE_FORMAT(r.datum_izdavanja, '%d.%m.%Y.') AS datum_ispis,
      CONCAT(p.Ime_pacijent, ' ', p.Prezime_pacijenta) AS ime_pacijenta,
      CONCAT(l.ime, ' ', l.prezime) AS ime_lijecnika
    FROM RECEPTI r
    JOIN PACIJENT p ON r.id_pacijent = p.ID_Pacijenta
    JOIN korisnici l ON r.id_korisnik = l.id_korisnici
  `;

  let parametri = [];

  // 🚀 Ako je PACIJENT, filtriramo samo njegove recepte
  if (uloga === 'pacijent') {
    sql += ` WHERE p.id_korisnik = ? `;
    parametri.push(id_korisnik_iz_tokena);
  }
  // Ako je zdravstveni_radnik, preskače se WHERE i on dobiva SVE recepte

  sql += ` ORDER BY r.datum_izdavanja DESC `;

  try {
    const [results] = await db.query(sql, parametri);
    return res.json(results);
  } catch (error) {
    console.error("❌ GREŠKA U /api/mojiRecepti:", error.message);
    return res.status(500).json({ message: "Greška pri dohvaćanju recepata." });
  }
});

// ============= TIKET RUTE =============

// Kreiranje novog tiketa (samo pacijent, s inicijalnom porukom)
app.post("/api/tiketi", provjeriToken, async (req, res) => {
  const db = getDB();
  const { naslov_upita, tekst_poruke } = req.body;
  const id_korisnika = req.korisnik.id;
  const uloga = req.korisnik.uloga?.toLowerCase();

  if (uloga !== 'pacijent') {
    return res.status(403).json({ message: "Samo pacijenti mogu otvoriti novi tiket." });
  }
  if (!naslov_upita || !naslov_upita.trim()) {
    return res.status(400).json({ message: "Naslov upita je obavezan." });
  }

  try {
    const [tiketResult] = await db.query(
      `INSERT INTO TIKET (naslov_upita, status, id_korisnika) VALUES (?, 'OTVORENO', ?)`,
      [naslov_upita.trim(), id_korisnika]
    );

    const id_tiketa = tiketResult.insertId;

    if (tekst_poruke && tekst_poruke.trim()) {
      await db.query(
        `INSERT INTO TIKET_PORUKE (tekst_poruke, id_tiketa, id_autora) VALUES (?, ?, ?)`,
        [tekst_poruke.trim(), id_tiketa, id_korisnika]
      );
    }

    res.json({ success: true, message: "Tiket uspješno kreiran!", id_tiketa });
  } catch (err) {
    console.error("SQL GREŠKA NA /api/tiketi (POST):", err.sqlMessage || err.message);
    res.status(500).json({ message: "Greška pri kreiranju tiketa.", detalji: err.sqlMessage || err.message });
  }
});

// Dohvat liste tiketa (pacijent svoje, radnik sve)
app.get("/api/tiketi", provjeriToken, async (req, res) => {
  const db = getDB();
  const id_korisnika = req.korisnik.id;
  const uloga = req.korisnik.uloga?.toLowerCase();

  try {
    let sql = `
      SELECT 
        t.id_tiketa,
        t.naslov_upita,
        t.status,
        DATE_FORMAT(t.vrijeme_kreiranja, '%d.%m.%Y. %H:%i') AS vrijeme_kreiranja_ispis,
        CONCAT(k.ime, ' ', k.prezime) AS autor,
        (SELECT COUNT(*) FROM TIKET_PORUKE tp WHERE tp.id_tiketa = t.id_tiketa) AS broj_poruka
      FROM TIKET t
      JOIN korisnici k ON t.id_korisnika = k.id_korisnici
    `;

    let parametri = [];

    if (uloga === 'pacijent') {
      sql += ` WHERE t.id_korisnika = ? `;
      parametri.push(id_korisnika);
    }

    sql += ` ORDER BY t.vrijeme_kreiranja DESC `;

    const [results] = await db.query(sql, parametri);
    res.json(results);
  } catch (err) {
    console.error("SQL GREŠKA NA /api/tiketi (GET):", err.sqlMessage || err.message);
    res.status(500).json({ message: "Greška pri dohvaćanju tiketa.", detalji: err.sqlMessage || err.message });
  }
});

// Dohvat poruka za određeni tiket
app.get("/api/tiketi/:id/poruke", provjeriToken, async (req, res) => {
  const db = getDB();
  const id_tiketa = req.params.id;
  const id_korisnika = req.korisnik.id;
  const uloga = req.korisnik.uloga?.toLowerCase();

  try {
    // Provjera pripada li tiket pacijentu (ako je pacijent)
    if (uloga === 'pacijent') {
      const [tiketCheck] = await db.query(
        `SELECT id_korisnika FROM TIKET WHERE id_tiketa = ?`,
        [id_tiketa]
      );
      if (tiketCheck.length === 0) {
        return res.status(404).json({ message: "Tiket nije pronađen." });
      }
      if (tiketCheck[0].id_korisnika !== id_korisnika) {
        return res.status(403).json({ message: "Nemate pristup ovom tiketu." });
      }
    }

    const [poruke] = await db.query(
      `SELECT 
        tp.id_poruke,
        tp.tekst_poruke,
        DATE_FORMAT(tp.vrijeme_slanja, '%d.%m.%Y. %H:%i') AS vrijeme_slanja_ispis,
        CONCAT(k.ime, ' ', k.prezime) AS autor,
        tp.id_autora
      FROM TIKET_PORUKE tp
      JOIN korisnici k ON tp.id_autora = k.id_korisnici
      WHERE tp.id_tiketa = ?
      ORDER BY tp.vrijeme_slanja ASC`,
      [id_tiketa]
    );

    res.json(poruke);
  } catch (err) {
    console.error("SQL GREŠKA NA /api/tiketi/:id/poruke:", err.sqlMessage || err.message);
    res.status(500).json({ message: "Greška pri dohvaćanju poruka.", detalji: err.sqlMessage || err.message });
  }
});

// Dodavanje poruke u tiket
app.post("/api/tiketi/:id/poruke", provjeriToken, async (req, res) => {
  const db = getDB();
  const id_tiketa = req.params.id;
  const id_korisnika = req.korisnik.id;
  const uloga = req.korisnik.uloga?.toLowerCase();
  const { tekst_poruke } = req.body;

  if (!tekst_poruke || !tekst_poruke.trim()) {
    return res.status(400).json({ message: "Tekst poruke ne smije biti prazan." });
  }

  try {
    // Provjera postoji li tiket
    const [tiketCheck] = await db.query(
      `SELECT id_korisnika, status FROM TIKET WHERE id_tiketa = ?`,
      [id_tiketa]
    );
    if (tiketCheck.length === 0) {
      return res.status(404).json({ message: "Tiket nije pronađen." });
    }
    if (uloga === 'pacijent' && tiketCheck[0].id_korisnika !== id_korisnika) {
      return res.status(403).json({ message: "Nemate pristup ovom tiketu." });
    }
    if (tiketCheck[0].status === 'ZATVORENO') {
      return res.status(400).json({ message: "Tiket je zatvoren. Nije moguće dodavati poruke." });
    }

    await db.query(
      `INSERT INTO TIKET_PORUKE (tekst_poruke, id_tiketa, id_autora) VALUES (?, ?, ?)`,
      [tekst_poruke.trim(), id_tiketa, id_korisnika]
    );

    res.json({ success: true, message: "Poruka uspješno poslana!" });
  } catch (err) {
    console.error("SQL GREŠKA NA /api/tiketi/:id/poruke (POST):", err.sqlMessage || err.message);
    res.status(500).json({ message: "Greška pri slanju poruke.", detalji: err.sqlMessage || err.message });
  }
});

// Promjena statusa tiketa (samo zdravstveni radnik)
app.put("/api/tiketi/:id/status", provjeriToken, provjeriUlogu("zdravstveni_radnik"), async (req, res) => {
  const db = getDB();
  const id_tiketa = req.params.id;
  const { status } = req.body;
  const dozvoljeniStatusi = ['OTVORENO', 'U OBRADI', 'ZATVORENO'];

  if (!status || !dozvoljeniStatusi.includes(status)) {
    return res.status(400).json({ 
      message: `Neispravan status. Dozvoljene vrijednosti: ${dozvoljeniStatusi.join(', ')}` 
    });
  }

  try {
    const [result] = await db.query(
      `UPDATE TIKET SET status = ? WHERE id_tiketa = ?`,
      [status, id_tiketa]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Tiket nije pronađen." });
    }

    res.json({ success: true, message: `Status tiketa promijenjen u "${status}".` });
  } catch (err) {
    console.error("SQL GREŠKA NA /api/tiketi/:id/status:", err.sqlMessage || err.message);
    res.status(500).json({ message: "Greška pri promjeni statusa.", detalji: err.sqlMessage || err.message });
  }
});

app.get("/api/obavijesti", provjeriToken, async (req, res) => {
  const db = getDB();
  const id_korisnik_iz_tokena = req.korisnik?.id;
  const uloga = req.korisnik?.uloga ? req.korisnik.uloga.toLowerCase() : '';

  console.log(`[BACKEND] Dohvaćanje obavijesti za ulogu: ${uloga}, ID Korisnika: ${id_korisnik_iz_tokena}`);

  let sql = `
    SELECT 
      t.ID_Termina,
      DATE_FORMAT(t.Datum, '%d.%m.%Y.') AS datum_ispis,
      TIME_FORMAT(t.Vrijeme, '%H:%i') AS vrijeme_ispis,
      CONCAT(p.Ime_pacijent, ' ', p.Prezime_pacijenta) AS ime_pacijenta
    FROM Termin t
    JOIN PACIJENT p ON t.ID_Pacijenta = p.ID_Pacijenta
    WHERE t.Datum >= DATE(NOW())
  `;

  let parametri = [];

  if (uloga === 'pacijent') {
    sql += ` AND p.id_korisnik = ? `;
    parametri.push(id_korisnik_iz_tokena);
  }

  sql += ` ORDER BY t.Datum ASC, t.Vrijeme ASC LIMIT 5 `;

  try {
    const [results] = await db.query(sql, parametri);
    console.log("[BACKEND] Pronađeno obavijesti:", results.length); 
    return res.json(results);
  } catch (error) {
    console.error("❌ GREŠKA U /api/obavijesti:", error.message);
    return res.status(500).json({ message: "Greška pri dohvaćanju obavijesti." });
  }
});

app.listen(port, () => {
    console.log("Server running at port: " + port);
});