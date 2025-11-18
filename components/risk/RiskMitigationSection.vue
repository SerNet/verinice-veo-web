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
  <div>
    <h2 class="text-h2 mt-2 mb-1 d-flex align-center">
      <nuxt-link
        v-if="data?.mitigation"
        :to="containerHref"
        class="headline-link"
        @click.capture.prevent="showNavigationDialog"
      >
        {{ upperFirst(t('Container').toString()) }}&nbsp;&gt;&nbsp;
      </nuxt-link>

      {{ upperFirst(t('mitigationSection').toString()) }}

      <v-tooltip location="bottom" :aria-label="data?.scenario?.displayName">
        <template #activator="{ props }">
          <v-icon v-bind="props" :icon="mdiInformationOutline" />
        </template>
        <template #default>
          <i18n-t keypath="mitigationAreaOfApplicationExplanation" tag="span" scope="global">
            <template #lineBreak>
              <br >
            </template>
            <template #risk>
              {{ data?.scenario?.displayName }}
            </template>
          </i18n-t>
        </template>
      </v-tooltip>
    </h2>
    <BaseCard border>
      <ObjectTable
        :default-headers="['icon', 'designator', 'abbreviation', 'name', 'status', 'updatedAt', 'actions']"
        :loading="fetchingMitigation"
        :items="selectedItems"
      >
        <template #actions="{ item }">
          <div class="d-flex justify-end">
            <v-tooltip location="start" :aria-label="data?.mitigation ? t('navigateToPart') : t('saveFirst')">
              <template #activator="{ props }">
                <div v-bind="props">
                  <v-btn
                    :disabled="!data?.mitigation"
                    :to="partHref(item)"
                    :icon="mdiArrowRightCircleOutline"
                    variant="text"
                    :aria-label="data?.mitigation ? t('navigateToPart') : t('saveFirst')"
                    @click.capture.prevent="(e: MouseEvent) => showNavigationDialog(e, item)"
                  />
                </div>
              </template>
              {{ data?.mitigation ? t('navigateToPart') : t('saveFirst') }}
            </v-tooltip>
            <v-tooltip location="start" :aria-label="t('unlinkPart')">
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  :icon="mdiLinkOff"
                  :aria-label="data?.mitigation ? t('navigateToPart') : t('saveFirst')"
                  variant="text"
                  @click="removeMitigationPart(item)"
                />
              </template>
              {{ t('unlinkPart') }}
            </v-tooltip>
          </div>
        </template>
      </ObjectTable>
      <div class="d-flex justify-end px-2">
        <v-menu :disabled="disabled" top offset-y>
          <template #activator="{ props }">
            <v-btn
              v-bind="props"
              class="mt-2 mb-2"
              color="primary"
              flat
              :disabled="disabled"
              data-veo-test="add-mitigation"
            >
              <v-icon start :icon="mdiPencilOutline" />
              {{ t('editMitigatingActions').toString() }}
            </v-btn>
          </template>
          <template #default>
            <v-list dense>
              <v-list-item data-veo-test="create-mitigation" @click="createMitigationDialogVisible = true">
                <v-list-item-title>{{ t('createMitigation') }}</v-list-item-title>
              </v-list-item>
              <v-list-item data-veo-test="add-mitigating-actions" @click="editMitigationsDialogVisible = true">
                <v-list-item-title>{{ t('addMitigation') }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </template>
        </v-menu>
      </div>
    </BaseCard>
    <!-- @vue-ignore TODO #3066 not assignable -->
    <ObjectLinkDialog
      v-if="editMitigationsDialogVisible"
      v-model="editMitigationsDialogVisible"
      v-model:preselected-items="selectedItems"
      :object="editedObject"
      return-objects
    >
      <template #header>
        {{ t('addMitigatingActionsToRisk', [data && data.designator, data && data.scenario?.displayName]).toString() }}
      </template>
    </ObjectLinkDialog>
    <ObjectCreateDialog
      v-if="createMitigationDialogVisible"
      v-model="createMitigationDialogVisible"
      object-type="control"
      :sub-type="currentDomain.raw.controlImplementationConfiguration.mitigationControlSubType"
      :domain-id="domainId"
      @success="onMitigationCreated"
    />
    <v-dialog v-model="closeConfirmationDialogVisible" width="450px">
      <v-card>
        <v-card-title class="bg-accent small-caps">
          {{ t('navigationDialog') }}
        </v-card-title>
        <v-card-text>
          {{ t('leavePage') }}
          <v-card-actions class="px-0 pb-0">
            <v-btn variant="text" @click="closeConfirmationDialogVisible = false">
              {{ t('global.button.cancel') }}
            </v-btn>
            <v-spacer />
            <v-btn
              ref="confirmButton"
              color="primary"
              variant="text"
              @click="confirmNavigation()"
              @keydown.enter="confirmNavigation()"
            >
              {{ t('global.button.yes') }}
            </v-btn>
          </v-card-actions>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import { mdiInformationOutline, mdiLinkOff, mdiPencilOutline, mdiArrowRightCircleOutline  } from '@mdi/js';
import { upperFirst } from 'lodash';
import type { PropType } from 'vue';

import { useQueryClient } from '@tanstack/vue-query';
import objectQueryDefinitions from '~/composables/api/queryDefinitions/objects';
import { useQuerySync } from '~/composables/api/utils/query';
import { useCurrentDomain } from '~/composables/index';
import { ROUTE_NAME as OBJECT_DETAIL_ROUTE } from '~/pages/[unit]/domains/[domain]/[objectType]/[subType]/[object].vue';
import type { IVeoEntity, IVeoRisk } from '~/types/VeoTypes';

export default defineComponent({
  props: {
    data: {
      type: Object as PropType<IVeoRisk>,
      default: undefined
    },
    mitigations: {
      type: Array as PropType<IVeoEntity[]>,
      default: () => []
    },
    disabled: {
      type: Boolean,
      default: false
    },
    domainId: {
      type: String,
      required: true
    }
  },
  emits: ['mitigations-modified'],
  setup(props, { emit }) {
    const { t } = useI18n();
    const queryClient = useQueryClient();
    const { data: currentDomain } = useCurrentDomain();
    // We don't need the name, as it only gets used by the text in the linkObjectDialog and this text gets overwritten by template#header
    const editedObject = { type: 'control', name: '' };

    const createMitigationDialogVisible = ref(false);
    const editMitigationsDialogVisible = ref(false);
    const selectedItems = computed<IVeoEntity[]>({
      get() {
        return props.mitigations;
      },
      set(newValue: IVeoEntity[]) {
        emit('mitigations-modified', true, newValue);
      }
    });

    const fetchingMitigation = ref(false);

    const fetchMitigation = async () => {
      if (props.data?.mitigation) {
        fetchingMitigation.value = true;
        try {
          selectedItems.value = (
            await useQuerySync(
              objectQueryDefinitions.queries.fetchObjectChildren,
              {
                domain: props.domainId,
                endpoint: 'controls',
                id: props.data.mitigation.id,
                size: 9999
              },
              queryClient
            )
          ).items;
          emit('mitigations-modified', false);
        } finally {
          fetchingMitigation.value = false;
        }
      } else {
        selectedItems.value = [];
        emit('mitigations-modified', false);
      }
    };

    const onMitigationCreated = async (objectId: string) => {
      const newMitigation = await useQuerySync(
        objectQueryDefinitions.queries.fetch,
        { domain: props.domainId, endpoint: 'controls', id: objectId },
        queryClient
      );
      selectedItems.value = [...selectedItems.value, newMitigation]; // We reassign the ref instead of using .push so that the computed setter picks up the changes
    };
    const route = useRoute();
    const router = useRouter();

    const removeMitigationPart = (item: any) => {
      selectedItems.value = selectedItems.value.filter((mitigation) => mitigation.id !== item.id);
    };
    const navigateToRef = ref<IVeoEntity | null>(null);
    const showNavigationDialog = (event: MouseEvent, item?: IVeoEntity) => {
      navigateToRef.value = item;
      closeConfirmationDialogVisible.value = true;
    };

    // Helper function to generate route parameters based on an object ID
    const getRouteParams = (objectId) => ({
      ...route.params,
      objectType: 'controls',
      subType: currentDomain.value?.raw.controlImplementationConfiguration.mitigationControlSubType,
      object: objectId
    });

    // Generic function to generate href
    const generateHref = (objectId) => {
      const params = getRouteParams(objectId);
      const { href } = router.resolve({
        name: OBJECT_DETAIL_ROUTE,
        params
      });
      return href;
    };

    // Navigation functions
    const navigateToContainer = () => {
      router.push({
        name: OBJECT_DETAIL_ROUTE,
        params: getRouteParams(props.data?.mitigation?.id)
      });
    };

    const containerHref = computed(() => generateHref(props.data?.mitigation?.id));

    const navigateToPart = (item) => {
      router.push({
        name: OBJECT_DETAIL_ROUTE,
        params: getRouteParams(item?.id)
      });
    };

    const partHref = (item: IVeoEntity) => generateHref(item?.id);

    watch(
      () => props.data?.mitigation,
      () => fetchMitigation(),
      { immediate: true }
    );

    const confirmButton = ref();
    // Everything regarding closing the dialog
    const closeConfirmationDialogVisible = ref(false);
    // Focus okay button so the user can leave the dialog by pressing enter
    watch(
      () => closeConfirmationDialogVisible.value,
      (value) => {
        if (value) {
          nextTick(() => {
            confirmButton.value.$el.focus();
          });
        } else {
          (document.activeElement as HTMLElement | null)?.blur?.();
        }
      }
    );
    const confirmNavigation = () => {
      closeConfirmationDialogVisible.value = false;
      if (navigateToRef.value) {
        navigateToPart(navigateToRef.value);
      } else {
        navigateToContainer();
      }
    };

    return {
      confirmNavigation,
      showNavigationDialog,
      confirmButton,
      closeConfirmationDialogVisible,
      createMitigationDialogVisible,
      editedObject,
      editMitigationsDialogVisible,
      fetchingMitigation,
      removeMitigationPart,
      onMitigationCreated,
      mdiArrowRightCircleOutline,
      selectedItems,
      t,
      upperFirst,
      mdiInformationOutline,
      mdiLinkOff,
      mdiPencilOutline,
      navigateToPart,
      navigateToContainer,
      currentDomain,
      containerHref,
      partHref
    };
  }
});
</script>

<i18n src="~/locales/base/components/risk-risk-mitigation-section.json"></i18n>
<style scoped>
.headline-link {
  text-decoration: none;
  cursor: pointer; /* Ensures the cursor changes to a pointer on hover */
}

.headline-link:hover {
  text-decoration: underline;
}
</style>
