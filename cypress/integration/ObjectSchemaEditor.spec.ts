/// <reference path="../support/index.d.ts" />

import { times } from 'lodash'
import { JsonPointer } from 'json-ptr'

let processRealValues: { text: string; numberOfProperties: number }[] = []

import { getCurrentOS } from '../support/utils'

const attributeTypes = [
  { value: 'string', text: 'Text' },
  { value: 'boolean', text: 'Wahrheitswert' },
  { value: 'number', text: 'Zahl' },
  { value: 'integer', text: 'Ganzzahl' },
  { value: 'enum', text: 'Auswahl' }
]

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
]

const changedAttributesResultedSchema = {
  process_GeneralInformationTest_TagsTest: {
    title: 'TagsTest',
    type: 'string'
  },
  process_GeneralInformationTest_DocumentTest: {
    title: 'DocumentTest',
    type: 'boolean'
  }
}

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
]

const addedAttributesResultedSchema = {
  process_AccessAuthorization_a: {
    title: 'a',
    type: 'string'
  },
  process_AccessAuthorization_b: {
    title: '',
    type: 'boolean'
  },
  process_AccessAuthorization_c: {
    title: 'c',
    type: 'number'
  },
  process_AccessAuthorization_d: {
    title: '',
    type: 'integer'
  },
  process_AccessAuthorization_e: {
    title: 'e',
    enum: ['a', 'b', 'c', 'd']
  },
  process_AccessAuthorization_f: {
    title: '',
    type: 'array',
    items: {
      enum: ['a', 'b', 'c', 'd']
    }
  }
}

const addTestTwoAttribute = {
  writeTitle: 'a',
  selectType: attributeTypes[0],
  writeDescription: 'a'
}

const TestAspectTwoAttributeSchema = {
  process_TestAspectTwo_a: {
    title: 'a',
    type: 'string'
  }
}

const linkTarget = {
  type: 'object',
  title: 'TestId',
  properties: {
    targetUri: {
      type: 'string',
      title: 'The id of the target object.'
    },
    type: {
      enum: ['Person']
    }
  }
}

const changedLinkAttributesResultedSchema = {
  process_LegalBasisTest_ExplanationTest: {
    title: 'ExplanationTest',
    type: 'string'
  },
  process_LegalBasisTest_DocumentTest: {
    title: 'DocumentTest',
    type: 'boolean'
  }
}

const addedLinkAttributesResultedSchema = {
  process_InternalRecipientLink_a: {
    title: 'a',
    type: 'string'
  },
  process_InternalRecipientLink_b: {
    title: '',
    type: 'boolean'
  },
  process_InternalRecipientLink_c: {
    title: 'c',
    type: 'number'
  },
  process_InternalRecipientLink_d: {
    title: '',
    type: 'integer'
  },
  process_InternalRecipientLink_e: {
    title: 'e',
    enum: ['a', 'b', 'c', 'd']
  },
  process_InternalRecipientLink_f: {
    title: '',
    type: 'array',
    items: {
      enum: ['a', 'b', 'c', 'd']
    }
  }
}

const TestLinkTwoAttributeSchema = {
  process_TestLinkTwo_a: {
    title: 'a',
    type: 'string'
  }
}

describe('Objectschema Editor', () => {
  before(() => {
    cy.auth()
    cy.intercept(
      {
        method: 'GET',
        url: 'https://veo.develop.cpmsys.io/schemas/process?domains=GDPR%2CISO_27001'
      },
      req => {
        req.reply({ fixture: 'objectschema/process.json' })
      }
    )

    cy.intercept(
      {
        method: 'GET',
        url: 'https://veo.develop.cpmsys.io/schemas'
      },
      req => {
        req.reply({
          fixture: 'objectschema/schemas.json'
        })
      }
    )

    /**
     * Navigate through Wizard to ObjectSchemaEditor
     */
    cy.visit('http://localhost:3000/editor')

    cy.get('.veo-page-wrapper .v-list').then(el => {
      cy.log(el.html())
    })

    cy.contains('Objektschema Editor')
      .closest('.v-list-item.v-list-item--link')
      .should('have.attr', 'href', '/editor/objectschema')
      .click()
      .wait(1)

    cy.get('.v-dialog--active').within(dialogEl => {
      cy.contains('.v-select', 'Typ des Objektschemas').type('Process{enter}')
      cy.get('.v-card__actions')
        .contains('Weiter')
        .click()
        .wait(1)
    })
  })
  beforeEach(() => {
    cy.fixture('objectschema/process.json')
      .as('processSchema')
      .then(processSchema => {
        processRealValues = [
          { text: 'Standardattribute', numberOfProperties: Object.keys(processSchema.properties).length - 2 },
          {
            text: 'Individuelle Aspekte',
            numberOfProperties: Object.keys(processSchema.properties.customAspects.properties).length
          },
          {
            text: 'Individuelle Links',
            numberOfProperties: Object.keys(processSchema.properties.links.properties).length
          }
        ]
      })
    /**
     * Define aliases
     */

    cy.get<HTMLElement>('.v-expansion-panel').as('expansionPanels')
    cy.get('@expansionPanels')
      .find<HTMLElement>('button.v-expansion-panel-header')
      .as('expansionPanelHeaders')
    cy.get('@expansionPanels')
      .find<HTMLDivElement>('.v-expansion-panel-content')
      .as('expansionPanelContent')
      .then(() => {
        // TODO: quick fix to close dialogs if error occured in the last test and remained opened.
        // This enables the next text to continue and work.
        // A Better solution would be to make all tests completely independent from each other
        if (cy.$$('.v-dialog--active')?.[0]) {
          cy.$$('.v-dialog--active .v-card__title i.mdi-close')
            .closest('.v-btn')?.[0]
            ?.click()
        }
      })
  })

  it.only('compares number of basic properties, aspects and links comply with sum in expansion panel title', function() {
    cy.get('@expansionPanelHeaders').each((el, i) => {
      const expansionPanelText = el[0].childNodes[0].nodeValue.trim()
      cy.wrap(expansionPanelText).should(
        'equal',
        `${processRealValues[i].text} (${processRealValues[i].numberOfProperties})`
      )
    })
  })

  it('deletes aspect with outer delete button', function() {
    cy.get('@expansionPanelContent')
      .eq(1)
      .find('.v-expansion-panel-content__wrap')
      .children()
      .should('have.length', processRealValues[1].numberOfProperties)
    cy.contains('SensitiveData')
      .closest('.v-list-item')
      .find('.v-btn')
      .eq(1)
      .click()
      .wait(1)
    cy.get('.v-dialog--active .v-card__actions .v-btn')
      .contains('Löschen')
      .click()
      .wait(1)
    cy.get('@expansionPanelContent')
      .eq(1)
      .find('.v-expansion-panel-content__wrap')
      .children()
      .should('have.length', processRealValues[1].numberOfProperties - 1)

    cy.get('.editor .cm-content').then(editor => {
      cy.wrap(getCurrentOS(editor)).as('currentOS')
      cy.get('@currentOS')
        .then(currentOS => {
          return JsonPointer.get(currentOS, '#/properties/customAspects/properties/process_SensitiveData') || null
        })
        .as('aspect')
        .should('be.null')
    })
  })

  it('changes customAspect name, attribute names, description and types', function() {
    cy.contains('GeneralInformation')
      .closest('.v-list-item')
      .find('.v-btn')
      .first()
      .click()
      .wait(1)
    cy.get('.v-dialog--active').within(dialogEl => {
      cy.contains('Name *')
        .closest('.v-text-field')
        .type('Test')

      cy.get('.v-form .v-list > .veo-attribute-list-attribute:not(:last-child)').each((el, wrapperIndex) => {
        cy.wrap(el).within(() => {
          const currentAttrData = changedAttributes[wrapperIndex]
          cy.contains('Name des Attributs *')
            .closest('.v-text-field')
            .type(currentAttrData.writeTitle)
          cy.contains('Typ des Attributs')
            .closest('.v-select')
            .type(`${currentAttrData.selectType.text}{enter}`)
          cy.contains('Beschreibung')
            .closest('.v-text-field')
            .type(currentAttrData.writeDescription)
        })
      })
      cy.get('.v-card__actions')
        .contains('Speichern')
        .closest('.v-btn')
        .click()
        .wait(1)
    })

    cy.get('.editor .cm-content').then(editor => {
      cy.wrap(getCurrentOS(editor)).as('currentOS')
      cy.get('@currentOS')
        .then(currentOS => {
          return (
            JsonPointer.get(currentOS, '#/properties/customAspects/properties/process_GeneralInformationTest') || null
          )
        })
        .as('aspect')
        .should('not.be.null')
      cy.get('@aspect')
        .then((aspect: any) => {
          return JSON.stringify(aspect.properties.attributes.properties, null, 2)
        })
        .should('eq', JSON.stringify(changedAttributesResultedSchema, null, 2))
    })
  })

  it('removes and adds aspect attributes', function() {
    cy.contains('AccessAuthorization')
      .closest('.v-list-item')
      .find('.v-btn')
      .first()
      .click()
      .wait(1)

    cy.get('.v-dialog--active').within(dialogEl => {
      times(3, () => {
        cy.get('.v-form .v-list > .veo-attribute-list-attribute:not(:last-child) .v-list-item__action > .v-btn')
          .eq(0)
          .click()
          .wait(1)
      })

      times(6, () => {
        cy.contains('Attribut hinzufügen')
          .closest('.v-btn')
          .click()
          .wait(1)
      })

      cy.get('.v-form .v-list > .veo-attribute-list-attribute:not(:last-child)').each((el, wrapperIndex) => {
        cy.wrap(el).within(() => {
          const currentAttrData = addAttributes[wrapperIndex]
          cy.contains('Name des Attributs *')
            .closest('.v-text-field')
            .type(currentAttrData.writeTitle)
          cy.contains('Typ des Attributs')
            .closest('.v-select')
            .type(`${currentAttrData.selectType.text}{enter}`)

          if (currentAttrData.writeDescription) {
            cy.contains('Beschreibung')
              .closest('.v-text-field')
              .type(currentAttrData.writeDescription)
          }
          if (currentAttrData.enum) {
            if (currentAttrData.checkMultiple) {
              cy.contains('Mehrfachauswahl')
                .closest('.v-input--checkbox')
                .click()
            }
            cy.contains('Werte (mit Enter trennen)')
              .closest('.v-autocomplete')
              .type(`${currentAttrData.enum.join('{enter}')}{enter}`)
          }
        })
      })
    })
    cy.get('.v-card__actions')
      .contains('Speichern')
      .closest('.v-btn')
      .click()
      .wait(1)

    cy.get('.editor .cm-content').then(function(editor) {
      cy.wrap(getCurrentOS(editor)).as('currentOS')
      cy.get('@currentOS')
        .then(currentOS => {
          return JsonPointer.get(currentOS, '#/properties/customAspects/properties/process_AccessAuthorization') || null
        })
        .as('aspect')
        .should('not.be.null')
      cy.get('@aspect')
        .then((aspect: any) => {
          return JSON.stringify(aspect.properties.attributes.properties, null, 2)
        })
        .should('eq', JSON.stringify(addedAttributesResultedSchema, null, 2))
    })
  })

  it('opens dialog to create a new aspect and clicks close button to discard changes', function() {
    // TODO: fix bug of adding customAspect into ObjectSchema despite clicking on "close"
    cy.contains('Aspekte hinzufügen')
      .closest('.v-btn')
      .click()
      .wait(1)

    cy.get('.v-dialog--active').within(el => {
      cy.contains('Name *')
        .closest('.v-text-field')
        .type('TestAspectOne{enter}')
      cy.get('.v-card__actions')
        .contains('Schließen')
        .closest('.v-btn')
        .click()
        .wait(1)
    })

    cy.get('@expansionPanelContent')
      .eq(1)
      .find('.v-card .v-list-item:first-child .v-list-item__content .v-list-item__title')
      .should('not.contain.text', 'TestAspectOne')

    cy.get('.editor .cm-content').then(editor => {
      cy.wrap(getCurrentOS(editor)).as('currentOS')
      cy.get('@currentOS')
        .then(currentOS => {
          return JsonPointer.get(currentOS, '#/properties/customAspects/properties/process_TestAspectOne') || null
        })
        .as('aspect')
        .should('be.null')
    })
  })

  it('adds completely new aspect and removes it from dialog with delete button', function() {
    cy.contains('Aspekte hinzufügen')
      .closest('.v-btn')
      .click()
      .wait(1)

    cy.get('.v-dialog--active').within(dialogEl => {
      cy.contains('Name *')
        .closest('.v-text-field')
        .type('TestAspectTwo{enter}')
      cy.contains('Attribut hinzufügen')
        .closest('.v-btn')
        .click()
        .wait(1)
      cy.get('.v-form .v-list > .veo-attribute-list-attribute')
        .first()
        .then(el => {
          cy.wrap(el).within(() => {
            const currentAttrData = addTestTwoAttribute
            cy.contains('Name des Attributs *')
              .closest('.v-text-field')
              .type(currentAttrData.writeTitle)
            cy.contains('Typ des Attributs')
              .closest('.v-select')
              .type(`${currentAttrData.selectType.text}{enter}`)
            cy.contains('Beschreibung')
              .closest('.v-text-field')
              .type(currentAttrData.writeDescription)
          })
        })

      cy.get('.v-card__actions')
        .contains('Speichern')
        .closest('.v-btn')
        .click()
        .wait(1)
    })

    cy.get('@expansionPanelContent')
      .eq(1)
      .find('.v-card .v-list-item:first-child .v-list-item__content .v-list-item__title')
      .should('contain.text', 'TestAspectTwo')

    cy.get('.editor .cm-content').then(editor => {
      cy.wrap(getCurrentOS(editor)).as('currentOS')
      cy.get('@currentOS')
        .then(currentOS => {
          return JsonPointer.get(currentOS, '#/properties/customAspects/properties/process_TestAspectTwo') || null
        })
        .as('aspect')
        .should('not.be.null')
      cy.get('@aspect')
        .then((aspect: any) => {
          return JSON.stringify(aspect.properties.attributes.properties, null, 2)
        })
        .should('eq', JSON.stringify(TestAspectTwoAttributeSchema, null, 2))
    })

    cy.contains('TestAspectTwo')
      .closest('.v-list-item')
      .find('.v-btn')
      .first()
      .click()
      .wait(1)
    cy.get('.v-dialog--active .v-card__actions')
      .contains('Aspekt löschen')
      .click()
      .wait(1)
    cy.get('.v-dialog--active .v-card__actions')
      .contains('Löschen')
      .click()
      .wait(1)
    cy.get('@expansionPanelContent')
      .eq(1)
      .find('.v-card .v-list-item:first-child .v-list-item__content .v-list-item__title')
      .should('not.contain.text', 'TestAspectTwo')
    cy.get('.editor .cm-content').then(editor => {
      cy.wrap(getCurrentOS(editor)).as('currentOS')
      cy.get('@currentOS')
        .then(currentOS => {
          return JsonPointer.get(currentOS, '#/properties/customAspects/properties/process_TestAspectTwo') || null
        })
        .as('aspect')
        .should('be.null')
    })
  })

  it('deletes a link with outer delete button', function() {
    cy.get('@expansionPanelContent')
      .eq(2)
      .find('.v-expansion-panel-content__wrap')
      .children()
      .should('have.length', processRealValues[2].numberOfProperties)
    cy.contains('ResponsibleDepartment')
      .closest('.v-list-item')
      .find('.v-btn')
      .eq(1)
      .click()
      .wait(1)
    cy.get('.v-dialog--active .v-card__actions .v-btn')
      .contains('Löschen')
      .click()
      .wait(1)
    cy.get('@expansionPanelContent')
      .eq(2)
      .find('.v-expansion-panel-content__wrap')
      .children()
      .should('have.length', processRealValues[2].numberOfProperties - 1)

    cy.get('.editor .cm-content').then(editor => {
      cy.wrap(getCurrentOS(editor)).as('currentOS')
      cy.get('@currentOS')
        .then(currentOS => {
          return JsonPointer.get(currentOS, '#/properties/links/properties/process_ResponsibleDepartment') || null
        })
        .as('link')
        .should('be.null')
    })
  })

  it('changes link name, attribute names, description and types', function() {
    cy.contains('LegalBasis')
      .closest('.v-list-item')
      .find('.v-btn')
      .first()
      .click()
      .wait(1)
    cy.get('.v-dialog--active').within(dialogEl => {
      cy.contains('Name *')
        .closest('.v-text-field')
        .type('Test')
      cy.contains('Linkbeschreibung *')
        .closest('.v-text-field')
        .clear()
        .type('TestId')
      cy.contains('Typ des Linkziels *')
        .closest('.v-select')
        .should('contain.text', 'Control')
        .type('Person{enter}')

      cy.get('.v-form .v-list > .veo-attribute-list-attribute:not(:last-child)').each((el, wrapperIndex) => {
        cy.wrap(el).within(() => {
          const currentAttrData = changedAttributes[wrapperIndex]
          cy.contains('Name des Attributs *')
            .closest('.v-text-field')
            .type(currentAttrData.writeTitle)
          cy.contains('Typ des Attributs')
            .closest('.v-select')
            .type(`${currentAttrData.selectType.text}{enter}`)
          cy.contains('Beschreibung')
            .closest('.v-text-field')
            .type(currentAttrData.writeDescription)
        })
      })
      cy.get('.v-card__actions')
        .contains('Speichern')
        .closest('.v-btn')
        .click()
        .wait(1)
    })

    cy.get('.editor .cm-content').then(editor => {
      cy.wrap(getCurrentOS(editor)).as('currentOS')
      cy.get('@currentOS')
        .then(currentOS => {
          return JsonPointer.get(currentOS, '#/properties/links/properties/process_LegalBasisTest') || null
        })
        .as('link')
        .should('not.be.null')
      cy.get('@link').then((link: any) => {
        cy.wrap(JSON.stringify(link.items.properties.target, null, 2)).should('eq', JSON.stringify(linkTarget, null, 2))
        cy.wrap(JSON.stringify(link.items.properties.attributes.properties, null, 2)).should(
          'eq',
          JSON.stringify(changedLinkAttributesResultedSchema, null, 2)
        )
      })
    })
  })

  it('removes and adds link attributes', function() {
    cy.contains('InternalRecipientLink')
      .closest('.v-list-item')
      .find('.v-btn')
      .first()
      .click()
      .wait(1)

    cy.get('.v-dialog--active').within(dialogEl => {
      times(3, () => {
        cy.get('.v-form .v-list > .veo-attribute-list-attribute:not(:last-child) .v-list-item__action > .v-btn')
          .eq(0)
          .click()
          .wait(1)
      })

      times(6, () => {
        cy.contains('Attribut hinzufügen')
          .closest('.v-btn')
          .click()
          .wait(1)
      })

      cy.get('.v-form .v-list > .veo-attribute-list-attribute:not(:last-child)').each((el, wrapperIndex) => {
        cy.wrap(el).within(() => {
          const currentAttrData = addAttributes[wrapperIndex]
          cy.contains('Name des Attributs *')
            .closest('.v-text-field')
            .type(currentAttrData.writeTitle)
          cy.contains('Typ des Attributs')
            .closest('.v-select')
            .type(`${currentAttrData.selectType.text}{enter}`)

          if (currentAttrData.writeDescription) {
            cy.contains('Beschreibung')
              .closest('.v-text-field')
              .type(currentAttrData.writeDescription)
          }
          if (currentAttrData.enum) {
            if (currentAttrData.checkMultiple) {
              cy.contains('Mehrfachauswahl')
                .closest('.v-input--checkbox')
                .click()
            }
            cy.contains('Werte (mit Enter trennen)')
              .closest('.v-autocomplete')
              .type(`${currentAttrData.enum.join('{enter}')}{enter}`)
          }
        })
      })
    })
    cy.get('.v-card__actions')
      .contains('Speichern')
      .closest('.v-btn')
      .click()
      .wait(1)

    cy.get('.editor .cm-content').then(function(editor) {
      cy.wrap(getCurrentOS(editor)).as('currentOS')
      cy.get('@currentOS')
        .then(currentOS => {
          return JsonPointer.get(currentOS, '#/properties/links/properties/process_InternalRecipientLink') || null
        })
        .as('link')
        .should('not.be.null')
      cy.get('@link')
        .then((link: any) => {
          return JSON.stringify(link.items.properties.attributes.properties, null, 2)
        })
        .should('eq', JSON.stringify(addedLinkAttributesResultedSchema, null, 2))
    })
  })

  it('opens dialog to create a new link and clicks close button to discard changes', function() {
    // TODO: fix bug of adding customAspect into ObjectSchema despite clicking on "close"
    cy.contains('Link hinzufügen')
      .closest('.v-btn')
      .click()
      .wait(1)

    cy.get('.v-dialog--active').within(dialogEl => {
      cy.contains('Name *')
        .closest('.v-text-field')
        .type('TestLinkOne')
      cy.contains('Linkbeschreibung *')
        .closest('.v-text-field')
        .type('TestLinkOne Beschreibung')
      cy.contains('Typ des Linkziels *')
        .closest('.v-select')
        .type('Control{enter}')

      cy.get('.v-card__actions')
        .contains('Weiter')
        .closest('.v-btn')
        .click()
        .wait(1)

      cy.get('.v-card__actions')
        .contains('Schließen')
        .closest('.v-btn')
        .click()
        .wait(1)
    })

    cy.get('@expansionPanelContent')
      .eq(2)
      .find('.v-card .v-list-item:first-child .v-list-item__content .v-list-item__title')
      .should('not.contain.text', 'TestLinkOne')

    cy.get('.editor .cm-content').then(editor => {
      cy.wrap(getCurrentOS(editor)).as('currentOS')
      cy.get('@currentOS')
        .then(currentOS => {
          return JsonPointer.get(currentOS, '#/properties/links/properties/process_TestLinkOne') || null
        })
        .as('link')
        .should('be.null')
    })
  })

  it('adds completely new link and removes it from dialog with delete button', function() {
    cy.contains('Link hinzufügen')
      .closest('.v-btn')
      .click()
      .wait(1)

    cy.get('.v-dialog--active').within(dialogEl => {
      cy.contains('Name *')
        .closest('.v-text-field')
        .type('TestLinkTwo')
      cy.contains('Linkbeschreibung *')
        .closest('.v-text-field')
        .type('TestLinkTwo Beschreibung')
      cy.contains('Typ des Linkziels *')
        .closest('.v-select')
        .type('Person{enter}')

      cy.get('.v-card__actions')
        .contains('Weiter')
        .closest('.v-btn')
        .click()
        .wait(1)

      cy.contains('Attribut hinzufügen')
        .closest('.v-btn')
        .click()
        .wait(1)
      cy.get('.v-form .v-list > .veo-attribute-list-attribute')
        .first()
        .then(el => {
          cy.wrap(el).within(() => {
            const currentAttrData = addTestTwoAttribute
            cy.contains('Name des Attributs *')
              .closest('.v-text-field')
              .type(currentAttrData.writeTitle)
            cy.contains('Typ des Attributs')
              .closest('.v-select')
              .type(`${currentAttrData.selectType.text}{enter}`)
            cy.contains('Beschreibung')
              .closest('.v-text-field')
              .type(currentAttrData.writeDescription)
          })
        })

      cy.get('.v-card__actions')
        .contains('Speichern')
        .closest('.v-btn')
        .click()
        .wait(1)
    })

    cy.get('@expansionPanelContent')
      .eq(2)
      .find('.v-card .v-list-item:first-child .v-list-item__content .v-list-item__title')
      .should('contain.text', 'TestLinkTwo')

    cy.get('.editor .cm-content').then(editor => {
      cy.wrap(getCurrentOS(editor)).as('currentOS')
      cy.get('@currentOS')
        .then(currentOS => {
          return JsonPointer.get(currentOS, '#/properties/links/properties/process_TestLinkTwo') || null
        })
        .as('link')
        .should('not.be.null')
      cy.get('@link')
        .then((link: any) => {
          return JSON.stringify(link.items.properties.attributes.properties, null, 2)
        })
        .should('eq', JSON.stringify(TestLinkTwoAttributeSchema, null, 2))
    })

    cy.contains('TestLinkTwo')
      .closest('.v-list-item')
      .find('.v-btn')
      .first()
      .click()
      .wait(1)
    cy.get('.v-dialog--active .v-card__actions')
      .contains('Link löschen')
      .click()
      .wait(1)
    cy.get('.v-dialog--active .v-card__actions')
      .contains('Löschen')
      .click()
      .wait(1)
    cy.get('@expansionPanelContent')
      .eq(1)
      .find('.v-card .v-list-item:first-child .v-list-item__content .v-list-item__title')
      .should('not.contain.text', 'TestLinkTwo')
    cy.get('.editor .cm-content').then(editor => {
      cy.wrap(getCurrentOS(editor)).as('currentOS')
      cy.get('@currentOS')
        .then(currentOS => {
          return JsonPointer.get(currentOS, '#/properties/links/properties/process_TestLinkTwo') || null
        })
        .as('link')
        .should('be.null')
    })
  })

  it('compares downloaded schema with the actual one', function() {
    cy.get('.mdi-download')
      .closest('.v-btn')
      .click()
      .wait(1)

    cy.get('.editor .cm-content').then(function(editor) {
      cy.wrap(getCurrentOS(editor)).then(currentOS => {
        cy.readFile('cypress/downloads/os_process.json').then(downloadedOS => {
          cy.wrap(JSON.stringify(currentOS, null, 2)).should('eq', JSON.stringify(downloadedOS, null, 2))
        })
      })
    })
  })
})
