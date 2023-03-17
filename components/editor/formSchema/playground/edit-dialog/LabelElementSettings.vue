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
  <section>
    <h2 class="text-h2">
      {{ t('common') }}
    </h2>
    <BaseCard>
      <v-card-text>
        <v-row>
          <v-col
            cols="12"
            md="6"
            class="d-flex align-center"
          >
            <v-text-field
              v-model="text"
              :label="t('text')"
              variant="underlined"
              clearable
              :prepend-inner-icon="mdiAlphabeticalVariant"
            />
          </v-col>
          <v-col
            cols="12"
            md="6"
          >
            <EditorFormSchemaPlaygroundEditDialogElementStylingOptions
              :form-schema-element="formSchemaElement"
              @update:form-schema-element="emit('update:form-schema-element', $event)"
            />
          </v-col>
        </v-row>
      </v-card-text>
    </BaseCard>
  </section>
</template>
  
<script setup lang="ts">
import { PropType, Ref } from 'vue';
import { mdiAlphabeticalVariant } from '@mdi/js';

import { PROVIDE_KEYS as FORMSCHEMA_PROVIDE_KEYS } from '~~/pages/[unit]/domains/[domain]/editor/formschema.vue';
import { IVeoFormSchemaItem, IVeoTranslationCollection } from '~~/types/VeoTypes';

const props = defineProps({
  formSchemaElement: {
    type: Object as PropType<IVeoFormSchemaItem>,
    required: true
  }
});

const emit = defineEmits<{
  (event: 'update:form-schema-element', formSchemaElement: IVeoFormSchemaItem): void
  (event: 'set-translation', translationKey: string, value: string | undefined): void
}>();

const language = inject<Ref<string>>(FORMSCHEMA_PROVIDE_KEYS.language);
const translations = inject<Ref<Record<string, IVeoTranslationCollection>>>(FORMSCHEMA_PROVIDE_KEYS.translations);

const isTranslatedLabel = computed(() => props.formSchemaElement.text?.startsWith('#lang/'));
const translatedLabelKey = computed(() => props.formSchemaElement.text?.replace('#lang/', '') as string);

const text = computed({
  get: () => {
    if(isTranslatedLabel.value && translations?.value && language?.value) {
      return translations.value[language.value][translatedLabelKey.value];
    }
    return props.formSchemaElement.text;
  },
  set: (newValue) => {
    if(isTranslatedLabel.value && translations?.value && language?.value) {
      emit('set-translation', translatedLabelKey.value, newValue);
    } else {
      emit('update:form-schema-element', { ...props.formSchemaElement, text: newValue });
    }
  }
});

const { t } = useI18n();
</script>

<i18n>
{
  "en": {
    "common": "Common",
    "text": "Text"
  },
  "de": {
    "common": "Allgemein",
    "text": "Text"
  }
}
</i18n>
