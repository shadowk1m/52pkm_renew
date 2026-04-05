import 'cypress-each'

describe('52pkm', () => {
  const domain = Cypress.env('DOMAIN')
  const emails = Cypress.env('EMAILS')
  const password = Cypress.env('PASSWORD')

  const tokens = []
  let baseUrl = ''
  
  before(() => {
    expect(domain).to.be.a('string', 'DOMAIN environment variable must be set')
    expect(emails).to.be.a('string', 'EMAILS environment variable must be set')
    expect(password).to.be.a('string', 'PASSWORD environment variable must be set')
  })

  after(() => {
    cy.task('log', `    URL: ${baseUrl}`)
    cy.task('log', `    Tokens: ${tokens.join(',')}`)
  })

  const emailList = emails ? emails.split(',') : []
  it.each(emailList)('reset %s', (email) => {
    // Dynamic anti-automation patching is now handled globally in commands.js
    
    cy.visit(`${domain}/login`)
    cy.login(email, password)
    
    // Check if login was successful (dashboard should have some element)
    cy.url().should('include', '/dashboard')

    cy.visit(`${domain}/profile`)
    cy.get('.v-navigation-drawer__scrim').click()
    cy.get('[value="tab-security"]').click()
    cy.get('.v-col-md-4 > .v-card--variant-flat > .v-card > .v-card-text > .v-btn').click()
    cy.get('.v-card-actions > .text-error').click()
    cy.get('.v-snackbar__content').should('contain', '成功')

    
    cy.visit(`${domain}/knowledge/12`)
    cy.get('.v-navigation-drawer__scrim').click()
    cy.get('.tutorial-container > .v-btn > .v-btn__content').invoke('attr', 'data-text').then(
      (t) => {
        expect(t).to.exist
        const [url, token] = t.split('=')
        baseUrl = `${url}=`
        tokens.push(token)
    })
        
    cy.wait(3000)
  })
})
