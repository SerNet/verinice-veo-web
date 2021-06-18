/// <reference path="../support/index.d.ts" />

import { times } from 'lodash';
import { JsonPointer } from 'json-ptr';

import { getEditorData } from '../support/utils';

let testSchema = '{}';
let emptySchema = '{}';

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

describe('Objectschema Editor', () => {
  before(() => {
    cy.auth();

    cy.intercept(
      {
        method: 'GET',
        url: /.*\/schemas$/
      },
      (req) => {
        req.reply({
          fixture: 'objectschema/schemas.json'
        });
      }
    );

    cy.intercept(
      {
        method: 'GET',
        url: /.*\/translations(.*)$/
      },
      (req) => {
        req.reply({
          fixture: 'translations/translation.json'
        });
      }
    );

    cy.intercept(
      {
        method: 'GET',
        url: /https:\/\/veo-forms\.develop\.\w+\.\w+\/*/
      },
      (req) => {
        req.reply({
          fixture: 'forms/fetchAllForms.json'
        });
      }
    );
    cy.intercept(
      {
        method: 'GET',
        url: /https:\/\/veo-reporting\.develop\.\w+\.\w+\/reports/
      },
      (req) => {
        req.reply({
          fixture: 'reports/fetchAllReports.json'
        });
      }
    );
    cy.intercept(
      {
        method: 'GET',
        url: /https:\/\/veo\.develop.\.\w+\.\w+\/domains/
      },
      (req) => {
        req.reply({
          fixture: 'default/fetchAllDomains.json'
        });
      }
    );

    /**
     * Navigate through Wizard to ObjectSchemaEditor
     */
    cy.visit('/editor');

    cy.contains('.v-list-item--link', 'Objektschema Editor').should('have.attr', 'href', '/editor/objectschema').click();

    // Upload os_testSchema as schema
    cy.get('.v-dialog--active').within(() => {
      cy.get('.v-window-item--active').contains('.v-text-field', 'Typ des Objektschemas').type('Eigenes{enter}');
      cy.get('.v-window-item--active').contains('.v-file-input', 'Objektschema hochladen (.json)').find('input[type="file"]').attachFile('objectschema/os_testSchema.json');
    });

    cy.fixture('objectschema/os_testSchema.json')
      .as('testSchema')
      .then((_testSchema) => {
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
        testSchema = _testSchema;
      });

    cy.fixture('objectschema/os_empty.json')
      .as('testSchema')
      .then((_emptySchema) => {
        emptySchema = _emptySchema;
      });
  });
  beforeEach(() => {
    // Reset the schema before each test to restore the original state
    cy.get('.editor')
      .find('.cm-content')
      .closest('.d-flex.flex-column')
      .then((el: any) => {
        el[0].__vue__.$emit('input', JSON.stringify(testSchema, undefined, 2));
      });

    cy.get('.veo-editor-save-button').contains('.v-btn__content', 'Codeänderungen übernehmen').closest('.v-btn').click();

    /**
     * Define aliases
     */
    cy.get<HTMLElement>('.v-expansion-panel').as('expansionPanels');
    cy.get('@expansionPanels').find<HTMLElement>('button.v-expansion-panel-header').as('expansionPanelHeaders');
    cy.get('@expansionPanels')
      .find<HTMLDivElement>('.v-expansion-panel-content')
      .as('expansionPanelContent')
      .then(() => {
        // TODO: quick fix to close dialogs if error occured in the last test and remained opened.
        // This enables the next text to continue and work.
        // A Better solution would be to make all tests completely independent from each other
        if (cy.$$('.v-dialog--active')?.[0]) {
          cy.$$('.v-dialog--active .v-card__title i.mdi-close').closest('.v-btn')?.[0]?.click();
        }
      });
  });

  it('compares number of basic properties, aspects and links comply with sum in expansion panel title', function () {
    cy.get('@expansionPanelHeaders').each((el, i) => {
      const expansionPanelText = el[0].childNodes[0].nodeValue.trim();
      cy.wrap(expansionPanelText).should('equal', `${schemaRealValues[i].text} (${schemaRealValues[i].numberOfProperties})`);
    });
  });

  it('deletes aspect with outer delete button', function () {
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
        cy.wrap(JsonPointer.get(currentOS, '#/properties/customAspects/properties/test_schema_Aspekt1')).should('be.undefined');
      });
    });
  });

  it('changes customAspect name, attribute names, description and types', function () {
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
        cy.wrap(JsonPointer.get(currentOS, '#/properties/customAspects/properties/test_schema_Aspekt1Test')).should('not.be.undefined');
      });

      cy.get('@currentOS')
        .then((currentOS) => JsonPointer.get(currentOS, '#/properties/customAspects/properties/test_schema_Aspekt1Test'))
        .as('aspect')
        .then((aspect: any) => {
          cy.wrap(aspect.properties.attributes.properties).toMatchSnapshot();
        });
    });
  });

  it('removes and adds aspect attributes', function () {
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
          return JsonPointer.get(currentOS, '#/properties/customAspects/properties/test_schema_Aspekt1') || null;
        })
        .as('aspect')
        .should('not.be.null');
      cy.get('@aspect').then((aspect: any) => {
        cy.wrap(aspect.properties.attributes.properties).toMatchSnapshot();
      });
    });
  });

  it('opens dialog to create a new aspect and clicks close button to discard changes', function () {
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
          return JsonPointer.get(currentOS, '#/properties/customAspects/properties/test_schema_TestAspectOne') || null;
        })
        .as('aspect')
        .should('be.null');
    });
  });

  it('adds completely new aspect and removes it from dialog with delete button', function () {
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
          return JsonPointer.get(currentOS, '#/properties/customAspects/properties/test_schema_TestAspectTwo') || null;
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
          return JsonPointer.get(currentOS, '#/properties/customAspects/properties/test_schema_TestAspectTwo') || null;
        })
        .as('aspect')
        .should('be.null');
    });
  });

  it('deletes a link with outer delete button', function () {
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
          return JsonPointer.get(currentOS, '#/properties/links/properties/test_schema_Link1') || null;
        })
        .as('link')
        .should('be.null');
    });
  });

  it('changes link name, attribute names, description and types', function () {
    cy.contains('Link1').closest('.v-list-item').find('.v-btn').first().click();
    cy.get('.v-dialog--active').within(() => {
      cy.contains('Name *').closest('.v-text-field').type('Test');
      cy.contains('Linkbeschreibung *').closest('.v-text-field').clear().type('TestId');
      cy.contains('Typ des Linkziels *').closest('.v-select').should('contain.text', 'Scope').type('Control{enter}');
      cy.contains('Link Subtyp').closest('.v-select').type('TOM{enter}');

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
          return JsonPointer.get(currentOS, '#/properties/links/properties/test_schema_Link1Test') || null;
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
          return JsonPointer.get(currentOS, '#/properties/links/properties/test_schema_Link1') || null;
        })
        .as('link')
        .should('not.be.null');
      cy.get('@link').then((link: any) => {
        cy.wrap(link.items.properties.attributes.properties).toMatchSnapshot();
      });
    });
  });

  it('opens dialog to create a new link and clicks close button to discard changes', function () {
    cy.contains('Link hinzufügen').closest('.v-btn').click();

    cy.get('.v-dialog--active').within(() => {
      cy.contains('Name *').closest('.v-text-field').type('TestLinkOne');
      cy.contains('Linkbeschreibung *').closest('.v-text-field').type('TestLinkOne Beschreibung');
      cy.contains('Typ des Linkziels *').closest('.v-select').type('Control{enter}');

      cy.get('.v-card__actions').contains('Weiter').closest('.v-btn').click();

      cy.get('.v-card__actions').contains('Schließen').closest('.v-btn').click();
    });

    cy.get('@expansionPanelContent').eq(2).find('.v-card .v-list-item:first-child .v-list-item__content .v-list-item__title').should('not.contain.text', 'TestLinkOne');

    cy.get('.editor .cm-content').then((editor) => {
      cy.wrap(getEditorData(editor)).as('currentOS');
      cy.get('@currentOS')
        .then((currentOS) => {
          return JsonPointer.get(currentOS, '#/properties/links/properties/test_schema_TestLinkOne') || null;
        })
        .as('link')
        .should('be.null');
    });
  });

  it('adds completely new link and removes it from dialog with delete button', function () {
    cy.contains('Link hinzufügen').closest('.v-btn').click();

    cy.get('.v-dialog--active').within(() => {
      cy.contains('Name *').closest('.v-text-field').type('TestLinkTwo');
      cy.contains('Linkbeschreibung *').closest('.v-text-field').type('TestLinkTwo Beschreibung');
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
          return JsonPointer.get(currentOS, '#/properties/links/properties/test_schema_TestLinkTwo') || null;
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
          return JsonPointer.get(currentOS, '#/properties/links/properties/test_schema_TestLinkTwo') || null;
        })
        .as('link')
        .should('be.null');
    });
  });

  it('compares downloaded schema with the actual one', function () {
    cy.get('.mdi-download').closest('.v-btn').click();
    cy.readFile('cypress/downloads/os_testSchema.json').toMatchSnapshot();
  });

  it('adds a translated description to a new aspect attribute for EN and DE via the dialog', function () {
    // Reset the schema before each test to restore the original state
    cy.get('.editor')
      .find('.cm-content')
      .closest('.d-flex.flex-column')
      .then((el: any) => {
        el[0].__vue__.$emit('input', JSON.stringify(emptySchema, undefined, 2));
      });

    cy.get('.veo-editor-save-button').contains('.v-btn__content', 'Codeänderungen übernehmen').closest('.v-btn').click();

    const currentAttrData = addAttributes[4];

    // Switch default language to de
    cy.get('.translate-button').click();

    cy.get('.v-dialog--active').within(() => {
      cy.get('.v-autocomplete').contains('Sprache').closest('.v-autocomplete').type('Deutsch{enter}');

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
      cy.get('.v-autocomplete').contains('Sprachen').closest('.v-autocomplete').type('Englisch{enter}');

      cy.get('.v-autocomplete').contains('Sprache').closest('.v-autocomplete').type('Englisch{enter}');

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
    // Reset the schema before each test to restore the original state
    cy.get('.editor')
      .find('.cm-content')
      .closest('.d-flex.flex-column')
      .then((el: any) => {
        el[0].__vue__.$emit('input', JSON.stringify(emptySchema, undefined, 2));
      });

    cy.get('.veo-editor-save-button').contains('.v-btn__content', 'Codeänderungen übernehmen').closest('.v-btn').click();

    const currentAttrData = addAttributes[4];

    // Switch default language to de
    cy.get('.translate-button').click();

    cy.get('.v-dialog--active').within(() => {
      cy.get('.v-autocomplete').contains('Sprache').closest('.v-autocomplete').type('Deutsch{enter}');

      cy.get('.v-card__actions').contains('Speichern').closest('.v-btn').click();
    });

    cy.contains('Link hinzufügen').closest('.v-btn').click();

    cy.get('.v-dialog--active').within(() => {
      cy.contains('Name *').closest('.v-text-field').type('TestLinkTwo');

      cy.contains('Linkbeschreibung *').closest('.v-text-field').clear().type('TestId');

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

      // Check for link description
      cy.get('@currentOS')
        .then((currentOS) => {
          return JsonPointer.get(currentOS, `#/properties/translations/de/empty_TestLinkTwo`) || null;
        })
        .should('not.be.null');
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
      cy.get('.v-autocomplete').contains('Sprachen').closest('.v-autocomplete').type('Englisch{enter}');

      cy.get('.v-autocomplete').contains('Sprache').closest('.v-autocomplete').type('Englisch{enter}');

      cy.get('.v-card__actions').contains('Speichern').closest('.v-btn').click();
    });

    // Expansion panel description should be empty
    cy.get('@expansionPanelContent').eq(2).find('.v-card:last-child .v-list-item:last-child .v-list-item__content .v-list-item__subtitle').should('contain.html', '<span></span>');

    // Add english translations
    cy.get('@expansionPanelContent').eq(2).find('.v-card:last-child .v-list-item:first-child .edit-button').click();

    cy.get('.v-dialog--active').within(() => {
      // Add english link description
      cy.contains('Linkbeschreibung *').closest('.v-text-field').should('have.value', '').type('TestId');

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

      // Link description
      cy.get('@currentOS')
        .then((currentOS) => {
          return JsonPointer.get(currentOS, `#/properties/translations/de/empty_TestLinkTwo`) || null;
        })
        .should('not.be.null');
      cy.get('@currentOS')
        .then((currentOS) => {
          return JsonPointer.get(currentOS, `#/properties/translations/en/empty_TestLinkTwo`) || null;
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
