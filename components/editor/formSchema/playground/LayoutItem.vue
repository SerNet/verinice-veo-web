<!--
   - verinice.veo web
   - Copyright (C) 2023  Jonas Heitmann
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
  <v-sheet
    rounded
    border
    class="fill-width pb-1 my-1"
  >
    <v-card-actions v-if="!playgroundItem.readonly">
      <div class="handle mr-1">
        <v-icon :icon="mdiDrag" />
      </div>
      <EditorFormSchemaPlaygroundRuleIcon
        :rule="formSchemaItem.rule"
        class="mr-1"
      />
      {{ t('layout') }} ({{ upperFirst(t(`layoutType.${formSchemaItem.options.format}`)) }})
      <v-spacer />
      <v-btn
        :icon="mdiPencilOutline"
        size="small"
        @click="emit('edit')"
      />
      <v-btn
        :icon="mdiTrashCanOutline"
        size="small"
        @click="emit('delete')"
      />
    </v-card-actions>
    <div class="mx-2">
      <span
        v-if="itemName"
        class="mb-1"
      >{{ itemName }}</span>
      <div
        class="d-flex overflow-x-auto"
        :class="directionClass"
      >
        <slot />
      </div>
    </div>
  </v-sheet>
</template>
  
<script setup lang="ts">
import { mdiDrag, mdiPencilOutline, mdiTrashCanOutline } from '@mdi/js';
import { upperFirst } from 'lodash';
import { PropType } from 'vue';

import { IVeoFormSchemaItem } from '~~/types/VeoTypes';
import { IPlaygroundItem } from './Item.vue';
  
const props = defineProps({
  playgroundItem: {
    type: Object as PropType<IPlaygroundItem>,
    required: true
  },
  formSchemaItem: {
    type: Object as PropType<IVeoFormSchemaItem>,
    required: true
  },
  itemName: {
    type: String,
    default: undefined
  }
});

const emit = defineEmits(['edit', 'delete']);

const { t } = useI18n();

const directionClass = computed(() => {
  // TODO: this.options does not trigger this computed property, when data is updated.
  if (props.formSchemaItem.options?.direction === 'horizontal') {
    return 'flex-row direction-horizontal';
  } else {
    return 'flex-column direction-vertical';
  }
});
</script>

<i18n>
{
  "en": {
    "layout": "layout",
    "layoutType": {
      "group": "group"
    }
  },
  "de": {
    "layout": "Layout",
    "layoutType": {
      "group": "Gruppe"
    }
  }
}
</i18n>
