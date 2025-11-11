let testDomain;
let testUnit;
const baseUrl = Cypress.config().baseUrl;

const defaultImpacts = [
  { name: 'Low Impact', description: 'Low impact description' },
  { name: 'Medium Impact', description: 'Medium impact description' }
];

let impactCount = 0;

// Helpers
function saveAndMaybeConfirm(hasConfirmationDialog = true) {
  cy.intercept('GET', `${Cypress.env('veoApiUrl')}/domains/${testDomain.id}`).as('isGettingDomain');
  cy.getCustom('button:not([disabled])').contains('Save risk definition').click();
  if (hasConfirmationDialog) {
    cy.getCustom('[data-veo-test="base-dialog"]').within(() => {
      cy.get('[data-veo-test="save-risk-definition-confirm-button"]').should('be.visible').click();
    });
  }
  cy.wait('@isGettingDomain');
}

function verifyRedirectToRiskDefinition() {
  cy.getCustom('h1').should('contain.text', 'DSA');
}

function switchToEnglishTranslation() {
  cy.getCustom('[data-veo-test="risk-category-translation-tab-en"]').click();
}

function startCategoryCreation() {
  cy.getCustom('[data-veo-test="add-risk-category-button"]').click();
  cy.url().should('contain', `/risks/DSA/edit`);
}

function fillCategoryBasics(name: string, description: string) {
  switchToEnglishTranslation();
  cy.getCustom('[data-veo-test="risk-category-editor-input-name-en"]').within(() => {
    cy.get('input').click().clear().type(name);
  });
  cy.getCustom('[data-veo-test="risk-category-editor-input-description-en"]').within(() => {
    cy.get('textarea, input').first().click().clear().type(description);
  });
}

function moveToImpactsStepAndStart() {
  cy.get('[data-veo-test="risk-category-impacts-step"]').click();
  cy.get('[data-veo-test="create-impact-button"]').click();
}

function addImpact(name: string, description: string, isFirstImpact = false) {
  if (!isFirstImpact) {
    cy.get('[data-veo-test="risk-definition-editor-add-button"]').last().click();
  }

  const index = isFirstImpact ? 0 : impactCount || 1;
  impactCount = index + 1;

  cy.getCustom(`[data-veo-test="risk-definition-editor-tab-${index}"]`).last().click();
  cy.get('[data-veo-test="risk-definition-editor-translation-tab-en"]').last().click();

  cy.get('[data-veo-test="risk-definition-editor-input-name-en"]')
    .last()
    .within(() => {
      cy.get('input').clear().type(name);
    });
  cy.get('[data-veo-test="risk-definition-editor-input-description"]')
    .last()
    .within(() => {
      cy.get('textarea').clear().type(description);
    });
}

function createImpacts(impacts = defaultImpacts) {
  moveToImpactsStepAndStart();

  impacts.forEach((impact, idx) => {
    addImpact(impact.name, impact.description, idx === 0);
  });
}

// Helper: convert hex to rgb string for Cypress color comparison
function hexToRgb(hex: string): string {
  hex = hex.replace('#', '');
  const bigint = parseInt(hex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgb(${r}, ${g}, ${b})`;
}

describe('Risk Definitions with one category', () => {
  beforeEach(() => {
    // Reset impact counter before each test
    impactCount = 0;
    cy.deleteTestUnits().then(() =>
      cy.deleteDomain().then(() =>
        cy.createDomain().then(() =>
          cy
            .createRiskDefinition()
            .then(() => {
              testDomain = Cypress.env('dynamicTestData').testDomain;
              cy.setupVeo('risk-definitions', [testDomain.name], false);
            })
            .then(() => {
              testUnit = Cypress.env('dynamicTestData').testUnits[0];
              cy.visit(`${testUnit.unitId}/domains/${testDomain.id}/risks/DSA`, { failOnStatusCode: false });
            })
        )
      )
    );
  });

  it('should display cross category values correctly', () => {
    cy.fixture('risk-definition.json').then((fixture) => {
      // riskValues from fixture
      const riskValues = fixture.riskValues.map((val) => ({
        text: val.translations.en.name,
        color:
          Cypress.$('<div>')
            .css('color', val.htmlColor)
            .css('background-color', val.htmlColor)
            .css('background-color') || val.htmlColor.replace(/^#/, 'rgb(') // fallback for rgb
      }));

      riskValues.forEach((val, idx) => {
        cy.getCustom(`[data-veo-test="risk-property-${idx}"]`)
          .eq(0)
          .find('.v-chip__content')
          .should('contain.text', val.text);
        cy.get(`[data-veo-test="risk-property-${idx}"]`).eq(0).should('have.css', 'background-color', val.color);
      });

      // probabilityLevels from fixture
      const probabilityLevels = fixture.probability.levels.map((level) => ({
        text: level.translations.en.name,
        color:
          Cypress.$('<div>')
            .css('color', level.htmlColor)
            .css('background-color', level.htmlColor)
            .css('background-color') || level.htmlColor.replace(/^#/, 'rgb(')
      }));

      probabilityLevels.forEach((val, idx) => {
        cy.getCustom(`[data-veo-test="risk-property-${idx}"]`)
          .eq(1)
          .find('.v-chip__content')
          .should('contain.text', val.text);
        cy.get(`[data-veo-test="risk-property-${idx}"]`).eq(1).should('have.css', 'background-color', val.color);
      });
    });
  });

  it('should show the correct values inside the risk matrix', () => {
    cy.fixture('risk-definition.json').then((fixture) => {
      // Probability headers
      cy.getCustom('[data-veo-test="risk-matrix-probabilities"] tr')
        .eq(1)
        .find('th')
        .then(($ths) => {
          // The first two ths are empty, skip them
          fixture.probability.levels.forEach((level, idx) => {
            const th = $ths.eq(idx + 2);
            cy.wrap(th).should('contain.text', level.translations.en.name);
            cy.wrap(th).should('have.css', 'background-color', hexToRgb(level.htmlColor));
          });
        });

      // Impact row headers (matrix rows are reversed)
      const impacts = fixture.categories[0].potentialImpacts.slice().reverse();
      cy.getCustom('[data-veo-test="risk-matrix-impacts-and-values"] tr')
        .not(':first')
        .each(($tr, rowIdx) => {
          cy.wrap($tr)
            .find('td')
            .eq(0)
            .then(($td) => {
              cy.wrap($td).should('contain.text', impacts[rowIdx].translations.en.name);
              cy.wrap($td).should('have.css', 'background-color', hexToRgb(impacts[rowIdx].htmlColor));
            });
        });

      // Matrix cells
      const riskValues = fixture.riskValues;
      const valueMatrix = fixture.categories[0].valueMatrix.slice().reverse(); // reverse for display order

      cy.getCustom('[data-veo-test="risk-matrix-impacts-and-values"] tr')
        .not(':first')
        .each(($tr, rowIdx) => {
          // skip first td (impact header), then check each cell
          cy.wrap($tr)
            .find('td')
            .not(':first')
            .each(($td, colIdx) => {
              const cell = valueMatrix[rowIdx][colIdx];
              const expectedRiskValue = riskValues.find((rv) => rv.ordinalValue === cell.ordinalValue);
              cy.wrap($td).find('span').should('contain.text', expectedRiskValue.translations.en.name);
              cy.wrap($td).find('div').should('have.css', 'background-color', hexToRgb(expectedRiskValue.htmlColor));
            });
        });
    });
  });

  // Cross-category values
  it('should edit the name of a risk value', () => {
    const testString = 'New Risk Value Name';
    cy.getCustom('[data-veo-test="risk-cross-category-edit"]').click();
    cy.url().should('eq', `${baseUrl}/${testUnit.unitId}/domains/${testDomain.id}/risks/DSA/edit`);

    cy.get('[data-veo-test="risk-definition-editor-translation-tab-en"').click();
    cy.get('[data-veo-test="risk-definition-editor-input-name-en"] input').click().clear().type(testString);

    saveAndMaybeConfirm(false);
    verifyRedirectToRiskDefinition();

    // Check if risk values have been updated
    cy.getCustom('[data-veo-test="risk-property-0"]').should('contain.text', testString);
    cy.get('td').then(($tds) => {
      const texts = $tds.map((index, td) => td.innerText.trim()).get();
      expect(texts).to.include(testString);
    });
  });

  it('should edit the name of a probability level', () => {
    const testString = 'New Probability Name';
    cy.getCustom('[data-veo-test="risk-cross-category-edit"]').click();
    cy.url().should('eq', `${baseUrl}/${testUnit.unitId}/domains/${testDomain.id}/risks/DSA/edit`);

    // Move to probability tab
    cy.contains(/edit probabilities/i).click();

    cy.getCustom('[data-veo-test="risk-definition-editor-translation-tab-en"]').last().click();
    cy.getCustom('[data-veo-test="risk-definition-editor-input-name-en"]')
      .first()
      .within(() => {
        cy.get('input').click().clear().type(testString);
      });

    saveAndMaybeConfirm(false);
    verifyRedirectToRiskDefinition();

    // Check if probability values have been updated
    cy.getCustom('[data-veo-test="risk-property-0"]').eq(1).should('contain.text', testString);

    // Check if risk matrices have been updated - probability headers should contain new name
    cy.getCustom('[data-veo-test="risk-matrix-probabilities"] th').then(($ths) => {
      const texts = [...$ths].map((th) => th.innerText.trim());
      expect(texts).to.include(testString);
    });
  });

  it('should delete a probability level', () => {
    // Store probability level name from fixture for later comparison
    let probabilityToDelete: string;
    cy.fixture('risk-definition.json').then((fixture) => {
      probabilityToDelete = fixture.probability.levels[2].translations.en.name;

      // Go probabilities tab
      cy.getCustom('[data-veo-test="risk-cross-category-edit"]').click();
      cy.contains(/edit probabilities/i).click();

      // Delete probability
      cy.getCustom('button')
        .contains(probabilityToDelete)
        .click()
        .then(() => {
          cy.get(`[data-veo-test="risk-definition-editor-remove-button-${probabilityToDelete}"]`).click();
        });

      saveAndMaybeConfirm();
      verifyRedirectToRiskDefinition();

      // Verify probability level was removed
      cy.getCustom('[data-veo-test="risk-property-container"]').eq(1).should('not.contain.text', probabilityToDelete);

      // Verify removed from matrix headers
      cy.getCustom('[data-veo-test="risk-matrix-probabilities"] th').should('not.contain.text', probabilityToDelete);
    });
  });

  it('should create a probability level', () => {
    const newProbability = {
      name: 'Extremely High',
      description: 'Almost certain to occur',
      color: '#FF0000'
    };

    let firstRiskValueName: string;
    cy.fixture('risk-definition.json').then((fixture) => {
      // Store first risk value name for later matrix filling
      firstRiskValueName = fixture.riskValues[0].translations.en.name;
    });

    // Open editor and go to probabilities tab
    cy.getCustom('[data-veo-test="risk-cross-category-edit"]').click();
    cy.contains(/edit probabilities/i).click();

    // Add new probability level
    cy.getCustom('[data-veo-test="risk-definition-editor-add-button"]').last().click();

    // Set name and description
    cy.getCustom('[data-veo-test="risk-definition-editor-translation-tab-en"]').last().click();
    cy.getCustom('[data-veo-test="risk-definition-editor-input-name-en"]')
      .last()
      .within(() => {
        cy.get('input').clear().type(newProbability.name);
      });
    cy.get('[data-veo-test="risk-definition-editor-input-description"]')
      .last()
      .within(() => {
        cy.get('textarea').clear().type(newProbability.description);
      });

    // Move to next step (criteria) to find the matrix
    cy.get('[data-veo-test="next-btn"]').click();

    // Fill the new matrix column - find all cells containing N.N.
    cy.getCustom('[data-veo-test="risk-matrix"]').within(() => {
      // Each td that contains N.N. needs to be clicked and filled
      cy.get('td').each(($td) => {
        if ($td.text().includes('N.N.')) {
          cy.wrap($td).within(() => {
            cy.get('.v-autocomplete').click();
            cy.get('input').type('{downArrow}{enter}');
          });
        }
      });
    });

    saveAndMaybeConfirm();
    verifyRedirectToRiskDefinition();

    // Verify new probability appears in list and matrix
    cy.getCustom('[data-veo-test="risk-property-container"]')
      .eq(1)
      .within(() => {
        cy.contains(newProbability.name).should('exist');
      });

    // Verify matrix headers
    cy.getCustom('[data-veo-test="risk-matrix-probabilities"] th').should('contain.text', newProbability.name);

    // Verify matrix cells in last row show selected risk value
    cy.get('[data-veo-test="risk-matrix-impacts-and-values"]').within(() => {
      cy.get('tr')
        .last()
        .find('td')
        .not(':first')
        .each(($td) => {
          cy.wrap($td).should('contain.text', firstRiskValueName);
        });
    });
  });

  it('should create a new risk risk category without impacts and matrix', () => {
    const name = 'New Criterion Name';
    const description = 'New Criterion Description';

    startCategoryCreation();
    fillCategoryBasics(name, description);
    saveAndMaybeConfirm();
    verifyRedirectToRiskDefinition();

    cy.contains(name).should('exist');
  });

  it('should create a risk risk category with impacts but without a matrix', () => {
    const newName = 'Risk Category With Impacts';
    const newDescription = 'A risk category with two impacts';
    const impacts = defaultImpacts;

    startCategoryCreation();
    fillCategoryBasics(newName, newDescription);
    createImpacts();
    saveAndMaybeConfirm();
    verifyRedirectToRiskDefinition();

    cy.contains(newName)
      .should('exist')
      .closest('.v-card')
      .within(() => {
        // Verify all impacts are shown as chips
        impacts.forEach((impact, idx) => {
          cy.get(`[data-veo-test="risk-property-${idx}"]`).should('exist').and('contain.text', impact.name);
        });
      });
  });

  it('should create a new risk risk category with a matrix', () => {
    const newName = 'Risk Category With Matrix';
    const newDescription = 'A risk category with impacts and matrix';
    const impacts = defaultImpacts;

    startCategoryCreation();
    fillCategoryBasics(newName, newDescription);
    createImpacts();

    // Create matrix
    cy.get('[data-veo-test="risk-category-matrix-step"]').click();
    cy.get('[data-component-name="risk-definition-wizard"]').within(() => {
      cy.get('[data-veo-test="alert-button-0"]').click();
    });

    // Fill matrix cells with risk values
    cy.getCustom('[data-veo-test="risk-matrix"]').within(() => {
      // For each cell in the matrix, select a risk value
      cy.get('.v-autocomplete').each(($select, index) => {
        // Pick different risk values in a cycle (0,1,2,3,0,1,2,3,...)
        const valueIndex = index % 4;
        cy.wrap($select)
          .click()
          .type(`{downArrow}`.repeat(valueIndex + 1) + `{enter}`);
      });
    });

    // Save and confirm
    cy.intercept('GET', `${Cypress.env('veoApiUrl')}/domains/${testDomain.id}`).as('isGettingDomain');
    cy.getCustom('button:not([disabled])').contains('Save risk definition').click();
    cy.get('[data-veo-test="save-risk-definition-confirm-button"]').should('be.visible').click();

    // Wait for redirect
    cy.wait('@isGettingDomain');
    cy.getCustom('h1').should('contain.text', 'DSA');

    // New criterion exists with impacts and matrix
    cy.contains(newName)
      .should('exist')
      .closest('.v-card')
      .within(() => {
        // Matrix exists and shows impacts
        cy.get('[data-veo-test="risk-matrix"]').should('exist');
        impacts.forEach((impact) => {
          cy.contains(impact.name).should('exist');
        });

        // Matrix cell values
        cy.getCustom('[data-veo-test="risk-matrix-impacts-and-values"]').within(() => {
          // Skip first row (headers) and first column (impact names) of each row
          cy.get('tr')
            .not(':first')
            .each(($tr, rowIndex) => {
              cy.wrap($tr)
                .find('td')
                .not(':first')
                .each(($td, colIndex) => {
                  const expectedValueIndex = (rowIndex * 4 + colIndex) % 4;

                  // Get expected risk value name from fixture
                  cy.fixture('risk-definition.json').then((fixture) => {
                    const expectedValue = fixture.riskValues[expectedValueIndex];

                    // Check if cell contains correct risk value name
                    cy.wrap($td).find('span').should('contain.text', expectedValue.translations.en.name);
                  });
                });
            });
        });
      });
  });
});

describe('Risk definitions with two categories', () => {
  beforeEach(() => {
    // ensure global counter reset for this suite as well
    impactCount = 0;
    // Reset environment and create fixture
    cy.deleteTestUnits().then(() =>
      cy.deleteDomain().then(() =>
        cy.createDomain().then(() =>
          cy
            .createRiskDefinition('risk-definition-2-categories.json')
            .then(() => {
              testDomain = Cypress.env('dynamicTestData').testDomain;
              cy.setupVeo('risk-definitions', [testDomain.name], false);
            })
            .then(() => {
              testUnit = Cypress.env('dynamicTestData').testUnits[0];
              cy.visit(`${testUnit.unitId}/domains/${testDomain.id}/risks/DSA`, { failOnStatusCode: false });
            })
        )
      )
    );
  });

  it('should delete a risk category', () => {
    const categoryName = 'Asian Veggie Delights';

    // Find category by name and locate trash button within its card
    cy.contains(categoryName)
      .closest('.v-card')
      .within(() => {
        cy.get('[data-veo-test="delete-category"]').click();
      });

    // Confirm deletion in dialog
    cy.contains('button', 'Yes').click();

    // Wait for domain refresh after delete
    cy.intercept('GET', `${Cypress.env('veoApiUrl')}/domains/${testDomain.id}`).as('isGettingDomain');
    cy.wait('@isGettingDomain');

    // Verify category no longer exists
    cy.contains(categoryName).should('not.exist');
  });
});
