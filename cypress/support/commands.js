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
Cypress.Commands.add('visitAndWait', (url, wait=300) => {
    cy.visit(url)
    cy.wait(wait)
})
Cypress.Commands.add('login', (email, password, wait=2000) => { 
    cy.get('#input-1').type(email)
    cy.get('#input-3').type(password)
    cy.get('button[type=submit]').click()
    cy.wait(wait)
})
Cypress.Commands.add('clickIfExists', (selector, wait=300)=> {
    cy.get('body').then(($body) => {
        if ($body.find(selector).length === 1) {
            cy.get(selector).click()
            cy.wait(wait)
        }
    })
})
Cypress.Commands.add('typeIfExists', (selector, text, wait=300) => {
    cy.get('body').then(($body) => {
        if ($body.find(selector).length === 1) {
            cy.get(selector).type(text)
            cy.wait(wait)
        }
    })
})

// Overwrite `visit` to inject small, non-invasive navigator/browser overrides
// that can help reduce detection of automation during tests.
Cypress.Commands.overwrite('visit', (originalFn, url, options = {}) => {
    const userOnBeforeLoad = options.onBeforeLoad
    options.onBeforeLoad = (win) => {
        try {
            Object.defineProperty(win.navigator, 'webdriver', {
                get: () => false,
            })
            Object.defineProperty(win.navigator, 'languages', {
                get: () => ['en-US', 'en'],
            })
            Object.defineProperty(win.navigator, 'plugins', {
                get: () => [1, 2, 3],
            })
            win.chrome = win.chrome || {}
        } catch (e) {
            // ignore failures — best-effort only
        }

        if (typeof userOnBeforeLoad === 'function') {
            userOnBeforeLoad(win)
        }
    }

    return originalFn(url, options)
})
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
