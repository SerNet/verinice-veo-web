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
import { ComputedRef } from 'vue';
import { maxBy } from 'lodash';
import { JsonPointer } from 'json-ptr';

import { VeoFormsControlProps } from '../util';
import * as Autocomplete from './Autocomplete.vue';
import * as Checkbox from './Checkbox.vue';
import * as InputDate from './InputDate.vue';
import * as InputDateTime from './InputDateTime.vue';
import * as InputNumber from './InputNumber.vue';
import * as InputText from './InputText.vue';
import * as InputTextMultiline from './InputTextMultiline.vue';
import * as InputUri from './InputUri.vue';
import * as LinksField from './LinksField.vue';
import * as LinksFieldRow from './LinksFieldRow.vue';
import * as MarkdownEditor from './MarkdownEditor.vue';
import * as Radio from './Radio.vue';
import * as Select from './Select.vue';

const AVAILABLE_CONTROLS = [
  Autocomplete,
  Checkbox,
  InputDate,
  InputDateTime,
  InputNumber,
  InputText,
  InputTextMultiline,
  InputUri,
  LinksField,
  LinksFieldRow,
  MarkdownEditor,
  Radio,
  Select
];

export default defineComponent({
  props: VeoFormsControlProps,
  emits: ['update:model-value'],
  setup(props, { emit, slots }) {
    const objectData = inject<ComputedRef<Record<string, any>>>('objectData');
    const translations = inject<ComputedRef<Record<string, any>>>('translations');

    watch(
      () => props.objectSchema,
      (newValue) => {
        // @ts-ignore We added VEO_FORMS_DEBUG_MAP to the window previously
        window.VEO_FORMS_DEBUG_MAP.set(props.objectSchemaPointer, JSON.stringify(newValue));
      },
      { immediate: true, deep: true }
    );

    const { locale } = useI18n();

    const controls = computed(() =>
      AVAILABLE_CONTROLS.flatMap((control) => {
        const definition = control.CONTROL_DEFINITION;
        if (definition) {
          if (process.dev && props.debug) {
            // eslint-disable-next-line no-console
            console.log(
              `VeoForm::Control: Checking whether ${
                definition.name[locale.value] || definition.name[0]
              } meets all conditions...`
            );
          }
          const evaluatedConditions: boolean[] = definition.conditions?.(props) || [];
          const truthyConditions = evaluatedConditions.filter((condition) => condition).length;

          if (process.dev && props.debug) {
            for (let j = 0; j < evaluatedConditions.length; j++) {
              if (evaluatedConditions[j]) {
                // eslint-disable-next-line no-console
                console.log(`VeoForm::Control: Condition ${j} is met`);
              } else {
                // eslint-disable-next-line no-console
                console.log(`VeoForm::Control: Condition ${j} is NOT met`);
              }
            }
          }

          if (evaluatedConditions.length === truthyConditions) {
            return [{ control, truthyConditions }];
          }
        }
        return [];
      })
    );

    if (process.dev && props.debug) {
      for (const control of controls.value) {
        // eslint-disable-next-line no-console
        console.log(
          `Control ${
            control.control.CONTROL_DEFINITION.name[locale.value] || control.control.CONTROL_DEFINITION.name[0]
          } has ${control.truthyConditions} truthy conditions`
        );
      }
    }

    const items = computed(() => {
      // @ts-ignore At this point we expect objectSchema to be set, so type WILL exist
      const items =
        props.objectSchema.enum ||
        [props.objectSchema.items || []].flat().flatMap((def) => (typeof def === 'object' ? def.enum || [] : []));
      return items.map((item, index) =>
        props.options.enum ?
          { title: props.options.enum[index], value: item }
        : { title: translations?.value[String(item)] || item, value: item }
      );
    });

    const valuePointer = computed(() =>
      props.index !== undefined ? props.valuePointer.replace('items', props.index + '') : props.valuePointer
    );
    const elementKey = computed(() =>
      props.index !== undefined ? props.elementKey?.replace('items', props.index + '') : props.elementKey
    );

    // If the element is part of a custom link, we have to modify some props. We can't do it in VeoForm as the index isn't accesible there, so we do it here
    const _props = computed(() => ({
      ...props,
      options: {
        ...props.options,
        disabled: props.objectSchema.readOnly || props.options.disabled
      },
      items: items.value,
      valuePointer: valuePointer.value,
      modelValue: JsonPointer.get(objectData?.value, valuePointer.value),
      elementKey: elementKey.value
    }));

    return () =>
      h(
        maxBy(controls.value, 'truthyConditions')?.control.default,
        {
          ..._props.value,
          key: elementKey.value,
          'onUpdate:modelValue': (newValue: any) =>
            emit(
              'update:model-value',
              _props.value.objectSchemaPointer,
              newValue,
              _props.value.modelValue,
              _props.value.index
            )
        },
        {
          default: slots.default ? () => slots.default() : undefined
        }
      );
  }
});
