interface ProjectLocale {
  errors: ProjectLocaleErrors;
}

interface ProjectLocaleVariables {
  AUTH_LOGIN_FAILED: any;
  FETCH_ELEMENT_FAILED: { id: string };
  FETCH_ROOT_ELEMENTS_FAILED: any;
  FETCH_CHILD_ELEMENTS_FAILED: any;
  FETCH_LINKS_FAILED: any;
  FETCH_HISTORY_FAILED: any;
  CREATE_ELEMENT_FAILED: any;
  UPDATE_ELEMENT_FAILED: any;
  FETCH_SCHEMA_FAILED: any;
}

type ProjectLocaleErrors = Record<keyof ProjectLocaleVariables, string>;
