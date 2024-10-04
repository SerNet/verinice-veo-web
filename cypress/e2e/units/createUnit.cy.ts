describe('create units', () => {
  beforeEach(() => {
    cy.login();
    cy.acceptAllCookies();
    cy.goToUnitSelection();
  });

  const testData = {
    unitName: `TEST-NAME-${Math.random()}`,
    unitDesc: 'TEST DESCRIPTION FROM `createUnit.cy.ts`',
    domains: ['DS-GVO', 'IT-Grundschutz'],
    domainSelectors: ['[data-veo-test="domain-card-checkbox-ds-gvo"]', '[data-veo-test="domain-card-checkbox-itgs"]']
  };

  type TestData = typeof testData;

  it('creates an empty unit and associates it with the `GDPR` and `IT-Security` domains', () => {
    enterUnitDetails(testData);

    // Click next on /profiles (not choosing any profile)
    cy.get('[data-veo-test="profile-radio-btn-none"]'); // make sure view is loaded
    clickNext();

    chooseDomains(testData);
    createUnit();
    testUnitCard(testData);

    cy.get('div.v-card-title')
      .contains(testData.unitName)
      .first()
      .then(($el) => {
        if ($el.length) {
          cy.wrap($el)
            .parent('a')
            .then(($a) => {
              const href = $a.attr('href');
              const idBeforeDomains = href.match(/\/([^/]+)\/domains/)[1];
              cy.veoRequest({
                endpoint: `units/${idBeforeDomains}`,
                method: 'DELETE'
              }).then((res) => expect(res.status).to.eq(204));
            });
        }
      });
  });

  it('creates a unit, associates it with the `IT-Security` domain and applies the `Beispieldaten (GDPR)` profile', () => {
    enterUnitDetails(testData);

    // Choose profile `Beispieldaten`
    cy.get('[data-veo-test="profile-radio-btn-Beispieldaten"]').click();
    clickNext();

    // domainSelectors[0] is preselected when choosing profile `Beispieldata` (cp. above)
    chooseDomains({ ...testData, domainSelectors: [testData.domainSelectors[1]] });
    createUnit({ hasProfile: true });
    cy.testDashboardWidgets();

    // Check if the unit card is rendered correctly
    cy.goToUnitSelection();
    testUnitCard(testData);

    cy.get('div.v-card-title')
      .contains(testData.unitName)
      .first()
      .then(($el) => {
        if ($el.length) {
          cy.wrap($el)
            .parent('a')
            .then(($a) => {
              const href = $a.attr('href');
              const idBeforeDomains = href.match(/\/([^/]+)\/domains/)[1];
              cy.intercept('DELETE', `${Cypress.env('veoApiUrl')}/units/**`).as('deleteUnit');
              cy.veoRequest({
                endpoint: `units/${idBeforeDomains}`,
                method: 'DELETE'
              }).then((res) => expect(res.status).to.eq(204));
            });
        }
      });
  });
  function enterUnitDetails(testData: TestData) {
    cy.log('enter unit details!');
    // Go to details page of the test unit
    cy.get('[data-veo-test="create-unit-btn"]').click().as('clickCreateBtn');
    cy.get('[data-veo-test="unit-details-card"]').as('detailsCard');

    // Enter details
    cy.get('@detailsCard').within((_$card) => {
      cy.get('input').type(testData.unitName);
      cy.get('textarea').type(testData.unitDesc);
    });

    clickNext();
  }

  function chooseDomains(testData: TestData) {
    testData.domainSelectors.forEach((selector: string) => cy.get(selector).first().click());
    clickNext();
  }

  function createUnit({ hasProfile = false }: { hasProfile?: boolean } = {}) {
    cy.log(JSON.stringify({ hasProfile }));
    if (hasProfile) {
      cy.intercept('POST', `${Cypress.env('veoApiUrl')}/domains/**/profiles/**/incarnation?unit=**`).as('applyProfile');
    }

    cy.intercept('POST', `${Cypress.env('veoApiUrl')}/units`).as('createUnit');
    cy.get('[data-veo-test="create-unit-create-btn"]').click();
    cy.wait('@createUnit').its('response.statusCode').should('eq', 201);

    if (hasProfile) {
      cy.wait(['@applyProfile']).its('response.statusCode').should('eq', 204);
    }

    // Intercept redirect
    cy.intercept('GET', `${Cypress.config('baseUrl')}/units`).as('getUnits');
    cy.wait('@getUnits').its('response.statusCode').should('eq', 200);
  }

  function testUnitCard(testData: TestData) {
    // Get test unit card
    cy.contains(testData.unitName) //.parent().as('testUnitCard');
      .parents('[data-veo-test="veo-card"]')
      .as('testUnitCard');

    // Assertions

    // Check name + description
    cy.get('@testUnitCard').should('contain', testData.unitName);
    cy.get('@testUnitCard').should('contain', testData.unitDesc);

    // Check domain
    cy.get('@testUnitCard').within((_card) => {
      cy.get('[data-veo-test="item-card-slot-left"] .v-chip').as('domainButtons');
    });
    cy.get('@domainButtons').each((button) => {
      expect(testData.domains).to.includes(button.text());
    });
  }

  function clickNext() {
    cy.get('[data-veo-test="create-unit-next-btn"]').click();
  }
});
