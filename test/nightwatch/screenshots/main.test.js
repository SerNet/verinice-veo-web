const path = require("path");
const config = require("../../../screenshots");

function makeScreenshot(url, name) {
  return function (browser) {
    console.log(`Loading ${browser.globals.root_url + url}: ${name}.png`)
    browser
      .url(browser.globals.root_url + url)
      .waitForElementVisible("body", 5000)
      .saveScreenshot(path.join(browser.options.screenshotsPath, name + ".png"))
      .end();
  };
}

module.exports = Object.keys(config).reduce((obj, key, i) => (obj[key] = makeScreenshot(config[key], `${i}_${key.replace(/\W+/g, "_")}`)) && obj, {});
