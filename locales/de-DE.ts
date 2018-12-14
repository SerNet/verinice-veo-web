export default {
  errors: {
    AUTH_LOGIN_FAILED: "Der Login ist fehlgeschlagen (Status: {status})!",
    FETCH_ELEMENT_FAILED: "Die Daten des Elements {id} konnten nicht geladen werden (Status: {status})!",
    FETCH_ROOT_ELEMENTS_FAILED: "Die Ursprungselemente des Baums konnten nicht geladen werden (Status: {status})!",
    FETCH_CHILD_ELEMENTS_FAILED: "Die Unterelemente des Elements {id} konnten nicht geladen werden (Status: {status})!",
    CREATE_ELEMENT_FAILED: "Das Element konnte nicht gespeichert werden (Status: {status})!",
    UPDATE_ELEMENT_FAILED: "Die Daten des Elements {id} konnten nicht gespeichert werden (Status: {status})!",
    FETCH_SCHEMA_FAILED: 'Das Schema "{name}" konnten nicht geladen werden! (Status: {status})',
    FETCH_LINKS_FAILED: "Die Links des Elements {id} konnten nicht geladen werden! (Status: {status})",
    FETCH_HISTORY_FAILED: "Die Änderungen des Elements {id} konnten nicht geladen werden! (Status: {status})"
  }
} as ProjectLocale;
