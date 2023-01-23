<!--
   - verinice.veo web
   - Copyright (C) 2021  Jonas Heitmann, Markus Werner
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
    :headline="headline"
    x-large
    :persistent="isFormDirty"
    fixed-footer
    inner-class="fill-height"
    v-bind="$attrs"
    @update:model-value="$emit('update:model-value', $event)"
  >
    <template #default>
      <ObjectForm
        v-model="objectData"
        v-bind="$props"
        v-model:valid="isFormValid"
        :preselected-sub-type="subType"
        :loading="domainIsFetching"
        disable-history
        scroll-wrapper-id="scroll-wrapper-create-dialog"
        object-creation-disabled
      />
    </template>
    <template #dialog-options>
      <v-btn
        text
        @click="$emit('update:model-value', false)"
      >
        {{ t('global.button.cancel') }}
      </v-btn>
      <v-spacer />
      <v-btn
        text
        color="primary"
        :disabled="!isFormValid || !isFormDirty"
        @click="onSubmit"
      >
        {{ t('global.button.save') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script lang="ts">
import { cloneDeep, upperFirst } from 'lodash';

import { useVeoAlerts } from '~/composables/VeoAlert';
import { isObjectEqual, separateUUIDParam } from '~/lib/utils';
import { useFetchDomain } from '~/composables/api/domains';
import { useFetchTranslations } from '~/composables/api/translations';
import { IVeoEntity } from '~/types/VeoTypes';
import { useFetchSchemas } from '~/composables/api/schemas';

export default defineComponent({
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    objectType: {
      type: String,
      required: true
    },
    subType: {
      type: String,
      default: undefined
    },
    domainId: {
      type: String,
      required: true
    }
  },
  emits: ['success', 'update:model-value'],
  setup(props, { emit }) {
    const { t, locale } = useI18n();
    const { $api } = useNuxtApp();
    const config = useRuntimeConfig();
    const route = useRoute();
    const { displaySuccessMessage, displayErrorMessage } = useVeoAlerts();

    const fetchTranslationsQueryParameters = computed(() => ({ languages: [locale.value] }));
    const { data: translations } = useFetchTranslations(fetchTranslationsQueryParameters);

    const { data: endpoints } = useFetchSchemas();

    const headline = computed(() => upperFirst(t('createObject').toString()) + ': ' + translations.value?.lang[locale.value]?.[props.objectType]);

    // Seeding of empty form
    const fetchDomainQueryParameters = computed(() => ({ id: props.domainId }));
    const fetchDomainQueryEnabled = computed(() => !!props.domainId);
    const { data: domain, isFetching: domainIsFetching } = useFetchDomain(fetchDomainQueryParameters, {
      onSuccess: () => {
        if (props.objectType === 'scope') {
          seedInitialData();
        }
      },
      enabled: fetchDomainQueryEnabled
    });

    const objectData = ref<Record<string, any>>({});
    const pristineObjectData = ref<Record<string, any>>({});

    const isFormDirty = computed(() => !isObjectEqual(objectData.value as IVeoEntity, pristineObjectData.value as IVeoEntity).isEqual);
    const isFormValid = ref(false);

    const seedInitialData = () => {
      objectData.value = {
        owner: {
          targetUri: `${config.public.apiUrl}/units/${separateUUIDParam(route.params.unit as string).id}`
        },
        domains: {
          [props.domainId]: {}
        }
      };

      // Set subtype if a subtype is preselected
      if (props.domainId && props.subType) {
        objectData.value.domains[props.domainId] = {
          subType: props.subType,
          status: 'NEW'
        };
      }

      setDefaultRiskDefinitionIfScope();

      // Create a pristine object to compare whether the user has inputted data
      pristineObjectData.value = cloneDeep(objectData.value);
    };

    const setDefaultRiskDefinitionIfScope = () => {
      if (props.objectType === 'scope' && domain.value) {
        if (Object.keys(domain.value.riskDefinitions).length === 1) {
          if (!objectData.value.domains) {
            objectData.value.domains = {};
          }
          if (!objectData.value.domains[props.domainId]) {
            objectData.value.domains[props.domainId] = {};
          }

          objectData.value.domains[props.domainId].riskDefinition = Object.keys(domain.value.riskDefinitions)[0];
        }
      }
    };

    watch(() => props.subType, seedInitialData, { immediate: true });
    watch(() => props.objectType, seedInitialData, { immediate: true });
    watch(
      () => props.modelValue,
      (newValue) => {
        if (!newValue) {
          setTimeout(() => {
            seedInitialData();
          }, 150);
        }
      }
    );

    // Submitting form
    const onSubmit = async () => {
      try {
        const result = await $api.entity.create(endpoints.value?.[props.objectType] || props.objectType, objectData.value as any);
        emit('success', result.resourceId);
        displaySuccessMessage(upperFirst(t('objectCreated', { name: objectData.value.name }).toString()));
        emit('update:model-value', false);
      } catch (e: any) {
        displayErrorMessage(upperFirst(t('objectNotCreated', { name: objectData.value.name || upperFirst(t('object').toString()) }).toString()), e.message);
      }
    };

    return {
      domainIsFetching,
      headline,
      isFormDirty,
      isFormValid,
      objectData,
      onSubmit,

      upperFirst,
      t
    };
  }
});
</script>

<i18n>
{
  "en": {
    "createObject": "create object",
    "object": "object",
    "objectCreated": "\"{name}\" was created successfully!",
    "objectNotCreated": "couldn't create \"{name}\""
  },
  "de": {
    "createObject": "objekt erstellen",
    "object": "objekt",
    "objectCreated": "\"{name}\" wurde erfolgreich erstellt!",
    "objectNotCreated": "\"{name}\" konnte nicht erstellt werden."
  }
}
</i18n>
