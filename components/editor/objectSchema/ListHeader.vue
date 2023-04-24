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
    lines="two"
  >
    <v-list-item-title class="body-1 font-weight-bold d-flex align-center">
      {{ item.title }}
    </v-list-item-title>
    <v-list-item-subtitle v-text="t('attributecount', item.attributes.length || 0)" />
    <template #append>
      <v-chip
        v-if="styling.name"
        :color="styling.color"
        class="mr-2"
        small
        label
        variant="outlined"
      >
        <span v-if="translate">
          {{ t(`editor.inputtypes.${styling.name}`) }}
        </span>
        <span v-else-if="styling.name">
          {{ upperFirst(styling.name) }}
        </span>
      </v-chip>
      <v-list-item-action class="ml-0 d-flex flex-row">
        <v-btn
          class="edit-button"
          :icon="mdiPencil"
          variant="text"
          @click="$emit('edit-item', $event)"
        />
        <v-btn
          class="delete-button"
          :icon="mdiTrashCanOutline"
          variant="text"
          @click="$emit('delete-item', $event)"
        />
      </v-list-item-action>
    </template>
  </v-list-item>
</template>
<script lang="ts" setup>
import { upperFirst } from 'lodash';
import { PropType } from 'vue';
import { mdiPencil, mdiTrashCanOutline } from '@mdi/js';

import { IVeoOSHCustomAspect, IVeoOSHCustomLink } from '~/lib/ObjectSchemaHelper2';
import { IInputType } from '~/types/VeoEditor';

defineProps({
  item: {
    type: Object as PropType<IVeoOSHCustomAspect | IVeoOSHCustomLink>,
    required: true
  },
  styling: {
    type: Object as PropType<IInputType>,
    default: () => ({})
  },
  translate: {
    type: Boolean,
    default: false
  }
});

defineEmits(['delete-item', 'edit-item']);
  
const { t } = useI18n();
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
