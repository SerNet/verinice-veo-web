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
  <BaseDialog v-bind="$attrs" :title="title" aria-label="ddd" @update:model-value="$emit('update:model-value', $event)">
    <template #default>
      {{ descriptionText }}
      <v-select v-model="type" data-veo-test="select-object-type" :items="options" variant="underlined" />
    </template>
    <template #dialog-options>
      <v-btn variant="text" @click="$emit('update:model-value', false)">
        {{ cancelText }}
      </v-btn>
      <v-spacer />
      <v-btn variant="text" color="primary" data-veo-test="confirm-object-type" :disabled="!type" @click="handleAction">
        {{ actionButtonText }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script setup lang="ts">
import translationQueryDefinitions from '~/composables/api/queryDefinitions/translations';
import { useQuery } from '~/composables/api/utils/query';
import { VeoElementTypePlurals } from '~/types/VeoTypes';

const props = defineProps({
  title: {
    type: String,
    default: 'Create new object'
  },
  descriptionText: {
    type: String,
    default: 'Please specify the type of the new object.'
  },
  cancelText: {
    type: String,
    default: 'Cancel'
  },
  actionButtonText: {
    type: String,
    default: 'Create'
  },
  targetElementType: {
    type: String,
    default: ''
  },
  action: {
    type: String as PropType<'create-entity' | 'update:model-value' | 'select-entity'>,
    default: 'create-entity'
  },
  eventPayload: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['create-entity', 'update:model-value', 'select-entity']);

const { locale } = useI18n();
const route = useRoute();

const fetchTranslationsQueryParameters = computed(() => ({
  languages: [locale.value],
  domain: route.params.domain ?? ''
}));
const { data: translations } = useQuery(translationQueryDefinitions.queries.fetch, fetchTranslationsQueryParameters);

const type = ref<string | undefined>();

const options = computed<{ title: string; value: string }[]>(() => {
  const objectSchemaNames = Object.keys(VeoElementTypePlurals).filter((item) =>
    props.targetElementType ? item !== props.targetElementType : true
  );

  return objectSchemaNames.map((schemaName) => ({
    value: schemaName,
    title: translations.value?.lang[locale.value]?.[schemaName] || schemaName
  }));
});

const handleAction = () => {
  emit(props.action, { type: type.value, ...props.eventPayload });
};
</script>
