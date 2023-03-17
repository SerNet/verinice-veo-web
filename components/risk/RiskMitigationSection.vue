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
    <h2 class="text-h2 mt-2 mb-1">
      {{ upperFirst(t('mitigationSection').toString()) }}
      <v-tooltip location="bottom">
        <template #activator="{ props }">
          <v-icon
            v-bind="props"
            :icon="mdiInformationOutline"
          />
        </template>
        <template #default>
          <i18n-t
            keypath="mitigationAreaOfApplicationExplanation"
            tag="span"
            scope="global"
          >
            <br>
          </i18n-t>
        </template>
      </v-tooltip>
    </h2>
    <BaseCard>
      <ObjectTable
        :default-headers="['icon', 'designator', 'abbreviation', 'name', 'status', 'updatedAt']"
        :loading="fetchingMitigation"
        :items="selectedItems"
      />
    </BaseCard>
    <v-menu
      :disabled="disabled"
      top
      offset-y
    >
      <template #activator="{ props }">
        <v-btn
          v-bind="props"
          class="mt-2"
          color="primary"
          flat
          :disabled="disabled"
        >
          <v-icon
            start
            :icon="mdiPencilOutline"
          />
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
      sub-type="CTL_TOM"
      :domain-id="domainId"
      @success="onMitigationCreated"
    />
  </div>
</template>

<script lang="ts">
import { PropType } from 'vue';
import { upperFirst } from 'lodash';
import { mdiInformationOutline, mdiPencilOutline } from '@mdi/js';

import { getEntityDetailsFromLink } from '~/lib/utils';
import { IVeoEntity, IVeoRisk } from '~/types/VeoTypes';
import { useQuerySync } from '~~/composables/api/utils/query';
import objectQueryDefinitions from '~~/composables/api/queryDefinitions/objects';

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
  emits: ['mitigations-modified', 'update:mitigations'],
  setup(props, { emit }) {
    const { t } = useI18n();

    // We don't need the name, as it only gets used by the text in the linkObjectDialog and this text gets overwritten by template#header
    const editedObject = { type: 'control', name: '' };

    const createMitigationDialogVisible = ref(false);
    const editMitigationsDialogVisible = ref(false);

    const selectedItems = computed<IVeoEntity[]>({
      get() {
        return props.mitigations;
      },
      set(newValue: IVeoEntity[]) {
        emit('update:mitigations', newValue);
        emit('mitigations-modified', true);
      }
    });

    const fetchingMitigation = ref(false);

    const fetchMitigation = async () => {
      if (props.data?.mitigation) {
        fetchingMitigation.value = true;
        const { id } = getEntityDetailsFromLink(props.data.mitigation);

        try {
          selectedItems.value = await useQuerySync(objectQueryDefinitions.queries.fetchObjectChildren, { endpoint: 'controls', id: id });
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
      const newMitigation = await useQuerySync(objectQueryDefinitions.queries.fetch, { endpoint: 'controls', id: objectId });
      selectedItems.value = [...selectedItems.value, newMitigation]; // We reassign the ref instead of using .push so that the computed setter picks up the changes
    };

    watch(
      () => props.data?.mitigation,
      () => fetchMitigation(),
      { immediate: true }
    );

    return {
      createMitigationDialogVisible,
      editedObject,
      editMitigationsDialogVisible,
      fetchingMitigation,
      onMitigationCreated,
      selectedItems,

      t,
      upperFirst,
      mdiInformationOutline,
      mdiPencilOutline
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
    "editMitigatingActions": "edit mitigating actions",
    "mitigationAreaOfApplicationExplanation": "Mitigating actions are applied across protection goals and risk definitions,{0} meaning only one mitigation action can be applied to a risk",
    "mitigationSection": "risk reduction actions (mitigating actions)"
  },
  "de": {
    "addMitigation": "Mitigierende Maßnahme verknüpfen",
    "addMitigatingActionsToRisk": "Vorhandene mitigierende Maßnahmen mit dem Risiko \"{0}\" verknüpfen",
    "createMitigation": "Mitigierende Maßnahme erstellen",
    "editMitigatingActions": "Mitigierende Maßnahmen bearbeiten",
    "mitigationAreaOfApplicationExplanation": "Mitigierende Maßnahmen gelten über Schutzziele und Risikodefinitionen hinweg,{0} d.h. es kann immer nur eine migitierende Maßnahme pro Risiko ausgewählt werden",
    "mitigationSection": "Maßnahmen zur Risikoreduktion (Mitigierende Maßnahmen)"
  }
}
</i18n>
