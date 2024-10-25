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
      <nuxt-link v-if="data?.mitigation" class="headline-link" @click="showNavigationDialog(null)">
        {{ upperFirst(t('Container').toString()) }}&nbsp;&gt;&nbsp;
      </nuxt-link>

      {{ upperFirst(t('mitigationSection').toString()) }}

      <v-tooltip location="bottom">
        <template #activator="{ props }">
          <v-icon v-bind="props" :icon="mdiInformationOutline" />
        </template>
        <template #default>
          <i18n-t keypath="mitigationAreaOfApplicationExplanation" tag="span" scope="global">
            <template #lineBreak>
              <br />
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
            <v-tooltip location="start">
              <template #activator="{ props }">
                <div v-bind="props">
                  <v-btn
                    :disabled="!data?.mitigation"
                    :icon="mdiArrowRightCircleOutline"
                    variant="text"
                    @click="showNavigationDialog(item)"
                  />
                </div>
              </template>
              {{ data?.mitigation ? t('navigateToPart') : t('saveFirst') }}
            </v-tooltip>
            <v-tooltip location="start">
              <template #activator="{ props }">
                <v-btn v-bind="props" :icon="mdiLinkOff" variant="text" @click="removeMitigationPart(item)" />
              </template>
              {{ t('unlinkPart') }}
            </v-tooltip>
          </div>
        </template>
      </ObjectTable>
      <div class="d-flex justify-end px-2">
        <v-menu :disabled="disabled" top offset-y>
          <template #activator="{ props }">
            <v-btn v-bind="props" class="mt-2 mb-2" color="primary" flat :disabled="disabled">
              <v-icon start :icon="mdiPencilOutline" />
              {{ t('editMitigatingActions').toString() }}
            </v-btn>
          </template>
          <template #default>
            <v-list dense>
              <v-list-item @click="createMitigationDialogVisible = true">
                <v-list-item-title>{{ t('createMitigation') }}</v-list-item-title>
              </v-list-item>
              <v-list-item @click="editMitigationsDialogVisible = true">
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
        {{ t('addMitigatingActionsToRisk', [data && data.designator]).toString() }}
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
import { mdiInformationOutline, mdiLinkOff, mdiPencilOutline } from '@mdi/js';
import { upperFirst } from 'lodash';
import { PropType } from 'vue';

import { mdiArrowRightCircleOutline } from '@mdi/js';
import { useQueryClient } from '@tanstack/vue-query';
import objectQueryDefinitions from '~/composables/api/queryDefinitions/objects';
import { useQuerySync } from '~/composables/api/utils/query';
import { useCurrentDomain } from '~/composables/index';
import { ROUTE_NAME as OBJECT_DETAIL_ROUTE } from '~/pages/[unit]/domains/[domain]/[objectType]/[subType]/[object].vue';
import { IVeoEntity, IVeoRisk } from '~/types/VeoTypes';

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

    const removeMitigationPart = (item: any) => {
      selectedItems.value = selectedItems.value.filter((mitigation) => mitigation.id !== item.id);
    };
    const navigateToRef = ref<IVeoEntity | null>(null);
    const showNavigationDialog = (item?: IVeoEntity) => {
      if (item && typeof item === 'object') {
        navigateToRef.value = item;
      }
      closeConfirmationDialogVisible.value = true;
    };

    const navigateToContainer = () => {
      const params: { objectType: string; subType: string; object?: string } = {
        ...route.params,
        objectType: 'controls',
        subType: currentDomain.value?.raw.controlImplementationConfiguration.mitigationControlSubType,
        object: props.data?.mitigation?.id
      };
      navigateTo({
        name: OBJECT_DETAIL_ROUTE,
        params
      });
    };

    const navigateToPart = (item: any) => {
      const params: { objectType: string; subType: string; object?: string } = {
        ...route.params,
        objectType: 'controls',
        subType: currentDomain.value?.raw.controlImplementationConfiguration.mitigationControlSubType,
        object: item?.id
      };
      navigateTo({
        name: OBJECT_DETAIL_ROUTE,
        params
      });
    };

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
      currentDomain
    };
  }
});
</script>

<i18n>
{
  "en": {
    "addMitigation": "add mitigating action",
    "addMitigatingActionsToRisk": "add existing mitigating actions to the risk \"{0}\"",
    "createMitigation": "create mitigating action",
    "editMitigatingActions": "add mitigating actions",
    "mitigationAreaOfApplicationExplanation": "Mitigating actions are applied across protection goals and risk definitions.{lineBreak} All selected mitigating actions are available under the action \"Mitigating action for {risk}\"",
    "mitigationSection": "risk reduction actions (mitigating actions)",
    "unlinkPart": "Unlink mitigating action",
    "navigateToPart": "Navigate to mitigating action",
    "container": "Container",
    "saveFirst": "Save the risk before you can navigate to the mitigations.",
    "navigationDialog": "Confirm Navigation",
    "leavePage": "Are you sure you want to leave this page? Unsaved changes might be lost."
  },
  "de": {
    "addMitigation": "Mitigierende Maßnahme verknüpfen",
    "addMitigatingActionsToRisk": "Vorhandene mitigierende Maßnahmen mit dem Risiko \"{0}\" verknüpfen",
    "createMitigation": "Mitigierende Maßnahme erstellen",
    "editMitigatingActions": "Mitigierende Maßnahmen hinzufügen",
    "mitigationAreaOfApplicationExplanation": "Mitigierende Maßnahmen gelten über Schutzziele und Risikodefinitionen hinweg.{lineBreak} Alle hier ausgewählten Maßnahmen sind unter der Maßnahme \"Mitigierende Maßnahme für {risk}\" zu finden",
    "mitigationSection": "Maßnahmen zur Risikoreduktion (Mitigierende Maßnahmen)",
    "unlinkPart": "Mitigierende Maßnahme entfernen",
    "navigateToPart": "Zu der mitigierenden Maßnahme wechseln",
    "container": "Container",
    "navigationDialog": "Seite verlassen",
    "saveFirst": "Risiko speichern, bevor Sie zu den mitigierenden Maßnahmen navigieren können",
    "leavePage": "Sind Sie sicher, dass Sie diese Seite verlassen möchten? Nicht gespeicherte Änderungen werden verloren gehen."
  }
}
</i18n>
<style scoped>
.headline-link {
  text-decoration: none;
  cursor: pointer; /* Ensures the cursor changes to a pointer on hover */
}

.headline-link:hover {
  text-decoration: underline;
}
</style>
