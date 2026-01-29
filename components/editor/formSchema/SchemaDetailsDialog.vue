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
      <v-form v-model="formIsValid" class="mx-4" @submit="doSave()">
        <v-row no-gutters class="align-center mt-4">
          <v-col cols="12">
            <v-text-field
              v-model="form.formSchema"
              required
              flat
              :rules="[requiredRule]"
              :label="globalT('editor.formschema.create.title')"
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
              :model-value="
                form.context === 'elementDetails' ?
                  globalT('editor.formschema.create.context.elementDetails')
                : globalT('editor.formschema.create.context.requirementImplementationControlView')
              "
              flat
              :label="globalT('editor.formschema.create.context')"
              readonly
              disabled
            />
          </v-col>
        </v-row>
        <v-row no-gutters class="align-center mt-4">
          <v-col cols="12">
            <v-text-field
              :model-value="objectSchema.title"
              flat
              :label="globalT('editor.formschema.create.type')"
              readonly
              disabled
            />
          </v-col>
        </v-row>
        <v-row no-gutters class="align-center mt-4">
          <v-col cols="12">
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
      <v-btn @click="$emit('update:model-value', false)">
        {{ globalT('global.button.cancel') }}
      </v-btn>
      <v-spacer />
      <v-btn color="primary" :disabled="!formIsValid" @click="doSave()">
        {{ globalT('global.button.save') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>
<script setup lang="ts">
import type { IVeoDomainSpecificObjectSchema } from '~/types/VeoTypes';

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    objectSchema: IVeoDomainSpecificObjectSchema;
    formSchema: string;
    subType: string | null;
    sorting: string | null;
    context: string | null;
    domainId: string;
  }>(),
  {
    formSchema: '',
    subType: null,
    sorting: null,
    context: null
  }
);

const emit = defineEmits<{
  (e: 'update:model-value', newValue: boolean): void;
  (e: 'update-schema-name', newValue: string): void;
  (e: 'update:sub-type' | 'update:sorting' | 'update:schema-context', newValue: string | null): void;
}>();

const { t: globalT } = useI18n({ useScope: 'global' });
const { requiredRule } = useRules();

const formIsValid = ref(true);
const form = ref({
  formSchema: props.formSchema,
  subType: props.subType,
  sorting: props.sorting,
  context: props.context
});

watch(
  () => props.formSchema,
  (val: string) => {
    form.value.formSchema = val;
  }
);

watch(
  () => props.subType,
  (val: string | null) => {
    form.value.subType = val as string;
  }
);

watch(
  () => props.sorting,
  (val) => {
    form.value.sorting = val as string;
  }
);

const subTypeOptions = computed(() =>
  (props.objectSchema?.properties.subType.enum || []).map((subType: string) => ({
    title: subType,
    value: subType
  }))
);

function doSave() {
  emit('update:sub-type', form.value.subType);
  emit('update:sorting', form.value.sorting ?? null);
  emit('update:schema-context', form.value.context);
  emit('update-schema-name', form.value.formSchema);
  emit('update:model-value', false);
}
</script>
