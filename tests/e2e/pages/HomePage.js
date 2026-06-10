const { By, until } = require('selenium-webdriver')
const { BASE_URL, sleep } = require('../config/webdriver')

class HomePage {
  constructor(driver) {
    this.driver = driver
  }

  async navigate() {
    await this.driver.get(`${BASE_URL}/#/`)
    await sleep(1000)
  }

  async getUserName() {
    const header = await this.driver.findElement(By.css('.q-header'))
    return header.getText()
  }

  async isLoggedIn() {
    try {
      await this.driver.findElement(By.xpath("//button[contains(., 'Odjava')]"))
      return true
    } catch {
      return false
    }
  }

  async getLoggedInUserName() {
    const el = await this.driver.findElement(
      By.xpath("//div[contains(@class, 'text-subtitle2')]")
    )
    return el.getText()
  }

  async clickLogout() {
    const btn = await this.driver.findElement(By.xpath("//button[contains(., 'Odjava')]"))
    await this.driver.executeScript("arguments[0].scrollIntoView({block: 'center'}); arguments[0].click()", btn)
    await sleep(1000)
  }

  async navigateTo(path) {
    await this.driver.get(`${BASE_URL}/#/${path}`)
    await sleep(1000)
  }
}

module.exports = HomePage
