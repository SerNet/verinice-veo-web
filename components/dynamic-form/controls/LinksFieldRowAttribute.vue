<!--
   - verinice.veo web
   - Copyright (C) 2022  Jonas Heitmann
   - 
   - This program is free software: you can redistribute it and/or modify
   - it under the terms of the GNU Affero General Public License as published by
   - the Free Software Foundation, either version 3 of the License, or
   - (at your option) any later version.
   - 
   - This program is distributed in the hope that it will be useful,
   - but WITHOUT ANY WARRANTY; without even the implied warranty of
   - MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   - GNU Affero General Public License for more details.
   - 
   - You should have received a copy of the GNU Affero General Public License
   - along with this program.  If not, see <http://www.gnu.org/licenses/>.
-->
<script lang="ts">
import type { IVeoFormsElementDefinition } from '../types';
import { VeoFormsControlProps } from '../util';
import type { IVeoCustomLink } from '~/types/VeoTypes';

export const CONTROL_DEFINITION: IVeoFormsElementDefinition = {
  code: 'veo-links-field-row',
  name: {
    en: 'links field row',
    de: 'Link-Feld-Eintrag'
  },
  description: {
    en: 'Row of the links field. Not used independently.',
    de: 'Einzelner Eintrag des Link-Feldes. Wird nicht alleine genutzt.'
  }
};

export default defineComponent({
  name: CONTROL_DEFINITION.code,
  props: {
    ...VeoFormsControlProps,
    otherSelectedLinks: {
      type: Array<IVeoCustomLink>,
      default: () => []
    },
    index: {
      type: Number,
      required: true
    }
  },
  setup(props, { slots }) {
    return () =>
      slots.default ?
        slots.default().map((linkAttribute) => {
          // Add an index to every control so that VeoForms can enter the value for the correct link
          for (const control of (linkAttribute.children as any)?.[0]?.children || []) {
            control.props.index = props.index;
          }

          return linkAttribute;
        })
      : null;
  }
});
</script>
