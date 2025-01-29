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
  <v-window-item v-bind="$attrs">
    <h2 class="text-h2 mb-2">
      {{ t('start') }}
    </h2>
    <v-list lines="two" color="transparent">
      <v-list-item
        v-for="action of actions"
        :key="action.title"
        lines="two"
        :data-veo-test="action.testAttributeName"
        @click="action.onClick()"
      >
        <v-list-item-title class="font-weight-bold">
          {{ action.title }}
        </v-list-item-title>
        <v-list-item-subtitle>
          {{ action.text }}
        </v-list-item-subtitle>
        <template #append>
          <v-list-item-action>
            <v-icon size="x-large" :icon="mdiChevronRight" />
          </v-list-item-action>
        </template>
      </v-list-item>
    </v-list>
  </v-window-item>
</template>

<script setup lang="ts">
import { mdiChevronRight } from '@mdi/js';

defineProps({
  modelValue: {
    type: Number,
    required: true
  }
});

const emit = defineEmits(['create', 'import']);

const { t } = useI18n();

const actions = [
  {
    title: t('createFormSchema'),
    text: t('createFormSchemaDescription'),
    testAttributeName: 'create-form-schema',
    onClick: () => emit('create')
  },
  {
    title: t('importFormSchema'),
    text: t('importFormSchemaDescription'),
    testAttributeName: 'import-form-schema',
    onClick: () => emit('import')
  }
];
</script>

<i18n src="~/locales/base/components/editor-form-schema-wizard-state-start.json"></i18n>

<style lang="scss" scoped>
.v-list-item__subtitle {
  white-space: normal;
}
</style>
