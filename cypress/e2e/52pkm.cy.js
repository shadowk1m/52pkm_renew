import 'cypress-each'

describe('52pkm', () => {
  const domain = Cypress.env('DOMAIN')
  const emails = Cypress.env('EMAILS')
  const password = Cypress.env('PASSWORD')
  const coupon = Cypress.env('COUPON')

  let overrideUrl = ''

  before(async () => {
    expect(domain).to.be.a('string', 'DOMAIN environment variable must be set')
    expect(emails).to.be.a('string', 'EMAILS environment variable must be set')
    expect(password).to.be.a('string', 'PASSWORD environment variable must be set')
    expect(coupon).to.be.a('string', 'COUPON environment variable must be set')

    const res = await cy.request(`${domain}/login`)
    const loginPage = new DOMParser().parseFromString(res.body, 'text/html')
    overrideUrl = loginPage.getElementsByTagName('script')[1].getAttribute('src')
  })


  const emailList = emails.split(',')
  it.each(emailList)('renew %s', (email) => {
    cy.intercept(overrideUrl, {
      fixture: '52pkm.override.txt',
      headers: {
        'Content-Type': 'application/javascript'
      }
    })

    cy.visitAndWait(`${domain}/login`)
    cy.login(email, password)
    cy.visitAndWait(`${domain}/plan/8`)
    cy.clickIfExists('.v-list > [href="/plan"]')
    cy.clickIfExists(':nth-child(2) > .elevation-0 > .v-card > .v-card-text > .pa-6 > .v-btn')
    cy.clickIfExists('.v-selection-control-group > .v-row > :nth-child(1) > .py-4')
    cy.typeIfExists('.elevation-0 > .v-card-text input', coupon)
    cy.clickIfExists('.v-card-actions > .d-flex > div > .v-btn > .v-btn__content')

    cy.get('.v-alert__content').eq(0).should('contain', '成功')
    cy.clickIfExists('.v-selection-control-group > .v-row > .v-col > .v-btn', 5000)
  })
})