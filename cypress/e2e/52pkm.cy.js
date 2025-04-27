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
  it.each(emailList)('renew %s', async (email) => {
    await cy.intercept(overrideUrl, { fixture: '52pkm.override.txt', headers: { 'Content-Type': 'application/javascript' } })

    await cy.visitAndWait(`${domain}/login`)
    await cy.login(email, password)

    await cy.clickIfExists('[style="z-index: 2420;"] > .v-overlay__content > .v-card > .v-card-actions > .text-grey > .v-btn__content')
    await cy.clickIfExists('.text-grey > .v-btn__content')
    await cy.clickIfExists('.v-card-actions > .v-btn')
    await cy.clickIfExists('.v-list > [href="/plan"]')
    await cy.clickIfExists(':nth-child(2) > .elevation-0 > .v-card > .v-card-text > .pa-6 > .v-btn', 3000)
    await cy.clickIfExists('.v-selection-control-group > .v-row > :nth-child(1) > .py-4')
    await cy.typeIfExists('.elevation-0 > .v-card-text input', coupon)
    await cy.clickIfExists('.v-card-actions > .d-flex > div > .v-btn > .v-btn__content')

    await cy.get('.v-alert__content').then(async ($alert) => {
      if ($alert.text().includes('成功')) {
        await cy.log(`${email} coupon applied successfully`)
        await cy.clickIfExists('.v-selection-control-group > .v-row > .v-col > .v-btn')
      } else {
        await cy.log(`${email} coupon applied unsuccessfully`)
      }
    })
  })
})