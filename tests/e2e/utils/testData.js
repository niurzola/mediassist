const axios = require('axios')

const API_TIMEOUT = 10000
const API_BASE = 'http://localhost:3000/api'

const timestamp = Date.now()

const TEST_PATIENT = {
  ime: 'TestPacijent',
  prezime: `Prezime${timestamp}`,
  email: `selenium_pacijent_${timestamp}@test.hr`,
  lozinka: 'test123456',
  uloga: 'pacijent',
  dob: '1990-01-15',
  spol: 'M',
}

const TEST_WORKER = {
  ime: 'TestRadnik',
  prezime: `Prezime${timestamp}`,
  email: `selenium_radnik_${timestamp}@test.hr`,
  lozinka: 'test123456',
  uloga: 'zdravstveni_radnik',
}

let PACIJENT_TOKEN = null
let RADNIK_TOKEN = null
let PACIJENT_ID = null

async function registerUser(userData) {
  const res = await axios.post(`${API_BASE}/registracija`, userData, { timeout: API_TIMEOUT })
  return res.data
}

async function loginUser(email, password) {
  const res = await axios.post(`${API_BASE}/login`, { email, lozinka: password }, { timeout: API_TIMEOUT })
  return res.data
}

async function createAllTestUsers() {
  try {
    await registerUser(TEST_PATIENT)
    console.log(`Test pacijent kreiran: ${TEST_PATIENT.email}`)
  } catch (e) {
    console.log(`Pacijent možda već postoji: ${e.response?.data?.message || e.message}`)
  }

  try {
    await registerUser(TEST_WORKER)
    console.log(`Test radnik kreiran: ${TEST_WORKER.email}`)
  } catch (e) {
    console.log(`Radnik možda već postoji: ${e.response?.data?.message || e.message}`)
  }

  const pacijentLogin = await loginUser(TEST_PATIENT.email, TEST_PATIENT.lozinka)
  PACIJENT_TOKEN = pacijentLogin.token

  const radnikLogin = await loginUser(TEST_WORKER.email, TEST_WORKER.lozinka)
  RADNIK_TOKEN = radnikLogin.token

  console.log('Tokeni za testne korisnike dobiveni')
}

async function getTestPatientId() {
  if (PACIJENT_ID) return PACIJENT_ID
  try {
    const res = await axios.get(`${API_BASE}/pacijenti`, {
      headers: { Authorization: `Bearer ${RADNIK_TOKEN}` }
    })
    const pacijent = res.data.find(p =>
      p.Ime_pacijent === TEST_PATIENT.ime &&
      p.Prezime_pacijenta === TEST_PATIENT.prezime
    )
    if (pacijent) {
      PACIJENT_ID = pacijent.ID_Pacijenta || pacijent.id_pacijenta
    }
    return PACIJENT_ID
  } catch (e) {
    console.error('Greška pri dohvaćanju ID-a pacijenta:', e.message)
    return null
  }
}

async function cleanupTestData() {
  // No cleanup needed - test users are kept
  console.log('Test podaci ostavljeni u bazi.')
}

module.exports = {
  TEST_PATIENT,
  TEST_WORKER,
  registerUser,
  loginUser,
  createAllTestUsers,
  getTestPatientId,
  cleanupTestData,
  get PACIJENT_TOKEN() { return PACIJENT_TOKEN },
  get RADNIK_TOKEN() { return RADNIK_TOKEN },
}
