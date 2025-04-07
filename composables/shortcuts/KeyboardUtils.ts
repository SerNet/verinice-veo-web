/*
 * verinice.veo web
 * Copyright (C) 2025 Aziz Khalledi
 *
 * This program is free software: you can redistribute it and/or modify it
 * under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3 of the License,
 * or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program.
 * If not, see <http://www.gnu.org/licenses/>.
 */

// Platform detection
export const isMac = typeof navigator !== 'undefined' ? /Mac|iPod|iPhone|iPad/.test(navigator.userAgent || '') : false;
// Key type categorization for styling
export enum KeyType {
  MODIFIER = 'modifier', // Shift, Ctrl, Alt, etc.
  FUNCTION = 'function', // F1-F12
  NAVIGATION = 'navigation', // Arrows, Home, End, etc.
  SPECIAL = 'special', // Esc, Tab, etc.
  LETTER = 'letter', // A-Z
  NUMBER = 'number', // 0-9
  SYMBOL = 'symbol', // ?, !, etc.
  ACTION = 'action' // Enter, Backspace, Delete, etc.
}

// Key data interface with all information needed for visualization
export interface KeyData {
  symbol: string; // Display symbol or text
  keyType: KeyType; // Category for styling
  description?: string; // Optional description
  width?: 'normal' | 'wide' | 'extra-wide'; // For special width keys
}

// Symbol mappings
interface KeySymbolMapping {
  [key: string]: string;
}

// macOS specific symbols
const macSymbols: KeySymbolMapping = {
  shift: '⇧',
  ctrl: '⌃',
  alt: '⌥',
  option: '⌥',
  cmd: '⌘',
  command: '⌘',
  meta: '⌘',
  return: '↩',
  enter: '↩',
  backspace: '⌫',
  delete: '⌦',
  esc: '⎋',
  escape: '⎋',
  tab: '⇥',
  space: '␣',
  up: '↑',
  down: '↓',
  left: '←',
  right: '→',
  pageup: '⇞',
  pagedown: '⇟',
  home: '↖',
  end: '↘',
  plus: '+',
  minus: '-',
  capslock: '⇪',
  '?': '?'
};

// Windows/Linux specific symbols
const windowsSymbols: KeySymbolMapping = {
  shift: 'Shift',
  ctrl: 'Ctrl',
  alt: 'Alt',
  option: 'Alt',
  cmd: 'Win',
  command: 'Win',
  meta: 'Win',
  return: 'Enter',
  enter: 'Enter',
  backspace: 'Backspace',
  delete: 'Del',
  esc: 'Esc',
  escape: 'Esc',
  tab: 'Tab',
  space: 'Space',
  up: '↑',
  down: '↓',
  left: '←',
  right: '→',
  pageup: 'Page Up',
  pagedown: 'Page Down',
  home: 'Home',
  end: 'End',
  plus: '+',
  minus: '-',
  capslock: 'Caps',
  '?': '?'
};

// Key type mapping to categorize keys
const keyTypeMapping: Record<string, KeyType> = {
  // Modifiers
  shift: KeyType.MODIFIER,
  ctrl: KeyType.MODIFIER,
  alt: KeyType.MODIFIER,
  option: KeyType.MODIFIER,
  cmd: KeyType.MODIFIER,
  command: KeyType.MODIFIER,
  meta: KeyType.MODIFIER,

  // Action keys
  return: KeyType.ACTION,
  enter: KeyType.ACTION,
  backspace: KeyType.ACTION,
  delete: KeyType.ACTION,
  space: KeyType.ACTION,

  // Special keys
  esc: KeyType.SPECIAL,
  escape: KeyType.SPECIAL,
  tab: KeyType.SPECIAL,
  capslock: KeyType.SPECIAL,

  // Navigation keys
  up: KeyType.NAVIGATION,
  down: KeyType.NAVIGATION,
  left: KeyType.NAVIGATION,
  right: KeyType.NAVIGATION,
  pageup: KeyType.NAVIGATION,
  pagedown: KeyType.NAVIGATION,
  home: KeyType.NAVIGATION,
  end: KeyType.NAVIGATION
};

// Key width mapping for special sized keys
const keyWidthMapping: Record<string, 'normal' | 'wide' | 'extra-wide'> = {
  shift: 'wide',
  ctrl: 'wide',
  enter: 'wide',
  backspace: 'wide',
  space: 'extra-wide',
  tab: 'wide',
  capslock: 'wide',
  return: 'wide'
};

/**
 * Get the symbol for a specific key based on the user's platform
 * @param key The key to get the symbol for
 * @returns The platform-specific symbol for the key
 */
function getKeySymbol(key: string): string {
  const normalizedKey = key.toLowerCase();
  const symbols = isMac ? macSymbols : windowsSymbols;
  return symbols[normalizedKey] || key;
}

/**
 * Get detailed key data including symbol, type, width, and style information
 * @param key The key name to get data for
 * @returns Full key data for rendering
 */
export function getKeyData(key: string): KeyData {
  const normalizedKey = key.toLowerCase();
  const symbol = getKeySymbol(normalizedKey);
  const keyType =
    keyTypeMapping[normalizedKey] ||
    (normalizedKey.match(/^[a-z]$/) ? KeyType.LETTER
    : normalizedKey.match(/^[0-9]$/) ? KeyType.NUMBER
    : /^[^\w\s]$/.test(normalizedKey) ? KeyType.SYMBOL
    : KeyType.LETTER);

  return {
    symbol,
    keyType,
    width: keyWidthMapping[normalizedKey] || 'normal',
    description: getKeyDescription(normalizedKey)
  };
}

/**
 * Get a user-friendly description for a key
 */
function getKeyDescription(key: string): string | undefined {
  const descriptions: Record<string, string> = {
    shift: 'Shift key, used with other keys',
    ctrl: 'Control key, used for shortcuts',
    alt: 'Alt key (Option on Mac)',
    cmd: 'Command key (Windows key on PC)',
    meta: 'Command key (Windows key on PC)',
    esc: 'Escape key, often used to cancel actions',
    enter: 'Enter key, confirms actions',
    return: 'Return key, confirms actions',
    space: 'Spacebar',
    tab: 'Tab key, navigates between fields'
  };

  return descriptions[key];
}

/**
 * Format a keyboard shortcut string to use platform-specific symbols
 * @param shortcut The shortcut string (e.g., "cmd+s" or "ctrl+shift+f")
 * @returns Formatted shortcut with platform-specific symbols
 */
export function formatKeyboardShortcut(shortcut: string | null): string {
  if (!shortcut) return '';

  return shortcut
    .split('+')
    .map((key) => getKeySymbol(key.trim()))
    .join(' + ');
}

/**
 * Get detailed data for all keys in a shortcut
 * @param shortcut The shortcut string (e.g., "cmd+s" or "ctrl+shift+f")
 * @returns Array of key data objects for each key in the shortcut
 */
export function getShortcutKeyData(shortcut: string): KeyData[] {
  if (!shortcut) return [];

  return shortcut.split('+').map((key) => getKeyData(key.trim()));
}

/**
 * Check if focus is in an input element
 * @param el The element to check
 * @returns True if the element is an input element
 */
export function isInputElement(el: Element | null): boolean {
  if (!el) return false;

  const tagName = el.tagName.toLowerCase();
  return (
    tagName === 'input' ||
    tagName === 'textarea' ||
    tagName === 'select' ||
    el.hasAttribute('contenteditable') ||
    el.getAttribute('role') === 'textbox' ||
    el.getAttribute('role') === 'combobox'
  );
}
