const { By, until } = require('selenium-webdriver')
const { BASE_URL, sleep, selectQuasarOption, waitForNotification } = require('../config/webdriver')

class RegisterPage {
  constructor(driver) {
    this.driver = driver
  }

  async navigate() {
    await this.driver.get(`${BASE_URL}/#/Registracija`)
    await sleep(1000)
    await this.driver.wait(until.elementLocated(By.css('.q-form')), 5000)
  }

  async selectRole(roleLabel) {
    const roleField = await this.driver.findElement(
      By.xpath("//div[contains(@class, 'q-field') and .//div[contains(@class, 'q-field__label') and contains(normalize-space(.), 'Registriram se kao')]]")
    )
    await selectQuasarOption(this.driver, roleField, roleLabel)
  }

  async enterIme(ime) {
    const input = await this.driver.findElement(
      By.xpath("//div[contains(@class, 'q-field') and .//div[contains(@class, 'q-field__label') and contains(normalize-space(.), 'Ime')]]//input")
    )
    await input.clear()
    await input.sendKeys(ime)
  }

  async enterPrezime(prezime) {
    const input = await this.driver.findElement(
      By.xpath("//div[contains(@class, 'q-field') and .//div[contains(@class, 'q-field__label') and contains(normalize-space(.), 'Prezime')]]//input")
    )
    await input.clear()
    await input.sendKeys(prezime)
  }

  async enterEmail(email) {
    const input = await this.driver.findElement(
      By.xpath("//div[contains(@class, 'q-field') and .//div[contains(@class, 'q-field__label') and contains(normalize-space(.), 'E-mail')]]//input")
    )
    await input.clear()
    await input.sendKeys(email)
  }

  async enterLozinka(lozinka) {
    const input = await this.driver.findElement(
      By.xpath("//div[contains(@class, 'q-field') and .//div[contains(@class, 'q-field__label') and contains(normalize-space(.), 'Lozinka')]]//input")
    )
    await input.clear()
    await input.sendKeys(lozinka)
  }

  async enterDob(dob) {
    await this.driver.executeScript(`
      const field = Array.from(document.querySelectorAll('.q-field'))
        .find(function(f) { return f.querySelector('.q-field__label') && f.querySelector('.q-field__label').textContent.includes('Datum rođenja'); });
      if (field) {
        const input = field.querySelector('input');
        if (input) {
          var setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
          setter.call(input, arguments[0]);
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }
    `, dob)
    await sleep(200)
  }

  async selectSpol(spolValue) {
    const spolField = await this.driver.findElement(
      By.xpath("//div[contains(@class, 'q-field') and .//div[contains(@class, 'q-field__label') and contains(normalize-space(.), 'Spol')]]")
    )
    await selectQuasarOption(this.driver, spolField, spolValue)
  }

  async clickSubmit() {
    const btn = await this.driver.findElement(By.xpath("//button[contains(., 'Registriraj se')]"))
    await this.driver.executeScript("arguments[0].scrollIntoView({block: 'center'}); arguments[0].click()", btn)
    await sleep(1500)
  }

  async getSuccessNotification() {
    return waitForNotification(this.driver)
  }

  async registerPatient({ ime, prezime, email, lozinka, dob, spol }) {
    await this.navigate()
    await this.selectRole('Pacijent')
    await this.enterIme(ime)
    await this.enterPrezime(prezime)
    await this.enterEmail(email)
    await this.enterLozinka(lozinka)
    await this.enterDob(dob)
    await this.selectSpol(spol)
    await this.clickSubmit()
    await sleep(1500)
  }

  async registerWorker({ ime, prezime, email, lozinka }) {
    await this.navigate()
    await this.selectRole('Zdravstveni radnik / Liječnik')
    await this.enterIme(ime)
    await this.enterPrezime(prezime)
    await this.enterEmail(email)
    await this.enterLozinka(lozinka)
    await this.clickSubmit()
    await sleep(1500)
  }
}

module.exports = RegisterPage
