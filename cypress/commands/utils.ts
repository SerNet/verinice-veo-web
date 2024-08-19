export function getRandomString(length = 8) {
  return Math.random().toString(36).substr(2, length);
}

export function getRandomElementType(
  elementTypes: string[] = ['Process', 'Asset', 'Person', 'Incident', 'Document', 'Scenario', 'Control']
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
