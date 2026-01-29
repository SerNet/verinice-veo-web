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
    <h2 class="text-h2">
      {{ t('createFormSchema') }}
    </h2>
    <v-form
      :model-value="valid"
      @update:model-value="$emit('update:valid', $event)"
      @submit.prevent="() => (valid ? $emit('submit') : () => {})"
    >
      <input type="submit" role="submit" class="d-none" />
      <BaseCard class="mb-4">
        <v-card-text>
          <v-row no-gutters class="align-center mt-4">
            <v-col cols="12">
              <v-text-field
                :model-value="name"
                :label="`${t('editor.formschema.create.title')}*`"
                :rules="[requiredRule]"
                required
                variant="underlined"
                data-veo-test="form-schema-name"
                @update:model-value="$emit('update:name', $event)"
              />
            </v-col>
          </v-row>
          <v-row no-gutters class="align-center mt-4">
            <v-col cols="12">
              <v-text-field
                :model-value="sorting"
                :label="t('editor.formschema.sorting')"
                variant="underlined"
                data-veo-test="form-schema-sorting"
                @update:model-value="$emit('update:sorting', $event)"
              />
            </v-col>
          </v-row>
        </v-card-text>
      </BaseCard>
      <BaseCard>
        <v-card-text>
          <v-row no-gutters class="align-center">
            <v-col cols="12">
              <v-select
                :model-value="context"
                :label="`${t('editor.formschema.create.context')}*`"
                :rules="[requiredRule]"
                :items="contexts"
                required
                variant="underlined"
                data-veo-test="form-schema-context-select"
                @update:model-value="$emit('update:context', $event)"
              />
            </v-col>
          </v-row>
          <v-row no-gutters class="align-center">
            <v-col cols="12">
              <v-select
                :model-value="objectType"
                :disabled="!context"
                :label="labels(context).objectType"
                :rules="[requiredRule]"
                :items="objectTypes"
                required
                variant="underlined"
                data-veo-test="form-schema-type-select"
                @update:model-value="$emit('update:object-type', $event)"
              />
            </v-col>
          </v-row>
          <v-row v-if="objectType === 'custom'" no-gutters>
            <v-col cols="12">
              <EditorFileUpload
                :input-label="t('objectSchemaUploadLabel')"
                :submit-button-text="t('importObjectSchema')"
                @schema-uploaded="$emit('update:object-schema', $event)"
              />
            </v-col>
          </v-row>
          <v-row no-gutters class="align-center mb-4">
            <v-col cols="12">
              <v-select
                :model-value="subType"
                :disabled="!objectType || (objectType === 'custom' && !objectSchema)"
                :items="subTypes"
                :loading="!!objectType && !objectSchema && objectType !== 'custom' && objectType !== 'all'"
                :label="labels(context).subType"
                :rules="[requiredRule]"
                variant="underlined"
                data-veo-test="form-schema-subtype-select"
                @update:model-value="$emit('update:sub-type', $event)"
              />
            </v-col>
          </v-row>
          <v-row no-gutters class="align-center mb-4">
            <v-col v-if="!!objectType" cols="4">
              {{ `${t('editor.formschema.underlying.scheme')}` }}: {{ labels(context).scheme }}
            </v-col>
          </v-row>
        </v-card-text>
      </BaseCard>
    </v-form>
    {{ t('global.input.requiredfields') }}
  </v-window-item>
</template>

<script lang="ts">
import { upperFirst } from 'lodash';

import {
  contextKeys,
  type IVeoDomainSpecificObjectSchema,
  RiContextTypes,
  VeoElementTypePlurals
} from '~/types/VeoTypes';

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
    context: {
      type: String,
      default: undefined
    },
    subType: {
      type: String,
      default: undefined
    },
    objectSchema: {
      type: Object as PropType<IVeoDomainSpecificObjectSchema | undefined>,
      default: undefined
    }
  },
  emits: [
    'update:context',
    'update:sub-type',
    'update:object-schema',
    'update:object-type',
    'update:sorting',
    'update:name',
    'submit',
    'update:valid'
  ],
  setup(props) {
    const { t, locale } = useI18n();
    const route = useRoute();
    const { data: currentDomain } = useCurrentDomain();
    const { data: translations } = useTranslations({ domain: route.params.domain as string });

    function requiredRule(value: string) {
      return !!value || t('global.input.required').toString();
    }

    const contexts = computed(() => {
      return contextKeys.map((value) => ({
        title: t(`editor.formschema.create.context.${value}`),
        value
      }));
    });

    const objectTypes = computed(() => {
      const lang = translations.value.lang[locale.value];

      if (props.context === 'requirementImplementationControlView') {
        return RiContextTypes.map((type) => ({
          title: lang[type] ?? t(type) ?? upperFirst(type),
          value: type
        }));
      }

      const objectSchemaOptions = Object.keys(VeoElementTypePlurals).map((elementType) => ({
        title: lang[elementType] ?? upperFirst(elementType),
        value: elementType
      }));

      objectSchemaOptions.unshift({
        title: t('customObjectSchema').toString(),
        value: 'custom'
      });

      return objectSchemaOptions;
    });

    const subTypes = computed(() => {
      if (props.objectType === 'all') {
        return [{ title: t('all'), value: 'all' }];
      }

      if (!props.objectType) {
        return [];
      }

      const elementTypeDef = currentDomain.value?.raw?.elementTypeDefinitions?.[props.objectType];
      if (!elementTypeDef) {
        return [];
      }

      const elementTypeTranslations = elementTypeDef.translations[locale.value] || {};
      const subTypeKeys = Object.keys(elementTypeDef.subTypes || {});

      return subTypeKeys.map((subType) => ({
        title: elementTypeTranslations[`${props.objectType}_${subType}_singular`] || subType,
        value: subType
      }));
    });

    const labels = (context: string) => {
      if (context === 'elementDetails') {
        return {
          objectType: `${t('editor.formschema.create.type')}*`,
          subType: `${t('editor.formschema.subtype')}*`,
          scheme: upperFirst(props.objectType)
        };
      }
      return {
        objectType: `${t('editor.formschema.create.type.context')}*`,
        subType: `${t('editor.formschema.subtype.context')}*`,
        scheme: 'Control'
      };
    };

    return {
      objectTypes,
      requiredRule,
      subTypes,
      contexts,
      labels,
      t
    };
  }
});
</script>

<i18n src="~/locales/base/components/editor-form-schema-wizard-state-create.json"></i18n>

<style lang="scss" scoped>
span {
  font-size: 1.2em;
}

// For some reason the chevron showed up in the upload component
:deep(.v-slide-group__next) {
  display: none;
}
</style>
