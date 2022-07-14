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
<template>
  <div
    v-if="options.visible"
    :class="options && options.class"
    class="vf-links-field vf-form-element veo-links-field-border mt-4 pa-2"
  >
    <v-list>
      {{ internalValue }}
      <v-list-item
        v-for="(link, index) of internalValue"
        :key="index"
      >
        <v-list-item-content>
          <VeoLinksFieldRow
            v-bind="$props"
            :value="link.target"
            @input="internalValue[index].target = $event"
          />
        </v-list-item-content>
        <v-list-item-action>
          <v-btn
            icon
            :disabled="disabled || options.disabled"
            @click="removeLink(index)"
          >
            <v-icon>{{ mdiTrashCanOutline }}</v-icon>
          </v-btn>
        </v-list-item-action>
      </v-list-item>
    </v-list>
    <v-btn
      v-if="!options.singleLink"
      text
      :disabled="disabled || options.disabled"
      color="primary"
      @click="addLink"
    >
      <v-icon small>
        {{ mdiPlus }}
      </v-icon>
      {{ t('addLink') }}
    </v-btn>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from '@nuxtjs/composition-api';
import { mdiPlus, mdiTrashCanOutline } from '@mdi/js';
import { useI18n } from 'nuxt-i18n-composable';

import { IVeoFormsElementDefinition } from '../types';
import { VeoFormsControlProps } from '../util';

export const CONTROL_DEFINITION: IVeoFormsElementDefinition = {
  key: 'veo-links-field',
  name: {
    en: 'links field',
    de: 'Link-Feld'
  },
  description: {
    en: 'Lets the user select 0-n objects to link. Object type and sub type can be restricted in the object schema.',
    de: 'Lässt den User 0-n links auf andere Objekte erstellen. Objekttyp und Subtyp können durch das Objektschema bestimmt werden.'
  },
  conditions: (props) => [props.objectSchema.type === 'array', typeof props.objectSchema.items?.properties?.target !== 'undefined']
};

export default defineComponent({
  name: CONTROL_DEFINITION.key,
  props: VeoFormsControlProps,
  setup(props, { emit }) {
    console.log(props);
    const { t } = useI18n();

    const internalValue = computed<any[]>({
      get: () => (props.value && props.value.length ? props.value : []),
      set: (newValue: undefined | any[]) => {
        emit('input', newValue);
      }
    });

    const addLink = () => {};

    const removeLink = (index: number) => {};

    return {
      addLink,
      internalValue,
      removeLink,

      mdiPlus,
      mdiTrashCanOutline,
      t
    };
  }
});
</script>

<i18n>
{
  "en": {
    "addLink": "Add link"
  },
  "de": {
    "addLink": "Link hinzufügen"
  }
}
</i18n>

<style lang="scss" scoped>
.veo-links-field-border {
  border: 1px solid $medium-grey;
  border-radius: 12px;
  overflow: hidden;
}
</style>
