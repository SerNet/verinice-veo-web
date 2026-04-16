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
    :title="globalT('editor.schema.properties')"
    fixed-footer
    @update:model-value="emit('update:model-value', $event)"
  >
    <template #default>
      <v-form v-model="formIsValid" class="mx-4" @submit="saveForm()">
        <v-row no-gutters class="align-center mt-4">
          <v-col cols="12">
            <v-text-field
              v-model="form.schemaName"
              :label="`${globalT('editor.formschema.create.title')} *`"
              :rules="[requiredRule]"
              flat
              required
            />
          </v-col>
        </v-row>
        <v-row no-gutters class="align-center mt-4">
          <v-col cols="12">
            <v-text-field v-model="form.sorting" :label="globalT('editor.formschema.sorting')" flat />
          </v-col>
        </v-row>
        <v-row no-gutters class="align-center mt-4">
          <v-col cols="12">
            <v-text-field
              :model-value="contextLabel"
              :label="globalT('editor.formschema.create.context')"
              disabled
              flat
              readonly
            />
          </v-col>
        </v-row>
        <v-row no-gutters class="align-center mt-4">
          <v-col cols="12">
            <v-select
              v-if="objectSchema.title === 'control'"
              :model-value="objectType"
              :label="globalT('editor.formschema.create.type')"
              :items="RISK_AFFECTED"
              flat
            />
            <v-text-field
              v-else
              :model-value="objectType"
              :label="globalT('editor.formschema.create.type')"
              disabled
              flat
              readonly
            />
          </v-col>
        </v-row>
        <v-row no-gutters class="align-center mt-4">
          <v-col cols="12">
            <v-select
              v-model="form.subType"
              :label="globalT('editor.formschema.subtype')"
              :items="subTypes"
              disabled
              readonly
            />
          </v-col>
        </v-row>
        <small>{{ globalT('global.input.requiredfields') }}</small>
      </v-form>
    </template>

    <template #dialog-options>
      <v-btn @click="$emit('update:model-value', false)">
        {{ globalT('global.button.cancel') }}
      </v-btn>
      <v-spacer />
      <v-btn color="primary" :disabled="!formIsValid" @click="saveForm()">
        {{ globalT('global.button.save') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script setup lang="ts">
import { type IVeoDomainSpecificObjectSchema, RISK_AFFECTED } from '~/types/VeoTypes';

interface Props {
  modelValue: boolean;
  domainId: string;
  objectSchema: IVeoDomainSpecificObjectSchema;
  schemaName: string;
  sorting: string | null;
  context: string | null;
  subType: string | null;
}
const props = withDefaults(defineProps<Props>(), {
  schemaName: '',
  sorting: null,
  context: null,
  subType: null
});

const emit = defineEmits<{
  (e: 'update:model-value', newValue: boolean): void;
  (e: 'update:schema-name', newValue: string): void;
  (e: 'update:sorting' | 'update:schema-context' | 'update:sub-type', newValue: string | null): void;
}>();

const { locale } = useI18n();
const { t: globalT } = useI18n({ useScope: 'global' });
const { requiredRule } = useRules();

const formIsValid = ref(true);

const form = ref({
  schemaName: props.schemaName,
  sorting: props.sorting,
  context: props.context,
  subType: props.subType
});

// Context
const contextLabels: Record<string, string> = {
  elementDetails: globalT('editor.formschema.create.context.elementDetails'),
  requirementImplementationControlView: globalT(
    'editor.formschema.create.context.requirementImplementationControlView'
  ),
  controlImplementationDetails: globalT('editor.formschema.create.context.controlImplementationDetails')
};

const contextLabel = computed(() => contextLabels[form.value.context] ?? '');

// ObjectType
const objectType: ComputedRef<string> = computed(() => {
  if (props.context === 'controlImplementationDetails' || props.context === 'requirementImplementationControlView') {
    return RISK_AFFECTED.filter((type) => type === props.objectSchema.title || '');
  }
  return props.objectSchema.title;
});

// SubTypes
const { data: translations } = useTranslations({ domain: props.domainId as string });
const filteredTranslations: Record<string, string> = translations.value?.lang?.[locale.value] || {};

const subTypes = computed(() =>
  (props.objectSchema?.properties?.subType?.enum || []).map((subType: string) => ({
    title: filteredTranslations?.[`${props.objectSchema?.title}_${subType}_singular`] || subType,
    value: subType
  }))
);

// Runtime changes
watch(
  () => props.schemaName,
  (val: string) => {
    form.value.schemaName = val;
  }
);

watch(
  () => props.sorting,
  (val) => {
    form.value.sorting = val as string;
  }
);

function saveForm() {
  emit('update:model-value', false);
  emit('update:schema-name', form.value.schemaName);
  emit('update:sorting', form.value.sorting ?? null);
  emit('update:schema-context', form.value.context);
  emit('update:sub-type', form.value.subType);
}
</script>
