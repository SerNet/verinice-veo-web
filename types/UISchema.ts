/*
 * verinice.veo web
 * Copyright (C) 2021  Davit Svandize, Markus Werner
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
import { JSONSchema7 } from 'json-schema';

// eslint-disable-next-line no-use-before-define
export type UISchemaElement = Layout | Control | Label;

export type UISchema = UISchemaElement;

export interface UIRule {
  effect: 'HIDE' | 'SHOW' | 'DISABLE' | 'ENABLE';
  condition: {
    scope: string;
    schema: JSONSchema7;
  };
}

export interface UIElement {
  type: string;
  elements?: UISchemaElement[];
  rule?: UIRule;
}

export interface Layout extends UIElement {
  type: 'Layout';
  options: {
    [key: string]: any;
  };
}

export interface Control extends UIElement {
  type: 'Control';
  scope?: string;
  label?: string;
  options?: {
    [key: string]: any;
  };
}

export interface Label extends UIElement {
  type: 'Label';
  text: string;
  options?: {
    [key: string]: any;
  };
}
