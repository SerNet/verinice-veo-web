export function getRandomString(length = 8) {
  return Math.random().toString(36).substr(2, length);
}

export function getRandomElementType(
  elementTypes: string[] = ['Processes', 'Assets', 'Persons', 'Incidents', 'Documents', 'Scenarios', 'Controls']
) {
  const idx = Math.floor(Math.random() * elementTypes.length);
  return elementTypes[idx];
}

export function waitForPageToLoad() {
  // Wait for Vue to finish rendering the new data
  cy.window().then((win) => {
    return new Cypress.Promise((resolve) => {
      win.requestAnimationFrame(() => {
        resolve();
      });
    });
  });
}

export function pluralizeElementType(elementType: string) {
  return elementType.toLowerCase() + (elementType === 'Process' ? 'es' : 's');
}
export function waitForLoadersToDisappear(options: any = {}) {
  cy.get('.v-skeleton-loader', options).should('not.exist');
  cy.get('[loading=true]', options).should('not.exist');
  cy.get('[role="progressbar"]:visible:not([data-test-veo="timerInstance"])', options).should('not.exist');
  cy.get('[data-veo-test="loadingDataTable"]', options).should('not.exist');
  cy.get('[data-veo-test="loader"]', options).should('not.exist');
}

export function getTestUnits() {
  const { dynamicTestData } = Cypress.env('dynamicTestData');
  return dynamicTestData.units;
}

export function getTestUnit() {
  return Cypress.env('dynamicTestData').testUnits[0];
}

export function getTestUnitId() {
  return Cypress.env('dynamicTestData').testUnits[0].unitId;
}

export function getTestDomain(domainName = 'DS-GVO') {
  return Cypress.env('dynamicTestData').testUnits[0].domains.find(
    (d: { name: string; id: string }) => d.name == domainName
  );
}

export function getTestDomainId(domainName = 'DS-GVO') {
  return getTestDomain(domainName).id;
}
