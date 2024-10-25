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
export function waitForLoadersToDisappear() {
  cy.get('.v-skeleton-loader').should('not.exist');
  cy.get('[loading=true]').should('not.exist');
  cy.get('[role=progressbar]:visible').should('not.exist');
}
