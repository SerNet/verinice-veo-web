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
  <section data-component-name="label-element-settings">
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
            <EditorFormSchemaPlaygroundEditDialogTranslatedInput
              :form-schema-element="formSchemaElement"
              @update:form-schema-element="emit('update:form-schema-element', $event)"
              @set-translation="(translationKey: string, newValue: string | undefined) => emit('set-translation', translationKey, newValue)"
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
import { PropType } from 'vue';

import { IVeoFormSchemaItem } from '~~/composables/api/queryDefinitions/forms';

defineProps({
  formSchemaElement: {
    type: Object as PropType<IVeoFormSchemaItem>,
    required: true
  }
});

const emit = defineEmits<{
  (event: 'update:form-schema-element', formSchemaElement: IVeoFormSchemaItem): void
  (event: 'set-translation', translationKey: string, value: string | undefined): void
}>();

const { t } = useI18n();
</script>

<i18n>
{
  "en": {
    "common": "Common"
  },
  "de": {
    "common": "Allgemein"
  }
}
</i18n>
