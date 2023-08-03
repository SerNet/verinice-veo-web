<!--
   - verinice.veo web
   - Copyright (C) 2021  Jonas Heitmann, Davit Svandize
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
  <BasePage :heading-level="2">
    <LayoutHeadline
      :title="t('editors')"
      :element="t('calltoaction').toString()"
    />
    <div class="d-flex justify-center">
      <BaseCard
        class="mt-10"
        style="width: 70%; max-width: 1000px;"
      >
        <v-card-title class="bg-accent small-caps">
          {{ t('editors') }}
        </v-card-title>
        <v-list
          lines="two"
          class="overflow-hidden"
        >
          <v-list-item :to="`/${$route.params.unit}/domains/${$route.params.domain}/editor/objectschema`">
            <v-list-item-title class="font-weight-bold">
              {{ $t('editor.objectschema.headline') }}
            </v-list-item-title>
            <v-list-item-subtitle>{{ t('objectSchemaDescription') }}</v-list-item-subtitle>
            <template #append>
              <v-icon
                size="x-large"
                :icon="mdiChevronRight"
              />
            </template>
          </v-list-item>
          <v-list-item :to="`/${$route.params.unit}/domains/${$route.params.domain}/editor/formschema`">
            <v-list-item-title class="font-weight-bold">
              {{ $t('editor.formschema.headline') }}
            </v-list-item-title>
            <v-list-item-subtitle>{{ t('formSchemaDescription') }}</v-list-item-subtitle>
            <template #append>
              <v-icon
                size="x-large"
                :icon="mdiChevronRight"
              />
            </template>
          </v-list-item>
        </v-list>
      </BaseCard>
    </div>
  </BasePage>
</template>

<script lang="ts">
export const ROUTE_NAME = 'unit-domains-domain-editor';
</script>

<script setup lang="ts">
import { mdiChevronRight } from '@mdi/js';

const { t } = useI18n();
const { t: $t } = useI18n({ useScope: 'global' });
</script>

<i18n>
{
  "en": {
    "calltoaction": "What do you want to do?",
    "editors": "Editors",
    "formSchemaDescription": "Create, edit, import or export form schemas",
    "objectSchemaDescription": "Create, edit, import or export object schemas"
  },
  "de": {
    "calltoaction": "Was möchten Sie tun?",
    "editors": "Editoren",
    "formSchemaDescription": "Formschemas erstellen, bearbeiten, importieren und exportieren",
    "objectSchemaDescription": "Objektschemas erstellen, bearbeiten, importieren und exportieren"
  }
}
</i18n>

<style lang="scss" scoped>
.v-list-item__subtitle {
  white-space: pre-wrap;
}
</style>
