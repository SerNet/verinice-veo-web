<!--
   - verinice.veo web
   - Copyright (C) 2025  Aziz Khalledi
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
  <v-sheet rounded border class="fill-width pb-1 my-1" data-component-name="impact-group-form-element">
    <v-card-actions>
      <div class="handle mr-1">
        <v-icon :icon="mdiDrag" />
      </div>
      <EditorFormSchemaPlaygroundRuleIcon :rule="formSchemaElement.rule" class="mr-1" />
      {{ t('impacts') }}
      <v-spacer />
      <v-btn
        v-if="!props.playgroundElement.readonly"
        :icon="mdiTrashCanOutline"
        size="small"
        @click="$emit('delete')"
      />
    </v-card-actions>
  </v-sheet>
</template>

<script setup lang="ts">
import { mdiDrag, mdiTrashCanOutline } from '@mdi/js';
import type { IVeoFormSchemaItem } from '~/composables/api/queryDefinitions/forms';
import type { IPlaygroundElement } from './Element.vue';

defineOptions({
  name: 'EditorFormSchemaPlaygroundImpactGroupElement'
});

const props = defineProps<{
  playgroundElement: IPlaygroundElement;
  formSchemaElement: IVeoFormSchemaItem;
}>();

defineEmits<{
  (event: 'delete'): void;
}>();

const { t } = useI18n();
</script>

<i18n lang="json">
{
  "en": {
    "impacts": "Impacts"
  },
  "de": {
    "impacts": "Auswirkungen"
  }
}
</i18n>

<style scoped>
.handle {
  cursor: move;
}
</style>
