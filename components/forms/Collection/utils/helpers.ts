/*
 * verinice.veo web
 * Copyright (C) 2021  Davit Svandize
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
import { UISchemaElement } from '@/types/UISchema';

// Nuxt compile throws warnings if this is no default export exists
export default {};

function isEveryConditionTrue(conditions: boolean[]): boolean {
  return conditions.every((condition) => condition === true);
}

export function calculateConditionsScore(conditions: boolean[], additionalCustomAdvantage: number = 0): number {
  // @param: additionalCustomAdvantage (Optional)
  // if current conditions must have some custom advantage in comparison.

  // If every condition is satisfied, than calculate number of conditions
  // else not every condition is satisfied and therefore return 0
  return (isEveryConditionTrue(conditions) ? conditions.length : 0) + additionalCustomAdvantage;
}
export interface FormElementProps {
  name: string;
  schema: JSONSchema7;
  elements: UISchemaElement[];
  options?: {
    [key: string]: any;
  };
  value: any;
  disabled: boolean;
  visible: boolean;
}

export interface LayoutProps {
  options?: {
    [key: string]: any;
  };
  disabled: boolean;
  visible: boolean;
}

export interface Helpful<T> {
  matchingScore: (props: T) => number;
}

// TODO: Is it good way to get rid of "as Function" Warnings
export type ContextListener = (event: any) => void;
