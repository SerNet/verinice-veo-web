interface ProjectLocale {
  errors: ProjectLocaleErrors;
}

interface ProjectLocaleVariables {
  AUTH_LOGIN_FAILED: {};
  CREATE_ELEMENT_FAILED: {};
  FETCH_CHILD_ELEMENTS_FAILED: { id: string };
  FETCH_ELEMENT_FAILED: { id: string };
  FETCH_ELEMENTS_FAILED: {};
  FETCH_HISTORY_FAILED: { id: string };
  FETCH_LINKS_FAILED: { id: string };
  FETCH_ROOT_ELEMENTS_FAILED: {};
  FETCH_SCHEMA_FAILED: { name: string };
  FETCH_SCHEMAS_FAILED: {};
  REMOVE_ELEMENT_FAILED: { id: string };
  REMOVE_LINK_FAILED: { id: string };
  UPDATE_ELEMENT_FAILED: { id: string };
}

type ProjectLocaleErrors = {
  [P in keyof ProjectLocaleVariables]: ((context: ProjectLocaleVariables[P]) => NonNullable<string>) | string
};
