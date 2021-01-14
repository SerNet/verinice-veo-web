const PRIMARY_NAV_MINI_VARIANT = 'primary-navigation-drawer--mini-variant';
const NAV_ENTRY_VEO_DATA_COLLAPSED = 'primary-navigation-drawer--nav-entry-veo-data-collapsed';
const NAV_ENTRY_VEO_FORMS_COLLAPSED = 'primary-navigation-drawer--nav-entry-veo-forms-collapsed';

export default class LocalStorage {
  static clear() {
    localStorage.clear();
  }

  static set(key: string, value: string | null) {
    if(value === null)
      localStorage.removeItem(key);
    else
      localStorage.setItem(key, value);
  }

  static get(key: string) {
    return localStorage.getItem(key);
  }

  static getBoolean(key: string) {
    return LocalStorage.get(key) === true.toString();
  }

  static setBoolean(key: string, value: boolean) {
    LocalStorage.set(key, value.toString())
  }


  static set primaryNavMiniVariant(value: boolean) {
    LocalStorage.setBoolean(PRIMARY_NAV_MINI_VARIANT, value)
  }

  static get primaryNavMiniVariant() {
    return LocalStorage.getBoolean(PRIMARY_NAV_MINI_VARIANT)
  }


  static get navEntryVeoDataCollapsed() {
    return LocalStorage.getBoolean(NAV_ENTRY_VEO_DATA_COLLAPSED)
  }
  
  static set navEntryVeoDataCollapsed(value: boolean) {
    LocalStorage.setBoolean(NAV_ENTRY_VEO_DATA_COLLAPSED, value)
  }

  static get navEntryVeoFormsCollapsed() {
    return LocalStorage.getBoolean(NAV_ENTRY_VEO_FORMS_COLLAPSED)
  }
  
  static set navEntryVeoFormsCollapsed(value: boolean) {
    LocalStorage.setBoolean(NAV_ENTRY_VEO_FORMS_COLLAPSED, value)
  }
}