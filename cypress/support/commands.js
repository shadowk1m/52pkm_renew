// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --

// Global anti-automation script patching
beforeEach(() => {
    // Patch scripts containing disable-devtool MD5
    cy.intercept('**/js/*.js', (req) => {
        req.continue((res) => {
            if (res.body.includes('321ef380c7d0f29b92e0b1c9c4cf2eb8')) {
                // Disable the rx(...) call by replacing it with a dummy
                res.body = res.body.replace(/rx\(\{md5:"321ef380c7d0f29b92e0b1c9c4cf2eb8"/g, '(() => ({success: true}))({md5:"patched"')
            }
        })
    })
})

Cypress.Commands.add('visitAndWait', (url, wait=300) => {
    cy.visit(url)
    cy.wait(wait)
})

Cypress.Commands.add('login', (email, password, wait=2000) => { 
    cy.get('#input-1', { timeout: 10000 }).should('be.visible').type(email)
    cy.get('#input-3', { timeout: 10000 }).should('be.visible').type(password)
    cy.get('button[type=submit]').click()
    cy.wait(wait)
})

Cypress.Commands.add('clickIfExists', (selector, wait=300)=> {
    cy.get(selector).click()
    cy.wait(wait)
})

Cypress.Commands.add('typeIfExists', (selector, text, wait=300) => {
    cy.get(selector).type(text)
    cy.wait(wait)
})

// Overwrite `visit` to inject small, non-invasive navigator/browser overrides
// that can help reduce detection of automation during tests.
Cypress.Commands.overwrite('visit', (originalFn, url, options = {}) => {
    const userOnBeforeLoad = options.onBeforeLoad
    options.onBeforeLoad = (win) => {
        try {
            // Spoof navigator.webdriver
            Object.defineProperty(win.navigator, 'webdriver', {
                get: () => false,
            })
            // Spoof languages
            Object.defineProperty(win.navigator, 'languages', {
                get: () => ['zh-CN', 'zh', 'en-US', 'en'],
            })
            // Spoof plugins
            Object.defineProperty(win.navigator, 'plugins', {
                get: () => [
                    { name: 'Chrome PDF Viewer', filename: 'internal-pdf-viewer' },
                    { name: 'Chromium PDF Viewer', filename: 'internal-pdf-viewer' },
                    { name: 'Microsoft Edge PDF Viewer', filename: 'internal-pdf-viewer' },
                    { name: 'PDF Viewer', filename: 'internal-pdf-viewer' },
                    { name: 'WebKit built-in PDF', filename: 'internal-pdf-viewer' }
                ],
            })
            // Spoof window.chrome
            win.chrome = {
                app: {
                    isInstalled: false,
                    InstallState: { DISABLED: 'disabled', INSTALLED: 'installed', NOT_INSTALLED: 'not_installed' },
                    RunningState: { CANNOT_RUN: 'cannot_run', RUNNING: 'running', CAN_RUN: 'can_run' }
                },
                runtime: {
                    OnInstalledReason: { CHROME_UPDATE: 'chrome_update', INSTALL: 'install', SHARED_MODULE_UPDATE: 'shared_module_update', UPDATE: 'update' },
                    OnRestartRequiredReason: { APP_UPDATE: 'app_update', OS_UPDATE: 'os_update', PERIODIC: 'periodic' },
                    PlatformArch: { ARM: 'arm', ARM64: 'arm64', MIPS: 'mips', MIPS64: 'mips64', X86_32: 'x86-32', X86_64: 'x86-64' },
                    PlatformNaclArch: { ARM: 'arm', MIPS: 'mips', MIPS64: 'mips64', X86_32: 'x86-32', X86_64: 'x86-64' },
                    PlatformOs: { ANDROID: 'android', CROS: 'cros', LINUX: 'linux', MAC: 'mac', OPENBSD: 'openbsd', WIN: 'win' },
                    RequestUpdateCheckStatus: { NO_UPDATE: 'no_update', THROTTLED: 'throttled', UPDATE_AVAILABLE: 'update_available' }
                }
            }
            
            // Spoof permissions
            const originalQuery = win.navigator.permissions.query;
            win.navigator.permissions.query = (parameters) => (
                parameters.name === 'notifications' ?
                    Promise.resolve({ state: Notification.permission }) :
                    originalQuery(parameters)
            );
        } catch (e) {
            // ignore failures — best-effort only
        }

        if (typeof userOnBeforeLoad === 'function') {
            userOnBeforeLoad(win)
        }
    }

    return originalFn(url, options)
})
