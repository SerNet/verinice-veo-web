const PRIMARY_NAV_MINI_VARIANT = 'primary-navigation-drawer--mini-variant';
const NAV_ENTRY_EXPANDED = 'primary-navigation-drawer--nav-entry-expanded';
const LAST_DOMAIN = 'last-domain';
const LAST_UNIT = 'last-unit';
const FIRST_STEPS_COMPLETED = 'first-steps-completed';

const PERSIST_ON_LOGOUT = [FIRST_STEPS_COMPLETED];

export default class LocalStorage {
  static clear() {
    const itemsToPersist: { key: string; value: string | null }[] = [];

    for (const item of PERSIST_ON_LOGOUT) {
      itemsToPersist.push({ key: item, value: localStorage.getItem(item) });
    }

    localStorage.clear();

    for (const { key, value } of itemsToPersist) {
      if (value !== null) {
        localStorage.setItem(key, value);
      }
    }
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

  static get lastDomain() {
    return LocalStorage.get(LAST_DOMAIN);
  }

  static set lastDomain(value: string | null) {
    LocalStorage.set(LAST_DOMAIN, value);
  }

  static get lastUnit() {
    return LocalStorage.get(LAST_UNIT);
  }

  static set lastUnit(value: string | null) {
    LocalStorage.set(LAST_UNIT, value);
  }

  static get firstStepsCompleted() {
    return LocalStorage.getBoolean(FIRST_STEPS_COMPLETED, false);
  }

  static set firstStepsCompleted(value: boolean) {
    LocalStorage.setBoolean(FIRST_STEPS_COMPLETED, value);
  }
}
