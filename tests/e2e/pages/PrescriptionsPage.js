const { By, until } = require('selenium-webdriver')
const { BASE_URL, sleep, selectQuasarOption, waitForNotification } = require('../config/webdriver')

class PrescriptionsPage {
  constructor(driver) {
    this.driver = driver
  }

  async navigate() {
    await this.driver.get(`${BASE_URL}/#/recepti`)
    await sleep(1000)
    await this.driver.wait(until.elementLocated(By.css('.q-page')), 5000)
  }

  async selectPatient(patientName) {
    const patientField = await this.driver.findElement(
      By.xpath("//div[contains(@class, 'q-field') and .//div[contains(@class, 'q-field__label') and contains(normalize-space(.), 'Pacijent')]]")
    )
    await selectQuasarOption(this.driver, patientField, patientName)
  }

  async enterNazivLijeka(value) {
    const input = await this.driver.findElement(
      By.xpath("//div[contains(@class, 'q-field') and .//div[contains(@class, 'q-field__label') and contains(normalize-space(.), 'Naziv lijeka')]]//input")
    )
    await input.clear()
    await input.sendKeys(value)
  }

  async enterDoziranje(value) {
    const input = await this.driver.findElement(
      By.xpath("//div[contains(@class, 'q-field') and .//div[contains(@class, 'q-field__label') and contains(normalize-space(.), 'Doziranje')]]//input")
    )
    await input.clear()
    await input.sendKeys(value)
  }

  async enterNapomena(value) {
    const textarea = await this.driver.findElement(
      By.xpath("//div[contains(@class, 'q-field') and .//div[contains(@class, 'q-field__label') and contains(normalize-space(.), 'Napomena')]]//textarea")
    )
    await textarea.clear()
    await textarea.sendKeys(value)
  }

  async clickIzdajRecept() {
    const btn = await this.driver.findElement(By.xpath("//button[contains(., 'Izdaj recept')]"))
    await this.driver.executeScript("arguments[0].scrollIntoView({block: 'center'}); arguments[0].click()", btn)
  }

  async getSuccessNotification() {
    return waitForNotification(this.driver)
  }

  async getPrescriptionListText() {
    const page = await this.driver.findElement(By.css('.q-page'))
    return page.getText()
  }
}

module.exports = PrescriptionsPage
