const { buildDriver } = require('./webdriver')

let _driver = null

async function getDriver() {
  if (!_driver) {
    _driver = buildDriver()
  }
  return _driver
}

async function quitDriver() {
  if (_driver) {
    await _driver.quit()
    _driver = null
  }
}

module.exports = { getDriver, quitDriver }
