// elementHelpers.ts
const testData = {
  statusOptions: ['Archived', 'New', 'In progress', 'Released', 'For review'] as Status[],
  element: {
    description: 'Cypress testElement',
    get abbreviation() {
      return `Abb_${Math.floor(Math.random() * 1000)}`;
    },
    get name() {
      return Cypress.env('dynamicTestData').testObject.subTypePlural;
    }
  }
};
export type Actions = 'Create object' | 'Select object' | 'Create scope' | 'Select scope' | 'Create risk';
export type Tabs = 'parentScopes' | 'links' | 'risks' | 'childScopes' | 'childObjects';
export type Status = 'Archived' | 'New' | 'In progress' | 'Released' | 'For review';
export const ElementActions = {
  selectRandomStatus: (list: Status[]) => list[Math.floor(Math.random() * list.length)],

  selectElement: (isRisk: boolean = false) => {
    // Find the dialog container
    cy.getCustom('[data-veo-test="dialog-card"]').as('container');

    // Find the first enabled row and check its checkbox
    cy.getCustom('@container')
      .find('tbody.v-data-table__tbody tr.v-data-table__tr')
      .find('input[type="checkbox"]:not(:disabled)')
      .first() // Select the first non-disabled checkbox
      .check() // Check the checkbox
      .closest('tr') // Get the closest row containing this checkbox
      .as('selectedRowText'); // Save the row text for later use

    if (isRisk) cy.getCustom('.v-overlay-container').containsCustom('create risk').click();
    else cy.getCustom('.v-card-actions button').contains('Save').click({ force: true });

    // Now, use the saved text to confirm that the row exists
    cy.get('@selectedRowText').then((selectedRowText) => {
      cy.getCustom('tr')
        .filter((index, row) => {
          const rowText = Cypress.$(row).text();
          if (!isRisk) return rowText.includes(selectedRowText.text().trim());
          else return selectedRowText.text().trim().includes(rowText);
        })
        .should('exist'); // Assert that the row with the selected text exists
    });
  },

  createElement: (status: Status) => {
    cy.getCustom('[data-veo-test="dialog-card"]').as('container');
    cy.log(testData.element.abbreviation);
    cy.getCustom('@container').find('input[id="#/properties/abbreviation"]').type(testData.element.abbreviation);
    cy.getCustom('@container').find('input[id="#/properties/name"]').type(testData.element.name);
    cy.getCustom('div[data-attribute-name="subType"]').click();
    cy.getCustom('.v-overlay-container div[role="listbox"]').first().click();
    cy.getCustom('@container').find('div[data-attribute-name="status"]').click();
    cy.getCustom('.v-overlay-container div[role="listbox"]').contains(status).click();
    cy.getCustom('.v-overlay__content .v-field__input').contains(status);
    cy.intercept('POST', `${Cypress.env('veoApiUrl')}/domains/**/**?scopes=**`).as('createElement');
    cy.getCustom('.v-card-actions button').contains('Save').click({ force: true });
    cy.wait(['@createElement']).its('response.statusCode').should('eq', 201);
    cy.getCustom('tr')
      .filter((_, row) => {
        const rowText = Cypress.$(row).text();
        return (
          rowText.includes(testData.element.abbreviation) && rowText.includes(`${name}`) && rowText.includes(status)
        );
      })
      .should('exist');
  },

  performAction: (action: Actions) => {
    const status = ElementActions.selectRandomStatus(testData.statusOptions);
    function selectType() {
      cy.getCustom('[data-veo-test="select-object-type"]').click();
      cy.get('.v-overlay-container [role="listbox"]').first().click();
      cy.getCustom('[data-veo-test="confirm-object-type"]').click();
    }
    const actionsMap = {
      'Create object': () => {
        selectType();
        ElementActions.createElement(status);
      },
      'Select object': () => {
        selectType();
        ElementActions.selectElement();
      },
      'Create scope': () => ElementActions.createElement(status),
      'Select scope': () => ElementActions.selectElement(),
      'Create risk': () => ElementActions.selectElement(true)
    };
    actionsMap[action]?.();
  },

  verifyAndPerformTabActions: (tab: Tabs, actions: Actions[]) => {
    cy.get('[data-component-name="object-details-actions-button"]').click();

    cy.get('[data-veo-test="action-selection-nav-item"]').then(($items) => {
      const availableActions = $items.toArray().map((item) => item.innerText.trim());
      cy.get('[data-component-name="object-details-actions-button"]').click();
      availableActions.forEach((action) => {
        if (!actions.includes(action as Actions)) return;
        cy.getCustom('[data-component-name="object-details-actions-button"]').click();
        cy.containsCustom('[data-veo-test="action-selection-nav-item"]', action).click();
        ElementActions.performAction(action as Actions);
        cy.get(`[data-component-name="object-details-${tab}-tab"]`).click();
      });
    });
  }
};
