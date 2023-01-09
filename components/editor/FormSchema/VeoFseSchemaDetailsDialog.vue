<!--
   - verinice.veo web
   - Copyright (C) 2021  Davit Svandize, Jonas Heitmann
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
    v-model="dialog.value"
    large
    :headline="t('schemaDetailsHeadline')"
    fixed-footer
  >
    <template #default>
      <v-form
        v-model="form.valid"
        class="mx-4"
        @submit="doSave()"
      >
        <v-row
          no-gutters
          class="align-center mt-4"
        >
          <v-col
            cols="12"
            :md="5"
          >
            <span style="font-size: 1.2rem;">{{ t('schemaName') }}*:</span>
          </v-col>
          <v-col
            cols="12"
            :md="5"
          >
            <v-text-field
              v-model="form.data.formSchema"
              required
              flat
              :rules="form.rules.formSchema"
              :label="t('schemaName')"
            />
          </v-col>
        </v-row>
        <v-row
          no-gutters
          class="align-center mt-4"
        >
          <v-col
            cols="12"
            :md="5"
          >
            <span style="font-size: 1.2rem;">{{ t('editor.formschema.sorting') }}:</span>
          </v-col>
          <v-col
            cols="12"
            :md="5"
          >
            <v-text-field
              v-model="form.data.sorting"
              :label="t('editor.formschema.sorting')"
              flat
            />
          </v-col>
        </v-row>
        <v-row
          no-gutters
          class="align-center mt-4"
        >
          <v-col
            cols="12"
            :md="5"
          >
            <span style="font-size: 1.2rem;">{{ t('editor.formschema.create.type.text') }}*:</span>
          </v-col>
          <v-col
            cols="12"
            :md="5"
          >
            <v-text-field
              :value="objectSchema.title"
              flat
              :label="t('editor.formschema.create.type')"
              readonly
              disabled
              class="objectschema-type-field"
            />
          </v-col>
        </v-row>
        <v-row
          no-gutters
          class="align-center mt-4"
        >
          <v-col
            cols="12"
            :md="5"
          >
            <span style="font-size: 1.2rem;">{{ t('editor.formschema.subtype') }}:</span>
          </v-col>
          <v-col
            cols="12"
            :md="5"
          >
            <v-select
              v-model="form.data.subType"
              :label="t('editor.formschema.subtype')"
              :items="subTypeOptions"
              flat
            />
          </v-col>
        </v-row>
        <small>{{ t('global.input.requiredfields') }}</small>
      </v-form>
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
        :disabled="!form.valid"
        @click="doSave()"
      >
        {{ t('global.button.save') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>
<script lang="ts">
import { PropType } from 'vue';
import { trim } from 'lodash';

import { IVeoObjectSchema } from '~/types/VeoTypes';

export default defineComponent({
  props: {
    value: {
      type: Boolean,
      required: true
    },
    objectSchema: {
      type: Object as PropType<IVeoObjectSchema>,
      required: true
    },
    formSchema: {
      type: String,
      default: ''
    },
    subtype: {
      type: String,
      default: null
    },
    sorting: {
      type: String,
      default: null
    },
    domainId: {
      type: String,
      required: true
    }
  },
  emits: ['input', 'update-subtype', 'update-sorting', 'update-schema-name'],
  setup(props, context) {
    const { t } = useI18n();

    /**
     * Common dialog stuff (opening and closing)
     */
    const dialog = ref({ value: props.value });

    const form = ref({
      data: {
        formSchema: props.formSchema,
        subType: props.subtype,
        sorting: props.sorting
      },
      rules: {
        formSchema: [(input: string) => trim(input).length > 0 || t('global.input.required')]
      },
      valid: false
    });

    watch(
      () => props.value,
      (val: boolean) => {
        dialog.value.value = val;
      }
    );

    watch(
      () => dialog.value.value,
      (val: boolean) => {
        if (!val) {
          context.emit('input', val);
        }
      }
    );

    watch(
      () => props.formSchema,
      (val: string) => {
        form.value.data.formSchema = val;
      }
    );

    watch(
      () => props.subtype,
      (val: string | null) => {
        form.value.data.subType = val as string;
      }
    );

    watch(
      () => props.sorting,
      (val: string | null) => {
        form.value.data.sorting = val as string;
      }
    );

    const subTypeOptions = computed(() =>
      (props.objectSchema?.properties?.domains?.properties?.['{CURRENT_DOMAIN_ID}']?.properties?.subType?.enum || []).map((subType: string) => ({
        text: subType,
        value: subType
      }))
    );

    function doSave() {
      context.emit('update-subtype', form.value.data.subType);
      context.emit('update-sorting', form.value.data.sorting ?? null);
      context.emit('update-schema-name', form.value.data.formSchema);
      context.emit('input', false);
    }

    return { dialog, doSave, form, subTypeOptions, t };
  }
});
</script>

<i18n>
{
  "en": {
    "schemaDetailsHeadline": "Formschema details",
    "schemaName": "Name of the form schema"
  },
  "de": {
    "schemaDetailsHeadline": "Formschema Eigenschaften",
    "schemaName": "Name des Formschemas"
  }
}
</i18n>

<style lang="scss" scoped>
.objectschema-type-field :deep(label) {
  color: rgba(0, 0, 0, 0.6) !important;
}

.objectschema-type-field :deep(input) {
  color: rgba(0, 0, 0, 0.87) !important;
}
</style>
