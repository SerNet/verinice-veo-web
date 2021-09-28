<!--
   - verinice.veo web
   - Copyright (C) 2021  Markus Werner, Davit Svandize, Jonas Heitmann
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
  <v-list-item
    style="background-color: #FAFAFA"
    two-line
  >
    <v-list-item-content>
      <v-list-item-title class="body-1 font-weight-bold d-flex align-center">
        {{ item.title }}
      </v-list-item-title>
      <v-list-item-subtitle v-text="tc('attributecount', item.attributes.length || 0)" />
    </v-list-item-content>
    <v-list-item-action class="ml-3">
      <v-chip
        v-if="styling"
        :color="styling.color"
        class="mr-2"
        small
        label
        outlined
      >
        <span v-if="$props.translate">
          {{ t(`editor.inputtypes.${styling.name}`) }}
        </span>
        <span v-else-if="styling.name">
          {{ upperFirst(styling.name) }}
        </span>
      </v-chip>
    </v-list-item-action>

    <v-list-item-action class="ml-0 d-flex flex-row">
      <v-btn
        class="edit-button"
        icon
        @click="$emit('edit-item', $event)"
      >
        <v-icon>
          mdi-pencil
        </v-icon>
      </v-btn>
      <v-btn
        class="delete-button"
        icon
        @click="$emit('delete-item', $event)"
      >
        <v-icon>
          mdi-delete
        </v-icon>
      </v-btn>
    </v-list-item-action>
  </v-list-item>
</template>
<script lang="ts">
import { defineComponent } from '@nuxtjs/composition-api';
import { useI18n } from 'nuxt-i18n-composable';
import { upperFirst } from 'lodash';

import { IVeoOSHCustomAspect, IVeoOSHCustomLink } from '~/lib/ObjectSchemaHelper2';
import { IInputType } from '~/types/VeoEditor';

interface IProps {
  item: IVeoOSHCustomAspect | IVeoOSHCustomLink;
  styling: IInputType;
}

export default defineComponent<IProps>({
  props: {
    item: { type: Object, required: true },
    styling: { type: Object, default: () => {} },
    translate: {
      type: Boolean,
      default: false
    }
  },
  setup() {
    const { t, tc } = useI18n();

    return {
      upperFirst,
      t,
      tc
    };
  }
});
</script>

<i18n>
{
  "en": {
    "attributecount": "No attributes | one attribute | {n} attributes"
  },
  "de": {
    "attributecount": "Keine Attribute | Ein Attribut | {n} Attribute"
  }
}
</i18n>
