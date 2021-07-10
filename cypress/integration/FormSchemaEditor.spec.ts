/// <reference path="../support/index.d.ts" />

import { getEditorData } from '../support/utils';

const textOrGroupLangRegex = /(group|text)_[a-zA-Z0-9._-]+/g;

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
};

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
};

const translationsDeleted = {};

interface ITo {
  requestUrlPattern: RegExp | string;
  fixturePath: string;
  browserUrl: string;
}

const tos: { [key: string]: ITo } = {
  emptyProcess: {
    requestUrlPattern: /https:\/\/veo-forms\.develop\.\w+\.\w+\/3ebd14a2-eb7d-4d18-a9ad-2056da85569e/,
    fixturePath: 'formschema/empty-process.json',
    browserUrl: '/editor/formschema?fs=3ebd14a2-eb7d-4d18-a9ad-2056da85569e'
  },
  inputTextMultilineMarkdown: {
    requestUrlPattern: /https:\/\/veo-forms\.develop\.\w+\.\w+\/1a3b9e9d-b451-4b44-b0c0-b0d18ac806d4/,
    fixturePath: 'formschema/elements/input-text-multiline-markdown.json',
    browserUrl: '/editor/formschema?fs=1a3b9e9d-b451-4b44-b0c0-b0d18ac806d4'
  },
  inputUri: {
    requestUrlPattern: /https:\/\/veo-forms\.develop\.\w+\.\w+\/d8e2e6bc-ea88-49e6-9622-0f64435d9e85/,
    fixturePath: 'formschema/elements/input-uri.json',
    browserUrl: '/editor/formschema?fs=d8e2e6bc-ea88-49e6-9622-0f64435d9e85'
  },
  inputDate: {
    requestUrlPattern: /https:\/\/veo-forms\.develop\.\w+\.\w+\/a809dbab-7b29-409e-9e5f-9ffb66e33868/,
    fixturePath: 'formschema/elements/input-date.json',
    browserUrl: '/editor/formschema?fs=a809dbab-7b29-409e-9e5f-9ffb66e33868'
  },
  checkbox: {
    requestUrlPattern: /https:\/\/veo-forms\.develop\.\w+\.\w+\/6972a6be-6fe6-4905-96d6-12d265c79667/,
    fixturePath: 'formschema/elements/checkbox.json',
    browserUrl: '/editor/formschema?fs=6972a6be-6fe6-4905-96d6-12d265c79667'
  },
  selectRadioAutocomplete: {
    requestUrlPattern: /https:\/\/veo-forms\.develop\.\w+\.\w+\/4a654fcd-387b-4dfa-b96b-b0c8899c284f/,
    fixturePath: 'formschema/elements/select-radio-autocomplete.json',
    browserUrl: '/editor/formschema?fs=4a654fcd-387b-4dfa-b96b-b0c8899c284f'
  },
  linksField: {
    requestUrlPattern: /https:\/\/veo-forms\.develop\.\w+\.\w+\/d25795f6-5399-4535-bcbd-de5010cdb977/,
    fixturePath: 'formschema/elements/links-field.json',
    browserUrl: '/editor/formschema?fs=d25795f6-5399-4535-bcbd-de5010cdb977'
  },
  label: {
    requestUrlPattern: /https:\/\/veo-forms\.develop\.\w+\.\w+\/944ed8b6-3231-467c-a1ef-b54292220020/,
    fixturePath: 'formschema/elements/label.json',
    browserUrl: '/editor/formschema?fs=944ed8b6-3231-467c-a1ef-b54292220020'
  },
  group: {
    requestUrlPattern: /https:\/\/veo-forms\.develop\.\w+\.\w+\/6e3de110-6468-418f-a677-4da9c1f51b72/,
    fixturePath: 'formschema/elements/group.json',
    browserUrl: '/editor/formschema?fs=6e3de110-6468-418f-a677-4da9c1f51b72'
  },
  minimal: {
    requestUrlPattern: /https:\/\/veo-forms\.develop\.\w+\.\w+\/ef0971af-ad3c-4eb7-bcda-18088d6899c6/,
    fixturePath: 'formschema/minimal.json',
    browserUrl: '/editor/formschema?fs=ef0971af-ad3c-4eb7-bcda-18088d6899c6'
  },
  dialogs: {
    requestUrlPattern: /https:\/\/veo-forms\.develop\.\w+\.\w+\/653d6d06-f3d1-4f09-b678-2d3f5ed27b35/,
    fixturePath: 'formschema/dialogs.json',
    browserUrl: '/editor/formschema?fs=653d6d06-f3d1-4f09-b678-2d3f5ed27b35'
  }
};

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

  cy.intercept(
    {
      method: 'GET',
      url: /.*\/schemas\/process.*/
    },
    (req) => {
      req.reply({
        fixture: 'objectschema/process.json'
      });
    }
  );

  cy.goTo('/editor');
  cy.goTo(to.browserUrl);
}

describe('Formschema Editor', () => {
  before(() => {
    cy.auth();

    cy.defineEditorIntercepts();

    /**
     * Navigate through Wizard to ObjectSchemaEditor
     */
    cy.visit('/editor');
    cy.wait(['@schemas', '@forms', '@reports', '@domains']);
  });

  beforeEach(() => {
    cy.defineEditorIntercepts();
  });

  it('drags and drops elements into dropzone and nests in each other', function () {
    goTo(tos.emptyProcess);
    cy.contains('.v-sheet', 'text').drag();
    cy.get('.dropzone').drop();

    cy.contains('.v-sheet', 'group').drag();
    cy.get('.dropzone').drop();

    cy.contains('.v-sheet', 'name').drag();
    cy.get('.dropzone').drop();

    cy.contains('.v-sheet', 'process / SensitiveData_SensitiveData').drag();
    cy.get('.dropzone').drop();

    cy.contains('.v-sheet', 'process / SensitiveData_comment').drag();
    cy.get('.dropzone').drop();

    cy.contains('.v-sheet', 'process / ProcessingDetails_typeOfSurvey').drag();
    cy.get('.dropzone').drop();

    cy.contains('.v-sheet', 'process / InternalRecipientLink').drag();
    cy.get('.dropzone').drop();

    cy.contains('.v-sheet', 'process / TypeOfDataProcessed').drag();
    cy.get('.dropzone').drop();

    cy.contains('.v-sheet', 'description').drag();
    cy.get('.dropzone').find('.dragArea').eq(0).drop();

    cy.contains('.fse-input', 'Datenverarbeitung besonders sensitiver Daten?').find('.handle').drag();
    cy.get('.dropzone').find('.dragArea').eq(0).drop();

    cy.contains('.v-sheet', 'group').drag();
    cy.get('.dropzone').drop();

    cy.get('.dropzone').find('.fse-group').eq(0).find('.handle').eq(0).drag();
    cy.get('.dropzone').find('.dragArea').eq(1).drop();

    cy.contains('.v-sheet', 'text').drag();
    cy.get('.dropzone').find('.dragArea').eq(0).drop();

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

    cy.get('.mdi-code-tags').closest('.v-btn').click();
    cy.get('.v-dialog--active').within(() => {
      cy.get('.editor .cm-content').then(function (editor) {
        cy.wrap(JSON.parse(JSON.stringify(getEditorData(editor)).replace(textOrGroupLangRegex, ''))).toMatchSnapshot({
          name: 'Drag and Drop - FS'
        });
      });
      cy.get('.v-card__actions').contains('.v-btn', 'Schließen').click();
    });

    cy.get('.vf-wrapper').eq(0).toMatchHtmlSnapshot({ name: 'Drag and Drop - VeoForm' });
  });

  it('opens InputText/InputTextMultiline/MarkdownEditor dialogs, changes data in dialogs and save them', function () {
    goTo(tos.inputTextMultilineMarkdown);
    cy.get('.mdi-code-tags').closest('.v-btn').click();
    cy.get('.v-dialog--active').within(() => {
      cy.get('.editor .cm-content').then(function (editor) {
        cy.wrap(getEditorData(editor)).toMatchSnapshot({ name: 'InputText - FS' });
      });
      cy.get('.v-card__actions').contains('.v-btn', 'Schließen').click();
    });

    cy.get('.vf-wrapper').eq(0).toMatchHtmlSnapshot({ name: 'InputText - VeoForm' });

    cy.contains('.fse-input', 'Name')
      .should('contain.text', 'Name')
      .should('contain.text', 'name')
      .should('contain.text', 'InputText')
      .find('.mdi-pencil')
      .closest('.v-btn')
      .click();

    cy.get('.v-dialog--active').within(() => {
      cy.get('.v-card__title').should('contain.text', 'Input Element anpassen');
      cy.get('.v-form').should('contain.text', 'Beschriftung des Elements*:');
      cy.contains('.v-text-field', 'Beschriftung').find('input').should('have.value', 'Name').closest('.v-text-field').type('{selectall}{backspace}Name Test 1');

      cy.get('.v-form').should('contain.text', 'Steuerelement Typ:');
      cy.contains('.v-select', 'Typ').should('contain.text', 'InputText').type('InputTextMultiline{enter}');

      cy.get('.v-card__actions').contains('.v-btn', 'Speichern').click();
    });

    cy.get('.mdi-code-tags').closest('.v-btn').click();
    cy.get('.v-dialog--active').within(() => {
      cy.get('.editor .cm-content').then(function (editor) {
        cy.wrap(getEditorData(editor)).toMatchSnapshot({ name: 'InputTextMultiline - FS' });
      });
      cy.get('.v-card__actions').contains('.v-btn', 'Schließen').click();
    });

    cy.get('.vf-wrapper').eq(0).toMatchHtmlSnapshot({ name: 'InputTextMultiline - VeoForm' });

    cy.contains('.fse-input', 'Name Test 1')
      .should('contain.text', 'Name Test 1')
      .should('contain.text', 'name')
      .should('contain.text', 'InputTextMultiline')
      .find('.mdi-pencil')
      .closest('.v-btn')
      .click();

    cy.get('.v-dialog--active').within(() => {
      cy.get('.v-card__title').should('contain.text', 'Input Element anpassen');
      cy.contains('.v-text-field', 'Beschriftung')
        .find('input')
        .should('have.value', 'Name Test 1')
        .closest('.v-text-field')
        .type('{selectall}{backspace}{selectall}{backspace}Name Test 2');

      cy.contains('.v-select', 'Typ').should('contain.text', 'InputTextMultiline').type('MarkdownEditor{enter}');

      cy.get('.v-card__actions').contains('.v-btn', 'Speichern').click();
    });

    cy.get('.mdi-code-tags').closest('.v-btn').click();
    cy.get('.v-dialog--active').within(() => {
      cy.get('.editor .cm-content').then(function (editor) {
        cy.wrap(getEditorData(editor)).toMatchSnapshot({ name: 'MarkdownEditor - FS' });
      });
      cy.get('.v-card__actions').contains('.v-btn', 'Schließen').click();
    });

    // TODO: MarkdownEditor generates different styles and classes depending on Windows/Mac/Linux scrollbars, therefore difficult with SnapshotTest
    // cy.get('.vf-wrapper')
    //   .eq(0)
    //   .toMatchHtmlSnapshot({ name: 'MarkdownEditor - VeoForm' })
    cy.get('.vf-wrapper').eq(0).find('.vf-markdown-editor').should('not.be.null');

    cy.contains('.fse-input', 'Name Test 2').should('contain.text', 'Name Test 2').should('contain.text', 'name').should('contain.text', 'MarkdownEditor');
  });

  it('opens InputUri dialogs, changes data in dialogs and save them', function () {
    goTo(tos.inputUri);
    cy.contains('.fse-input', 'Dokument')
      .should('contain.text', 'Dokument')
      .should('contain.text', 'process_GeneralInformation_document')
      .should('contain.text', 'InputUri')
      .find('.mdi-pencil')
      .closest('.v-btn')
      .click();
    cy.get('.v-dialog--active').within(() => {
      cy.get('.v-card__title').should('contain.text', 'Input Element anpassen');
      cy.get('.v-form').should('contain.text', 'Beschriftung des Elements*:');
      cy.contains('.v-text-field', 'Beschriftung').find('input').should('have.value', 'Dokument').closest('.v-text-field').type('{selectall}{backspace}Dokument Test');
      cy.get('.v-form').should('contain.text', 'Steuerelement Typ:');
      cy.contains('.v-select', 'Typ').should('have.class', 'v-input--is-disabled').should('contain.text', 'InputUri');
      cy.get('.v-card__actions').contains('.v-btn', 'Speichern').click();
    });

    cy.get('.mdi-code-tags').closest('.v-btn').click();
    cy.get('.v-dialog--active').within(() => {
      cy.get('.editor .cm-content').then(function (editor) {
        cy.wrap(getEditorData(editor)).toMatchSnapshot({ name: 'InputUri - FS' });
      });
      cy.get('.v-card__actions').contains('.v-btn', 'Schließen').click();
    });

    cy.get('.vf-wrapper').eq(0).toMatchHtmlSnapshot({ name: 'InputUri - VeoForm' });

    cy.contains('.fse-input', 'Dokument Test')
      .should('contain.text', 'Dokument Test')
      .should('contain.text', 'process_GeneralInformation_document')
      .should('contain.text', 'InputUri');
  });

  it('opens InputDate dialogs, changes data in dialogs and save them', function () {
    goTo(tos.inputDate);
    cy.contains('.fse-input', 'Erhebung durchgeführt am')
      .should('contain.text', 'Erhebung durchgeführt am')
      .should('contain.text', 'process_ProcessingDetails_surveyConductedOn')
      .should('contain.text', 'InputDate')
      .find('.mdi-pencil')
      .closest('.v-btn')
      .click();

    cy.get('.v-dialog--active').within(() => {
      cy.get('.v-card__title').should('contain.text', 'Input Element anpassen');
      cy.get('.v-form').should('contain.text', 'Beschriftung des Elements*:');
      cy.contains('.v-text-field', 'Beschriftung')
        .find('input')
        .should('have.value', 'Erhebung durchgeführt am')
        .closest('.v-text-field')
        .type('{selectall}{backspace}Erhebung durchgeführt am Test');

      cy.get('.v-form').should('contain.text', 'Steuerelement Typ:');
      cy.contains('.v-select', 'Typ').should('have.class', 'v-input--is-disabled').should('contain.text', 'InputDate');

      cy.get('.v-card__actions').contains('.v-btn', 'Speichern').click();
    });

    cy.get('.mdi-code-tags').closest('.v-btn').click();
    cy.get('.v-dialog--active').within(() => {
      cy.get('.editor .cm-content').then(function (editor) {
        cy.wrap(getEditorData(editor)).toMatchSnapshot({ name: 'InputUri - FS' });
      });
      cy.get('.v-card__actions').contains('.v-btn', 'Schließen').click();
    });

    cy.get('.vf-wrapper').eq(0).toMatchHtmlSnapshot({ name: 'InputUri - VeoForm' });

    cy.contains('.fse-input', 'Erhebung durchgeführt am Test')
      .should('contain.text', 'Erhebung durchgeführt am Test')
      .should('contain.text', 'process_ProcessingDetails_surveyConductedOn')
      .should('contain.text', 'InputDate');
  });

  it('opens Checkbox dialogs, changes data in dialogs and save them', function () {
    goTo(tos.checkbox);
    cy.contains('.fse-input', 'Datenverarbeitung besonders sensitiver Daten?')
      .should('contain.text', 'Datenverarbeitung besonders sensitiver Daten?')
      .should('contain.text', 'process_SensitiveData_SensitiveData')
      .should('contain.text', 'Checkbox')
      .find('.mdi-pencil')
      .closest('.v-btn')
      .click();
    cy.get('.v-dialog--active').within(() => {
      cy.get('.v-card__title').should('contain.text', 'Input Element anpassen');
      cy.get('.v-form').should('contain.text', 'Beschriftung des Elements*:');
      cy.contains('.v-text-field', 'Beschriftung')
        .find('input')
        .should('have.value', 'Datenverarbeitung besonders sensitiver Daten?')
        .closest('.v-text-field')
        .type('{selectall}{backspace}Datenverarbeitung besonders sensitiver Daten? Test');
      cy.get('.v-form').should('contain.text', 'Steuerelement Typ:');
      cy.contains('.v-select', 'Typ').should('have.class', 'v-input--is-disabled').should('contain.text', 'Checkbox');
      cy.get('.v-card__actions').contains('.v-btn', 'Speichern').click();
    });

    cy.get('.mdi-code-tags').closest('.v-btn').click();
    cy.get('.v-dialog--active').within(() => {
      cy.get('.editor .cm-content').then(function (editor) {
        cy.wrap(getEditorData(editor)).toMatchSnapshot({ name: 'Checkbox - FS' });
      });
      cy.get('.v-card__actions').contains('.v-btn', 'Schließen').click();
    });

    cy.get('.vf-wrapper').eq(0).toMatchHtmlSnapshot({ name: 'Checkbox - VeoForm' });

    cy.contains('.fse-input', 'Datenverarbeitung besonders sensitiver Daten? Test')
      .should('contain.text', 'Datenverarbeitung besonders sensitiver Daten? Test')
      .should('contain.text', 'process_SensitiveData_SensitiveData')
      .should('contain.text', 'Checkbox');
  });

  it('opens Select/Radio/Autocomplete dialogs, changes data in dialogs and save them', function () {
    goTo(tos.selectRadioAutocomplete);
    cy.get('.mdi-code-tags').closest('.v-btn').click();
    cy.get('.v-dialog--active').within(() => {
      cy.get('.editor .cm-content').then(function (editor) {
        cy.wrap(getEditorData(editor)).toMatchSnapshot({ name: 'Select - FS' });
      });
      cy.get('.v-card__actions').contains('.v-btn', 'Schließen').click();
    });

    cy.get('.vf-wrapper').eq(0).toMatchHtmlSnapshot({ name: 'Select - VeoForm' });

    cy.contains('.fse-input', 'Art der Erhebung')
      .should('contain.text', 'Art der Erhebung')
      .should('contain.text', 'process_ProcessingDetails_typeOfSurvey')
      .should('contain.text', 'Select')
      .find('.mdi-pencil')
      .closest('.v-btn')
      .click();

    cy.get('.v-dialog--active').within(() => {
      cy.get('.v-card__title').should('contain.text', 'Input Element anpassen');
      cy.get('.v-form').should('contain.text', 'Beschriftung des Elements*:');
      cy.contains('.v-text-field', 'Beschriftung')
        .find('input')
        .should('have.value', 'Art der Erhebung')
        .closest('.v-text-field')
        .type('{selectall}{backspace}Art der Erhebung Test 1');

      cy.get('.v-form').should('contain.text', 'Steuerelement Typ:');
      cy.contains('.v-select', 'Typ').should('contain.text', 'Select').type('Radio{enter}');

      cy.get('.v-card__actions').contains('.v-btn', 'Speichern').click();
    });

    cy.get('.mdi-code-tags').closest('.v-btn').click();
    cy.get('.v-dialog--active').within(() => {
      cy.get('.editor .cm-content').then(function (editor) {
        cy.wrap(getEditorData(editor)).toMatchSnapshot({ name: 'Radio - FS' });
      });
      cy.get('.v-card__actions').contains('.v-btn', 'Schließen').click();
    });

    cy.get('.vf-wrapper').eq(0).toMatchHtmlSnapshot({ name: 'Radio - VeoForm' });

    cy.contains('.fse-input', 'Art der Erhebung Test 1')
      .should('contain.text', 'Art der Erhebung Test 1')
      .should('contain.text', 'process_ProcessingDetails_typeOfSurvey')
      .should('contain.text', 'Radio')
      .find('.mdi-pencil')
      .closest('.v-btn')
      .click();

    cy.get('.v-dialog--active').within(() => {
      cy.get('.v-card__title').should('contain.text', 'Input Element anpassen');
      cy.contains('.v-text-field', 'Beschriftung')
        .find('input')
        .should('have.value', 'Art der Erhebung Test 1')
        .closest('.v-text-field')
        .type('{selectall}{backspace}{selectall}{backspace}Art der Erhebung Test 2');

      cy.contains('.v-select', 'Typ').should('contain.text', 'Radio').type('Autocomplete{enter}');

      cy.get('.v-card__actions').contains('.v-btn', 'Speichern').click();
    });

    cy.get('.mdi-code-tags').closest('.v-btn').click();
    cy.get('.v-dialog--active').within(() => {
      cy.get('.editor .cm-content').then(function (editor) {
        cy.wrap(getEditorData(editor)).toMatchSnapshot({ name: 'Autocomplete - FS' });
      });
      cy.get('.v-card__actions').contains('.v-btn', 'Schließen').click();
    });

    cy.get('.vf-wrapper').eq(0).toMatchHtmlSnapshot({ name: 'Autocomplete - VeoForm' });

    cy.contains('.fse-input', 'Art der Erhebung Test 2')
      .should('contain.text', 'Art der Erhebung Test 2')
      .should('contain.text', 'process_ProcessingDetails_typeOfSurvey')
      .should('contain.text', 'Autocomplete');
  });

  it('opens LinksField dialogs, changes data in dialogs and save them', function () {
    goTo(tos.linksField);
    cy.contains('.fse-input', 'Empfänger Intern')
      .should('contain.text', 'Empfänger Intern')
      .should('contain.text', 'process_InternalRecipientLink')
      .should('contain.text', 'LinksField')
      .find('.mdi-pencil')
      .closest('.v-btn')
      .click();

    cy.get('.v-dialog--active').within(() => {
      cy.get('.v-card__title').should('contain.text', 'Input Element anpassen');
      cy.get('.v-form').should('contain.text', 'Beschriftung des Elements*:');
      cy.contains('.v-text-field', 'Beschriftung')
        .find('input')
        .should('have.value', 'Empfänger Intern')
        .closest('.v-text-field')
        .type('{selectall}{backspace}Empfänger Intern Test');

      cy.get('.v-form').should('contain.text', 'Steuerelement Typ:');
      cy.contains('.v-select', 'Typ').should('have.class', 'v-input--is-disabled').should('contain.text', 'LinksField');

      cy.get('.v-form').should('contain.text', 'Linkattribute:');
      cy.contains('.v-autocomplete', 'Linkattribute').type('{downarrow}{enter}{downarrow}{enter}{downarrow}{enter}{esc}').should('contain.text', 'purpose, explanation, document');

      cy.get('.dragArea').find('.fse-input').should('have.length', 3);

      cy.get('.v-card__actions').contains('.v-btn', 'Speichern').click();
    });

    cy.get('.mdi-code-tags').closest('.v-btn').click();
    cy.get('.v-dialog--active').within(() => {
      cy.get('.editor .cm-content').then(function (editor) {
        cy.wrap(getEditorData(editor)).toMatchSnapshot({ name: 'LinksField - FS' });
      });
      cy.get('.v-card__actions').contains('.v-btn', 'Schließen').click();
    });

    cy.get('.vf-wrapper').eq(0).toMatchHtmlSnapshot({ name: 'LinksField - VeoForm' });

    cy.contains('.fse-input', 'Empfänger Intern Test')
      .should('contain.text', 'Empfänger Intern Test')
      .should('contain.text', 'process_InternalRecipientLink')
      .should('contain.text', 'LinksField');
  });

  it('opens FseLabel dialogs, changes data in dialogs and save them', function () {
    goTo(tos.label);
    cy.get('.fse-label').eq(0).should('not.contain.text').find('.mdi-pencil').closest('.v-btn').click();

    cy.get('.v-dialog--active').within(() => {
      cy.get('.v-card__title').should('contain.text', 'Text Element anpassen');
      cy.get('.v-form').should('contain.text', 'Text des Elements*:');
      cy.contains('.v-text-field', 'Text').type('Text 1 für das Textelement');

      cy.get('.v-form').should('contain.text', 'CSS Klassen:');
      cy.contains('.v-select--is-multi.v-autocomplete', 'Klassen').type('class1{enter}class2{enter}class3{enter}');

      cy.get('.v-form').should('contain.text', 'CSS Styles:');
      cy.contains('.v-select--is-multi.v-autocomplete', 'Styles').type('color:green{enter}margin-left:50px{enter}font-size:20px{enter}');

      cy.get('.v-card__actions').contains('.v-btn', 'Speichern').click();
    });

    cy.get('.fse-label').eq(0).should('contain.text', 'Text 1 für das Textelement');

    cy.get('.mdi-code-tags').closest('.v-btn').click();
    cy.get('.v-dialog--active').within(() => {
      cy.get('.editor .cm-content').then(function (editor) {
        cy.wrap(getEditorData(editor)).toMatchSnapshot({ name: 'Label 1 - FS' });
      });
      cy.get('.v-card__actions').contains('.v-btn', 'Schließen').click();
    });

    cy.get('.vf-wrapper').eq(0).toMatchHtmlSnapshot({ name: 'Label 1 - VeoForm' });

    cy.get('.fse-label').eq(1).should('not.contain.text').find('.mdi-pencil').closest('.v-btn').click();

    cy.get('.v-dialog--active').within(() => {
      cy.get('.v-card__title').should('contain.text', 'Text Element anpassen');
      cy.get('.v-form').should('contain.text', 'Text des Elements*:');
      cy.contains('.v-text-field', 'Text').type('Text 2 für das Textelement');

      cy.get('.v-form').should('contain.text', 'CSS Klassen:');
      cy.contains('.v-select--is-multi.v-autocomplete', 'Klassen').type('class1{enter}class2{enter}class3{enter}');

      cy.get('.v-form').should('contain.text', 'CSS Styles:');
      cy.contains('.v-select--is-multi.v-autocomplete', 'Styles').type('color:blue{enter}margin-left:80px{enter}font-size:14px{enter}');

      cy.get('.v-card__actions').contains('.v-btn', 'Speichern').click();
    });

    cy.get('.mdi-code-tags').closest('.v-btn').click();
    cy.get('.v-dialog--active').within(() => {
      cy.get('.editor .cm-content').then(function (editor) {
        cy.wrap(getEditorData(editor)).toMatchSnapshot({ name: 'Label 2 - FS' });
      });
      cy.get('.v-card__actions').contains('.v-btn', 'Schließen').click();
    });

    cy.get('.vf-wrapper').eq(0).toMatchHtmlSnapshot({ name: 'Label 2 - VeoForm' });

    cy.get('.fse-label').eq(1).should('contain.text', 'Text 2 für das Textelement');
  });

  it('opens FseGroup dialogs, changes data in dialogs and save them', function () {
    goTo(tos.group);
    cy.get('.dropzone').find('.fse-group').eq(0).find('.dragArea').should('have.class', 'flex-column direction-vertical').find('.fse-input').should('have.length', 2);

    cy.get('.dropzone').find('.fse-group').eq(0).find('.mdi-pencil').eq(0).closest('.v-btn').click();

    cy.get('.v-dialog--active').within(() => {
      cy.get('.v-card__title').should('contain.text', 'Gruppen Element anpassen');
      cy.get('.v-form').should('contain.text', 'Beschriftung des Elements:');
      cy.contains('.v-text-field', 'Beschriftung').find('input').should('not.have.value').closest('.v-text-field').type('Gruppe Test 1');

      cy.get('.v-form').should('contain.text', 'Ausrichtung*:');
      cy.contains('.v-autocomplete', 'Ausrichtung').find('input').should('have.value', 'Vertikal').closest('.v-autocomplete').type('Horizontal{enter}');

      cy.get('.v-form').should('contain.text', 'CSS Klassen:');
      cy.contains('.v-select--is-multi.v-autocomplete', 'Klassen').type('border{enter}');

      cy.get('.v-form').should('contain.text', 'CSS Styles:');
      cy.contains('.v-select--is-multi.v-autocomplete', 'Styles').type('margin-left:20px{enter}');

      cy.get('.v-card__actions').contains('.v-btn', 'Speichern').click();
    });

    cy.get('.mdi-code-tags').closest('.v-btn').click();
    cy.get('.v-dialog--active').within(() => {
      cy.get('.editor .cm-content').then(function (editor) {
        cy.wrap(JSON.parse(JSON.stringify(getEditorData(editor)).replace(textOrGroupLangRegex, ''))).toMatchSnapshot({
          name: 'Group 1 - FS'
        });
      });
      cy.get('.v-card__actions').contains('.v-btn', 'Schließen').click();
    });

    cy.get('.vf-wrapper').eq(0).toMatchHtmlSnapshot({ name: 'Group 1 - VeoForm' });

    cy.get('.dropzone')
      .find('.fse-group')
      .eq(0)
      .should('contain.text', 'Gruppe Test 1')
      .find('.dragArea')
      .should('have.class', 'flex-row direction-horizontal')
      .find('.fse-input')
      .should('have.length', 2);

    cy.get('.dropzone').find('.fse-group').eq(1).find('.dragArea').should('have.class', 'flex-column direction-vertical').find('.fse-input').should('have.length', 2);

    cy.get('.dropzone').find('.fse-group').eq(1).find('.mdi-pencil').eq(0).closest('.v-btn').click();

    cy.get('.v-dialog--active').within(() => {
      cy.get('.v-card__title').should('contain.text', 'Gruppen Element anpassen');
      cy.contains('.v-text-field', 'Beschriftung').find('input').should('not.have.value').closest('.v-text-field').type('Gruppe Test 2');

      cy.get('.v-form').should('contain.text', 'Ausrichtung*:');
      cy.contains('.v-autocomplete', 'Ausrichtung').find('input').should('have.value', 'Vertikal');

      cy.get('.v-card__actions').contains('.v-btn', 'Speichern').click();
    });

    cy.get('.mdi-code-tags').closest('.v-btn').click();
    cy.get('.v-dialog--active').within(() => {
      cy.get('.editor .cm-content').then(function (editor) {
        cy.wrap(JSON.parse(JSON.stringify(getEditorData(editor)).replace(textOrGroupLangRegex, ''))).toMatchSnapshot({
          name: 'Group 2 - FS'
        });
      });
      cy.get('.v-card__actions').contains('.v-btn', 'Schließen').click();
    });

    cy.get('.vf-wrapper').eq(0).toMatchHtmlSnapshot({ name: 'Group 2 - VeoForm' });

    cy.get('.dropzone')
      .find('.fse-group')
      .eq(1)
      .should('contain.text', 'Gruppe Test 2')
      .find('.dragArea')
      .should('have.class', 'flex-column direction-vertical')
      .find('.fse-input')
      .should('have.length', 2);

    // Regression test for veo#226 bug
    cy.contains('.v-sheet', 'group').drag();
    cy.contains('.fse-group', 'Gruppe Test 1').drop();
    cy.get('.dropzone').find('.fse-group').eq(1).toMatchHtmlSnapshot({ name: 'Group newly added 1 - FSE' });

    cy.contains('.v-sheet', 'group').drag();
    cy.contains('.fse-group', 'Gruppe Test 2').drop();
    cy.get('.dropzone').find('.fse-group').eq(3).toMatchHtmlSnapshot({ name: 'Group newly added 2 - FSE' });
  });

  it('deletes elements', function () {
    goTo(tos.minimal);
    cy.get('.fse-label').find('.mdi-delete').closest('.v-btn').click();
    cy.get('.v-dialog--active .v-card__title').should('contain.text', 'Element löschen');
    cy.get('.v-dialog--active .v-card__actions').contains('.v-btn', 'Löschen').click();

    cy.get('.fse-group').find('.mdi-delete').eq(0).closest('.v-btn').click();
    cy.get('.v-dialog--active .v-card__title').should('contain.text', 'Element löschen');
    cy.get('.v-dialog--active .v-card__actions').contains('.v-btn', 'Löschen').click();

    cy.get('.fse-input').find('.mdi-delete').closest('.v-btn').click();
    cy.get('.v-dialog--active .v-card__title').should('contain.text', 'Element löschen');
    cy.get('.v-dialog--active .v-card__actions').contains('.v-btn', 'Löschen').click();

    cy.get('.dropzone').find('.fse-label').should('have.length', 0);
    cy.get('.dropzone').find('.fse-group').should('have.length', 0);
    cy.get('.dropzone').find('.fse-input').should('have.length', 0);
  });

  it('adds, updates, deletes translations', function () {
    goTo(tos.dialogs);
    // Add translations
    cy.get('.mdi-translate').closest('.v-btn').click();
    cy.get('.v-dialog--active').within(() => {
      cy.get('.editor .cm-content').then(function (editor) {
        cy.wrap(getEditorData(editor)).toMatchSnapshot({ name: 'Translations initial empty' });

        // TODO: this is a hack to load OS in Code Editor. It needs a better solution
        const el = editor.closest('.d-flex.flex-column') as any;
        el[0].__vue__.$emit('input', JSON.stringify(translationsAdded, null, 2));
      });

      cy.get('.v-card__actions').contains('.v-btn', 'Speichern').click();
    });

    cy.get('.dropzone').toMatchHtmlSnapshot({ name: 'Translations added - FSE' });
    cy.get('.vf-wrapper').eq(0).toMatchHtmlSnapshot({ name: 'Translations added - VeoForm' });

    // Change translations
    cy.get('.mdi-translate').closest('.v-btn').click();
    cy.get('.v-dialog--active').within(() => {
      cy.get('.editor .cm-content').then(function (editor) {
        cy.wrap(getEditorData(editor)).toMatchSnapshot({ name: 'Translations added' });

        // TODO: this is a hack to load OS in Code Editor. It needs a better solution
        const el = editor.closest('.d-flex.flex-column') as any;
        el[0].__vue__.$emit('input', JSON.stringify(translationsChanged, null, 2));
      });

      cy.get('.v-card__actions').contains('.v-btn', 'Speichern').click();
    });

    cy.get('.dropzone').toMatchHtmlSnapshot({ name: 'Translations changed - FSE' });
    cy.get('.vf-wrapper').eq(0).toMatchHtmlSnapshot({ name: 'Translations changed - VeoForm' });

    // Delete translations
    cy.get('.mdi-translate').closest('.v-btn').click();
    cy.get('.v-dialog--active').within(() => {
      cy.get('.editor .cm-content').then(function (editor) {
        cy.wrap(getEditorData(editor)).toMatchSnapshot({ name: 'Translations deleted' });

        // TODO: this is a hack to load OS in Code Editor. It needs a better solution
        const el = editor.closest('.d-flex.flex-column') as any;
        el[0].__vue__.$emit('input', JSON.stringify(translationsDeleted, null, 2));
      });

      cy.get('.v-card__actions').contains('.v-btn', 'Speichern').click();
    });

    cy.get('.dropzone').toMatchHtmlSnapshot({ name: 'Translations deleted - FSE' });
    cy.get('.vf-wrapper').eq(0).toMatchHtmlSnapshot({ name: 'Translations deleted - VeoForm' });
  });

  it('compares downloaded schema with the actual one', function () {
    goTo(tos.minimal);
    cy.get('.mdi-download').closest('.v-btn').click();

    cy.readFile('cypress/downloads/fs_test_formschema.json').then((downloadedFS) => {
      cy.wrap(downloadedFS).toMatchSnapshot();
    });
  });

  it('adds, updates formSchema meta details', function () {
    goTo(tos.emptyProcess);
    cy.get('h1').should('contain.text', 'Formschema Editor - Test Formschema');

    cy.get('.mdi-wrench').closest('.v-btn').click();
    cy.get('.v-dialog--active').within(() => {
      cy.contains('.v-text-field', 'Name des Formschemas').find('input').should('have.value', 'Test Formschema');
      cy.contains('.v-text-field', 'Sub Typ').find('input').should('have.value', 'TF');
      cy.contains('.v-text-field.v-input--is-disabled', 'Objektschematyp').find('input').should('have.value', 'process');

      cy.contains('.v-text-field', 'Name des Formschemas').type('{selectall}{backspace}Test Formschema 1 DE');
      cy.contains('.v-text-field', 'Sub Typ').find('input').type('{selectall}{backspace}TF 1');

      cy.get('.v-card__actions').contains('.v-btn', 'Speichern').click();
    });
    cy.get('h1').should('contain.text', 'Formschema Editor - Test Formschema 1 DE');

    cy.get('.mdi-code-tags').closest('.v-btn').click();
    cy.get('.v-dialog--active').within(() => {
      cy.get('.editor .cm-content').then(function (editor) {
        cy.wrap(getEditorData(editor)).toMatchSnapshot();
      });
      cy.get('.v-card__actions').contains('.v-btn', 'Schließen').click();
    });

    cy.get('.mdi-translate').closest('.v-btn').click();
    cy.get('.v-dialog--active').within(() => {
      cy.contains('.v-select', 'Sprachen').type('{downarrow}{downarrow}{enter}');
      cy.contains('.v-select', 'Sprache').type('Englisch{enter}');
      cy.get('.v-card__actions').contains('.v-btn', 'Speichern').click();
    });

    cy.get('h1').should('contain.text', 'Formschema Editor - Missing translation for EN');

    cy.get('.mdi-wrench').closest('.v-btn').click();
    cy.get('.v-dialog--active').within(() => {
      cy.contains('.v-text-field', 'Name des Formschemas').find('input').should('not.have.value');
      cy.contains('.v-text-field', 'Sub Typ').find('input').should('have.value', 'TF 1');
      cy.contains('.v-text-field.v-input--is-disabled', 'Objektschematyp').find('input').should('have.value', 'process');

      cy.contains('.v-text-field', 'Name des Formschemas').type('Test Formschema 2 EN');

      cy.get('.v-card__actions').contains('.v-btn', 'Speichern').click();
    });
    cy.get('h1').should('contain.text', 'Formschema Editor - Test Formschema 2 EN');

    cy.get('.mdi-code-tags').closest('.v-btn').click();
    cy.get('.v-dialog--active').within(() => {
      cy.get('.editor .cm-content').then(function (editor) {
        cy.wrap(getEditorData(editor)).toMatchSnapshot();
      });
      cy.get('.v-card__actions').contains('.v-btn', 'Schließen').click();
    });
  });
});
