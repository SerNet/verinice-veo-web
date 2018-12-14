export default {
  errors: {
    AUTH_LOGIN_FAILED: "The login failed (status: {status})!",
    FETCH_ELEMENT_FAILED: "The data for element could not be loaded {id} (status: {status})!",
    FETCH_ROOT_ELEMENTS_FAILED: "The root nodes for the tree could not be loaded (status: {status})!",
    FETCH_CHILD_ELEMENTS_FAILED: "The child nodes of element {id} could not be loaded (status: {status})!",
    CREATE_ELEMENT_FAILED: "The element could not be created (status: {status})!",
    UPDATE_ELEMENT_FAILED: "The element {id} could not be updated (status: {status})!",
    FETCH_SCHEMA_FAILED: "The scheme {name} could not be loaded! (status: {status})",
    FETCH_LINKS_FAILED: "The links of element {id} could not be loaded! (status: {status})",
    FETCH_HISTORY_FAILED: "The change history of element {id} could not be loaded! (status: {status})"
  }
} as ProjectLocale;
