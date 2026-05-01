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

    cy.get('input[placeholder="输入优惠码"]').type(coupon)
    cy.get('.coupon-card__controls > .v-btn').click()
    cy.get('.pricing-options > .v-row > :nth-child(1) > .py-4').click()
    cy.wait(1000)
    cy.get('.v-alert__content').eq(0).should('contain', '已生效')
    cy.get(':nth-child(7) > .v-btn').click()
    cy.wait(3000)
  })
})
