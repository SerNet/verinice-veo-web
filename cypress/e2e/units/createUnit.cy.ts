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
    domainSelectors: [
      '[data-veo-test="domain-card-checkbox-ds-gvo"]',
      '[data-veo-test="domain-card-checkbox-it-grundschutz"]'
    ],
    ChipSelectors: ['domain-card-chip-ds-gvo', 'domain-card-chip-it-grundschutz']
  };

  type TestData = typeof testData;

  it('creates an empty unit and associates it with the `GDPR` and `IT-Security` domains', () => {
    enterUnitDetails(testData);

    // Click next on /profiles (not choosing any profile)
    cy.getCustom('[data-veo-test="profile-radio-btn-none"]'); // make sure view is loaded
    clickNext();

    chooseDomains(testData);
    createUnit();
    testUnitCard(testData);

    cy.getCustom('div.v-card-title')
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
    cy.getCustom('[data-veo-test="profile-radio-btn-Beispieldaten"]').click();
    clickNext();

    // domainSelectors[0] is preselected when choosing profile `Beispieldata` (cp. above)
    chooseDomains({ ...testData, domainSelectors: [testData.domainSelectors[1]] });
    createUnit({ hasProfile: true });
    cy.testDashboardWidgets();

    // Check if the unit card is rendered correctly
    cy.goToUnitSelection();
    testUnitCard(testData);

    cy.getCustom('div.v-card-title')
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
    cy.getCustom('[data-veo-test="create-unit-btn"]').click().as('clickCreateBtn');
    cy.getCustom('[data-veo-test="unit-details-card"]').as('detailsCard');

    // Enter details
    cy.getCustom('@detailsCard').within((_$card) => {
      cy.getCustom('input').type(testData.unitName);
      cy.getCustom('textarea').type(testData.unitDesc);
    });

    clickNext();
  }

  function chooseDomains(testData: TestData) {
    testData.domainSelectors.forEach((selector: string) => cy.getCustom(selector).first().click());
    clickNext();
  }

  function createUnit({ hasProfile = false }: { hasProfile?: boolean } = {}) {
    cy.log(JSON.stringify({ hasProfile }));
    if (hasProfile) {
      cy.intercept('POST', `${Cypress.env('veoApiUrl')}/domains/**/profiles/**/incarnation?unit=**`).as('applyProfile');
    }

    cy.intercept('POST', `${Cypress.env('veoApiUrl')}/units`).as('createUnit');
    cy.getCustom('[data-veo-test="create-unit-create-btn"]').click();
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
    cy.containsCustom(testData.unitName) //.parent().as('testUnitCard');
      .parents('[data-veo-test="veo-card"]')
      .as('testUnitCard');

    // Assertions

    // Check name + description
    cy.getCustom('@testUnitCard').should('contain', testData.unitName);
    cy.getCustom('@testUnitCard').should('contain', testData.unitDesc);

    // Check domain
    cy.getCustom('@testUnitCard').within((_card) => {
      cy.getCustom('[data-veo-test="item-card-slot-left"] .v-chip').as('domainButtons');
    });
    cy.getCustom('@domainButtons').each((button) => {
      const attr = button.attr('data-veo-test');
      expect(testData.ChipSelectors).to.include(attr);
    });
  }
  function clickNext() {
    cy.getCustom('[data-veo-test="create-unit-next-btn"]').click();
  }
});
