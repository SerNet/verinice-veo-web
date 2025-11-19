import { LOCAL_STORAGE_KEYS } from '../../../types/localStorage';
import type { UnitDetails } from '../../support/setupHelpers';
import { generateUnitDetails } from '../../support/setupHelpers';
let unitDetails: UnitDetails;

describe('Unit-Card', () => {
  before(() => {
    unitDetails = generateUnitDetails('unitCard');
    cy.login();
    cy.createUnit({ name: unitDetails.name, desc: unitDetails.desc, domains: ['IT-Grundschutz', 'DS-GVO'] });
    cy.goToUnitSelection();
  });
  beforeEach(() => {
    cy.login();
    cy.acceptAllCookies();
    cy.goToUnitSelection();
  });
  after(() => cy.deleteUnit(unitDetails.name));

  it('displays the right unit data', () => {
    cy.getVeoTestUnitCard(unitDetails.name).as('veo-card');
    cy.getCustom('@veo-card').should('contain', Cypress.env(unitDetails.name).name);
    cy.getCustom('@veo-card').should('contain', Cypress.env(unitDetails.name).desc);
    Cypress.env(unitDetails.name).domains.forEach((domain: { name: string; id: string }) => {
      cy.getCustom('@veo-card').should('contain', domain.name);
    });
  });

  it('bookmarks a unit as favorite unit', () => {
    cy.getVeoTestUnitCard(unitDetails.name).as('veo-card');

    // Bookmark test unit as favorite unit
    cy.getCustom('@veo-card').within((_card) => {
      cy.getCustom('[data-veo-test="item-card-slot-prepend"] button').click();
    });

    // Get id of favorite unit from LS
    cy.getAllLocalStorage().then((result) => {
      cy.wrap(result[Cypress.env('baseUrl')][LOCAL_STORAGE_KEYS.FAVORITE_UNIT]).as('favorite-unit-id');
    });

    // Get bookmark button
    cy.getCustom('@veo-card').within((_card) => {
      cy.getCustom('button svg path').as('favorite-unit-btn');
    });

    // Compare id of favorite unit to the id of the test unit
    cy.getCustom('@favorite-unit-id').should('equal', Cypress.env(unitDetails.name).unitId);

    // Check draw-path to figure out if the correct svg is rendered
    cy.getCustom('@favorite-unit-btn').should(
      'have.attr',
      'd',
      'M17,3H7A2,2 0 0,0 5,5V21L12,18L19,21V5C19,3.89 18.1,3 17,3Z'
    );
  });
});
