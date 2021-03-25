describe('Homepage test', () => {
  it('Should go to homepage', () => {
    cy.intercept(
      {
        method: 'GET', // Route all GET requests
        url: 'https://veo-keycloak.staging.cpmsys.io/auth/realms/verinice-veo/protocol/openid-connect/auth*' // that have a URL that matches '/users/*'
      },
      req => {
        req.redirect('http://localhost:3000/sso')
      } // and force the response to be: []
    )

    cy.intercept(
      {
        method: 'GET', // Route all GET requests
        url: 'http://localhost:3000/sso' // that have a URL that matches '/users/*'
      },
      req => {}
    )

    cy.intercept('http://localhost:3000/_loading/sse', req => {})

    cy.intercept(
      {
        method: 'POST', // Route all GET requests
        url: 'https://veo-keycloak.staging.cpmsys.io/auth/realms/verinice-veo/protocol/openid-connect/token' // that have a URL that matches '/users/*'
      },
      req => {}
    )

    cy.intercept(
      {
        method: 'GET', // Route all GET requests
        url: 'https://veo-keycloak.staging.cpmsys.io/auth/realms/verinice-veo/account' // that have a URL that matches '/users/*'
      },
      {
        fixture: 'user.json'
      }
    )
    cy.visit('http://localhost:3000')
  })
})
