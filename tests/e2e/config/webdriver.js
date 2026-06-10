const { By, until, Builder } = require('selenium-webdriver')
const chrome = require('selenium-webdriver/chrome')
const chromedriver = require('chromedriver')

const BASE_URL = 'http://localhost:9000'

function buildDriver() {
  const options = new chrome.Options()
  options.addArguments('--no-sandbox')
  options.addArguments('--disable-dev-shm-usage')
  options.addArguments('--window-size=1280,720')

  const service = new chrome.ServiceBuilder(chromedriver.path)

  return new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .setChromeService(service)
    .build()
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function waitForNotification(driver, timeout = 5000) {
  const notification = await driver.wait(
    until.elementLocated(By.css('.q-notification')),
    timeout
  )
  await sleep(300)
  return notification.getText()
}

async function selectQuasarOption(driver, inputElement, optionText) {
  await driver.executeScript("arguments[0].scrollIntoView({block: 'center'}); arguments[0].click()", inputElement)
  await sleep(500)
  await driver.wait(until.elementLocated(By.css('.q-menu')), 3000)
  await sleep(300)
  const option = await driver.findElement(
    By.xpath(`//div[contains(@class, 'q-item') and contains(normalize-space(.), '${optionText}')]`)
  )
  await driver.executeScript("arguments[0].scrollIntoView({block: 'nearest'})", option)
  await sleep(200)
  try {
    await option.click()
  } catch {
    await driver.executeScript("arguments[0].click()", option)
  }
  await sleep(300)
}

module.exports = {
  BASE_URL,
  buildDriver,
  sleep,
  waitForNotification,
  selectQuasarOption,
}
