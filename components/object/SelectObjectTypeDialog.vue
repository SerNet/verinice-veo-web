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
  <BaseDialog v-bind="$attrs" :title="t('headline')">
    <template #default>
      {{ t('create_entity') }}
      <v-select v-model="type" :items="options" variant="underlined" />
    </template>
    <template #dialog-options>
      <v-btn text @click="$emit('update:model-value', false)">
        {{ $t('global.button.cancel') }}
      </v-btn>
      <v-spacer />
      <v-btn
        text
        color="primary"
        :disabled="!type"
        @click="$emit('create-entity', { type, ...eventPayload })">
        {{ t('create') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script setup lang="ts">
import schemaQueryDefinitions from '~/composables/api/queryDefinitions/schemas';
import translationQueryDefinitions from '~/composables/api/queryDefinitions/translations';
import { useQuery } from '~/composables/api/utils/query';

defineProps({
  eventPayload: {
    type: Object,
    default: () => ({})
  }
});

defineEmits(['create-entity', 'update:model-value']);

const { t, locale } = useI18n();
const { t: $t } = useI18n({ useScope: 'global' });
const route = useRoute();

const fetchTranslationsQueryParameters = computed(() => ({
  languages: [locale.value],
  domain: route.params.domain
}));
const { data: translations } = useQuery(
  translationQueryDefinitions.queries.fetch,
  fetchTranslationsQueryParameters
);

const { data: schemas } = useQuery(schemaQueryDefinitions.queries.fetchSchemas);

const type = ref<string | undefined>();

const options = computed<{ title: string; value: string }[]>(() =>
  Object.keys(schemas.value || {}).map((schemaName) => ({
    value: schemaName,
    title: translations.value?.lang[locale.value]?.[schemaName] || schemaName
  }))
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
