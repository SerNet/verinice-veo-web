import { LOCAL_STORAGE_KEYS } from '../../../types/localStorage';

describe('Unit-Card', () => {
  const testUnitDetails = {
    domainNames: ['IT-Grundschutz', 'DS-GVO']
  };

  beforeEach(() => {
    cy.login();
    cy.createUnit(testUnitDetails);
    cy.goToUnitSelection();
  });

  afterEach(() => {
    cy.deleteUnit();
  });

  it('displays the right unit data', () => {
    cy.getVeoTestUnitCard().as('veo-card');
    cy.get('@veo-card').should('contain', Cypress.env('unitDetails').name);
    cy.get('@veo-card').should('contain', Cypress.env('unitDetails').desc);
    Cypress.env('unitDetails').domains.forEach((domain: { name: string; id: string }) => {
      cy.get('@veo-card').should('contain', domain.name);
    });
  });

  it('changes unit name and description', () => {
    const testData = {
      unitName: `TEST-NAME-${Math.random()}`,
      unitDesc: 'TEST DESCRIPTION'
    };

    cy.getVeoTestUnitCard().as('veo-card');

    // Open edit modal
    cy.get('@veo-card').find('[data-veo-test="units-edit-unit-button"]').click();
    // Fill in and store new data
    cy.editUnit(testData);

    // Check if new data is rendered
    cy.get('@veo-card').should('contain', testData.unitName);
    cy.get('@veo-card').should('contain', testData.unitDesc);
  });

  it('bookmarks a unit as favorite unit', () => {
    cy.getVeoTestUnitCard().as('veo-card');

    // Bookmark test unit as favorite unit
    cy.get('@veo-card').within((_card) => {
      cy.get('[data-veo-test="item-card-slot-prepend"] button').click();
    });

    // Get id of favorite unit from LS
    cy.getAllLocalStorage().then((result) => {
      cy.wrap(result[Cypress.env('baseUrl')][LOCAL_STORAGE_KEYS.FAVORITE_UNIT]).as('favorite-unit-id');
    });

    // Get bookmark button
    cy.get('@veo-card').within((_card) => {
      cy.get('button svg path').as('favorite-unit-btn');
    });

    // Compare id of favorite unit to the id of the test unit
    cy.get('@favorite-unit-id').should('equal', Cypress.env('unitDetails').unitId);

    // Check draw-path to figure out if the correct svg is rendered
    cy.get('@favorite-unit-btn').should(
      'have.attr',
      'd',
      'M17,3H7A2,2 0 0,0 5,5V21L12,18L19,21V5C19,3.89 18.1,3 17,3Z'
    );
  });
});
