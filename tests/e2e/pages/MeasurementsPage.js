const { By, until } = require('selenium-webdriver')
const { BASE_URL, sleep, waitForNotification } = require('../config/webdriver')

class MeasurementsPage {
  constructor(driver) {
    this.driver = driver
  }

  async navigate() {
    await this.driver.get(`${BASE_URL}/#/mjerenja`)
    await sleep(1000)
    await this.driver.wait(until.elementLocated(By.css('.q-page')), 5000)
  }

  async enterTlakGornji(value) {
    const input = await this.driver.findElement(
      By.xpath("//div[contains(@class, 'q-field') and .//div[contains(@class, 'q-field__label') and contains(normalize-space(.), 'Tlak Gornji')]]//input")
    )
    await input.clear()
    await input.sendKeys(value.toString())
  }

  async enterTlakDonji(value) {
    const input = await this.driver.findElement(
      By.xpath("//div[contains(@class, 'q-field') and .//div[contains(@class, 'q-field__label') and contains(normalize-space(.), 'Tlak Donji')]]//input")
    )
    await input.clear()
    await input.sendKeys(value.toString())
  }

  async enterPuls(value) {
    const input = await this.driver.findElement(
      By.xpath("//div[contains(@class, 'q-field') and .//div[contains(@class, 'q-field__label') and contains(normalize-space(.), 'Puls')]]//input")
    )
    await input.clear()
    await input.sendKeys(value.toString())
  }

  async enterTemperatura(value) {
    const input = await this.driver.findElement(
      By.xpath("//div[contains(@class, 'q-field') and .//div[contains(@class, 'q-field__label') and contains(normalize-space(.), 'Temperatura')]]//input")
    )
    await input.clear()
    await input.sendKeys(value.toString())
  }

  async enterGlukoza(value) {
    const input = await this.driver.findElement(
      By.xpath("//div[contains(@class, 'q-field') and .//div[contains(@class, 'q-field__label') and contains(normalize-space(.), 'Razina glukoze')]]//input")
    )
    await input.clear()
    await input.sendKeys(value.toString())
  }

  async clickSpremiMjerenje() {
    const btn = await this.driver.findElement(By.xpath("//button[contains(., 'Spremi mjerenje')]"))
    await this.driver.executeScript("arguments[0].scrollIntoView({block: 'center'}); arguments[0].click()", btn)
  }

  async getSuccessNotification() {
    return waitForNotification(this.driver)
  }

  async getTableRows() {
    const rows = await this.driver.findElements(By.css('.q-table tbody tr'))
    return rows.length
  }

  async enterMeasurement({ tlakGornji, tlakDonji, puls, temperatura, glukoza }) {
    await this.enterTlakGornji(tlakGornji)
    await this.enterTlakDonji(tlakDonji)
    await this.enterPuls(puls)
    await this.enterTemperatura(temperatura)
    await this.enterGlukoza(glukoza)
    await this.clickSpremiMjerenje()
    await sleep(1500)
  }
}

module.exports = MeasurementsPage
