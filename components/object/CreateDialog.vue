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
        v-bind="omit($props, 'modelValue')"
        v-model:valid="isFormValid"
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
        {{ globalT('global.button.cancel') }}
      </v-btn>
      <v-spacer />
      <v-btn
        text
        color="primary"
        :disabled="!isFormValid || !isFormDirty"
        @click="onSubmit"
      >
        {{ globalT('global.button.save') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script lang="ts">
import { cloneDeep, omit, upperFirst } from 'lodash';

import { useVeoAlerts } from '~/composables/VeoAlert';
import { isObjectEqual, separateUUIDParam } from '~/lib/utils';
import domainQueryDefinitions from '~/composables/api/queryDefinitions/domains';
import translationQueryDefinitions from '~/composables/api/queryDefinitions/translations';
import { IVeoAPIMessage, IVeoEntity } from '~/types/VeoTypes';
import schemasQueryDefinitions from '~/composables/api/queryDefinitions/schemas';
import objectQueryDefinitions from '~/composables/api/queryDefinitions/objects';
import { useQuery } from '~~/composables/api/utils/query';
import { useMutation } from '~~/composables/api/utils/mutation';

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
    const { t: globalT } = useI18n({ useScope: 'global' });
    const config = useRuntimeConfig();
    const route = useRoute();
    const { displaySuccessMessage, displayErrorMessage } = useVeoAlerts();
    const { ability } = useVeoPermissions();

    const fetchTranslationsQueryParameters = computed(() => ({ languages: [locale.value] }));
    const { data: translations } = useQuery(translationQueryDefinitions.queries.fetch, fetchTranslationsQueryParameters);

    const { data: endpoints } = useQuery(schemasQueryDefinitions.queries.fetchSchemas);

    const headline = computed(() => upperFirst(t('createObject').toString()) + ': ' + translations.value?.lang[locale.value]?.[props.objectType]);

    // Seeding of empty form
    const fetchDomainQueryParameters = computed(() => ({ id: props.domainId as string}));
    const fetchDomainQueryEnabled = computed(() => !!props.domainId);
    const { data: domain, isFetching: domainIsFetching } = useQuery(domainQueryDefinitions.queries.fetchDomain, fetchDomainQueryParameters, {
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
    const { mutateAsync: create } = useMutation(objectQueryDefinitions.mutations.createObject, {
      onSuccess: (queryClient, data: IVeoAPIMessage) => {
        emit('success', data.resourceId);
        displaySuccessMessage(upperFirst(t('objectCreated', { name: objectData.value.name }).toString()));
        emit('update:model-value', false);
      }
    });
    const onSubmit = async () => {
      if(!isFormValid.value || !isFormDirty.value || ability.value.cannot('manage', 'objects')) {
        return;
      }
      try {
        await create({ endpoint: endpoints.value?.[props.objectType], object: objectData.value });
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

      omit,
      upperFirst,
      t,
      globalT
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
