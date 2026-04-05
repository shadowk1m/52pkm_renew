const path = require('path')
const fs = require('fs')

module.exports = {
  e2e: {
    setupNodeEvents(on, config) {
      let logs = []
      on('task', {
        log(message) {
          logs.push(message)
          return null
        },
        saveResults({ baseUrl, tokens }) {
          const resultsPath = path.join(config.projectRoot, 'cypress', 'results.json')
          fs.writeFileSync(resultsPath, JSON.stringify({ baseUrl, tokens }, null, 2))
          return null
        }
      })
      on('after:spec', (spec, results) => {
        if (logs.length > 0) {
          console.log('\n    --- Test Run Info ---')
          logs.forEach(msg => console.log(msg))
          console.log('    ---------------------\n')
          logs = []
        }
      })
      on('before:browser:launch', (browser = {}, launchOptions) => {
        if (browser.family === 'chromium' && browser.name !== 'electron') {
          launchOptions.args = (launchOptions.args || []).filter(arg => !arg.startsWith('--enable-automation'))
          launchOptions.args.push('--disable-blink-features=AutomationControlled')
          launchOptions.args.push('--disable-features=RendererCodeIntegrity')
          const userDataDir = path.join(config.projectRoot, 'tmp', 'cypress-user-data')
          launchOptions.args.push(`--user-data-dir=${userDataDir}`)
        }
        return launchOptions
      })
    },
  },
};
