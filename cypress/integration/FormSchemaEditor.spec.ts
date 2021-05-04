/// <reference path="../support/index.d.ts" />

import { times } from 'lodash'
import { JsonPointer } from 'json-ptr'

let processRealValues: { text: string; numberOfProperties: number }[] = []

import { getEditorData } from '../support/utils'

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
      enum: ['person']
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

describe('Formschema Editor', () => {
  before(() => {
    cy.auth()

    /**
     * Navigate through Wizard to ObjectSchemaEditor
     */
    cy.visit('http://localhost:3000/editor')
  })

  beforeEach(() => {
    cy.intercept(
      {
        method: 'GET',
        url: /.*\/translations.*/
      },
      req => {
        req.reply({
          fixture: 'objectschema/translations.json'
        })
      }
    )
    cy.intercept(
      {
        method: 'GET',
        url: /.*\/schemas$/
      },
      req => {
        req.reply({
          fixture: 'objectschema/schemas.json'
        })
      }
    )
    cy.window().then(function(win: any) {
      win.$nuxt?.$router?.push('/editor')
    })
    cy.contains('.v-list-item--link', 'Formschema Editor')
      .should('have.attr', 'href', '/editor/formschema')
      .click()
      .wait(1)
  })

  it('compares downloaded schema with the actual one', function() {
    cy.intercept(
      {
        method: 'GET',
        url: /.*\/schemas\/process.*/
      },
      req => {
        req.reply({
          fixture: 'objectschema/process.json'
        })
      }
    )
    cy.get('.v-dialog--active').within(dialogEl => {
      cy.get('.v-window-item--active')
        .contains('Formschema importieren')
        .closest('.v-list-item--link')
        .click()
        .wait(1)
      cy.get('.v-window-item--active')
        .contains('.v-file-input', 'Formschema hochladen (.json)')
        .find('input[type="file"]')
        .attachFile('formschema/minimal.json')
        .wait(2000)
    })
    cy.get('h1').should('contain.text', 'Formschema Editor- Test Formschema')
    cy.get('.mdi-download')
      .closest('.v-btn')
      .click()
      .wait(1)
    cy.get('.mdi-code-tags')
      .closest('.v-btn')
      .click()
      .wait(1)
    cy.get('.v-dialog--active').within(dialogEl => {
      cy.get('.editor .cm-content').then(function(editor) {
        cy.wrap(getEditorData(editor)).then(currentFS => {
          cy.readFile('cypress/downloads/fs_Test Formschema.json').then(downloadedFS => {
            cy.wrap(JSON.stringify(currentFS)).should('eq', JSON.stringify(downloadedFS))
          })
        })
      })
      cy.get('.v-card__actions')
        .contains('.v-btn', 'Schließen')
        .click()
        .wait(1)
    })
  })

  it.only('drags and drops form element into dropzone', function() {
    cy.intercept(
      {
        method: 'GET',
        url: /.*\/schemas\/process.*/
      },
      req => {
        req.reply({
          fixture: 'objectschema/process.json'
        })
      }
    )
    cy.get('.v-dialog--active').within(dialogEl => {
      cy.get('.v-window-item--active')
        .contains('Formschema importieren')
        .closest('.v-list-item--link')
        .click()
        .wait(1)
      cy.get('.v-window-item--active')
        .contains('.v-file-input', 'Formschema hochladen (.json)')
        .find('input[type="file"]')
        .attachFile('formschema/minimal.json')
        .wait(2000)
    })

    cy.wait(1000)

    cy.contains('.v-sheet', 'group').drag()
    cy.get('.dropzone').drop()

    // cy.contains('.v-sheet', 'group')
    //   .trigger('pointerdown', {
    //     which: 1,
    //     button: 0
    //   })
    //   .trigger('dragstart')

    // cy.get('.dropzone')
    //   .trigger('dragover', 'bottom')
    //   .trigger('drop')
    //   .trigger('pointerup', {
    //     which: 1,
    //     button: 0
    //   })
  })
})
