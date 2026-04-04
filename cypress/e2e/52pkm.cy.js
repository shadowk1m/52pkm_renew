import 'cypress-each'

describe('52pkm', () => {
  const domain = Cypress.env('DOMAIN')
  const emails = Cypress.env('EMAILS')
  const password = Cypress.env('PASSWORD')
  const coupon = Cypress.env('COUPON')

  before(() => {
    expect(domain).to.be.a('string', 'DOMAIN environment variable must be set')
    expect(emails).to.be.a('string', 'EMAILS environment variable must be set')
    expect(password).to.be.a('string', 'PASSWORD environment variable must be set')
    expect(coupon).to.be.a('string', 'COUPON environment variable must be set')
  })

  const emailList = emails ? emails.split(',') : []
  it.each(emailList)('renew %s', (email) => {
    // Dynamic anti-automation patching is now handled globally in commands.js
    
    cy.visit(`${domain}/login`)
    cy.login(email, password)
    
    // Check if login was successful (dashboard should have some element)
    cy.url().should('include', '/dashboard')

    cy.visit(`${domain}/plan/8`)
    cy.get('.v-navigation-drawer__scrim').click()

    cy.get('#input-70').type(coupon)
    cy.get('.v-card-actions > .d-flex > div > .v-btn > .v-btn__content').click()
    cy.wait(1000)
    cy.get('.v-alert__content').eq(0).should('contain', '成功')
    cy.get('.v-selection-control-group > .v-row > :nth-child(1) > .py-4').click()
    cy.get('.v-col > .v-btn').click()
    cy.wait(3000)
  })
})
