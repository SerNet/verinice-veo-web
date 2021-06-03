import { JSONSchema7 } from 'json-schema';
import { UISchemaElement } from '@/types/UISchema';

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
