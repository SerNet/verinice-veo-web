/*
 * verinice.veo web
 * Copyright (C) 2021  Davit Svandize, Jonas Heitmann
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
/// <reference path="../../support/index.d.ts" />
/// <reference types="cypress" />

import { times } from 'lodash';
import { JsonPointer } from 'json-ptr';

import { generateTos, getEditorData, ITo } from '../../support/utils';

let schemaRealValues: { text: string; numberOfProperties: number }[] = [];

const attributeTypes = [
  { value: 'string', text: 'Text' },
  { value: 'boolean', text: 'Wahrheitswert' },
  { value: 'number', text: 'Zahl' },
  { value: 'integer', text: 'Ganzzahl' },
  { value: 'enum', text: 'Auswahl' }
];

const changedAttributes = [
  {
    writeTitle: 'Test',
    selectType: attributeTypes[0],
    writeDescription: 'Test'
  },
  {
    writeTitle: 'Test',
    selectType: attributeTypes[1],
    writeDescription: 'Test'
  }
];

const addAttributes = [
  {
    writeTitle: 'a',
    selectType: attributeTypes[0],
    writeDescription: 'a'
  },
  {
    writeTitle: 'b',
    selectType: attributeTypes[1],
    writeDescription: ''
  },
  {
    writeTitle: 'c',
    selectType: attributeTypes[2],
    writeDescription: 'c'
  },
  {
    writeTitle: 'd',
    selectType: attributeTypes[3],
    writeDescription: ''
  },
  {
    writeTitle: 'e',
    selectType: attributeTypes[4],
    writeDescription: 'e',
    checkMultiple: false,
    enum: ['a', 'b', 'c', 'd']
  },
  {
    writeTitle: 'f',
    selectType: attributeTypes[4],
    writeDescription: '',
    checkMultiple: true,
    enum: ['a', 'b', 'c', 'd']
  }
];

const addTestTwoAttribute = {
  writeTitle: 'a',
  selectType: attributeTypes[0],
  writeDescription: 'a'
};

const tos = generateTos({
  testschema: {
    requestUrlPattern: /.*\/schemas\/testschema.*/,
    fixturePath: 'api/default/schemas/os_testschema.json',
    browserUrl: '/editor/objectschema?os=testschema'
  },
  empty: {
    requestUrlPattern: /.*\/schemas\/empty.*/,
    fixturePath: 'api/default/schemas/os_empty.json',
    browserUrl: '/editor/objectschema?os=empty'
  }
});

function goTo(to: ITo) {
  cy.intercept(
    {
      method: 'GET',
      url: to.requestUrlPattern
    },
    (req) => {
      req.reply({
        fixture: to.fixturePath
      });
    }
  ).as('loadedSchema');

  cy.goTo('/editor/').goTo(to.browserUrl);

  cy.wait(['@loadedSchema']);

  /**
   * Define aliases
   */
  cy.get('.v-expansion-panel').as('expansionPanels');
  cy.get('@expansionPanels').find('button.v-expansion-panel-header').as('expansionPanelHeaders');
  cy.get('@expansionPanels').find('.v-expansion-panel-content').as('expansionPanelContent');
}

describe('Objectschema Editor', () => {
  before(() => {
    cy.auth();

    cy.interceptLayoutCalls();

    cy.fixture('api/default/schemas/os_testschema.json').then((_testSchema) => {
      schemaRealValues = [
        // -3 = customAspects, customLinks, translations
        { text: 'Standardattribute', numberOfProperties: Object.keys(_testSchema.properties).length - 3 },
        {
          text: 'Individuelle Aspekte',
          numberOfProperties: Object.keys(_testSchema.properties.customAspects.properties).length
        },
        {
          text: 'Individuelle Links',
          numberOfProperties: Object.keys(_testSchema.properties.links.properties).length
        }
      ];
    });

    /**
     * Navigate through Wizard to ObjectSchemaEditor
     */
    cy.visit('/editor/');
    cy.wait('@G_fetchSchemas');
  });
  beforeEach(() => {
    cy.interceptLayoutCalls();
  });

  it('compares number of basic properties, aspects and links comply with sum in expansion panel title', function () {
    goTo(tos.testschema);
    cy.get('@expansionPanelHeaders').each((el, i) => {
      const expansionPanelText = el[0].childNodes[0].nodeValue.trim();
      cy.wrap(expansionPanelText).should('equal', `${schemaRealValues[i].text} (${schemaRealValues[i].numberOfProperties})`);
    });
  });

  it('deletes aspect with outer delete button', function () {
    goTo(tos.testschema);
    cy.get('@expansionPanelContent').eq(1).find('.v-expansion-panel-content__wrap').children().should('have.length', schemaRealValues[1].numberOfProperties);
    cy.contains('Aspekt1').closest('.v-list-item').find('.v-btn').eq(1).click();
    cy.get('.v-dialog--active .v-card__actions .v-btn').contains('Löschen').click();
    cy.get('@expansionPanelContent')
      .eq(1)
      .find('.v-expansion-panel-content__wrap')
      .children()
      .should('have.length', schemaRealValues[1].numberOfProperties - 1);

    cy.get('.editor .cm-content').then((editor) => {
      cy.wrap(getEditorData(editor)).as('currentOS');
      cy.get('@currentOS').then((currentOS) => {
        cy.wrap(JsonPointer.get(currentOS, '#/properties/customAspects/properties/testSchema_Aspekt1')).should('be.undefined');
      });
    });
  });

  it('changes customAspect name, attribute names, description and types', function () {
    goTo(tos.testschema);
    cy.contains('Aspekt1').closest('.v-list-item').find('.v-btn').first().click();
    cy.get('.v-dialog--active').within(() => {
      cy.contains('Name *').closest('.v-text-field').type('Test');

      cy.get('.v-form .v-list > .veo-attribute-list-attribute:not(:last-child)').each((el, wrapperIndex) => {
        cy.wrap(el).within(() => {
          const currentAttrData = changedAttributes[wrapperIndex];
          if (currentAttrData) {
            cy.contains('Name des Attributs *').closest('.v-text-field').type(currentAttrData.writeTitle);
            cy.contains('Typ des Attributs').closest('.v-select').type(`${currentAttrData.selectType.text}{enter}`);
            cy.contains('Beschreibung').closest('.v-text-field').type(currentAttrData.writeDescription);
          }
        });
      });
      cy.get('.v-card__actions').contains('Speichern').closest('.v-btn').click();
    });

    cy.get('.editor .cm-content').then((editor) => {
      cy.wrap(getEditorData(editor)).as('currentOS');
      cy.get('@currentOS').then((currentOS) => {
        cy.wrap(JsonPointer.get(currentOS, '#/properties/customAspects/properties/testSchema_Aspekt1Test')).should('not.be.undefined');
      });

      cy.get('@currentOS')
        .then((currentOS) => JsonPointer.get(currentOS, '#/properties/customAspects/properties/testSchema_Aspekt1Test'))
        .as('aspect')
        .then((aspect: any) => {
          cy.wrap(aspect.properties.attributes.properties).toMatchSnapshot();
        });
    });
  });

  it('removes and adds aspect attributes', function () {
    goTo(tos.testschema);
    // Open aspect
    cy.contains('Aspekt1').closest('.v-list-item').find('.v-btn').first().click();

    cy.get('.v-dialog--active').within(() => {
      // Delete all 3 existing attributes
      times(3, () => {
        cy.get('.v-form .v-list > .veo-attribute-list-attribute:not(:last-child) .v-list-item__action > .v-btn').eq(0).click();
      });

      // Add 6 new attributes
      times(6, () => {
        cy.contains('Attribut hinzufügen').closest('.v-btn').click();
      });

      cy.get('.v-form .v-list > .veo-attribute-list-attribute:not(:last-child)').each((el, wrapperIndex) => {
        cy.wrap(el).within(() => {
          const currentAttrData = addAttributes[wrapperIndex];
          if (currentAttrData) {
            cy.contains('Name des Attributs *').closest('.v-text-field').type(currentAttrData.writeTitle);
            cy.contains('Typ des Attributs').closest('.v-select').type(`${currentAttrData.selectType.text}{enter}`);

            if (currentAttrData.writeDescription) {
              cy.contains('Beschreibung').closest('.v-text-field').type(currentAttrData.writeDescription);
            }
            if (currentAttrData.enum) {
              if (currentAttrData.checkMultiple) {
                cy.contains('Mehrfachauswahl').closest('.v-input--checkbox').click();
              }
              cy.contains('Werte (mit Enter trennen)')
                .closest('.v-autocomplete')
                .type(`${currentAttrData.enum.join('{enter}')}{enter}`);
            }
          }
        });
      });
    });
    cy.get('.v-card__actions').contains('Speichern').closest('.v-btn').click();

    cy.get('.editor .cm-content').then(function (editor) {
      cy.wrap(getEditorData(editor)).as('currentOS');
      cy.get('@currentOS')
        .then((currentOS) => {
          return JsonPointer.get(currentOS, '#/properties/customAspects/properties/testSchema_Aspekt1') || null;
        })
        .as('aspect')
        .should('not.be.null');
      cy.get('@aspect').then((aspect: any) => {
        cy.wrap(aspect.properties.attributes.properties).toMatchSnapshot();
      });
    });
  });

  it('opens dialog to create a new aspect and clicks close button to discard changes', function () {
    goTo(tos.testschema);
    cy.contains('Aspekte hinzufügen').closest('.v-btn').click();

    cy.get('.v-dialog--active').within(() => {
      cy.contains('Name *').closest('.v-text-field').type('TestAspectOne{enter}');
      cy.get('.v-card__actions').contains('Schließen').closest('.v-btn').click();
    });

    cy.get('@expansionPanelContent').eq(1).find('.v-card .v-list-item:first-child .v-list-item__content .v-list-item__title').should('not.contain.text', 'TestAspectOne');

    cy.get('.editor .cm-content').then((editor) => {
      cy.wrap(getEditorData(editor)).as('currentOS');
      cy.get('@currentOS')
        .then((currentOS) => {
          return JsonPointer.get(currentOS, '#/properties/customAspects/properties/testSchema_TestAspectOne') || null;
        })
        .as('aspect')
        .should('be.null');
    });
  });

  it('adds completely new aspect and removes it from dialog with delete button', function () {
    goTo(tos.testschema);
    cy.contains('Aspekte hinzufügen').closest('.v-btn').click();

    cy.get('.v-dialog--active').within(() => {
      cy.contains('Name *').closest('.v-text-field').type('TestAspectTwo{enter}');
      cy.contains('Attribut hinzufügen').closest('.v-btn').click();
      cy.get('.v-form .v-list > .veo-attribute-list-attribute')
        .first()
        .then((el) => {
          cy.wrap(el).within(() => {
            const currentAttrData = addTestTwoAttribute;
            cy.contains('Name des Attributs *').closest('.v-text-field').type(currentAttrData.writeTitle);
            cy.contains('Typ des Attributs').closest('.v-select').type(`${currentAttrData.selectType.text}{enter}`);
            cy.contains('Beschreibung').closest('.v-text-field').type(currentAttrData.writeDescription);
          });
        });

      cy.get('.v-card__actions').contains('Speichern').closest('.v-btn').click();
    });

    cy.get('@expansionPanelContent').eq(1).find('.v-card .v-list-item:first-child .v-list-item__content .v-list-item__title').should('contain.text', 'TestAspectTwo');

    cy.get('.editor .cm-content').then((editor) => {
      cy.wrap(getEditorData(editor)).as('currentOS');
      cy.get('@currentOS')
        .then((currentOS) => {
          return JsonPointer.get(currentOS, '#/properties/customAspects/properties/testSchema_TestAspectTwo') || null;
        })
        .as('aspect')
        .should('not.be.null');
      cy.get('@aspect').then((aspect: any) => {
        cy.wrap(aspect.properties.attributes.properties).toMatchSnapshot();
      });
    });

    cy.contains('TestAspectTwo').closest('.v-list-item').find('.v-btn').first().click();
    cy.get('.v-dialog--active .v-card__actions').contains('Aspekt löschen').click();
    cy.get('.v-dialog--active .v-card__actions').contains('Löschen').click();
    cy.get('@expansionPanelContent').eq(1).find('.v-card .v-list-item:first-child .v-list-item__content .v-list-item__title').should('not.contain.text', 'TestAspectTwo');
    cy.get('.editor .cm-content').then((editor) => {
      cy.wrap(getEditorData(editor)).as('currentOS');
      cy.get('@currentOS')
        .then((currentOS) => {
          return JsonPointer.get(currentOS, '#/properties/customAspects/properties/testSchema_TestAspectTwo') || null;
        })
        .as('aspect')
        .should('be.null');
    });
  });

  it('deletes a link with outer delete button', function () {
    goTo(tos.testschema);
    cy.get('@expansionPanelContent').eq(2).find('.v-expansion-panel-content__wrap').children().should('have.length', schemaRealValues[2].numberOfProperties);
    cy.contains('Link1').closest('.v-list-item').find('.v-btn').eq(1).click();
    cy.get('.v-dialog--active .v-card__actions .v-btn').contains('Löschen').click();
    cy.get('@expansionPanelContent')
      .eq(2)
      .find('.v-expansion-panel-content__wrap')
      .children()
      .should('have.length', schemaRealValues[2].numberOfProperties - 1);

    cy.get('.editor .cm-content').then((editor) => {
      cy.wrap(getEditorData(editor)).as('currentOS');
      cy.get('@currentOS')
        .then((currentOS) => {
          return JsonPointer.get(currentOS, '#/properties/links/properties/testSchema_Link1') || null;
        })
        .as('link')
        .should('be.null');
    });
  });

  it('changes link name, attribute names, description and types', function () {
    goTo(tos.testschema);
    cy.contains('Link1').closest('.v-list-item').find('.v-btn').first().click();
    cy.get('.v-dialog--active').within(() => {
      cy.contains('Name *').closest('.v-text-field').type('Test');
      cy.contains('Typ des Linkziels *').closest('.v-select').should('contain.text', 'Scope').type('Asset{enter}');
      cy.contains('Link Subtyp').closest('.v-select').type('Datenart{enter}');

      cy.get('.v-form .v-list > .veo-attribute-list-attribute:not(:last-child)').each((el, wrapperIndex) => {
        cy.wrap(el).within(() => {
          const currentAttrData = changedAttributes[wrapperIndex];
          if (currentAttrData) {
            cy.contains('Name des Attributs *').closest('.v-text-field').type(currentAttrData.writeTitle);
            cy.contains('Typ des Attributs').closest('.v-select').type(`${currentAttrData.selectType.text}{enter}`);
            cy.contains('Beschreibung').closest('.v-text-field').type(currentAttrData.writeDescription);
          }
        });
      });
      cy.get('.v-card__actions').contains('Speichern').closest('.v-btn').click();
    });

    cy.get('.editor .cm-content').then((editor) => {
      cy.wrap(getEditorData(editor)).as('currentOS');
      cy.get('@currentOS')
        .then((currentOS) => {
          return JsonPointer.get(currentOS, '#/properties/links/properties/testSchema_Link1Test') || null;
        })
        .as('link')
        .should('not.be.null');
      cy.get('@link').then((link: any) => {
        cy.wrap(link.items.properties.target).toMatchSnapshot();
        cy.wrap(link.items.properties.attributes.properties).toMatchSnapshot();
      });
    });
  });

  it('removes and adds link attributes', function () {
    goTo(tos.testschema);
    cy.contains('Link1').closest('.v-list-item').find('.v-btn').first().click();

    cy.get('.v-dialog--active').within(() => {
      times(2, () => {
        cy.get('.v-form .v-list > .veo-attribute-list-attribute:not(:last-child) .v-list-item__action > .v-btn').eq(0).click();
      });

      times(6, () => {
        cy.contains('Attribut hinzufügen').closest('.v-btn').click();
      });

      cy.get('.v-form .v-list > .veo-attribute-list-attribute:not(:last-child)').each((el, wrapperIndex) => {
        cy.wrap(el).within(() => {
          const currentAttrData = addAttributes[wrapperIndex];
          if (currentAttrData) {
            cy.contains('Name des Attributs *').closest('.v-text-field').type(currentAttrData.writeTitle);
            cy.contains('Typ des Attributs').closest('.v-select').type(`${currentAttrData.selectType.text}{enter}`);

            if (currentAttrData.writeDescription) {
              cy.contains('Beschreibung').closest('.v-text-field').type(currentAttrData.writeDescription);
            }
            if (currentAttrData.enum) {
              if (currentAttrData.checkMultiple) {
                cy.contains('Mehrfachauswahl').closest('.v-input--checkbox').click();
              }
              cy.contains('Werte (mit Enter trennen)')
                .closest('.v-autocomplete')
                .type(`${currentAttrData.enum.join('{enter}')}{enter}`);
            }
          }
        });
      });
    });
    cy.get('.v-card__actions').contains('Speichern').closest('.v-btn').click();

    cy.get('.editor .cm-content').then(function (editor) {
      cy.wrap(getEditorData(editor)).as('currentOS');
      cy.get('@currentOS')
        .then((currentOS) => {
          return JsonPointer.get(currentOS, '#/properties/links/properties/testSchema_Link1') || null;
        })
        .as('link')
        .should('not.be.null');
      cy.get('@link').then((link: any) => {
        cy.wrap(link.items.properties.attributes.properties).toMatchSnapshot();
      });
    });
  });

  it('opens dialog to create a new link and clicks close button to discard changes', function () {
    goTo(tos.testschema);
    cy.contains('Link hinzufügen').closest('.v-btn').click();

    cy.get('.v-dialog--active').within(() => {
      cy.contains('Name *').closest('.v-text-field').type('TestLinkOne');
      cy.contains('Typ des Linkziels *').closest('.v-select').type('Control{enter}');

      cy.get('.v-card__actions').contains('Weiter').closest('.v-btn').click();

      cy.get('.v-card__actions').contains('Schließen').closest('.v-btn').click();
    });

    cy.get('@expansionPanelContent').eq(2).find('.v-card .v-list-item:first-child .v-list-item__content .v-list-item__title').should('not.contain.text', 'TestLinkOne');

    cy.get('.editor .cm-content').then((editor) => {
      cy.wrap(getEditorData(editor)).as('currentOS');
      cy.get('@currentOS')
        .then((currentOS) => {
          return JsonPointer.get(currentOS, '#/properties/links/properties/testSchema_TestLinkOne') || null;
        })
        .as('link')
        .should('be.null');
    });
  });

  it('adds completely new link and removes it from dialog with delete button', function () {
    goTo(tos.testschema);
    cy.contains('Link hinzufügen').closest('.v-btn').click();

    cy.get('.v-dialog--active').within(() => {
      cy.contains('Name *').closest('.v-text-field').type('TestLinkTwo');
      cy.contains('Typ des Linkziels *').closest('.v-select').type('Person{enter}');

      cy.get('.v-card__actions').contains('Weiter').closest('.v-btn').click();

      cy.contains('Attribut hinzufügen').closest('.v-btn').click();
      cy.get('.v-form .v-list > .veo-attribute-list-attribute')
        .first()
        .then((el) => {
          cy.wrap(el).within(() => {
            const currentAttrData = addTestTwoAttribute;
            cy.contains('Name des Attributs *').closest('.v-text-field').type(currentAttrData.writeTitle);
            cy.contains('Typ des Attributs').closest('.v-select').type(`${currentAttrData.selectType.text}{enter}`);
            cy.contains('Beschreibung').closest('.v-text-field').type(currentAttrData.writeDescription);
          });
        });

      cy.get('.v-card__actions').contains('Speichern').closest('.v-btn').click();
    });

    cy.get('@expansionPanelContent').eq(2).find('.v-card .v-list-item:first-child .v-list-item__content .v-list-item__title').should('contain.text', 'TestLinkTwo');

    cy.get('.editor .cm-content').then((editor) => {
      cy.wrap(getEditorData(editor)).as('currentOS');
      cy.get('@currentOS')
        .then((currentOS) => {
          return JsonPointer.get(currentOS, '#/properties/links/properties/testSchema_TestLinkTwo') || null;
        })
        .as('link')
        .should('not.be.null');
      cy.get('@link').then((link: any) => {
        cy.wrap(link.items.properties.attributes.properties).toMatchSnapshot();
      });
    });

    cy.contains('TestLinkTwo').closest('.v-list-item').find('.v-btn').first().click();
    cy.get('.v-dialog--active .v-card__actions').contains('Link löschen').click();
    cy.get('.v-dialog--active .v-card__actions').contains('Löschen').click();
    cy.get('@expansionPanelContent').eq(1).find('.v-card .v-list-item:first-child .v-list-item__content .v-list-item__title').should('not.contain.text', 'TestLinkTwo');
    cy.get('.editor .cm-content').then((editor) => {
      cy.wrap(getEditorData(editor)).as('currentOS');
      cy.get('@currentOS')
        .then((currentOS) => {
          return JsonPointer.get(currentOS, '#/properties/links/properties/testSchema_TestLinkTwo') || null;
        })
        .as('link')
        .should('be.null');
    });
  });

  it('compares downloaded schema with the actual one', function () {
    goTo(tos.testschema);
    cy.get('.mdi-download').closest('.v-btn').click();
    cy.readFile('cypress/downloads/os_testSchema.json').toMatchSnapshot();
  });

  it('adds a translated description to a new aspect attribute for EN and DE via the dialog', function () {
    goTo(tos.empty);
    const currentAttrData = addAttributes[4];

    // Switch default language to de
    cy.get('.translate-button').click();

    cy.get('.v-dialog--active').within(() => {
      cy.get('.v-select').contains('Sprache').closest('.v-select').type('Deutsch{enter}');

      cy.get('.v-card__actions').contains('Speichern').closest('.v-btn').click();
    });

    cy.contains('Aspekte hinzufügen').closest('.v-btn').click();

    cy.get('.v-dialog--active').within(() => {
      cy.contains('Name *').closest('.v-text-field').type('TestAspectTwo{enter}');
      cy.contains('Attribut hinzufügen').closest('.v-btn').click();
      cy.get('.v-form .v-list > .veo-attribute-list-attribute')
        .first()
        .then((el) => {
          cy.wrap(el).within(() => {
            cy.contains('Name des Attributs *').closest('.v-text-field').type(currentAttrData.writeTitle);
            cy.contains('Typ des Attributs').closest('.v-select').type(`${currentAttrData.selectType.text}{enter}`);
            cy.contains('Beschreibung').closest('.v-text-field').type(currentAttrData.writeDescription);
            cy.contains('Werte (mit Enter trennen)')
              .closest('.v-autocomplete')
              .type(`${currentAttrData.enum.join('{enter}')}{enter}`);
          });
        });

      cy.get('.v-card__actions').contains('Speichern').closest('.v-btn').click();
    });

    cy.get('@expansionPanelContent')
      .eq(1)
      .find('.v-card:last-child .v-list-item:last-child .v-list-item__content .v-list-item__subtitle')
      .should('contain.text', currentAttrData.writeDescription);

    cy.get('.editor .cm-content').then((editor) => {
      cy.wrap(getEditorData(editor)).as('currentOS');
      cy.get('@currentOS')
        .then((currentOS) => {
          return JsonPointer.get(currentOS, `#/properties/translations/de/empty_TestAspectTwo_${currentAttrData.writeTitle}`) || null;
        })
        .should('not.be.null');
      cy.get('@currentOS')
        .then((currentOS) => {
          return JsonPointer.get(currentOS, `#/properties/translations/en/empty_TestAspectTwo_${currentAttrData.writeTitle}`) || null;
        })
        .should('be.null');
      for (const enumEntry of currentAttrData.enum) {
        cy.get('@currentOS')
          .then((currentOS) => {
            return JsonPointer.get(currentOS, `#/properties/translations/de/${enumEntry}`) || null;
          })
          .should('not.be.null');
        cy.get('@currentOS')
          .then((currentOS) => {
            return JsonPointer.get(currentOS, `#/properties/translations/en/${enumEntry}`) || null;
          })
          .should('be.null');
      }
    });

    // Switch default language
    cy.get('.translate-button').click();

    cy.get('.v-dialog--active').within(() => {
      cy.get('.v-select').contains('Sprachen').closest('.v-select').type('{downarrow}{enter}');

      cy.get('.v-select').contains('Sprache').closest('.v-select').type('Englisch{enter}');

      cy.get('.v-card__actions').contains('Speichern').closest('.v-btn').click();
    });

    // Expansion panel description should be empty
    cy.get('@expansionPanelContent').eq(1).find('.v-card:last-child .v-list-item:last-child .v-list-item__content .v-list-item__subtitle').should('contain.html', '<span></span>');

    // Add english translations
    cy.get('@expansionPanelContent').eq(1).find('.v-card:last-child .v-list-item:first-child .edit-button').click();

    cy.get('.v-dialog--active').within(() => {
      cy.get('.v-form .v-list > .veo-attribute-list-attribute')
        .first()
        .then((el) => {
          cy.wrap(el).within(() => {
            cy.contains('Beschreibung').closest('.v-text-field').type(currentAttrData.writeDescription);
          });
        });

      cy.get('.v-card__actions').contains('Speichern').closest('.v-btn').click();
    });

    // Expansion panel description should have content
    cy.get('@expansionPanelContent')
      .eq(1)
      .find('.v-card:last-child .v-list-item:last-child .v-list-item__content .v-list-item__subtitle')
      .should('contain.text', currentAttrData.writeDescription);

    // Editor should contain translation object with the english and german keys
    cy.get('.editor .cm-content').then((editor) => {
      cy.wrap(getEditorData(editor)).as('currentOS');
      cy.get('@currentOS')
        .then((currentOS) => {
          return JsonPointer.get(currentOS, `#/properties/translations/de/empty_TestAspectTwo_${currentAttrData.writeTitle}`) || null;
        })
        .should('not.be.null');
      cy.get('@currentOS')
        .then((currentOS) => {
          return JsonPointer.get(currentOS, `#/properties/translations/en/empty_TestAspectTwo_${currentAttrData.writeTitle}`) || null;
        })
        .should('not.be.null');
      for (const enumEntry of currentAttrData.enum) {
        cy.get('@currentOS')
          .then((currentOS) => {
            return JsonPointer.get(currentOS, `#/properties/translations/de/${enumEntry}`) || null;
          })
          .should('not.be.null');
        cy.get('@currentOS')
          .then((currentOS) => {
            return JsonPointer.get(currentOS, `#/properties/translations/en/${enumEntry}`) || null;
          })
          .should('not.be.null');
      }
    });

    // Remove english translations
    cy.get('@expansionPanelContent').eq(1).find('.v-card:last-child .v-list-item:first-child .edit-button').click();

    cy.get('.v-dialog--active').within(() => {
      cy.get('.v-form .v-list > .veo-attribute-list-attribute')
        .first()
        .then((el) => {
          cy.wrap(el).within(() => {
            cy.contains('Beschreibung').closest('.v-text-field').type('{selectall}{backspace}');
          });
        });

      cy.get('.v-card__actions').contains('Speichern').closest('.v-btn').click();
    });

    // Expansion panel description should be empty
    cy.get('@expansionPanelContent').eq(1).find('.v-card:last-child .v-list-item:last-child .v-list-item__content .v-list-item__subtitle').should('contain.html', '<span></span>');
  });

  it('adds a translated description to a new link attribute for EN and DE via the dialog', function () {
    goTo(tos.empty);
    const currentAttrData = addAttributes[4];

    // Switch default language to de
    cy.get('.translate-button').click();

    cy.get('.v-dialog--active').within(() => {
      cy.get('.v-select').contains('Sprache').closest('.v-select').type('Deutsch{enter}');

      cy.get('.v-card__actions').contains('Speichern').closest('.v-btn').click();
    });

    cy.contains('Link hinzufügen').closest('.v-btn').click();

    cy.get('.v-dialog--active').within(() => {
      cy.contains('Name *').closest('.v-text-field').type('TestLinkTwo');

      cy.contains('Typ des Linkziels *').closest('.v-select').type('Control{enter}');

      cy.contains('Weiter').closest('.v-btn').click();

      cy.contains('Attribut hinzufügen').closest('.v-btn').click();
      cy.get('.v-form .v-list > .veo-attribute-list-attribute')
        .first()
        .then((el) => {
          cy.wrap(el).within(() => {
            cy.contains('Name des Attributs *').closest('.v-text-field').type(currentAttrData.writeTitle);
            cy.contains('Typ des Attributs').closest('.v-select').type(`${currentAttrData.selectType.text}{enter}`);
            cy.contains('Beschreibung').closest('.v-text-field').type(currentAttrData.writeDescription);
            cy.contains('Werte (mit Enter trennen)')
              .closest('.v-autocomplete')
              .type(`${currentAttrData.enum.join('{enter}')}{enter}`);
          });
        });

      cy.get('.v-card__actions').contains('Speichern').closest('.v-btn').click();
    });

    cy.get('@expansionPanelContent')
      .eq(2)
      .find('.v-card:last-child .v-list-item:last-child .v-list-item__content .v-list-item__subtitle')
      .should('contain.text', currentAttrData.writeDescription);

    cy.get('.editor .cm-content').then((editor) => {
      cy.wrap(getEditorData(editor)).as('currentOS');
      cy.get('@currentOS')
        .then((currentOS) => {
          return JsonPointer.get(currentOS, `#/properties/translations/de/empty_TestLinkTwo_${currentAttrData.writeTitle}`) || null;
        })
        .should('not.be.null');
      cy.get('@currentOS')
        .then((currentOS) => {
          return JsonPointer.get(currentOS, `#/properties/translations/en/empty_TestLinkTwo_${currentAttrData.writeTitle}`) || null;
        })
        .should('be.null');
      cy.get('@currentOS')
        .then((currentOS) => {
          return JsonPointer.get(currentOS, `#/properties/translations/en/empty_TestLinkTwo`) || null;
        })
        .should('be.null');
      for (const enumEntry of currentAttrData.enum) {
        cy.get('@currentOS')
          .then((currentOS) => {
            return JsonPointer.get(currentOS, `#/properties/translations/de/${enumEntry}`) || null;
          })
          .should('not.be.null');
        cy.get('@currentOS')
          .then((currentOS) => {
            return JsonPointer.get(currentOS, `#/properties/translations/en/${enumEntry}`) || null;
          })
          .should('be.null');
      }
    });

    // Switch default language
    cy.get('.translate-button').click();

    cy.get('.v-dialog--active').within(() => {
      cy.get('.v-select').contains('Sprachen').closest('.v-select').type('{downarrow}{enter}');

      cy.get('.v-select').contains('Sprache').closest('.v-select').type('Englisch{enter}');

      cy.get('.v-card__actions').contains('Speichern').closest('.v-btn').click();
    });

    // Expansion panel description should be empty
    cy.get('@expansionPanelContent').eq(2).find('.v-card:last-child .v-list-item:last-child .v-list-item__content .v-list-item__subtitle').should('contain.html', '<span></span>');

    // Add english translations
    cy.get('@expansionPanelContent').eq(2).find('.v-card:last-child .v-list-item:first-child .edit-button').click();

    cy.get('.v-dialog--active').within(() => {
      // Add english link description

      cy.get('.v-form .v-list > .veo-attribute-list-attribute')
        .first()
        .then((el) => {
          cy.wrap(el).within(() => {
            cy.contains('Beschreibung').closest('.v-text-field').type(currentAttrData.writeDescription);
          });
        });

      cy.get('.v-card__actions').contains('Speichern').closest('.v-btn').click();
    });

    // Expansion panel description should have content
    cy.get('@expansionPanelContent')
      .eq(2)
      .find('.v-card:last-child .v-list-item:last-child .v-list-item__content .v-list-item__subtitle')
      .should('contain.text', currentAttrData.writeDescription);

    // Editor should contain translation object with the english and german keys
    cy.get('.editor .cm-content').then((editor) => {
      cy.wrap(getEditorData(editor)).as('currentOS');
      cy.get('@currentOS')
        .then((currentOS) => {
          return JsonPointer.get(currentOS, `#/properties/translations/de/empty_TestLinkTwo_${currentAttrData.writeTitle}`) || null;
        })
        .should('not.be.null');
      cy.get('@currentOS')
        .then((currentOS) => {
          return JsonPointer.get(currentOS, `#/properties/translations/en/empty_TestLinkTwo_${currentAttrData.writeTitle}`) || null;
        })
        .should('not.be.null');
      for (const enumEntry of currentAttrData.enum) {
        cy.get('@currentOS')
          .then((currentOS) => {
            return JsonPointer.get(currentOS, `#/properties/translations/de/${enumEntry}`) || null;
          })
          .should('not.be.null');
        cy.get('@currentOS')
          .then((currentOS) => {
            return JsonPointer.get(currentOS, `#/properties/translations/en/${enumEntry}`) || null;
          })
          .should('not.be.null');
      }
    });

    // Remove english translations
    cy.get('@expansionPanelContent').eq(2).find('.v-card:last-child .v-list-item:first-child .edit-button').click();

    cy.get('.v-dialog--active').within(() => {
      cy.get('.v-form .v-list > .veo-attribute-list-attribute')
        .first()
        .then((el) => {
          cy.wrap(el).within(() => {
            cy.contains('Beschreibung').closest('.v-text-field').type('{selectall}{backspace}');
          });
        });

      cy.get('.v-card__actions').contains('Speichern').closest('.v-btn').click();
    });

    // Expansion panel description should be empty
    cy.get('@expansionPanelContent').eq(2).find('.v-card:last-child .v-list-item:last-child .v-list-item__content .v-list-item__subtitle').should('contain.html', '<span></span>');
  });
});
