const PRIMARY_NAV_MINI_VARIANT = 'primary-navigation-drawer--mini-variant';
const NAV_ENTRY_VEO_DATA_COLLAPSED = 'primary-navigation-drawer--nav-entry-veo-data-collapsed';
const NAV_ENTRY_VEO_FORMS_COLLAPSED = 'primary-navigation-drawer--nav-entry-veo-forms-collapsed';
const NAV_ENTRY_VEO_REPORTS_COLLAPSED = 'primary-navigation-drawer--nav-entry-veo-reports-collapsed';
const DEFAULT_UNIT_DOMAINS = 'default-unit-domains';

export default class LocalStorage {
  static clear() {
    localStorage.clear();
  }

  static set(key: string, value: string | null) {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  }

  static get(key: string) {
    return localStorage.getItem(key);
  }

  static getBoolean(key: string, ifNotSet: boolean) {
    const value = LocalStorage.get(key);
    return typeof value === 'string' ? LocalStorage.get(key) === true.toString() : ifNotSet;
  }

  static setBoolean(key: string, value: boolean) {
    LocalStorage.set(key, value.toString());
  }

  static getObject(key: string) {
    return JSON.parse(LocalStorage.get(key) || '{}');
  }

  static setObject(key: string, value: Object) {
    LocalStorage.set(key, JSON.stringify(value));
  }

  static set primaryNavMiniVariant(value: boolean) {
    LocalStorage.setBoolean(PRIMARY_NAV_MINI_VARIANT, value);
  }

  static get primaryNavMiniVariant() {
    return LocalStorage.getBoolean(PRIMARY_NAV_MINI_VARIANT, false);
  }

  static get navEntryVeoDataCollapsed() {
    return LocalStorage.getBoolean(NAV_ENTRY_VEO_DATA_COLLAPSED, true);
  }

  static set navEntryVeoDataCollapsed(value: boolean) {
    LocalStorage.setBoolean(NAV_ENTRY_VEO_DATA_COLLAPSED, value);
  }

  static get navEntryVeoFormsCollapsed() {
    return LocalStorage.getBoolean(NAV_ENTRY_VEO_FORMS_COLLAPSED, true);
  }

  static set navEntryVeoFormsCollapsed(value: boolean) {
    LocalStorage.setBoolean(NAV_ENTRY_VEO_FORMS_COLLAPSED, value);
  }

  static get navEntryVeoReportsCollapsed() {
    return LocalStorage.getBoolean(NAV_ENTRY_VEO_REPORTS_COLLAPSED, true);
  }

  static set navEntryVeoReportsCollapsed(value: boolean) {
    LocalStorage.setBoolean(NAV_ENTRY_VEO_REPORTS_COLLAPSED, value);
  }

  static get defaultUnitDomains() {
    return LocalStorage.getObject(DEFAULT_UNIT_DOMAINS);
  }

  static set defaultUnitDomains(value: Object) {
    LocalStorage.setObject(DEFAULT_UNIT_DOMAINS, value);
  }
}
