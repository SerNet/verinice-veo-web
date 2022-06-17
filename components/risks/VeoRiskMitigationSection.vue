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
    <h2 class="text-h2 mt-4">
      {{ upperFirst(t('mitigationSection').toString()) }}
      <v-tooltip bottom>
        <template #activator="{ on }">
          <v-icon v-on="on">
            {{ mdiInformationOutline }}
          </v-icon>
        </template>
        <template #default>
          <i18n
            path="mitigationAreaOfApplicationExplanation"
            tag="span"
          >
            <br>
          </i18n>
        </template>
      </v-tooltip>
    </h2>
    <VeoCard>
      <VeoObjectTable
        :default-headers="['name']"
        :loading="fetchingMitigation"
      />
    </VeoCard>
    <v-menu
      top
      offset-y
    >
      <template #activator="{ on }">
        <v-btn
          class="mt-2"
          color="primary"
          depressed
          v-on="on"
        >
          <v-icon left>
            {{ mdiPencilOutline }}
          </v-icon>
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
    <VeoLinkObjectDialog
      v-if="editMitigationsDialogVisible"
      v-model="editMitigationsDialogVisible"
      add-type="entity"
      return-objects
    />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref, useContext, useRoute, watch } from '@nuxtjs/composition-api';
import { useI18n } from 'nuxt-i18n-composable';
import { upperFirst } from 'lodash';
import { mdiInformationOutline, mdiPencilOutline } from '@mdi/js';

import { getEntityDetailsFromLink, separateUUIDParam } from '~/lib/utils';
import { IVeoEntity, IVeoRisk } from '~/types/VeoTypes';

export default defineComponent({
  props: {
    data: {
      type: Object as PropType<IVeoRisk>,
      default: undefined
    },
    domainId: {
      type: String,
      required: true
    }
  },
  setup(props, { emit }) {
    const { t } = useI18n();
    const { $config, $api } = useContext();
    const route = useRoute();

    // Mitigating action stuff
    const newMitigatingAction = computed(() => ({
      type: 'control',
      name: t('mitigatingAction', [props.data?.designator]).toString(),
      owner: {
        targetUri: `${$config.apiUrl}/units/${separateUUIDParam(route.value.params.unit).id}`
      },
      domain: {
        [props.domainId]: {
          subType: 'CTL_TOM'
        }
      }
    }));

    watch(
      () => newMitigatingAction.value,
      (newValue) => emit('update:new-mitigating-action', newValue),
      { deep: true }
    );

    const createMitigationDialogVisible = ref(false);
    const editMitigationsDialogVisible = ref(false);

    const containerAsObject = ref<IVeoEntity | undefined>(undefined);
    const fetchingMitigation = ref(false);

    const fetchMitigation = async () => {
      if (props.data?.mitigation) {
        fetchingMitigation.value = true;
        const { id } = getEntityDetailsFromLink(props.data.mitigation);

        try {
          containerAsObject.value = await $api.entity.fetch('control', id);
        } finally {
          fetchingMitigation.value = false;
        }
      }
    };

    watch(
      () => props.data?.mitigation,
      () => fetchMitigation(),
      { immediate: true }
    );

    return {
      createMitigationDialogVisible,
      containerAsObject,
      editMitigationsDialogVisible,
      fetchingMitigation,
      newMitigatingAction,

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
    "createMitigation": "create mitigating action",
    "editMitigatingActions": "edit mitigating actions",
    "mitigatingAction": "Mitigating action for \"{0}\"",
    "mitigationAreaOfApplicationExplanation": "Mitigating actions are applied across protection goals and risk definitions,{0} meaning only one mitigation action can be applied to a risk",
    "mitigationSection": "risk reduction actions (mitigating actions)"
  },
  "de": {
    "addMitigation": "Mitigierende Maßnahme verknüpfen",
    "createMitigation": "Mitigierende Maßnahme erstellen",
    "editMitigatingActions": "Mitigierende Maßnahmen bearbeiten",
    "mitigatingAction": "Mitigierende Maßnahme für \"{0}\"",
    "mitigationAreaOfApplicationExplanation": "Mitigierende Maßnahmen gelten über Schutzziele und Risikodefinitionen hinweg,{0} d.h. es kann immer nur eine migitierende Maßnahme pro Risiko ausgewählt werden",
    "mitigationSection": "Maßnahmen zur Risikoreduktion (Mitigierende Maßnahmen)"
  }
}
</i18n>
