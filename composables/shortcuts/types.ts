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

export const SHORTCUT_DIALOG_DISPLAY = 'Shift + ?';
export const CATEGORY_DOMAIN_NAVIGATION = 'Domain Navigation';
export const SEQUENCE_TIMEOUT_MS = 1000;
export const MAX_SEQUENCE_LENGTH = 3;

export interface ShortcutAction {
  id: string;
  name: string;
  keys: string;
  description: string;
  action: () => void;
  category?: string;
  disabled?: boolean;
}

export interface ShortcutGroup {
  id: string;
  name: string;
  shortcuts: ShortcutAction[];
}

export interface TrieNode {
  shortcuts: ShortcutAction[];
  children: Map<string, TrieNode>;
}

export interface MatchResult {
  exactMatches: ShortcutAction[];
  hasPartialMatches: boolean;
}

export interface KeyboardHandlerOptions {
  onExactMatch: (shortcut: ShortcutAction) => void;
  onSequenceReset: () => void;
  isEnabled: () => boolean;
}

export interface ShortcutRegistry {
  register: (group: ShortcutGroup) => void;
  unregister: (id?: string) => void;
  clear: () => void;
}
