const { By } = require('selenium-webdriver')
const { getDriver, quitDriver } = require('./config/driver')
const { sleep, waitForNotification } = require('./config/webdriver')
const { TEST_PATIENT, TEST_WORKER, createAllTestUsers } = require('./utils/testData')
const LoginPage = require('./pages/LoginPage')
const RegisterPage = require('./pages/RegisterPage')
const HomePage = require('./pages/HomePage')
const MeasurementsPage = require('./pages/MeasurementsPage')
const PrescriptionsPage = require('./pages/PrescriptionsPage')
const PatientsPage = require('./pages/PatientsPage')

let driver
let loginPage
let registerPage
let homePage
let measurementsPage
let prescriptionsPage
let patientsPage

beforeAll(async () => {
  driver = await getDriver()
  loginPage = new LoginPage(driver)
  registerPage = new RegisterPage(driver)
  homePage = new HomePage(driver)
  measurementsPage = new MeasurementsPage(driver)
  prescriptionsPage = new PrescriptionsPage(driver)
  patientsPage = new PatientsPage(driver)

  await createAllTestUsers()
}, 60000)

afterAll(async () => {
  await quitDriver()
})

describe('Funkcijski testovi (FT)', () => {

  test('FT-1: Registracija korisnika', async () => {
    const uniqueSuffix = Date.now()
    const testUser = {
      ime: 'FT1Ime',
      prezime: `FT1Prezime${uniqueSuffix}`,
      email: `ft1_${uniqueSuffix}@test.hr`,
      lozinka: 'test123456',
      dob: '1985-05-20',
      spol: 'Ž',
    }

    await registerPage.navigate()
    await registerPage.selectRole('Pacijent')
    await registerPage.enterIme(testUser.ime)
    await registerPage.enterPrezime(testUser.prezime)
    await registerPage.enterEmail(testUser.email)
    await registerPage.enterLozinka(testUser.lozinka)
    await registerPage.enterDob(testUser.dob)
    await registerPage.selectSpol(testUser.spol)
    await registerPage.clickSubmit()

    await sleep(2000)
    const currentUrl = await driver.getCurrentUrl()
    expect(currentUrl).toContain('/#/loginPage')

    const notification = await registerPage.getSuccessNotification()
    expect(notification).toMatch(/uspješn|uspješna/i)
  })

  test('FT-2: Prijava korisnika', async () => {
    await loginPage.loginAs(TEST_PATIENT.email, TEST_PATIENT.lozinka)

    const currentUrl = await driver.getCurrentUrl()
    expect(currentUrl).toMatch(/\/#\/?$/)

    const isLoggedIn = await homePage.isLoggedIn()
    expect(isLoggedIn).toBe(true)

    const headerText = await homePage.getLoggedInUserName()
    expect(headerText).toContain(TEST_PATIENT.ime)
  })

  test('FT-3: Unos mjerenja kao pacijent', async () => {
    await homePage.navigateTo('mjerenja')
    await sleep(1500)

    await measurementsPage.enterTlakGornji(120)
    await measurementsPage.enterTlakDonji(80)
    await measurementsPage.enterPuls(72)
    await measurementsPage.enterTemperatura(36.6)
    await measurementsPage.enterGlukoza(5.5)

    await measurementsPage.clickSpremiMjerenje()
    await sleep(2000)

    const notification = await measurementsPage.getSuccessNotification()
    expect(notification).toMatch(/uspješn|spremljeno/i)
  })

  test('FT-4: Pregled recepta kao pacijent', async () => {
    await prescriptionsPage.navigate()
    await sleep(1000)

    const pageText = await prescriptionsPage.getPrescriptionListText()
    expect(pageText).toMatch(/Recept/i)
  })

  test('FT-5: Unos recepta kao zdravstveni radnik', async () => {
    const logoutBtn = await driver.findElement(By.xpath("//button[contains(., 'Odjava')]"))
    await driver.executeScript("arguments[0].scrollIntoView({block: 'center'}); arguments[0].click()", logoutBtn)
    await sleep(1500)

    await loginPage.loginAs(TEST_WORKER.email, TEST_WORKER.lozinka)
    await sleep(1500)

    await prescriptionsPage.navigate()
    await sleep(2000)

    const patientName = `${TEST_PATIENT.ime} ${TEST_PATIENT.prezime}`
    await prescriptionsPage.selectPatient(patientName)

    const drugName = `TestLijek${Date.now()}`
    await prescriptionsPage.enterNazivLijeka(drugName)
    await prescriptionsPage.enterDoziranje('1x1')
    await prescriptionsPage.enterNapomena('Uzimati nakon jela')

    await prescriptionsPage.clickIzdajRecept()
    await sleep(2000)

    const notification = await prescriptionsPage.getSuccessNotification()
    expect(notification).toMatch(/uspješn|spremljen/i)
  })

  test('FT-6: Pregled svih pacijenata kao zdravstveni radnik', async () => {
    await patientsPage.navigate()
    await sleep(1500)

    const heading = await patientsPage.getPageHeading()
    expect(heading).toMatch(/pacijen/i)

    const hasTable = await patientsPage.isTableVisible()
    expect(hasTable).toBe(true)

    const rowCount = await patientsPage.getPatientRows()
    expect(rowCount).toBeGreaterThan(0)
  })

  test('FT-7: Odjava korisnika', async () => {
    await homePage.navigate()
    await sleep(500)

    await homePage.clickLogout()
    await sleep(1500)

    const currentUrl = await driver.getCurrentUrl()
    expect(currentUrl).toContain('/#/loginPage')

    const isLoggedIn = await homePage.isLoggedIn()
    expect(isLoggedIn).toBe(false)
  })

})
