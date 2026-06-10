const { By, until } = require('selenium-webdriver')
const { BASE_URL, sleep, waitForNotification } = require('../config/webdriver')

class LoginPage {
  constructor(driver) {
    this.driver = driver
  }

  async navigate() {
    await this.driver.get(`${BASE_URL}/#/loginPage`)
    await sleep(1000)
    await this.driver.wait(until.elementLocated(By.css('.q-form')), 5000)
  }

  async enterEmail(email) {
    const input = await this.driver.findElement(
      By.xpath("//div[contains(@class, 'q-field') and .//div[contains(@class, 'q-field__label') and contains(normalize-space(.), 'Email')]]//input")
    )
    await input.clear()
    await input.sendKeys(email)
  }

  async enterPassword(password) {
    const input = await this.driver.findElement(
      By.xpath("//div[contains(@class, 'q-field') and .//div[contains(@class, 'q-field__label') and contains(normalize-space(.), 'Lozinka')]]//input")
    )
    await input.clear()
    await input.sendKeys(password)
  }

  async clickSubmit() {
    const btn = await this.driver.findElement(By.xpath("//button[contains(., 'Prijavi se')]"))
    await this.driver.executeScript("arguments[0].scrollIntoView({block: 'center'}); arguments[0].click()", btn)
  }

  async getSuccessNotification() {
    return waitForNotification(this.driver)
  }

  async getErrorNotification() {
    return waitForNotification(this.driver)
  }

  async loginAs(email, password) {
    await this.navigate()
    await this.enterEmail(email)
    await this.enterPassword(password)
    await this.clickSubmit()
    await sleep(2000)
  }
}

module.exports = LoginPage
