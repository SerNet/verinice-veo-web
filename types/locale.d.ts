interface ProjectLocale {
  errors: ProjectLocaleErrors;
}

interface ProjectLocaleVariables {
  AUTH_LOGIN_FAILED: {};
  FETCH_ELEMENT_FAILED: { id: string };
  FETCH_ROOT_ELEMENTS_FAILED: {};
  FETCH_CHILD_ELEMENTS_FAILED: { id: string };
  FETCH_LINKS_FAILED: { id: string };
  FETCH_HISTORY_FAILED: { id: string };
  CREATE_ELEMENT_FAILED: {};
  UPDATE_ELEMENT_FAILED: { id: string };
  FETCH_SCHEMA_FAILED: { name: string };
}

type ProjectLocaleErrors = Record<keyof ProjectLocaleVariables, string>;
