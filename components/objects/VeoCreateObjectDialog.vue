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
  <VeoDialog
    :value="value"
    :headline="headline"
    x-large
    :persistent="isFormDirty"
    fixed-footer
    inner-class="fill-height"
    v-on="$listeners"
  >
    <template #default>
      <VeoObjectForm
        v-model="objectData"
        v-bind="$props"
        :preselected-sub-type="subType"
        :valid.sync="isFormValid"
        :loading="domainIsFetching"
        disable-history
        scroll-wrapper-id="scroll-wrapper-create-dialog"
        object-creation-disabled
      />
    </template>
    <template #dialog-options>
      <v-btn
        text
        :data-cy="$utils.prefixCyData($options, 'cancel-button')"
        @click="$emit('input', false)"
      >
        {{ t('global.button.cancel') }}
      </v-btn>
      <v-spacer />
      <v-btn
        text
        color="primary"
        :disabled="!isFormValid || !isFormDirty"
        :data-cy="$utils.prefixCyData($options, 'save-button')"
        @click="onSubmit"
      >
        {{ t('global.button.save') }}
      </v-btn>
    </template>
  </VeoDialog>
</template>

<script lang="ts">
import { defineComponent, ref, useContext, useRoute, computed, watch } from '@nuxtjs/composition-api';
import { useI18n } from 'nuxt-i18n-composable';
import { cloneDeep, isEqual, upperFirst } from 'lodash';

import { useVeoAlerts } from '~/composables/VeoAlert';
import { IBaseObject, separateUUIDParam } from '~/lib/utils';
import { useFetchDomain } from '~/composables/api/domains';

export default defineComponent({
  props: {
    value: {
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
  setup(props, { emit }) {
    const { t } = useI18n();
    const { $api, $config } = useContext();
    const route = useRoute();
    const { displaySuccessMessage, displayErrorMessage } = useVeoAlerts();

    const headline = computed(() => upperFirst(t('createObject').toString()) + ': ' + t(`objectTypes.${props.objectType}`).toString());

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

    const objectData = ref<IBaseObject>({});
    const pristineObjectData = ref<IBaseObject>({});

    const isFormDirty = computed(() => isEqual(objectData.value, pristineObjectData.value));
    const isFormValid = ref(false);

    const seedInitialData = () => {
      objectData.value = {
        owner: {
          targetUri: `${$config.apiUrl}/units/${separateUUIDParam(route.value.params.unit).id}`
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

    watch(() => props.subType, seedInitialData);
    watch(() => props.objectType, seedInitialData);
    watch(
      () => props.value,
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
        const result = await $api.entity.create(props.objectType, objectData.value as any);
        emit('success', result.resourceId);
        displaySuccessMessage(upperFirst(t('objectCreated', { name: objectData.value.name }).toString()));
        emit('input', false);
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
