export default {
  clone: 'Clone',

  unsavedChanges: 'There are unsaved changes. Do you really want to leave this page?',

  'editor.basicproperties': 'Basic properties',
  'editor.customaspects': 'Custom aspects',
  'editor.customaspects.add': 'Add aspect',
  'editor.customlinks': 'Custom links',
  'editor.inputtypes.array': 'Array',
  'editor.inputtypes.boolean': 'Boolean',
  'editor.inputtypes.enum': 'Selection',
  'editor.inputtypes.integer': 'Integer',
  'editor.inputtypes.layout': 'Group',
  'editor.inputtypes.null': 'Null',
  'editor.inputtypes.number': 'Number',
  'editor.inputtypes.object': 'Object',
  'editor.inputtypes.string': 'Text',
  'editor.inputtypes.label': 'Text',
  'editor.inputtypes.unknown': 'Unknown',
  'editor.formschema.create.title': 'Form schema name',
  'editor.formschema.create.title.text': 'Name of the new form schema',
  'editor.formschema.create.type': 'Object schema type',
  'editor.formschema.create.type.text': 'Type of the object schema',
  'editor.formschema.edit.css.class': 'CSS classes',
  'editor.formschema.edit.css.style': 'CSS styles',
  'editor.formschema.edit.css.class.text': 'Classes',
  'editor.formschema.edit.css.style.text': 'Styles',
  'editor.formschema.edit.input.direction': 'Direction',
  'editor.formschema.edit.input.direction.horizontal': 'horizontal',
  'editor.formschema.edit.input.direction.vertical': 'vertical',
  'editor.formschema.edit.input.label': 'Label',
  'editor.formschema.edit.input.label.text': 'Element label',
  'editor.formschema.headline': 'Form schema editor',
  'editor.formschema.sorting': 'Sort value',
  'editor.formschema.subtype': 'Subtype',
  'editor.formschema.translation': 'Custom translations',
  'editor.objectschema.headline': 'Object schema editor',
  'editor.schema.download': 'Download schema',
  'editor.schema.warnings': 'Warnings',
  'editor.schema.properties': 'Schema properties',

  'error.title': 'An error occured',
  error404: '404 - Not found',

  'global.button.cancel': 'Cancel',
  'global.button.close': 'Close',
  'global.button.delete': 'Delete',
  'global.button.next': 'Next',
  'global.button.no': 'No',
  'global.button.ok': 'Okay',
  'global.button.previous': 'Previous',
  'global.button.save': 'Save',
  'global.button.save_quit': 'Save and exit',
  'global.button.apply': 'Apply',
  'global.button.reset': 'Reset',
  'global.button.yes': 'Yes',
  'global.input.required': 'The field is required',
  'global.input.requiredfields': '* Required fields',
  'global.logout': 'Logout',
  'global.menu.collapse': 'Collapse menu',
  'global.menu.expand': 'Fix menu',

  objectlist: {
    abbreviation: 'Abbreviation',
    createdAt: 'Created at',
    designator: 'Designator',
    description: 'Description',
    hasChildObjects: 'has parts',
    name: 'object name',
    notPartOfGroup: 'not part of another object',
    objectType: 'Object type',
    status: 'Status',
    subType: 'Subtype',
    updatedAt: 'Last change',
    updatedBy: 'Editor'
  },

  'page.editors.title': 'Editors',
  'page.editors.calltoaction': 'What do you want to do?',

  'page.help.title': 'Manual',

  'page.index.title': 'Unit selection',
  'page.index.chooseunit': 'Please choose a Unit',
  'page.index.chooseunitplaceholder': 'Search for a unit...',

  'domain.index.title': 'Dashboard',

  'unit.create': 'Create new unit',
  'unit.create.short': 'Create unit',
  'unit.created': 'Unit was created',
  'unit.default.name': 'Unit 1',
  'unit.default.description': 'Your first unit',
  'unit.details.children': 'Child units',
  'unit.details.description': 'Beschreibung',
  'unit.details.description.required': 'A unit description is required!',
  'unit.details.name': 'Unit name',
  'unit.details.name.required': 'A unit name is required!',
  'unit.details.nochild': 'No child units',
  'unit.details.nodescription': 'No description provided',
  'unit.details.noparent': 'Top-Level unit',
  'unit.details.objects': 'Object overview',
  'unit.details.parent': 'Parent unit',
  'unit.index.title': 'Unit Dashboard',
  'unit.select.label': 'Unit',

  breadcrumbs: {
    catalogs: 'Catalogs',
    domain: 'Module',
    editor: 'Editors',
    formschema: 'Formschema editor',
    help: 'Manual',
    index: 'Unit selection',
    more: 'More modules',
    objects: 'Objects',
    objectschema: 'Objektschema editor',
    reports: 'Reports',
    risks: 'Risk definitions'
  },

  // NBRX-1765 object type names are hardcoded in the frontend for the moment. Will change at some point
  objectTypes: {
    asset: 'asset',
    assets: 'assets',
    control: 'control',
    controls: 'controls',
    document: 'document',
    documents: 'documents',
    incident: 'incident',
    incidents: 'incidents',
    person: 'person',
    persons: 'persons',
    process: 'process',
    processes: 'processes',
    scenario: 'scenario',
    scenarios: 'scenarios',
    scope: 'scope',
    scopes: 'scopes'
  },

  // temporary until the composition api supports <i18n></i18n>
  saveSchemaError: "Couldn't update schema",
  saveSchemaSuccess: 'Schema updated!',
  attributeTypes: {
    date: 'Date',
    dateTime: 'Date and Time',
    text: 'Text',
    uri: 'URI'
  },

  error: {
    format: 'The field "{field}" has to match the format "{format}"',
    required: 'The field "{field}" is required',
    required_link: 'The {position} link in "{field}" has to point to an object or must be removed'
  },

  forbidden: 'Access forbidden',
  forbiddenNavigationHint: 'You were returned to the previous page.'
};
