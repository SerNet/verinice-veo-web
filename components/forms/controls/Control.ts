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
import { computed, ComputedRef, defineComponent, h, inject } from '@nuxtjs/composition-api';
import { maxBy } from 'lodash';
import { useI18n } from 'nuxt-i18n-composable';
import { JsonPointer } from 'json-ptr';

import { VeoFormsControlProps } from '../util';
import * as VeoAutocomplete from './VeoAutocomplete.vue';
import * as VeoCheckbox from './VeoCheckbox.vue';
import * as VeoInputDate from './VeoInputDate.vue';
import * as VeoInputDateTime from './VeoInputDateTime.vue';
import * as VeoInputNumber from './VeoInputNumber.vue';
import * as VeoInputText from './VeoInputText.vue';
import * as VeoInputTextMultiline from './VeoInputTextMultiline.vue';
import * as VeoInputUri from './VeoInputUri.vue';
import * as VeoLinksField from './VeoLinksField.vue';
import * as VeoLinksFieldRow from './VeoLinksFieldRow.vue';
import * as VeoMarkdownEditor from './VeoMarkdownEditor.vue';
import * as VeoRadio from './VeoRadio.vue';
import * as VeoSelect from './VeoSelect.vue';
import { IBaseObject } from '~/lib/utils';

const AVAILABLE_CONTROLS = [
  VeoAutocomplete,
  VeoCheckbox,
  VeoInputDate,
  VeoInputDateTime,
  VeoInputNumber,
  VeoInputText,
  VeoInputTextMultiline,
  VeoInputUri,
  VeoLinksField,
  VeoLinksFieldRow,
  VeoMarkdownEditor,
  VeoRadio,
  VeoSelect
];

export default defineComponent({
  props: VeoFormsControlProps,
  emits: ['input'],
  setup(props, { emit, slots }) {
    const objectData = inject<ComputedRef<IBaseObject>>('objectData');
    const translations = inject<ComputedRef<IBaseObject>>('translations');

    const { locale } = useI18n();

    const controls = AVAILABLE_CONTROLS.flatMap((control) => {
      const definition = control.CONTROL_DEFINITION;
      if (definition) {
        if (process.dev && props.debug) {
          // eslint-disable-next-line no-console
          console.log(`VeoForm::Control: Checking whether ${definition.name[locale.value] || definition.name[0]} meets all conditions...`);
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
    });

    if (process.dev && props.debug) {
      for (const control of controls) {
        // eslint-disable-next-line no-console
        console.log(
          `Control ${control.control.CONTROL_DEFINITION.name[locale.value] || control.control.CONTROL_DEFINITION.name[0]} has ${control.truthyConditions} truthy conditions`
        );
      }
    }

    const items = computed(() => {
      const items = props.objectSchema.enum || [props.objectSchema.items || []].flat().flatMap((def) => (typeof def === 'object' ? def.enum || [] : []));
      return items.map((item, index) => (props.options.enum ? { text: props.options.enum[index], value: item } : { text: translations?.value[String(item)] || item, value: item }));
    });

    const valuePointer = computed(() => (props.index !== undefined ? props.valuePointer.replace('items', props.index + '') : props.valuePointer));
    const elementKey = computed(() => (props.index !== undefined ? props.elementKey?.replace('items', props.index + '') : props.elementKey));

    // If the element is part of a custom link, we have to modify some props. We can't do it in VeoForm as the index isn't accesible there, so we do it here
    const _props = computed<any>(() => ({
      ...props,
      items: items.value,
      valuePointer: valuePointer.value,
      value: JsonPointer.get(objectData?.value, valuePointer.value),
      elementKey: elementKey.value
    }));

    return () =>
      h(maxBy(controls, 'truthyConditions')?.control.default, {
        props: _props.value,
        key: elementKey.value,
        scopedSlots: {
          default: () => (slots.default ? slots.default() : undefined)
        },
        on: {
          input: (newValue: any) => emit('input', _props.value.objectSchemaPointer, newValue, _props.value.value, _props.value.index)
        }
      });
  }
});
