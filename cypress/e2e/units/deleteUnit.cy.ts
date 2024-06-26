import { UnitDetails, generateUnitDetails } from '../../support/setupHelpers';

let unitDetails: UnitDetails;

before(() => {
  unitDetails = generateUnitDetails('deleteUnit');
  cy.login();
  cy.createUnit(unitDetails);
});

it('deletes a unit', () => {
  cy.deleteUnit(unitDetails.name);
});
