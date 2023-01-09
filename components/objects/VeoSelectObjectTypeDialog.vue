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
  <BaseDialog
    v-bind="$attrs"
    :headline="t('headline')"
  >
    <template #default>
      {{ t('create_entity') }}
      <v-select
        v-model="type"
        :items="options"
      />
    </template>
    <template #dialog-options>
      <v-btn
        text
        @click="$emit('input', false)"
      >
        {{ t('global.button.cancel') }}
      </v-btn>
      <v-spacer />
      <v-btn
        text
        color="primary"
        :disabled="!type"
        @click="$emit('create-entity', { type, ...eventPayload })"
      >
        {{ t('create') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script lang="ts" setup>
import { useFetchSchemas } from '~/composables/api/schemas';
import { useFetchTranslations } from '~/composables/api/translations';

defineProps({
  eventPayload: {
    type: Object,
    default: () => ({})
  }
});

defineEmits(['create-entity', 'input']);

const { t, locale } = useI18n();

const fetchTranslationsQueryParameters = computed(() => ({ languages: [locale.value] }));
const { data: translations } = useFetchTranslations(fetchTranslationsQueryParameters);

const { data: schemas } = useFetchSchemas();

const type = ref<string | undefined>();

const options = computed<{ text: string; value: string }[]>(() =>
  Object.keys(schemas || {}).map((schemaName) => ({ value: schemaName, text: translations.value?.lang[locale.value]?.[schemaName] || schemaName }))
);
</script>

<i18n>
{
  "en": {
    "create": "Create",
    "create_entity": "Please specify the type of the new object.",
    "headline": "Create new object"
  },
  "de": {
    "create": "Erstellen",
    "create_entity": "Bitte wählen Sie den Typ des neuen Objektes.",
    "headline": "Objekt erstellen"
  }
}
</i18n>
