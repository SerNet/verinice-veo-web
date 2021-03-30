/// <reference path="../support/index.d.ts" />

describe('Authentication test', () => {
  beforeEach(() => {
    cy.auth()
  })
  it('Should login', () => {
    // Keycloak Auth Endpoint

    cy.visit('http://localhost:3000')
    // Compare each link with units
    // cy.get<HTMLLinkElement>('.v-list:not(.v-list--nav) a').each((el, i) => {
    //   const unit = units[i]
    //   const link = cy.wrap(el)
    //   link.should('have.attr', 'href', `/unit-${unit.id}`)
    //   link.find('.v-list-item__title').should('contain.text', unit.name)
    // })
  })
})
