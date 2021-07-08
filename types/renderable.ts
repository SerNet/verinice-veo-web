import { UISchema } from '@/types/UISchema';
import { JSONSchema7 } from 'json-schema';

export interface Renderable {
  schema: JSONSchema7;
  ui: UISchema;
  value: {
    [propName: string]: any;
  };
}
