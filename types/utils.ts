/*
 * verinice.veo web
 * Copyright (C) 2024 jae
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
import type { IVeoLink } from '~/types/VeoTypes';

export type TInlineComponent = {
  props?: string[];
  emits?: string[];
  data?: () => Record<string, any>;
  methods?: Record<string, (args: any) => void | any>;
  computed?: Record<string, (args: any) => void | any>;
  template?: string;
};

export function validateType<T>(value: any, typeGuard: (any) => any is T) {
  if (!typeGuard(value)) {
    throw 'invalid value:' + value;
  }
  return value;
}

export function isVeoLink(link: any): link is IVeoLink {
  return typeof link === 'object' && typeof link.targetUri === 'string';
}
