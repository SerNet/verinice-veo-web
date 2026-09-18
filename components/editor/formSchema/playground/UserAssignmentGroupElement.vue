<!--
   - verinice.veo web
   - Copyright (C) 2026 Aziz Khalledi
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
  <v-sheet rounded border class="fill-width pb-1 my-1" data-component-name="user-assignment-group-form-element">
    <v-card-actions>
      <v-icon :icon="mdiLockOutline" class="mr-2" color="primary" />
      {{ t('layout') }} ({{ t('layoutType.group') }})
      <v-spacer />
    </v-card-actions>
    <div class="mx-2">
      <div class="mb-1">{{ translate('userAssignment') }}</div>
      <v-sheet rounded border class="fill-width my-1 d-flex overflow-hidden">
        <div class="mr-1 d-flex align-center px-1 bg-grey">
          <v-icon :icon="mdiLockOutline" color="primary" />
        </div>
        <v-card-actions class="d-flex flex-grow-1 py-0">
          <b>{{ translate('linkedAccount') }}</b>
          <span class="text-medium-emphasis ml-2">{{ t('accountSelect') }}</span>
        </v-card-actions>
      </v-sheet>
      <div class="text-caption text-medium-emphasis mt-1">{{ t('autoAddedHint') }}</div>
    </div>
  </v-sheet>
</template>

<script setup lang="ts">
import { mdiLockOutline } from '@mdi/js';
import type { IVeoFormSchemaItem } from '~/composables/api/queryDefinitions/forms';
import type { IPlaygroundElement } from './Element.vue';
import { PROVIDE_KEYS as FORMSCHEMA_PROVIDE_KEYS } from '~/pages/[unit]/domains/[domain]/editor/formschema.vue';

defineOptions({
  name: 'EditorFormSchemaPlaygroundUserAssignmentGroupElement'
});

defineProps<{
  playgroundElement: IPlaygroundElement;
  formSchemaElement: IVeoFormSchemaItem;
}>();

const { t, locale } = useI18n();

const editorLanguage = inject<Ref<string>>(FORMSCHEMA_PROVIDE_KEYS.EDITOR_LANGUAGE);
const translate = (key: string) =>
  t(key, {}, { locale: (editorLanguage?.value || locale.value) as typeof locale.value });
</script>

<i18n src="~/locales/base/components/editor-form-schema-playground-layout-element.json"></i18n>
<i18n src="~/locales/base/components/dynamic-form-user-assignment.json"></i18n>
<i18n lang="json">
{
  "en": {
    "accountSelect": "account select"
  },
  "de": {
    "accountSelect": "Account-Auswahl"
  }
}
</i18n>
