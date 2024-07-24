describe('create units', () => {
  beforeEach(() => {
    cy.login();
    cy.acceptAllCookies();
    cy.goToUnitSelection();
  });

  after(() => cy.deleteUnit());

  const testData = {
    unitName: `TEST-NAME-${Math.random()}`,
    unitDesc: 'TEST DESCRIPTION',
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

    // Store unitId
    if (hasProfile) {
      /**
       * After creating a new unit users are redirected to the new unit dashboard.
       * The new unit id can be found in the url.
       * Take it and store it for later use.
       */
      cy.get('[data-component-name="domain-dashboard-page"]').then((_el) => {
        cy.url().then((url) => {
          const unitDetails = { ...Cypress.env('unitDetails'), unitId: url.split('/').at(3) };
          Cypress.env('unitDetails', unitDetails);
        });
      });

      return;
    }

    /**
     * GET UNIT ID
     * If a unit is created without a profile,
     * users are redirected to /units
     * here we get the unit id from its unit card
     */

    // Make sure everything is loaded correctly:
    // 1. Check if the current view is /units
    cy.get('[data-component-name="number-available-units"]').as('checkUnitPageIsLoaded');
    // 2. Check if unit cards are rendered
    cy.get('.v-card').as('checkUnitCardsAreRendered');

    // Get url to the units dashboard
    // -> unit id is part of that link
    cy.contains(testData.unitName).as('testUnitLink');
    cy.get('@testUnitLink').then(($link) => {
      if (!$link.length) {
        cy.log("There was an issue getting the test unit's url");
        return;
      }
      const unitId = ($link[0] as HTMLLinkElement).href.split('/')[3];
      const unitDetails = { ...Cypress.env('unitDetails'), unitId };
      Cypress.env('unitDetails', unitDetails);
    });
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
