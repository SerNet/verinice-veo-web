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
    :title="headline"
    x-large
    :confirm-close="isFormDirty"
    fixed-footer
    inner-class="d-flex flex-column"
    v-bind="$attrs"
    heading-level="h2"
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
      <v-btn variant="text" @click="$emit('update:model-value', false)">
        {{ globalT('global.button.cancel') }}
      </v-btn>
      <v-spacer />
      <v-btn variant="text" color="primary" :disabled="!isFormValid || !isFormDirty" @click="onSubmit">
        {{ globalT('global.button.save') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script lang="ts">
import { cloneDeep, omit, upperFirst } from 'lodash';

import domainQueryDefinitions from '~/composables/api/queryDefinitions/domains';
import objectQueryDefinitions from '~/composables/api/queryDefinitions/objects';
import translationQueryDefinitions from '~/composables/api/queryDefinitions/translations';
import { useMutation } from '~/composables/api/utils/mutation';
import { useQuery } from '~/composables/api/utils/query';
import { useVeoAlerts } from '~/composables/VeoAlert';
import { isObjectEqual } from '~/lib/utils';
import type { IVeoAPIMessage, IVeoEntity } from '~/types/VeoTypes';
import { VeoElementTypePlurals } from '~/types/VeoTypes';

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
    },
    parentScopeIds: {
      type: Array as PropType<string[]>,
      default: () => []
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

    const fetchTranslationsQueryParameters = computed(() => ({
      languages: [locale.value],
      domain: props.domainId
    }));
    const { data: translations } = useQuery(
      translationQueryDefinitions.queries.fetch,
      fetchTranslationsQueryParameters
    );

    const { subTypeTranslation } = useSubTypeTranslation(
      toRef(() => props.objectType),
      toRef(() => props.subType),
      false
    );

    const headline = computed(() => {
      const subType = subTypeTranslation.value === 'all' ? '' : subTypeTranslation.value;
      return (
        upperFirst(t('createObject').toString()) +
        ': ' +
        translations.value?.lang[locale.value]?.[props.objectType] +
        (subType ? ' ' + subType : '')
      );
    });

    // Seeding of empty form
    const fetchDomainQueryParameters = computed(() => ({
      id: props.domainId as string
    }));
    const fetchDomainQueryEnabled = computed(() => !!props.domainId);
    const { data: domain, isFetching: domainIsFetching } = useQuery(
      domainQueryDefinitions.queries.fetchDomain,
      fetchDomainQueryParameters,
      {
        onSuccess: () => {
          if (props.objectType === 'scope') {
            seedInitialData();
          }
        },
        enabled: fetchDomainQueryEnabled
      }
    );

    const objectData = ref<Record<string, any>>({});
    const pristineObjectData = ref<Record<string, any>>({});

    const isFormDirty = computed(
      () => !isObjectEqual(objectData.value as IVeoEntity, pristineObjectData.value as IVeoEntity).isEqual
    );
    const isFormValid = ref(false);

    const seedInitialData = () => {
      objectData.value = {
        type: props.objectType,
        owner: {
          targetUri: `${config.public.apiUrl}/units/${route.params.unit as string}`
        }
      };

      // Set subtype if a subtype is preselected
      if (props.domainId && props.subType) {
        objectData.value.subType = props.subType;
        objectData.value.status = 'NEW';
      }

      setDefaultRiskDefinitionIfScope();

      // Create a pristine object to compare whether the user has inputted data
      pristineObjectData.value = cloneDeep(objectData.value);
    };

    const setDefaultRiskDefinitionIfScope = () => {
      if (props.objectType === 'scope' && domain.value) {
        if (Object.keys(domain.value.riskDefinitions).length === 1) {
          objectData.value.riskDefinition = Object.keys(domain.value.riskDefinitions)[0];
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
      onSuccess: async (queryClient, data: IVeoAPIMessage) => {
        // Store value of object name before it gets reset on close dialog
        const objectName = objectData.value.name;
        // Invalidate parent scopes (should always be only one), if set directly as a parent via parentScopeIds.
        if (props.parentScopeIds) {
          for (const scope of props.parentScopeIds) {
            queryClient.invalidateQueries([
              'object',
              {
                endpoint: 'scopes',
                id: scope
              }
            ]);
            queryClient.invalidateQueries([
              'childObjects',
              {
                endpoint: 'scopes',
                id: scope
              }
            ]);
            queryClient.invalidateQueries([
              'childScopes',
              {
                id: scope
              }
            ]);
          }
        }
        emit('update:model-value', false);
        emit('success', data.resourceId);
        await nextTick(); // Wait for dialog begin closing
        setTimeout(() => {
          displaySuccessMessage(
            upperFirst(t('objectCreated', { name: objectName || upperFirst(t('object').toString()) }).toString())
          );
        }, 100); // Need to wait for dialog closing animation
      }
    });
    const onSubmit = async () => {
      if (!isFormValid.value || !isFormDirty.value || ability.value.cannot('manage', 'objects')) {
        return;
      }
      try {
        await create({
          endpoint: VeoElementTypePlurals[props.objectType],
          object: objectData.value,
          parentScopes: props.parentScopeIds
        });
      } catch (e: any) {
        displayErrorMessage(
          upperFirst(
            t('objectNotCreated', {
              name: objectData.value.name || upperFirst(t('object').toString())
            }).toString()
          ),
          e.message
        );
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

<i18n src="~/locales/base/components/object-create-dialog.json"></i18n>
