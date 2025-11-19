/*
 * verinice.veo web
 * Copyright (C) 2024 Jonas Heitmann, Frank Schneider
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
import { maxBy } from 'lodash';

import { VeoFormsElementProps } from '../util';
import * as Group from './Group.vue';
import * as Accordion from './Accordion.vue';

const AVAILABLE_LAYOUTS = [Group, Accordion];

export default defineComponent({
  props: VeoFormsElementProps,
  setup(props, { slots }) {
    const { locale } = useI18n();

    const layouts = computed(() =>
      AVAILABLE_LAYOUTS.flatMap((layout) => {
        const definition = layout.GROUP_DEFINITION;
        if (definition) {
          if (process.dev && props.debug) {
            console.info(
              `VeoForm::Layout: Checking whether ${
                definition.name[locale.value] || definition.name[0]
              } meets all conditions...`
            );
          }
          const evaluatedConditions: boolean[] = definition.conditions?.(props) || [];
          const truthyConditions = evaluatedConditions.filter((condition) => condition).length;

          if (process.dev && props.debug) {
            for (let j = 0; j < evaluatedConditions.length; j++) {
              if (evaluatedConditions[j]) {
                console.info(`VeoForm::Layout: Condition ${j} is met`);
              } else {
                console.info(`VeoForm::Layout: Condition ${j} is NOT met`);
              }
            }
          }

          if (evaluatedConditions.length === truthyConditions) {
            return [{ layout, truthyConditions }];
          }
        }
        return [];
      })
    );

    if (process.dev && props.debug) {
      for (const layout of layouts.value) {
        console.info(
          `layout ${layout.layout.GROUP_DEFINITION.name[locale.value] || layout.layout.GROUP_DEFINITION.name[0]} has ${
            layout.truthyConditions
          } truthy conditions`
        );
      }
    }

    return () =>
      h(
        maxBy(layouts.value, 'truthyConditions')?.layout.default,
        {
          ...props
        },
        {
          default: slots.default ? () => slots.default() : undefined
        }
      );
  }
});
