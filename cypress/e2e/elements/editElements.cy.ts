import { UnitDetails, generateUnitDetails } from '../../support/setupHelpers';
let unitDetails: UnitDetails;

describe('Edit elements', () => {
  before(() => {
    unitDetails = generateUnitDetails('editElements');
    cy.importUnit(unitDetails.name, { fixturePath: 'units/test-unit-dsgvo.json' });
    cy.login();
  });

  beforeEach(() => {
    cy.login();
    cy.goToUnitSelection();
    cy.acceptAllCookies();
    cy.selectUnit(unitDetails.name);
    cy.selectDomain('DS-GVO');
  });

  after(() => cy.deleteUnit(unitDetails.name));

  it('edits an element in Scopes', () => {});
});

function editElement({ typePlural, subTypePlural }: { typePlural: string; subTypePlural: string }) {
  const testData = {
    abbreviation: 'test-abbreviation',
    name: 'test-name',
    description: 'test-description',
    status: 'Archived'
  };

  // Open first object
  cy.navigateTo({ group: 'objects', category: typePlural, entry: subTypePlural });
  cy.getCustom('.v-data-table__tr').first().as('originalRow');
  cy.getCustom('@originalRow').click();

  // In the form
  // Set status
  cy.getCustom('input[id="#/properties/status"]').as('statusInput');
  cy.wait(1); // Interestingly this test otherwise crashes the cypress gui (electron)
  cy.get('@statusInput').click().clear().type(`${testData.status}{downArrow}{enter}`);

  // Fill in some more form values
  cy.getCustom('input[id="#/properties/abbreviation"]').clear().type(testData.abbreviation);
  cy.getCustom('input[id="#/properties/name"]').clear().type(testData.name);
  cy.getCustom('textarea[id="#/properties/description"]').clear().type(testData.description);

  // Save
  cy.intercept('PUT', `${Cypress.env('veoApiUrl')}/domains/**`).as('editElement');
  cy.intercept('GET', `${Cypress.env('veoApiUrl')}/domains/**`).as('getElements');
  cy.containsCustom('Save').click();
  cy.wait(['@editElement', '@getElements']).then((intercepts) => {
    expect(intercepts[0].response.statusCode).to.equal(200);
    expect(intercepts[1].response.statusCode).to.equal(200);
  });

  // Go back to overview page
  cy.navigateTo({ group: 'objects', category: typePlural, entry: subTypePlural });
  cy.containsCustom('tr', testData.abbreviation).as('rowWithElements');

  cy.getCustom('@rowWithElements').then(($row: JQuery<HTMLElement>) => {
    const cells = $row.children('td');

    const texts = [];
    cells.each((_index, cell) => {
      if (Cypress.$(cell).text()) texts.push(Cypress.$(cell).text());
    });

    const abb = texts[1];
    const name = texts[2];
    const status = texts[3];

    expect(abb).to.equal(testData.abbreviation);
    expect(name).to.equal(testData.name);
    expect(status).to.equal(testData.status);
  });

  // Go back to the object and check description
  cy.getCustom('@rowWithElements').click();

  cy.getCustom('textarea[id="#/properties/description"]')
    .should('be.visible')
    .invoke('val')
    .then((descriptionValue: string) => {
      expect(descriptionValue.toString().trim()).to.equal(testData.description);
    });
}
