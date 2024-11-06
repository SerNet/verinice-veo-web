import { getRandomElementType } from '../../commands/utils';
import { UnitDetails, generateUnitDetails } from '../../support/setupHelpers';
let unitDetails: UnitDetails;

describe.skip('Add Elements to other Domain', () => {
  before(() => {
    unitDetails = generateUnitDetails('addElementToOtherDomain');
    cy.login();
    cy.importUnit(unitDetails.name, { fixturePath: 'units/test-unit-dsgvo.json' });
    cy.goToUnitSelection();
    cy.addDomain(unitDetails.name, 'IT-Grundschutz');
  });

  beforeEach(() => {
    cy.login();
    cy.goToUnitSelection();
    cy.acceptAllCookies();
    cy.selectUnit(unitDetails.name);
  });

  after(() => cy.deleteUnit(unitDetails.name));

  const elementTypeList: string[] = ['Scopes', getRandomElementType()];

  elementTypeList.forEach((elementType) => {
    it('Add Element of type ' + elementType + ' to other Domain', () => {
      navigateToElementType(elementType);
      const targetDomain = 'IT-Grundschutz';
      let targetObjects = []; // Initialize array to store target objects and statuses
      let originalElementName;

      cy.selectFirstSubType(elementType, ($subType) => {
        cy.wrap($subType).click();

        cy.checkSubTypePage($subType[0].innerText);

        cy.getCustom('.v-data-table__tr').first().as('originalRow');

        cy.getCustom('@originalRow').then(($row) => {
          const cells = $row.children();
          const texts = [];
          cells.each((index, cell) => {
            texts.push(Cypress.$(cell).text());
          });
          originalElementName = texts[2];

          cy.wrap($row)
            .find('[data-veo-test="object-overview-assign-button"]')
            .should('exist')
            .then(($button) => {
              cy.wrap($button).scrollIntoView().should('be.visible').click();
            });
          cy.wait(200);
        });

        cy.getCustom('[data-veo-test="dialog-card"]').as('container');

        cy.getCustom('@container')
          .find('.v-list-item.v-list-item--link:not(.v-list-item--disabled)')
          .each(($item) => {
            const text = $item.find('.v-list-item-title').text().trim();
            if (text === targetDomain) {
              cy.wait(200);

              cy.wrap($item).find('.v-icon--clickable').click({ force: true });

              cy.wrap($item).find('[data-veo-test="subtype-select"] .v-field').first().click({ force: true });
              cy.wait(200);

              cy.getCustom('.v-menu')
                .should('be.visible')
                .first()
                .within(() => {
                  cy.getCustom('.v-list-item:not(.v-list-item--disabled)').then(($dropdownItems) => {
                    const randomIndex = Math.floor(Math.random() * $dropdownItems.length);
                    const $randomItem = $dropdownItems.eq(randomIndex);
                    const targetObject = $randomItem.find('.v-list-item-title').text().trim();
                    cy.wait(200);
                    cy.wrap($randomItem).click();
                    targetObjects.push({ object: targetObject });
                  });
                });

              cy.wrap($item).find('[data-veo-test="status-select"] .v-field').first().click({ force: true });
              cy.getCustom('.v-menu')
                .should('be.visible')
                .first()
                .within(() => {
                  cy.getCustom('.v-list-item:not(.v-list-item--disabled)').then(($dropdownItems) => {
                    const randomIndex = Math.floor(Math.random() * $dropdownItems.length);
                    const $randomItem = $dropdownItems.eq(randomIndex);
                    const targetObjectStatus = $randomItem.find('.v-list-item-title').text().trim();
                    cy.wrap($randomItem).click();

                    targetObjects[targetObjects.length - 1].status = targetObjectStatus;
                    targetObjects[targetObjects.length - 1].name = originalElementName;
                  });
                });
              cy.getCustom('@container').contains('button', 'Save').should('exist').click();
              veoAlertDismiss();
            }
          });
      });

      cy.then(() => {
        cy.selectDomain(targetDomain);
        navigateToElementType(elementType);
        let _foundCount = 0;
        targetObjects.forEach((target) => {
          const targetObject = target.object;
          const targetObjectStatus = target.status;
          const targetObjectName = target.name;
          let targetSubType;
          const normalizeString = (str) => str.toLowerCase().replace(/[^a-z]/g, '');
          cy.containsCustom('div[sub-group="true"] > div', new RegExp(`^${elementType}$`))
            .should('be.visible')
            .parent()
            .find('a')
            .then(($subTypes) => {
              const $matchingSubType = $subTypes.filter((index, $subType) => {
                return normalizeString(Cypress.$($subType).text().trim()) === normalizeString(targetObject);
              });
              if ($matchingSubType.length > 0) {
                targetSubType = $matchingSubType.first();
                cy.wrap(targetSubType).click();
              }
            });

          cy.wait(200);

          cy.getCustom('tr')
            .filter(`:contains("${targetObjectName}")`)
            .filter(`:contains("${targetObjectStatus}")`)
            .then(($rows) => {
              if ($rows.length === 1) {
                _foundCount++;
              }
            });
        });
        targetObjects = [];
      });
    });

    const navigateToElementType = (elementType: string) => {
      cy.navigateTo({ group: 'objects', category: elementType });
    };

    const veoAlertDismiss = () => {
      cy.getCustom('div[role="alert"][params="[object Object]"]').click();
    };
  });
});
