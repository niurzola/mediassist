const { By, until } = require('selenium-webdriver')
const { BASE_URL, sleep } = require('../config/webdriver')

class PatientsPage {
  constructor(driver) {
    this.driver = driver
  }

  async navigate() {
    await this.driver.get(`${BASE_URL}/#/Pacijenti`)
    await sleep(1000)
    await this.driver.wait(until.elementLocated(By.css('.q-page')), 5000)
  }

  async isTableVisible() {
    try {
      const table = await this.driver.findElement(By.css('.q-table'))
      return await table.isDisplayed()
    } catch {
      return false
    }
  }

  async getPatientRows() {
    const rows = await this.driver.findElements(By.css('.q-table tbody tr'))
    return rows.length
  }

  async getToggleButtonText() {
    const btn = await this.driver.findElement(
      By.xpath("//button[contains(., 'Prikaži') or contains(., 'Sakrij')]")
    )
    return btn.getText()
  }

  async getPageHeading() {
    const heading = await this.driver.findElement(By.css('h5'))
    return heading.getText()
  }
}

module.exports = PatientsPage
