export default {
  clone: 'Kopie',

  unsavedChanges: 'Es gibt ungespeicherte Änderungen. Wollen Sie die Seite wirklich verlassen?',

  'editor.basicproperties': 'Standardattribute',
  'editor.customaspects': 'Individuelle Aspekte',
  'editor.customaspects.add': 'Aspekte hinzufügen',
  'editor.customlinks': 'Individuelle Links',
  'editor.inputtypes.array': 'Array',
  'editor.inputtypes.boolean': 'Wahrheitswert',
  'editor.inputtypes.enum': 'Auswahl',
  'editor.inputtypes.integer': 'Ganzzahl',
  'editor.inputtypes.layout': 'Gruppe',
  'editor.inputtypes.null': 'Null',
  'editor.inputtypes.number': 'Zahl',
  'editor.inputtypes.object': 'Objekt',
  'editor.inputtypes.string': 'Text',
  'editor.inputtypes.label': 'Text',
  'editor.inputtypes.unknown': 'Unbekannt',
  'editor.formschema.create.title': 'Name des Formschemas',
  'editor.formschema.create.title.text': 'Name des neuen Formschemas',
  'editor.formschema.create.type': 'Objektschematyp',
  'editor.formschema.create.type.text': 'Typ des Objektschemas',
  'editor.formschema.edit.css.class': 'CSS-Klassen',
  'editor.formschema.edit.css.style': 'CSS-Styles',
  'editor.formschema.edit.css.class.text': 'Klassen',
  'editor.formschema.edit.css.style.text': 'Styles',
  'editor.formschema.edit.input.direction': 'Ausrichtung',
  'editor.formschema.edit.input.direction.horizontal': 'Horizontal',
  'editor.formschema.edit.input.direction.vertical': 'Vertikal',
  'editor.formschema.edit.input.label': 'Beschriftung',
  'editor.formschema.edit.input.label.text': 'Beschriftung des Elements',
  'editor.formschema.headline': 'Formschema-Editor',
  'editor.formschema.sorting': 'Sortierwert',
  'editor.formschema.subtype': 'Sub Typ',
  'editor.formschema.translation': 'Benutzerdefinierte Übersetzungen',
  'editor.objectschema.headline': 'Objektschema-Editor',
  'editor.schema.download': 'Schema herunterladen',
  'editor.schema.properties': 'Schema-Eigenschaften',
  'editor.schema.warnings': 'Hinweise',

  'error.title': 'Es ist ein Fehler aufgetreten',
  error404: '404 - Nicht gefunden',

  'global.button.cancel': 'Abbrechen',
  'global.button.close': 'Schließen',
  'global.button.delete': 'Löschen',
  'global.button.next': 'Weiter',
  'global.button.no': 'Nein',
  'global.button.ok': 'Okay',
  'global.button.previous': 'Zurück',
  'global.button.save': 'Speichern',
  'global.button.save_quit': 'Speichern und Schließen',
  'global.button.apply': 'Übernehmen',
  'global.button.reset': 'Zurücksetzen',
  'global.button.yes': 'Ja',
  'global.input.required': 'Das Feld muss ausgefüllt werden',
  'global.input.requiredfields': '* Pflichtfelder',
  'global.logout': 'Logout',
  'global.menu.collapse': 'Menü verstecken',
  'global.menu.expand': 'Menü fixieren',

  objectlist: {
    abbreviation: 'Abkürzung',
    createdAt: 'Erstellzeitpunkt',
    designator: 'Designator',
    description: 'Beschreibung',
    hasChildObjects: 'hat Bestandteile',
    name: 'Objektname',
    notPartOfGroup: 'nicht Teil eines anderen Objektes',
    objectType: 'Objekttyp',
    status: 'Status',
    subType: 'Subtyp',
    updatedAt: 'Letzte Änderung',
    updatedBy: 'Bearbeiter'
  },

  'page.editors.title': 'Editoren',
  'page.editors.calltoaction': 'Was möchten Sie tun?',

  'page.help.title': 'Handbuch',

  'page.index.title': 'Unitauswahl',
  'page.index.chooseunit': 'Bitte wählen Sie eine Unit',
  'page.index.chooseunitplaceholder': 'Nach einer Unit suchen...',

  'domain.index.title': 'Dashboard',

  'unit.create': 'Neue Unit erstellen',
  'unit.create.short': 'Unit erstellen',
  'unit.created': 'Unit wurde erstellt',
  'unit.default.name': 'Unit 1',
  'unit.default.description': 'Deine erste Unit',
  'unit.details.children': 'Untergeordnete Units',
  'unit.details.description': 'Beschreibung',
  'unit.details.description.required': 'Bitte tragen Sie eine Beschreibung ein.',
  'unit.details.name': 'Name der Unit',
  'unit.details.name.required': 'Bitte tragen Sie einen Unit-Namen ein.',
  'unit.details.nochild': 'Keine untegeordneten Units vorhanden',
  'unit.details.nodescription': 'Keine Beschreibung festgelegt',
  'unit.details.noparent': 'Top-Level Unit',
  'unit.details.objects': 'Objekte',
  'unit.details.parent': 'Übergeordnete Unit',
  'unit.index.title': 'Unit-Dashboard',
  'unit.select.label': 'Unit',

  breadcrumbs: {
    administration: 'Clientverwaltung',
    catalogs: 'Kataloge',
    docs: 'Dokumentation',
    domain: 'Modul',
    editor: 'Editoren',
    formschema: 'Formschema Editor',
    help: 'Handbuch',
    index: 'Unitauswahl',
    more: 'Weitere Module',
    objects: 'Objekte',
    objectschema: 'Objektschema Editor',
    reports: 'Reports',
    risks: 'Risikodefinitionen'
  },

  // temporary until the composition api supports <i18n></i18n>
  saveSchemaError: 'Das Schema konnte nicht aktualisiert werden',
  saveSchemaSuccess: 'Schema wurde aktualisiert!',
  attributeTypes: {
    date: 'Datum',
    dateTime: 'Datum und Uhrzeit',
    text: 'Text',
    uri: 'URI'
  },

  error: {
    additionalProperties: 'Das Feld "{field}" ist nicht Teil dieses Objektschemas und darf nicht gesetzt sein.',
    enum: 'Das Feld "{field}" besitzt einen nicht erlaubten Wert',
    format: 'Das Feld "{field}" muss dem Format "{format}" entsprechen',
    required: 'Das Feld "{field}" muss ausgefüllt sein',
    required_link: 'Der {position} Link in "{field}" muss auf ein Objekt zeigen oder entfernt werden'
  }
};
