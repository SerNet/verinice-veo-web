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
  <h2 class="text-h2 px-4 pt-1">
    {{ t('display') }}
  </h2>
  <v-card-text>
    <v-select
      :model-value="displayOption"
      class="mt-n2"
      :label="upperFirst(t('viewAs').toString())"
      hide-details
      variant="underlined"
      :items="displayOptions"
      @update:model-value="emit('update:display-option', $event)"
    />
  </v-card-text>
</template>

<script setup lang="ts">
import { upperFirst } from 'lodash';
import { IVeoFormSchemaMeta } from '~/composables/api/queryDefinitions/forms';
import { IVeoObjectSchema } from '~/types/VeoTypes';

const props = withDefaults(
  defineProps<{
    displayOption: string;
    domainId: string;
    formSchemas: IVeoFormSchemaMeta[];
    objectData: Record<string, any>;
    objectSchema: IVeoObjectSchema;
  }>(),
  {
    objectData: undefined,
    objectSchema: undefined,
    formSchemas: () => [],
  }
);

const emit = defineEmits<{
  (event: 'update:display-option', value: string): void;
}>();

const { t, locale } = useI18n();

const displayOptions = computed<{ title: string; value: string | undefined }[]>(
  () => {
    const currentSubType = props.objectData?.subType;
    const availableFormSchemas: { title: string; value: string | undefined }[] =
      props.formSchemas
        .filter(
          (formSchema) =>
            formSchema.modelType === props.objectSchema?.title &&
            (!currentSubType || currentSubType === formSchema.subType)
        )
        .map((formSchema) => ({
          title: formSchema.name[locale.value] || formSchema.subType,
          value: formSchema.id,
        }));
    availableFormSchemas.unshift({
      title: upperFirst(t('objectView').toString()),
      value: 'objectschema',
    });
    return availableFormSchemas;
  }
);
</script>

<i18n>
{
    "en": {
      "display": "View",
      "objectView": "object view",
      "viewAs": "view as"
    },
    "de": {
      "display": "Ansicht",
      "objectView": "Objektansicht",
      "viewAs": "darstellen als"
    }
}
</i18n>
