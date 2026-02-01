const path = require('path')

module.exports = {
  e2e: {
    setupNodeEvents(on, config) {
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
