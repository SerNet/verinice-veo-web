import { JSONSchema7 } from 'json-schema';
export type UISchema = UISchemaElement;

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

export interface UIRule {
  effect: 'HIDE' | 'SHOW' | 'DISABLE' | 'ENABLE';
  condition: {
    scope: string;
    schema: JSONSchema7;
  };
}

export type UISchemaElement = Layout | Control | Label;
