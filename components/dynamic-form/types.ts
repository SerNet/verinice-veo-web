/*
 * verinice.veo web
 * Copyright (C) 2022  Jonas Heitmann
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

export default {};

export interface IVeoFormsAdditionalContext {
  [pointer: string]: {
    objectSchema?: Record<string, any>;
    formSchema?: Record<string, any>;
  };
}

export interface IVeoFormsReactiveFormActions {
  [pointer: string]: ((
    newValue: any,
    oldValue: any,
    newObject: Record<string, any>,
    oldObject: Record<string, any>
  ) => Record<string, any>)[];
}

export interface IVeoFormsTranslations {
  [lang: string]: Record<string, any>;
}

export interface IVeoFormElementRule {
  visible: boolean;
  disabled: boolean;
}

export type IDynamicFormElementOptions = Record<string, any> &
  IVeoFormElementRule;

export interface IVeoFormElementDefaultProps {
  metaData: JSONSchema7;
  disabled: boolean;
  objectCreationDisabled: boolean;
  debug: boolean;
  [key: string]: any;
}

export interface IVeoFormsElementDefinition {
  code: string;
  name: { [lang: string]: string }; // Name of this component (used in FormSchemaEditor)
  description: { [lang: string]: string }; // Description describing this component (used in FormSchemaEditor)
  conditions?: (_props: IVeoFormElementDefaultProps) => boolean[]; // Every condition has to be truthy in order for this component to get displayed. Components with more truthy conditions will be displayed first.
  bias?: number; // Bias so this component gets choosen over other components with the same amount of truthy conditions
}

export interface IVeoFormElementFormSchemaRule {
  effect: 'HIDE' | 'SHOW' | 'DISABLE' | 'ENABLE';
  condition: {
    scope: string;
    schema: JSONSchema7;
  };
}

export interface IVeoFormElementFormSchema {
  type: string;
  options: IDynamicFormElementOptions;
  elements?: IVeoFormElementFormSchema[];
  rule?: IVeoFormElementFormSchemaRule;
}

export interface IVeoFormControlFormSchema extends IVeoFormElementFormSchema {
  scope: string;
  label: string;
}

export interface IVeoFormLabelFormSchema extends IVeoFormElementFormSchema {
  text: string;
}

export interface IVeoFormWidgetFormSchema extends IVeoFormElementFormSchema {
  name: string;
}
