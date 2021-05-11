/// <reference path="../support/index.d.ts" />

import { getEditorData } from '../support/utils'

const textOrGroupLangRegex = /(group|text)_[a-zA-Z0-9._-]+/g

const translationsAdded = {
  name: 'Name Test',
  process_GeneralInformation_document: 'Dokument Test',
  process_ProcessingDetails_surveyConductedOn: 'Erhebung durchgeführt am Test',
  process_SensitiveData_SensitiveData: 'Datenverarbeitung besonders sensitiver Daten? Test',
  process_ProcessingDetails_typeOfSurvey: 'Art der Erhebung Test',
  process_InternalRecipientLink: 'Empfänger Intern Test',
  process_SensitiveData_comment: 'Bemerkungen Test',
  process_SensitiveData_notification3343GDPR: 'Meldeverfahren Art. 33,34 DS-GVO? Test',
  'text_45b08d55-78ff-430e-a8ae-cb6faaee497d': 'Text 1 Test',
  'text_bff6d345-b0f7-401f-8473-a9acb5694b2e': 'Text 2 Test',
  'group_53731d24-172a-4a7f-b45f-fcddd434434c': 'Gruppe 1 Test',
  'group_860ed628-c439-440c-a429-fb4a132f85af': 'Gruppe 2 Test'
}

const translationsChanged = {
  name: 'Name Test',
  process_GeneralInformation_document: 'Dokument Test geändert',
  process_ProcessingDetails_surveyConductedOn: 'Erhebung durchgeführt am Test geändert',
  process_SensitiveData_SensitiveData: 'Datenverarbeitung besonders sensitiver Daten? Test geändert',
  process_ProcessingDetails_typeOfSurvey: 'Art der Erhebung Test geändert',
  process_InternalRecipientLink: 'Empfänger Intern Test geändert',
  process_SensitiveData_comment: 'Bemerkungen Test geändert',
  process_SensitiveData_notification3343GDPR: 'Meldeverfahren Art. 33,34 DS-GVO? Test geändert',
  'text_45b08d55-78ff-430e-a8ae-cb6faaee497d': 'Text 1 Test geändert',
  'text_bff6d345-b0f7-401f-8473-a9acb5694b2e': 'Text 2 Test geändert',
  'group_53731d24-172a-4a7f-b45f-fcddd434434c': 'Gruppe 1 Test geändert',
  'group_860ed628-c439-440c-a429-fb4a132f85af': 'Gruppe 2 Test geändert'
}

const translationsDeleted = {}

describe('Formschema Editor', () => {
  before(() => {
    cy.auth()

    /**
     * Navigate through Wizard to ObjectSchemaEditor
     */
    cy.visit('http://localhost:3000/editor')
  })

  it('drags and drops elements into dropzone and nests in each other', function() {
    cy.loadFse('formschema/empty-process.json')
    cy.contains('.v-sheet', 'text').drag()
    cy.get('.dropzone').drop()

    cy.contains('.v-sheet', 'group').drag()
    cy.get('.dropzone').drop()

    cy.contains('.v-sheet', 'name').drag()
    cy.get('.dropzone').drop()

    cy.contains('.v-sheet', 'process / SensitiveData_SensitiveData').drag()
    cy.get('.dropzone').drop()

    cy.contains('.v-sheet', 'process / SensitiveData_comment').drag()
    cy.get('.dropzone').drop()

    cy.contains('.v-sheet', 'process / ProcessingDetails_typeOfSurvey').drag()
    cy.get('.dropzone').drop()

    cy.contains('.v-sheet', 'process / InternalRecipientLink').drag()
    cy.get('.dropzone').drop()

    cy.contains('.v-sheet', 'process / TypeOfDataProcessed').drag()
    cy.get('.dropzone').drop()

    cy.contains('.v-sheet', 'description').drag()
    cy.get('.dropzone')
      .find('.dragArea')
      .eq(0)
      .drop()

    cy.contains('.fse-input', 'Datenverarbeitung besonders sensitiver Daten?')
      .find('.handle')
      .drag()
    cy.get('.dropzone')
      .find('.dragArea')
      .eq(0)
      .drop()

    cy.contains('.v-sheet', 'group').drag()
    cy.get('.dropzone').drop()

    cy.get('.dropzone')
      .find('.fse-group')
      .eq(0)
      .find('.handle')
      .eq(0)
      .drag()
    cy.get('.dropzone')
      .find('.dragArea')
      .eq(1)
      .drop()

    cy.contains('.v-sheet', 'text').drag()
    cy.get('.dropzone')
      .find('.dragArea')
      .eq(0)
      .drop()

    // TODO: because of different scrollbars on Ubuntu/Window they do not work in the same way as on MacOS
    // cy.contains('.fse-input', 'Art der verarbeiteten Daten')
    //   .find('.handle')
    //   .drag()
    // cy.get('.dropzone')
    //   .find('.dragArea')
    //   .eq(0)
    //   .wait(1000)
    //   .drop()

    // cy.contains('.fse-input', 'Art der Erhebung')
    //   .find('.handle')
    //   .drag()
    // cy.get('.dropzone')
    //   .find('.dragArea')
    //   .eq(1)
    //   .drop()

    cy.get('.mdi-code-tags')
      .closest('.v-btn')
      .click()
      .wait(1)
    cy.get('.v-dialog--active').within(dialogEl => {
      cy.get('.editor .cm-content').then(function(editor) {
        cy.wrap(getEditorData(editor)).then(currentFS => {
          cy.fixture('formschema/drag-and-drop.json').then(compareFS => {
            cy.wrap(JSON.stringify(currentFS).replace(textOrGroupLangRegex, '')).should(
              'eq',
              JSON.stringify(compareFS).replace(textOrGroupLangRegex, '')
            )
          })
        })
      })
      cy.get('.v-card__actions')
        .contains('.v-btn', 'Schließen')
        .click()
        .wait(1)
    })

    cy.get('.vf-wrapper')
      .eq(0)
      .toMatchHtmlSnapshot()
  })

  it('opens InputText/InputTextMultiline/MarkdownEditor dialogs, changes data in dialogs and save them', function() {
    cy.loadFse('formschema/elements/input-text-multiline-markdown.json')
    cy.get('.mdi-code-tags')
      .closest('.v-btn')
      .click()
      .wait(1)
    cy.get('.v-dialog--active').within(dialogEl => {
      cy.get('.editor .cm-content').then(function(editor) {
        cy.wrap(getEditorData(editor)).toMatchSnapshot({ name: 'InputText - FS' })
      })
      cy.get('.v-card__actions')
        .contains('.v-btn', 'Schließen')
        .click()
        .wait(1)
    })

    cy.get('.vf-wrapper')
      .eq(0)
      .toMatchHtmlSnapshot({ name: 'InputText - VeoForm' })

    cy.contains('.fse-input', 'Name')
      .should('contain.text', 'Name name InputText')
      .find('.mdi-pencil')
      .closest('.v-btn')
      .click()
      .wait(1)

    cy.get('.v-dialog--active').within(dialogEl => {
      cy.get('.v-card__title').should('contain.text', 'Input Element anpassen')
      cy.get('.v-form').should('contain.text', 'Beschriftung des Elements*:')
      cy.contains('.v-text-field', 'Beschriftung')
        .find('input')
        .should('have.value', 'Name')
        .closest('.v-text-field')
        .type('{selectall}{backspace}Name Test 1')

      cy.get('.v-form').should('contain.text', 'Steuerelement Typ:')
      cy.contains('.v-select', 'Typ')
        .should('contain.text', 'InputText')
        .type('InputTextMultiline{enter}')

      cy.get('.v-card__actions')
        .contains('.v-btn', 'Speichern')
        .click()
        .wait(1)
    })

    cy.get('.mdi-code-tags')
      .closest('.v-btn')
      .click()
      .wait(1)
    cy.get('.v-dialog--active').within(dialogEl => {
      cy.get('.editor .cm-content').then(function(editor) {
        cy.wrap(getEditorData(editor)).toMatchSnapshot({ name: 'InputTextMultiline - FS' })
      })
      cy.get('.v-card__actions')
        .contains('.v-btn', 'Schließen')
        .click()
        .wait(1)
    })

    cy.get('.vf-wrapper')
      .eq(0)
      .toMatchHtmlSnapshot({ name: 'InputTextMultiline - VeoForm' })

    cy.contains('.fse-input', 'Name Test 1')
      .should('contain.text', 'Name Test 1 name InputTextMultiline')
      .find('.mdi-pencil')
      .closest('.v-btn')
      .click()
      .wait(1)

    cy.get('.v-dialog--active').within(dialogEl => {
      cy.get('.v-card__title').should('contain.text', 'Input Element anpassen')
      cy.contains('.v-text-field', 'Beschriftung')
        .find('input')
        .should('have.value', 'Name Test 1')
        .closest('.v-text-field')
        .type('{selectall}{backspace}{selectall}{backspace}Name Test 2')

      cy.contains('.v-select', 'Typ')
        .should('contain.text', 'InputTextMultiline')
        .type('MarkdownEditor{enter}')

      cy.get('.v-card__actions')
        .contains('.v-btn', 'Speichern')
        .click()
        .wait(1)
    })

    cy.get('.mdi-code-tags')
      .closest('.v-btn')
      .click()
      .wait(1)
    cy.get('.v-dialog--active').within(dialogEl => {
      cy.get('.editor .cm-content').then(function(editor) {
        cy.wrap(getEditorData(editor)).toMatchSnapshot({ name: 'MarkdownEditor - FS' })
      })
      cy.get('.v-card__actions')
        .contains('.v-btn', 'Schließen')
        .click()
        .wait(1)
    })

    // TODO: MarkdownEditor generates different styles and classes depending on Windows/Mac/Linux scrollbars, therefore difficult with SnapshotTest
    // cy.get('.vf-wrapper')
    //   .eq(0)
    //   .toMatchHtmlSnapshot({ name: 'MarkdownEditor - VeoForm' })
    cy.get('.vf-wrapper')
      .eq(0)
      .find('.vf-markdown-editor')
      .should('not.be.null')

    cy.contains('.fse-input', 'Name Test 2').should('contain.text', 'Name Test 2 name MarkdownEditor')
  })

  it('opens InputUri dialogs, changes data in dialogs and save them', function() {
    cy.loadFse('formschema/elements/input-uri.json')
    cy.contains('.fse-input', 'Dokument')
      .should('contain.text', 'Dokument process_GeneralInformation_document InputUri')
      .find('.mdi-pencil')
      .closest('.v-btn')
      .click()
      .wait(1)
    cy.get('.v-dialog--active').within(dialogEl => {
      cy.get('.v-card__title').should('contain.text', 'Input Element anpassen')
      cy.get('.v-form').should('contain.text', 'Beschriftung des Elements*:')
      cy.contains('.v-text-field', 'Beschriftung')
        .find('input')
        .should('have.value', 'Dokument')
        .closest('.v-text-field')
        .type('{selectall}{backspace}Dokument Test')
      cy.get('.v-form').should('contain.text', 'Steuerelement Typ:')
      cy.contains('.v-select', 'Typ')
        .should('have.class', 'v-input--is-disabled')
        .should('contain.text', 'InputUri')
      cy.get('.v-card__actions')
        .contains('.v-btn', 'Speichern')
        .click()
        .wait(1)
    })

    cy.get('.mdi-code-tags')
      .closest('.v-btn')
      .click()
      .wait(1)
    cy.get('.v-dialog--active').within(dialogEl => {
      cy.get('.editor .cm-content').then(function(editor) {
        cy.wrap(getEditorData(editor)).toMatchSnapshot({ name: 'InputUri - FS' })
      })
      cy.get('.v-card__actions')
        .contains('.v-btn', 'Schließen')
        .click()
        .wait(1)
    })

    cy.get('.vf-wrapper')
      .eq(0)
      .toMatchHtmlSnapshot({ name: 'InputUri - VeoForm' })

    cy.contains('.fse-input', 'Dokument Test').should(
      'contain.text',
      'Dokument Test process_GeneralInformation_document InputUri'
    )
  })

  it('opens InputDate dialogs, changes data in dialogs and save them', function() {
    cy.loadFse('formschema/elements/input-date.json')
    cy.contains('.fse-input', 'Erhebung durchgeführt am')
      .should('contain.text', 'Erhebung durchgeführt am process_ProcessingDetails_surveyConductedOn InputDate')
      .find('.mdi-pencil')
      .closest('.v-btn')
      .click()
      .wait(1)

    cy.get('.v-dialog--active').within(dialogEl => {
      cy.get('.v-card__title').should('contain.text', 'Input Element anpassen')
      cy.get('.v-form').should('contain.text', 'Beschriftung des Elements*:')
      cy.contains('.v-text-field', 'Beschriftung')
        .find('input')
        .should('have.value', 'Erhebung durchgeführt am')
        .closest('.v-text-field')
        .type('{selectall}{backspace}Erhebung durchgeführt am Test')

      cy.get('.v-form').should('contain.text', 'Steuerelement Typ:')
      cy.contains('.v-select', 'Typ')
        .should('have.class', 'v-input--is-disabled')
        .should('contain.text', 'InputDate')

      cy.get('.v-card__actions')
        .contains('.v-btn', 'Speichern')
        .click()
        .wait(1)
    })

    cy.get('.mdi-code-tags')
      .closest('.v-btn')
      .click()
      .wait(1)
    cy.get('.v-dialog--active').within(dialogEl => {
      cy.get('.editor .cm-content').then(function(editor) {
        cy.wrap(getEditorData(editor)).toMatchSnapshot({ name: 'InputUri - FS' })
      })
      cy.get('.v-card__actions')
        .contains('.v-btn', 'Schließen')
        .click()
        .wait(1)
    })

    cy.get('.vf-wrapper')
      .eq(0)
      .toMatchHtmlSnapshot({ name: 'InputUri - VeoForm' })

    cy.contains('.fse-input', 'Erhebung durchgeführt am Test').should(
      'contain.text',
      'Erhebung durchgeführt am Test process_ProcessingDetails_surveyConductedOn InputDate'
    )
  })

  it('opens Checkbox dialogs, changes data in dialogs and save them', function() {
    cy.loadFse('formschema/elements/checkbox.json')
    cy.contains('.fse-input', 'Datenverarbeitung besonders sensitiver Daten?')
      .should(
        'contain.text',
        'Datenverarbeitung besonders sensitiver Daten? process_SensitiveData_SensitiveData Checkbox'
      )
      .find('.mdi-pencil')
      .closest('.v-btn')
      .click()
      .wait(1)
    cy.get('.v-dialog--active').within(dialogEl => {
      cy.get('.v-card__title').should('contain.text', 'Input Element anpassen')
      cy.get('.v-form').should('contain.text', 'Beschriftung des Elements*:')
      cy.contains('.v-text-field', 'Beschriftung')
        .find('input')
        .should('have.value', 'Datenverarbeitung besonders sensitiver Daten?')
        .closest('.v-text-field')
        .type('{selectall}{backspace}Datenverarbeitung besonders sensitiver Daten? Test')
      cy.get('.v-form').should('contain.text', 'Steuerelement Typ:')
      cy.contains('.v-select', 'Typ')
        .should('have.class', 'v-input--is-disabled')
        .should('contain.text', 'Checkbox')
      cy.get('.v-card__actions')
        .contains('.v-btn', 'Speichern')
        .click()
        .wait(1)
    })

    cy.get('.mdi-code-tags')
      .closest('.v-btn')
      .click()
      .wait(1)
    cy.get('.v-dialog--active').within(dialogEl => {
      cy.get('.editor .cm-content').then(function(editor) {
        cy.wrap(getEditorData(editor)).toMatchSnapshot({ name: 'Checkbox - FS' })
      })
      cy.get('.v-card__actions')
        .contains('.v-btn', 'Schließen')
        .click()
        .wait(1)
    })

    cy.get('.vf-wrapper')
      .eq(0)
      .toMatchHtmlSnapshot({ name: 'Checkbox - VeoForm' })

    cy.contains('.fse-input', 'Datenverarbeitung besonders sensitiver Daten? Test').should(
      'contain.text',
      'Datenverarbeitung besonders sensitiver Daten? Test process_SensitiveData_SensitiveData Checkbox'
    )
  })

  it('opens Select/Radio/Autocomplete dialogs, changes data in dialogs and save them', function() {
    cy.loadFse('formschema/elements/select-radio-autocomplete.json')

    cy.get('.mdi-code-tags')
      .closest('.v-btn')
      .click()
      .wait(1)
    cy.get('.v-dialog--active').within(dialogEl => {
      cy.get('.editor .cm-content').then(function(editor) {
        cy.wrap(getEditorData(editor)).toMatchSnapshot({ name: 'Select - FS' })
      })
      cy.get('.v-card__actions')
        .contains('.v-btn', 'Schließen')
        .click()
        .wait(1)
    })

    cy.get('.vf-wrapper')
      .eq(0)
      .toMatchHtmlSnapshot({ name: 'Select - VeoForm' })

    cy.contains('.fse-input', 'Art der Erhebung')
      .should('contain.text', 'Art der Erhebung process_ProcessingDetails_typeOfSurvey Select')
      .find('.mdi-pencil')
      .closest('.v-btn')
      .click()
      .wait(1)

    cy.get('.v-dialog--active').within(dialogEl => {
      cy.get('.v-card__title').should('contain.text', 'Input Element anpassen')
      cy.get('.v-form').should('contain.text', 'Beschriftung des Elements*:')
      cy.contains('.v-text-field', 'Beschriftung')
        .find('input')
        .should('have.value', 'Art der Erhebung')
        .closest('.v-text-field')
        .type('{selectall}{backspace}Art der Erhebung Test 1')

      cy.get('.v-form').should('contain.text', 'Steuerelement Typ:')
      cy.contains('.v-select', 'Typ')
        .should('contain.text', 'Select')
        .type('Radio{enter}')

      cy.get('.v-card__actions')
        .contains('.v-btn', 'Speichern')
        .click()
        .wait(1)
    })

    cy.get('.mdi-code-tags')
      .closest('.v-btn')
      .click()
      .wait(1)
    cy.get('.v-dialog--active').within(dialogEl => {
      cy.get('.editor .cm-content').then(function(editor) {
        cy.wrap(getEditorData(editor)).toMatchSnapshot({ name: 'Radio - FS' })
      })
      cy.get('.v-card__actions')
        .contains('.v-btn', 'Schließen')
        .click()
        .wait(1)
    })

    cy.get('.vf-wrapper')
      .eq(0)
      .toMatchHtmlSnapshot({ name: 'Radio - VeoForm' })

    cy.contains('.fse-input', 'Art der Erhebung Test 1')
      .should('contain.text', 'Art der Erhebung Test 1 process_ProcessingDetails_typeOfSurvey Radio')
      .find('.mdi-pencil')
      .closest('.v-btn')
      .click()
      .wait(1)

    cy.get('.v-dialog--active').within(dialogEl => {
      cy.get('.v-card__title').should('contain.text', 'Input Element anpassen')
      cy.contains('.v-text-field', 'Beschriftung')
        .find('input')
        .should('have.value', 'Art der Erhebung Test 1')
        .closest('.v-text-field')
        .type('{selectall}{backspace}{selectall}{backspace}Art der Erhebung Test 2')

      cy.contains('.v-select', 'Typ')
        .should('contain.text', 'Radio')
        .type('Autocomplete{enter}')

      cy.get('.v-card__actions')
        .contains('.v-btn', 'Speichern')
        .click()
        .wait(1)
    })

    cy.get('.mdi-code-tags')
      .closest('.v-btn')
      .click()
      .wait(1)
    cy.get('.v-dialog--active').within(dialogEl => {
      cy.get('.editor .cm-content').then(function(editor) {
        cy.wrap(getEditorData(editor)).toMatchSnapshot({ name: 'Autocomplete - FS' })
      })
      cy.get('.v-card__actions')
        .contains('.v-btn', 'Schließen')
        .click()
        .wait(1)
    })

    cy.get('.vf-wrapper')
      .eq(0)
      .toMatchHtmlSnapshot({ name: 'Autocomplete - VeoForm' })

    cy.contains('.fse-input', 'Art der Erhebung Test 2').should(
      'contain.text',
      'Art der Erhebung Test 2 process_ProcessingDetails_typeOfSurvey Autocomplete'
    )
  })

  it('opens LinksField dialogs, changes data in dialogs and save them', function() {
    cy.loadFse('formschema/elements/links-field.json')
    cy.contains('.fse-input', 'Empfänger Intern')
      .should('contain.text', 'Empfänger Intern process_InternalRecipientLink LinksField')
      .find('.mdi-pencil')
      .closest('.v-btn')
      .click()
      .wait(1)

    cy.get('.v-dialog--active').within(dialogEl => {
      cy.get('.v-card__title').should('contain.text', 'Input Element anpassen')
      cy.get('.v-form').should('contain.text', 'Beschriftung des Elements*:')
      cy.contains('.v-text-field', 'Beschriftung')
        .find('input')
        .should('have.value', 'Empfänger Intern')
        .closest('.v-text-field')
        .type('{selectall}{backspace}Empfänger Intern Test')

      cy.get('.v-form').should('contain.text', 'Steuerelement Typ:')
      cy.contains('.v-select', 'Typ')
        .should('have.class', 'v-input--is-disabled')
        .should('contain.text', 'LinksField')

      cy.get('.v-form').should('contain.text', 'Linkattribute:')
      cy.contains('.v-autocomplete', 'Linkattribute')
        .type('{downarrow}{enter}{downarrow}{enter}{downarrow}{enter}{esc}')
        .should('contain.text', 'purpose, explanation, document')

      cy.get('.v-form').should('contain.text', 'Ausrichtung:')
      cy.contains('.v-autocomplete', 'Ausrichtung')
        .find('input')
        .should('have.value', 'Horizontal')
        .closest('.v-autocomplete')
        .type('Vertikal{enter}')

      cy.get('.dragArea')
        .find('.fse-input')
        .should('have.length', 3)

      cy.get('.v-card__actions')
        .contains('.v-btn', 'Speichern')
        .click()
        .wait(1)
    })

    cy.get('.mdi-code-tags')
      .closest('.v-btn')
      .click()
      .wait(1)
    cy.get('.v-dialog--active').within(dialogEl => {
      cy.get('.editor .cm-content').then(function(editor) {
        cy.wrap(getEditorData(editor)).toMatchSnapshot({ name: 'LinksField - FS' })
      })
      cy.get('.v-card__actions')
        .contains('.v-btn', 'Schließen')
        .click()
        .wait(1)
    })

    cy.get('.vf-wrapper')
      .eq(0)
      .toMatchHtmlSnapshot({ name: 'LinksField - VeoForm' })

    cy.contains('.fse-input', 'Empfänger Intern Test').should(
      'contain.text',
      'Empfänger Intern Test process_InternalRecipientLink LinksField'
    )
  })

  it('opens FseLabel dialogs, changes data in dialogs and save them', function() {
    cy.loadFse('formschema/elements/label.json')
    cy.get('.fse-label')
      .eq(0)
      .should('not.contain.text')
      .find('.mdi-pencil')
      .closest('.v-btn')
      .click()
      .wait(1)

    cy.get('.v-dialog--active').within(dialogEl => {
      cy.get('.v-card__title').should('contain.text', 'Text Element anpassen')
      cy.get('.v-form').should('contain.text', 'Text des Elements*:')
      cy.contains('.v-text-field', 'Text').type('Text 1 für das Textelement')

      cy.get('.v-form').should('contain.text', 'CSS Klassen:')
      cy.contains('.v-select--is-multi.v-autocomplete', 'Klassen').type('class1{enter}class2{enter}class3{enter}')

      cy.get('.v-form').should('contain.text', 'CSS Styles:')
      cy.contains('.v-select--is-multi.v-autocomplete', 'Styles').type(
        'color:green{enter}margin-left:50px{enter}font-size:20px{enter}'
      )

      cy.get('.v-card__actions')
        .contains('.v-btn', 'Speichern')
        .click()
        .wait(1)
    })

    cy.get('.fse-label')
      .eq(0)
      .should('contain.text', 'Text 1 für das Textelement')

    cy.get('.mdi-code-tags')
      .closest('.v-btn')
      .click()
      .wait(1)
    cy.get('.v-dialog--active').within(dialogEl => {
      cy.get('.editor .cm-content').then(function(editor) {
        cy.wrap(getEditorData(editor)).toMatchSnapshot({ name: 'Label 1 - FS' })
      })
      cy.get('.v-card__actions')
        .contains('.v-btn', 'Schließen')
        .click()
        .wait(1)
    })

    cy.get('.vf-wrapper')
      .eq(0)
      .toMatchHtmlSnapshot({ name: 'Label 1 - VeoForm' })

    cy.get('.fse-label')
      .eq(1)
      .should('not.contain.text')
      .find('.mdi-pencil')
      .closest('.v-btn')
      .click()
      .wait(1)

    cy.get('.v-dialog--active').within(dialogEl => {
      cy.get('.v-card__title').should('contain.text', 'Text Element anpassen')
      cy.get('.v-form').should('contain.text', 'Text des Elements*:')
      cy.contains('.v-text-field', 'Text').type('Text 2 für das Textelement')

      cy.get('.v-form').should('contain.text', 'CSS Klassen:')
      cy.contains('.v-select--is-multi.v-autocomplete', 'Klassen').type('class1{enter}class2{enter}class3{enter}')

      cy.get('.v-form').should('contain.text', 'CSS Styles:')
      cy.contains('.v-select--is-multi.v-autocomplete', 'Styles').type(
        'color:blue{enter}margin-left:80px{enter}font-size:14px{enter}'
      )

      cy.get('.v-card__actions')
        .contains('.v-btn', 'Speichern')
        .click()
        .wait(1)
    })

    cy.get('.mdi-code-tags')
      .closest('.v-btn')
      .click()
      .wait(1)
    cy.get('.v-dialog--active').within(dialogEl => {
      cy.get('.editor .cm-content').then(function(editor) {
        cy.wrap(getEditorData(editor)).toMatchSnapshot({ name: 'Label 2 - FS' })
      })
      cy.get('.v-card__actions')
        .contains('.v-btn', 'Schließen')
        .click()
        .wait(1)
    })

    cy.get('.vf-wrapper')
      .eq(0)
      .toMatchHtmlSnapshot({ name: 'Label 2 - VeoForm' })

    cy.get('.fse-label')
      .eq(1)
      .should('contain.text', 'Text 2 für das Textelement')
  })

  it('opens FseGroup dialogs, changes data in dialogs and save them', function() {
    cy.loadFse('formschema/elements/group.json')
    cy.get('.dropzone')
      .find('.fse-group')
      .eq(0)
      .find('.dragArea')
      .should('have.class', 'flex-column direction-vertical')
      .find('.fse-input')
      .should('have.length', 2)

    cy.get('.dropzone')
      .find('.fse-group')
      .eq(0)
      .find('.mdi-pencil')
      .eq(0)
      .closest('.v-btn')
      .click()
      .wait(1)

    cy.get('.v-dialog--active').within(dialogEl => {
      cy.get('.v-card__title').should('contain.text', 'Gruppen Element anpassen')
      cy.get('.v-form').should('contain.text', 'Beschriftung des Elements:')
      cy.contains('.v-text-field', 'Beschriftung')
        .find('input')
        .should('not.have.value')
        .closest('.v-text-field')
        .type('Gruppe Test 1')

      cy.get('.v-form').should('contain.text', 'Ausrichtung*:')
      cy.contains('.v-autocomplete', 'Ausrichtung')
        .find('input')
        .should('have.value', 'Vertikal')
        .closest('.v-autocomplete')
        .type('Horizontal{enter}')

      cy.get('.v-form').should('contain.text', 'CSS Klassen:')
      cy.contains('.v-select--is-multi.v-autocomplete', 'Klassen').type('border{enter}')

      cy.get('.v-form').should('contain.text', 'CSS Styles:')
      cy.contains('.v-select--is-multi.v-autocomplete', 'Styles').type('margin-left:20px{enter}')

      cy.get('.v-card__actions')
        .contains('.v-btn', 'Speichern')
        .click()
        .wait(1)
    })

    cy.get('.mdi-code-tags')
      .closest('.v-btn')
      .click()
      .wait(1)
    cy.get('.v-dialog--active').within(dialogEl => {
      cy.get('.editor .cm-content').then(function(editor) {
        cy.wrap(JSON.parse(JSON.stringify(getEditorData(editor)).replace(textOrGroupLangRegex, ''))).toMatchSnapshot({
          name: 'Group 1 - FS'
        })
      })
      cy.get('.v-card__actions')
        .contains('.v-btn', 'Schließen')
        .click()
        .wait(1)
    })

    cy.get('.vf-wrapper')
      .eq(0)
      .toMatchHtmlSnapshot({ name: 'Group 1 - VeoForm' })

    cy.get('.dropzone')
      .find('.fse-group')
      .eq(0)
      .should('contain.text', 'Gruppe Test 1')
      .find('.dragArea')
      .should('have.class', 'flex-row direction-horizontal')
      .find('.fse-input')
      .should('have.length', 2)

    cy.get('.dropzone')
      .find('.fse-group')
      .eq(1)
      .find('.dragArea')
      .should('have.class', 'flex-column direction-vertical')
      .find('.fse-input')
      .should('have.length', 2)

    cy.get('.dropzone')
      .find('.fse-group')
      .eq(1)
      .find('.mdi-pencil')
      .eq(0)
      .closest('.v-btn')
      .click()
      .wait(1)

    cy.get('.v-dialog--active').within(dialogEl => {
      cy.get('.v-card__title').should('contain.text', 'Gruppen Element anpassen')
      cy.contains('.v-text-field', 'Beschriftung')
        .find('input')
        .should('not.have.value')
        .closest('.v-text-field')
        .type('Gruppe Test 2')

      cy.get('.v-form').should('contain.text', 'Ausrichtung*:')
      cy.contains('.v-autocomplete', 'Ausrichtung')
        .find('input')
        .should('have.value', 'Vertikal')

      cy.get('.v-card__actions')
        .contains('.v-btn', 'Speichern')
        .click()
        .wait(1)
    })

    cy.get('.mdi-code-tags')
      .closest('.v-btn')
      .click()
      .wait(1)
    cy.get('.v-dialog--active').within(dialogEl => {
      cy.get('.editor .cm-content').then(function(editor) {
        cy.wrap(JSON.parse(JSON.stringify(getEditorData(editor)).replace(textOrGroupLangRegex, ''))).toMatchSnapshot({
          name: 'Group 2 - FS'
        })
      })
      cy.get('.v-card__actions')
        .contains('.v-btn', 'Schließen')
        .click()
        .wait(1)
    })

    cy.get('.vf-wrapper')
      .eq(0)
      .toMatchHtmlSnapshot({ name: 'Group 2 - VeoForm' })

    cy.get('.dropzone')
      .find('.fse-group')
      .eq(1)
      .should('contain.text', 'Gruppe Test 2')
      .find('.dragArea')
      .should('have.class', 'flex-column direction-vertical')
      .find('.fse-input')
      .should('have.length', 2)
  })

  it('deletes elements', function() {
    cy.loadFse('formschema/minimal.json')
    cy.get('.fse-label')
      .find('.mdi-delete')
      .closest('.v-btn')
      .click()
      .wait(1)
    cy.get('.v-dialog--active .v-card__title').should('contain.text', 'Element löschen')
    cy.get('.v-dialog--active .v-card__actions')
      .contains('.v-btn', 'Löschen')
      .click()
      .wait(1)

    cy.get('.fse-group')
      .find('.mdi-delete')
      .eq(0)
      .closest('.v-btn')
      .click()
      .wait(1)
    cy.get('.v-dialog--active .v-card__title').should('contain.text', 'Element löschen')
    cy.get('.v-dialog--active .v-card__actions')
      .contains('.v-btn', 'Löschen')
      .click()
      .wait(1)

    cy.get('.fse-input')
      .find('.mdi-delete')
      .closest('.v-btn')
      .click()
      .wait(1)
    cy.get('.v-dialog--active .v-card__title').should('contain.text', 'Element löschen')
    cy.get('.v-dialog--active .v-card__actions')
      .contains('.v-btn', 'Löschen')
      .click()
      .wait(1)

    cy.get('.dropzone')
      .find('.fse-label')
      .should('have.length', 0)
    cy.get('.dropzone')
      .find('.fse-group')
      .should('have.length', 0)
    cy.get('.dropzone')
      .find('.fse-input')
      .should('have.length', 0)
  })

  it('adds, updates, deletes translations', function() {
    cy.loadFse('formschema/dialogs.json')
    // Add translations
    cy.get('.mdi-translate')
      .closest('.v-btn')
      .click()
      .wait(1)
    cy.get('.v-dialog--active').within(dialogEl => {
      cy.get('.editor .cm-content').then(function(editor) {
        cy.wrap(getEditorData(editor)).toMatchSnapshot({ name: 'Translations initial empty' })

        // TODO: this is a hack to load OS in Code Editor. It needs a better solution
        const el = editor.closest('.d-flex.flex-column') as any
        el[0].__vue__.$emit('input', JSON.stringify(translationsAdded, null, 2))
      })

      cy.get('.v-card__actions')
        .contains('.v-btn', 'Speichern')
        .click()
        .wait(1)
    })

    cy.get('.dropzone').toMatchHtmlSnapshot({ name: 'Translations added - FSE' })
    cy.get('.vf-wrapper')
      .eq(0)
      .toMatchHtmlSnapshot({ name: 'Translations added - VeoForm' })

    // Change translations
    cy.get('.mdi-translate')
      .closest('.v-btn')
      .click()
      .wait(1)
    cy.get('.v-dialog--active').within(dialogEl => {
      cy.get('.editor .cm-content').then(function(editor) {
        cy.wrap(getEditorData(editor)).toMatchSnapshot({ name: 'Translations added' })

        // TODO: this is a hack to load OS in Code Editor. It needs a better solution
        const el = editor.closest('.d-flex.flex-column') as any
        el[0].__vue__.$emit('input', JSON.stringify(translationsChanged, null, 2))
      })

      cy.get('.v-card__actions')
        .contains('.v-btn', 'Speichern')
        .click()
        .wait(1)
    })

    cy.get('.dropzone').toMatchHtmlSnapshot({ name: 'Translations changed - FSE' })
    cy.get('.vf-wrapper')
      .eq(0)
      .toMatchHtmlSnapshot({ name: 'Translations changed - VeoForm' })

    // Delete translations
    cy.get('.mdi-translate')
      .closest('.v-btn')
      .click()
      .wait(1)
    cy.get('.v-dialog--active').within(dialogEl => {
      cy.get('.editor .cm-content').then(function(editor) {
        cy.wrap(getEditorData(editor)).toMatchSnapshot({ name: 'Translations deleted' })

        // TODO: this is a hack to load OS in Code Editor. It needs a better solution
        const el = editor.closest('.d-flex.flex-column') as any
        el[0].__vue__.$emit('input', JSON.stringify(translationsDeleted, null, 2))
      })

      cy.get('.v-card__actions')
        .contains('.v-btn', 'Speichern')
        .click()
        .wait(1)
    })

    cy.get('.dropzone').toMatchHtmlSnapshot({ name: 'Translations deleted - FSE' })
    cy.get('.vf-wrapper')
      .eq(0)
      .toMatchHtmlSnapshot({ name: 'Translations deleted - VeoForm' })
  })

  it('compares downloaded schema with the actual one', function() {
    cy.loadFse('formschema/minimal.json')
    cy.get('.mdi-download')
      .closest('.v-btn')
      .click()
      .wait(1)

    cy.readFile('cypress/downloads/fs_Test Formschema.json').then(downloadedFS => {
      cy.wrap(downloadedFS).toMatchSnapshot()
    })
  })
})
