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
      {{ t('createFormSchema') }}
    </h2>
    <v-form
      :model-value="valid"
      @update:model-value="$emit('update:valid', $event)"
      @submit.prevent="() => valid ? $emit('submit') : () => {}"
    >
      <input
        type="submit"
        role="submit"
        class="d-none"
      >
      <BaseCard
        class="mb-4"
      >
        <v-card-text>
          <v-row
            no-gutters
            class="align-center mt-4"
          >
            <v-col
              cols="12"
              md="5"
            >
              <span>{{ t('editor.formschema.create.title.text') }}*:</span>
            </v-col>
            <v-col
              cols="12"
              md="7"
            >
              <v-text-field
                :model-value="name"
                :label="t('editor.formschema.create.title')"
                :rules="[requiredRule]"
                required
                @update:model-value="$emit('update:name', $event)"
              />
            </v-col>
          </v-row>
          <v-row
            no-gutters
            class="align-center mt-4"
          >
            <v-col
              cols="12"
              md="5"
            >
              <span>{{ t('editor.formschema.sorting') }}:</span>
            </v-col>
            <v-col
              cols="12"
              md="7"
            >
              <v-text-field
                :model-value="sorting"
                :label="t('editor.formschema.sorting')"
                @update:model-value="$emit('update:sorting', $event)"
              />
            </v-col>
          </v-row>
        </v-card-text>
      </BaseCard>
      <BaseCard>
        <v-card-text>
          <v-row
            no-gutters
            class="align-center"
          >
            <v-col
              cols="12"
              md="5"
            >
              <span>{{ t('editor.formschema.create.type.text') }}*:</span>
            </v-col>
            <v-col
              cols="12"
              md="7"
            >
              <v-select
                :model-value="objectType"
                :label="t('editor.formschema.create.type')"
                :rules="[requiredRule]"
                :items="objectTypes"
                required
                @update:model-value="$emit('update:object-type', $event)"
              />
            </v-col>
          </v-row>
          <v-row
            v-if="objectType === 'custom'"
            no-gutters
          >
            <v-col
              cols="0"
              md="5"
            />
            <v-col
              cols="12"
              md="7"
            >
              <EditorsFormSchemaFileUpload
                :input-label="t('objectSchemaUploadLabel')"
                :submit-button-text="t('importObjectSchema')"
                @schema-uploaded="$emit('update:object-schema', $event)"
              />
            </v-col>
          </v-row>
          <v-row
            no-gutters
            class="align-center mt-4"
          >
            <v-col
              cols="12"
              md="5"
            >
              <span>{{ t('editor.formschema.subtype') }}*:</span>
            </v-col>
            <v-col
              cols="12"
              md="7"
            >
              <v-select
                :model-value="subType"
                :disabled="!objectType || (objectType === 'custom' && !objectSchema)"
                :items="subTypes"
                :loading="!!objectType && !objectSchema"
                :label="t('editor.formschema.subtype')"
                :rules="[requiredRule]"
                @update:model-value="$emit('update:sub-type', $event)"
              />
            </v-col>
          </v-row>
        </v-card-text>
      </BaseCard>
    </v-form>
    {{ t('global.input.requiredfields') }}
  </v-window-item>
</template>

<script lang="ts">
import { PropType } from 'vue';
import { upperFirst } from 'lodash';

import { useFetchSchemas } from '~/composables/api/schemas';
import { IVeoObjectSchema } from '~/types/VeoTypes';

export default defineComponent({
  props: {
    modelValue: {
      type: Number,
      required: true
    },
    domainId: {
      type: String,
      required: true
    },
    valid: {
      type: Boolean,
      default: true
    },
    name: {
      type: String,
      default: undefined
    },
    sorting: {
      type: String,
      default: undefined
    },
    objectType: {
      type: String,
      default: undefined
    },
    subType: {
      type: String,
      default: undefined
    },
    objectSchema: {
      type: Object as PropType<IVeoObjectSchema | undefined>,
      default: undefined
    }
  },
  emits: ['update:sub-type', 'update:object-schema', 'update:object-type', 'update:sorting', 'update:name', 'submit', 'update:valid'],
  setup(props) {
    const { t } = useI18n();

    function requiredRule(value: string) {
      return !!value || t('global.input.required').toString();
    }

    // Select options
    const { data: objectSchemas } = useFetchSchemas();

    const objectTypes = computed(() => {
      const objectSchemaOptions = Object.keys(objectSchemas.value || {}).map((schemaName) => ({ title: upperFirst(schemaName), value: schemaName }));
      objectSchemaOptions.unshift({
        title: t('customObjectSchema').toString(),
        value: 'custom'
      });
      return objectSchemaOptions;
    });

    const subTypes = computed(() => props.objectSchema?.properties?.domains?.properties?.[props.domainId]?.properties?.subType?.enum || []);

    return {
      objectTypes,
      requiredRule,
      subTypes,

      t
    };
  }
});
</script>

<i18n>
{
  "en": {
    "createFormSchema": "Create form schema",
    "customObjectSchema": "Custom",
    "format": "(.json)",
    "importObjectSchema": "Import object schema",
    "objectSchemaUploadLabel": "Object schema upload @:format"
  },
  "de": {
    "createFormSchema": "Formschema erstellen",
    "customObjectSchema": "Eigenes",
    "format": "(.json)",
    "importObjectSchema": "Objektschema importieren",
    "objectSchemaUploadLabel": "Objektschema hochladen @:format"
  }
}
</i18n>

<style lang="scss" scoped>
span {
  font-size: 1.2em;
}

// For some reason the chevron showed up in the upload component
:deep(.v-slide-group__next) {
  display: none;
}
</style>
