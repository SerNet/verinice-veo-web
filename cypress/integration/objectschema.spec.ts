/// <reference path="../support/index.d.ts" />

import { times } from 'lodash'
import { JsonPointer } from 'json-ptr'

let processRealValues: { text: string; numberOfProperties: number }[] = []

function getCurrentOS(editor: JQuery<HTMLElement>): any {
  return JSON.parse((editor as any)[0].cmView.view.state.toJSON().doc)
}

const attributeTypes = [
  { value: 'string', text: 'Text' },
  { value: 'boolean', text: 'Wahrheitswert' },
  { value: 'number', text: 'Zahl' },
  { value: 'integer', text: 'Ganzzahl' },
  { value: 'enum', text: 'Auswahl' }
]

const changedAttributes = {
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
    title: 'process_GeneralInformationTest_a',
    name: 'a',
    type: attributeTypes[0],
    description: 'a'
  },
  {
    title: 'process_GeneralInformationTest_b',
    name: 'b',
    type: attributeTypes[1],
    description: ''
  },
  {
    title: 'process_GeneralInformationTest_c',
    name: 'c',
    type: attributeTypes[2],
    description: 'c'
  },
  {
    title: 'process_GeneralInformationTest_d',
    name: 'd',
    type: attributeTypes[3],
    description: ''
  },
  {
    title: 'process_GeneralInformationTest_e',
    name: 'e',
    type: attributeTypes[4],
    description: 'e',
    multiple: false,
    enum: ['a', 'b', 'c', 'd']
  },
  {
    title: 'process_GeneralInformationTest_f',
    name: 'f',
    type: attributeTypes[4],
    description: '',
    multiple: true,
    enum: ['a', 'b', 'c', 'd']
  }
]

const addedAttributesResultedSchema = {
  process_GeneralInformationTest_a: {
    title: 'a',
    type: 'string'
  },
  process_GeneralInformationTest_b: {
    title: '',
    type: 'boolean'
  },
  process_GeneralInformationTest_c: {
    title: 'c',
    type: 'number'
  },
  process_GeneralInformationTest_d: {
    title: '',
    type: 'integer'
  },
  process_GeneralInformationTest_e: {
    title: 'e',
    enum: ['a', 'b', 'c', 'd']
  },
  process_GeneralInformationTest_f: {
    title: '',
    type: 'array',
    items: {
      enum: ['a', 'b', 'c', 'd']
    }
  }
}

const addTestAspectZweiAttribute = {
  title: 'process_TestAspectZwei_a',
  name: 'a',
  type: attributeTypes[0],
  description: ''
}

const TestAspectZweiAttributeSchema = {
  process_TestAspectZwei_a: {
    title: '',
    type: 'string'
  }
}

describe('Objectschema', () => {
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
    cy.get<HTMLLinkElement>('.v-main__wrap a.v-list-item.v-list-item--link')
      .first()
      .should('have.attr', 'href', '/editor/objectschema')

    cy.get<HTMLLinkElement>('.v-main__wrap a.v-list-item.v-list-item--link')
      .first()
      .click()

    cy.get('.v-dialog--active #input-86')
      .parent()
      .click()

    cy.get('.v-menu__content .v-list-item__title').should('contain.text', 'Process')

    cy.get('.v-menu__content .v-list-item__title')
      .contains('Process')
      .click()

    cy.get('.v-dialog--active .v-btn__content')
      .contains('Weiter')
      .click()
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
  })
  it('compares number of basic properties, aspects and links compy with sum in expansion panel title', function() {
    cy.get('@expansionPanelHeaders').each((el, i) => {
      const expansionPanelText = el[0].childNodes[0].nodeValue.trim()
      cy.wrap(expansionPanelText).should(
        'equal',
        `${processRealValues[i].text} (${processRealValues[i].numberOfProperties})`
      )
    })
  })

  it('deletes aspect with outer delete button', function() {
    cy.get('@expansionPanels')
      .eq(1)
      .scrollIntoView({ offset: { top: -100, left: 0 } })
    cy.get('@expansionPanelContent')
      .eq(1)
      .find('.v-expansion-panel-content__wrap')
      .children()
      .should('have.length', processRealValues[1].numberOfProperties)
    cy.get('@expansionPanelContent')
      .eq(1)
      .find('.v-expansion-panel-content__wrap > div:first-child .v-list-item__action--stack > .v-btn')
      .eq(1)
      .click()
    cy.get('.v-dialog__content--active .v-card__actions .v-btn')
      .eq(1)
      .click()
    cy.get('@expansionPanelContent')
      .eq(1)
      .find('.v-expansion-panel-content__wrap')
      .children()
      .should('have.length', processRealValues[1].numberOfProperties - 1)

    cy.get('.editor .cm-content').then(editor => {
      const currentOS = getCurrentOS(editor)
      cy.wrap(JsonPointer.get(currentOS, '#/properties/customAspects/properties/process_SensitiveData')).should(
        'be.undefined'
      )
    })
  })

  it('changes customAspect name, attribute names, description and types', function() {
    cy.get('@expansionPanelContent')
      .eq(1)
      .find('.v-expansion-panel-content__wrap > div:first-child .v-list-item__action--stack > .v-btn')
      .eq(0)
      .click()
    cy.get('.v-dialog--active .v-form > .row > .col-12 > .v-text-field').type('Test')
    cy.get('.v-dialog--active .v-form .v-list > .veo-attribute-list-attribute:not(:last-child)').each(
      (el, wrapperIndex) => {
        cy.wrap(el)
          .find('.v-input')
          .each((inputEl, inputIndex) => {
            if (inputIndex === 1) {
              cy.wrap(inputEl).type(`${attributeTypes[wrapperIndex].text}{enter}`)
            } else {
              cy.wrap(inputEl).type('Test')
            }
          })
      }
    )
    cy.get('.v-dialog--active .v-card__actions .v-btn:last-child').click()

    cy.get('.editor .cm-content').then(editor => {
      const currentOS = getCurrentOS(editor)
      const aspect = JsonPointer.get(
        currentOS,
        '#/properties/customAspects/properties/process_GeneralInformationTest'
      ) as any
      cy.wrap(aspect).should('not.be.undefined')
      const attributes = aspect.properties.attributes.properties
      cy.wrap(JSON.stringify(attributes, null, 2)).should('eq', JSON.stringify(changedAttributes, null, 2))
    })
  })

  it('removes and adds aspect attributes', function() {
    cy.get('@expansionPanelContent')
      .eq(1)
      .find('.v-expansion-panel-content__wrap > div:first-child .v-list-item__action--stack > .v-btn')
      .eq(0)
      .click()
    cy.get(
      '.v-dialog--active .v-form .v-list > .veo-attribute-list-attribute:not(:last-child) .v-list-item__action > .v-btn'
    )
      .eq(0)
      .click()
    cy.get(
      '.v-dialog--active .v-form .v-list > .veo-attribute-list-attribute:not(:last-child) .v-list-item__action > .v-btn'
    )
      .eq(0)
      .click()

    times(6, () => {
      cy.get('.v-dialog--active .v-form .v-list > .veo-attribute-list-add-button .v-list-item__action > .v-btn').click()
    })

    cy.get('.v-dialog--active .v-form .v-list > .veo-attribute-list-attribute:not(:last-child)').each(
      (el, wrapperIndex) => {
        const currentAttrData = addAttributes[wrapperIndex]
        cy.wrap(el)
          .find('.v-input')
          .eq(0)
          .type(currentAttrData.name)
        cy.wrap(el)
          .find('.v-input')
          .eq(1)
          .type(`${currentAttrData.type.text}{enter}`)
        if (currentAttrData.description) {
          cy.wrap(el)
            .find('.v-input')
            .eq(2)
            .type(currentAttrData.description)
        }
        if (currentAttrData.enum) {
          if (currentAttrData.multiple) {
            cy.wrap(el)
              .find('.v-input')
              .eq(3)
              .click()
          }
          cy.wrap(el)
            .find('.v-input')
            .eq(4)
            .type(`${currentAttrData.enum.join('{enter}')}{enter}`)
        }
      }
    )
    cy.get('.v-dialog--active .v-card__actions .v-btn')
      .last()
      .click()

    cy.get('.editor .cm-content').then(editor => {
      const currentOS = getCurrentOS(editor)
      const aspect = JsonPointer.get(
        currentOS,
        '#/properties/customAspects/properties/process_GeneralInformationTest'
      ) as any
      cy.wrap(aspect).should('not.be.undefined')
      const attributes = aspect.properties.attributes.properties
      cy.wrap(JSON.stringify(attributes, null, 2)).should('eq', JSON.stringify(addedAttributesResultedSchema, null, 2))
    })
  })

  it('opens dialog to create a new apsect and clicks close button to discard changes', function() {
    // TODO: fix bug of adding customAspect into ObjectSchema despite clicking on "close"
    cy.get('@expansionPanelHeaders')
      .find('.v-btn')
      .eq(0)
      .click()
    cy.get('.v-dialog--active .v-text-field').type('TestAspectEins{enter}')
    cy.get('.v-dialog--active .v-card__actions .v-btn')
      .eq(1)
      .click()
    cy.get('@expansionPanelContent')
      .eq(1)
      .find('.v-card .v-list-item:first-child .v-list-item__content .v-list-item__title')
      .should('not.contain.text', 'TestAspectEins')
    cy.get('.editor .cm-content').then(editor => {
      const currentOS = getCurrentOS(editor)
      const aspect = JsonPointer.get(currentOS, '#/properties/customAspects/properties/TestAspectEins') as any
      cy.wrap(aspect).should('be.undefined')
    })
  })

  it('adds completely new aspect and removes it from dialog with delete button', function() {
    cy.get('@expansionPanelHeaders')
      .find('.v-btn')
      .eq(0)
      .click()
    cy.get('.v-dialog--active .v-text-field').type('TestAspectZwei{enter}')
    cy.get('.v-dialog--active .v-form .v-list > .veo-attribute-list-add-button .v-list-item__action > .v-btn').click()
    cy.get('.v-dialog--active .v-form .v-list > .veo-attribute-list-attribute')
      .first()
      .then(el => {
        const currentAttrData = addTestAspectZweiAttribute
        cy.wrap(el)
          .find('.v-input')
          .eq(0)
          .type(currentAttrData.name)
        cy.wrap(el)
          .find('.v-input')
          .eq(1)
          .type(`${currentAttrData.type.text}{enter}`)
      })
    cy.get('.v-dialog--active .v-card__actions .v-btn')
      .last()
      .click()
    cy.get('@expansionPanelContent')
      .eq(1)
      .find('.v-card .v-list-item:first-child .v-list-item__content .v-list-item__title')
      .should('not.contain.text', 'testaspect')
    cy.get('.editor .cm-content').then(editor => {
      const currentOS = getCurrentOS(editor)
      const aspect = JsonPointer.get(currentOS, '#/properties/customAspects/properties/process_TestAspectZwei') as any
      cy.wrap(aspect).should('not.be.undefined')
      const attributes = aspect.properties.attributes.properties
      cy.wrap(JSON.stringify(attributes, null, 2)).should('eq', JSON.stringify(TestAspectZweiAttributeSchema, null, 2))
    })

    cy.get('@expansionPanelContent')
      .eq(1)
      .find('.v-expansion-panel-content__wrap > div:last-child .v-list-item__action--stack > .v-btn')
      .eq(0)
      .click()
    cy.get('.v-dialog--active .v-card__actions .v-btn')
      .first()
      .click()
    cy.get('.v-dialog--active')
      .first()
      .find('.v-card__actions .v-btn')
      .eq(1)
      .click()
    cy.get('@expansionPanelContent')
      .eq(1)
      .find('.v-card .v-list-item:first-child .v-list-item__content .v-list-item__title')
      .should('not.contain.text', 'TestAspectZwei')
    cy.get('.editor .cm-content').then(editor => {
      const currentOS = getCurrentOS(editor)
      const aspect = JsonPointer.get(currentOS, '#/properties/customAspects/properties/TestAspectZwei') as any
      cy.wrap(aspect).should('be.undefined')
    })
  })
  it('deletes link', function() {
    cy.get('@expansionPanels')
      .eq(2)
      .scrollIntoView({ offset: { top: -100, left: 0 } })
    cy.get('@expansionPanelContent')
      .eq(2)
      .find('.v-expansion-panel-content__wrap')
      .children()
      .should('have.length', processRealValues[2].numberOfProperties)
    cy.get('@expansionPanelContent')
      .eq(2)
      .find('.v-expansion-panel-content__wrap > div:first-child .v-list-item__action--stack > .v-btn')
      .eq(1)
      .click()
    cy.get('.v-dialog__content--active .v-card__actions .v-btn')
      .eq(1)
      .click()
    cy.get('@expansionPanelContent')
      .eq(2)
      .find('.v-expansion-panel-content__wrap')
      .children()
      .should('have.length', processRealValues[2].numberOfProperties - 1)
    cy.get('.editor .cm-content').then(editor => {
      const currentOS = getCurrentOS(editor)
      cy.wrap(JsonPointer.get(currentOS, '#/properties/links/properties/process_ResponsibleDepartment')).should(
        'be.undefined'
      )
    })
  })
})
