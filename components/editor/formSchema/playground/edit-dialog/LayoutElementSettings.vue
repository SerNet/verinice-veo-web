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
          >
            <v-text-field
              :label="t('label')"
              variant="underlined"
              clearable
              :prepend-inner-icon="mdiLabelOutline"
            />
          </v-col>
          <v-col
            cols="12"
            md="6"
          >
            <v-select
              :items="directionOptions"
              :label="t('direction')"
              variant="underlined"
              :prepend-inner-icon="mdiSwapVertical"
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
import { mdiLabelOutline, mdiSwapVertical } from '@mdi/js';

import { IVeoFormSchemaItem } from '~~/types/VeoTypes';

defineProps({
  formSchemaElement: {
    type: Object as PropType<IVeoFormSchemaItem>,
    required: true
  }
});

const emit = defineEmits<{
  (event: 'update:form-schema-element', formSchemaElement: IVeoFormSchemaItem): void
}>();

const { t } = useI18n();

const directionOptions = ref([
  {
    title: t('vertical'),
    value: 'vertical'
  },
  {
    title: t('horizontal'),
    value: 'horizontal'
  }
]);
</script>

<i18n>
{
  "en": {
    "common": "Common",
    "direction": "Direction",
    "horizontal": "Horizontal",
    "label": "Label",
    "vertical": "Vertical"
  },
  "de": {
    "common": "Allgemein",
    "direction": "Ausrichtung",
    "horizontal": "Horizontal",
    "label": "Beschriftung",
    "vertical": "Vertikal"
  }
}
</i18n>
