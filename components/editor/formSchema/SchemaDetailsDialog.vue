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
    :model-value="modelValue"
    large
    :title="t('schemaDetailsHeadline')"
    fixed-footer
    @update:model-value="emit('update:model-value', $event)"
  >
    <template #default>
      <v-form
        v-model="formIsValid"
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
              v-model="form.formSchema"
              required
              flat
              :rules="[requiredRule]"
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
            <span style="font-size: 1.2rem;">{{ globalT('editor.formschema.sorting') }}:</span>
          </v-col>
          <v-col
            cols="12"
            :md="5"
          >
            <v-text-field
              v-model="form.sorting"
              :label="globalT('editor.formschema.sorting')"
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
            <span style="font-size: 1.2rem;">{{ globalT('editor.formschema.create.type.text') }}*:</span>
          </v-col>
          <v-col
            cols="12"
            :md="5"
          >
            <v-text-field
              :model-value="objectSchema.title"
              flat
              :label="globalT('editor.formschema.create.type')"
              readonly
              disabled
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
            <span style="font-size: 1.2rem;">{{ globalT('editor.formschema.subtype') }}:</span>
          </v-col>
          <v-col
            cols="12"
            :md="5"
          >
            <v-select
              v-model="form.subType"
              :label="globalT('editor.formschema.subtype')"
              :items="subTypeOptions"
              :rules="[requiredRule]"
              flat
            />
          </v-col>
        </v-row>
        <small>{{ globalT('global.input.requiredfields') }}</small>
      </v-form>
    </template>
    <template #dialog-options>
      <v-btn
        text
        @click="$emit('update:model-value', false)"
      >
        {{ globalT('global.button.cancel') }}
      </v-btn>
      <v-spacer />
      <v-btn
        text
        color="primary"
        :disabled="!formIsValid"
        @click="doSave()"
      >
        {{ globalT('global.button.save') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>
<script setup lang="ts">
import { IVeoObjectSchema } from '~/types/VeoTypes';

const props = withDefaults(defineProps<{
  modelValue: boolean;
  objectSchema: IVeoObjectSchema;
  formSchema: string;
  subType: string | null;
  sorting: string | null;
  domainId: string;
}>(), {
  formSchema: '',
  subType: null,
  sorting: null
});

const emit = defineEmits<{
  (e: 'update:model-value', newValue: boolean): void,
  (e: 'update-schema-name', newValue: string): void,
  (e: 'update:sub-type', newValue: string | null): void,
  (e: 'update:sorting', newValue: string | null): void,
}>();

const { t } = useI18n();
const { t: globalT } = useI18n({ useScope: 'global' });
const { requiredRule } = useRules();

const formIsValid = ref(true);
const form = ref({
  formSchema: props.formSchema,
  subType: props.subType,
  sorting: props.sorting
});

watch(() => props.formSchema, (val: string) => {
  form.value.formSchema = val;
});

watch(() => props.subType, (val: string | null) => {
  form.value.subType = val as string;
});

watch(() => props.sorting, (val) => {
  form.value.sorting = val as string;
});

const subTypeOptions = computed(() =>
  (props.objectSchema?.properties?.domains?.properties?.['{CURRENT_DOMAIN_ID}']?.properties?.subType?.enum || []).map((subType: string) => ({
    title: subType,
    value: subType
  }))
);

function doSave() {
  emit('update:sub-type', form.value.subType);
  emit('update:sorting', form.value.sorting ?? null);
  emit('update-schema-name', form.value.formSchema);
  emit('update:model-value', false);
}
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
