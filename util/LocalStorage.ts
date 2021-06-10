const PRIMARY_NAV_MINI_VARIANT = 'primary-navigation-drawer--mini-variant';
const NAV_ENTRY_EXPANDED = 'primary-navigation-drawer--nav-entry-expanded';

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

  static getNumber(key: string) {
    return Number(LocalStorage.get(key));
  }

  static setNumber(key: string, value: number) {
    LocalStorage.set(key, value + '');
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

  static get expandedNavEntry() {
    return LocalStorage.getNumber(NAV_ENTRY_EXPANDED) || -1;
  }

  static set expandedNavEntry(value: number) {
    LocalStorage.setNumber(NAV_ENTRY_EXPANDED, value);
  }
}
