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


  it('renew', async () => {
    const body = await cy.readFile('cypress/fixtures/52pkm.override.js')
    await cy.intercept('GEt', overrideUrl, { body, statusCode: 200, headers: { 'Content-Type': 'application/javascript' } })
    const emailList = emails.split(',')
    for (const email of emailList) {
      cy.clearAllSessionStorage()
      cy.clearCookies()
      cy.clearAllLocalStorage()

      cy.visit(`${domain}/login`)
      cy.wait(3000)
      cy.login(email, password)
      cy.wait(3000)
      cy.clickIfExists('.text-grey > .v-btn__content')
      cy.clickIfExists('.v-card-actions > .v-btn')
      cy.clickIfExists('.v-list > [href="/plan"]')
      cy.clickIfExists(':nth-child(2) > .elevation-0 > .v-card > .v-card-text > .pa-6 > .v-btn')
      cy.clickIfExists('.v-selection-control-group > .v-row > :nth-child(1) > .py-4')
      cy.get('.elevation-0 > .v-card-text input').type(coupon)
      cy.wait(1000)
      cy.clickIfExists('.v-card-actions > .d-flex > div > .v-btn > .v-btn__content')
      cy.get('.v-alert__content').then(($alert) => {
        if ($alert.text().includes('成功')) {
          cy.log('兑换成功')
          cy.clickIfExists('.v-selection-control-group > .v-row > .v-col > .v-btn')
        }
      })
    }
  })
})