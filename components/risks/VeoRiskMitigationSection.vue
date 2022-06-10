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
      <v-card-text>
        <div class="d-flex fill-width align-center">
          <div>
            <v-radio-group
              v-model="createNewMitigatingAction"
              hide-details
              dense
            >
              <v-radio
                :label="t('createNewMitigation')"
                :value="true"
              />
              <v-radio
                :label="`${t('useExistingMitigation')}:`"
                :value="false"
              />
            </v-radio-group>
            <VeoObjectSelect
              :value="data.mitigation"
              object-type="control"
              :disabled="createNewMitigatingAction"
              :label="t('mitigation')"
              value-as-link
              class="ml-8"
              @input="$emit('input', { ...data, mitigation: $event })"
            />
          </div>
          <v-tooltip bottom>
            <template #activator="{ on }">
              <div
                class="ml-4"
                v-on="on"
              >
                <v-badge
                  :content="mitigationParts.length + ''"
                  overlap
                >
                  <v-btn
                    icon
                    :disabled="fetchingMitigation"
                    @click="editPartsDialogVisible = true"
                  >
                    <v-icon>
                      {{ mdiFileDocumentMultiple }}
                    </v-icon>
                  </v-btn>
                </v-badge>
              </div>
            </template>
            <template #default>
              {{ upperFirst(t('editParts').toString()) }}
            </template>
          </v-tooltip>
        </div>
        <VeoLinkObjectDialog
          v-if="editPartsDialogVisible"
          v-model="editPartsDialogVisible"
          add-type="entity"
          :edited-object="createNewMitigatingAction ? newMitigatingAction : selectedMitigationAsEntity"
          return-objects
          :selected-items.sync="mitigationParts"
        />
      </v-card-text>
    </VeoCard>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref, useContext, useRoute, watch } from '@nuxtjs/composition-api';
import { useI18n } from 'nuxt-i18n-composable';
import { upperFirst } from 'lodash';
import { mdiFileDocumentMultiple, mdiInformationOutline } from '@mdi/js';

import { getEntityDetailsFromLink, separateUUIDParam } from '~/lib/utils';
import { IVeoEntity, IVeoRisk } from '~/types/VeoTypes';

export default defineComponent({
  props: {
    data: {
      type: Object as PropType<IVeoRisk>,
      default: undefined
    }
  },
  setup(props, { emit }) {
    const { t } = useI18n();
    const { $config, $api } = useContext();
    const route = useRoute();

    // Mitigating action stuff
    const createNewMitigatingAction = ref(true);
    const newMitigatingAction = computed(() => ({
      type: 'control',
      name: t('mitigatingAction', [props.data?.scenario?.displayName]).toString(),
      owner: {
        targetUri: `${$config.apiUrl}/units/${separateUUIDParam(route.value.params.unit).id}`
      }
    }));

    watch(
      () => newMitigatingAction.value,
      (newValue) => emit('update:new-mitigating-action', newValue),
      { deep: true }
    );

    const editPartsDialogVisible = ref(false);

    const selectedMitigationAsEntity = ref<IVeoEntity | undefined>(undefined);
    const fetchingMitigation = ref(false);

    const mitigationParts = ref<{ type: string; id: string }[]>([]);

    watch(
      () => mitigationParts.value,
      (newValue) => emit('update:mitigation-parts', newValue),
      { deep: true }
    );

    const fetchMitigation = async () => {
      if (props.data?.mitigation) {
        fetchingMitigation.value = true;
        const { id } = getEntityDetailsFromLink(props.data.mitigation);

        try {
          selectedMitigationAsEntity.value = await $api.entity.fetch('control', id);

          mitigationParts.value = selectedMitigationAsEntity.value.parts.map((part) => getEntityDetailsFromLink(part));
        } finally {
          fetchingMitigation.value = false;
        }
      } else {
        mitigationParts.value = [];
      }
    };

    watch(
      () => createNewMitigatingAction.value,
      (newValue) => {
        if (newValue) {
          mitigationParts.value = [];
        } else {
          fetchMitigation();
        }
      }
    );

    watch(
      () => props.data?.mitigation,
      () => {
        if (props.data?.mitigation) {
          createNewMitigatingAction.value = false;
        }
        fetchMitigation();
      },
      { immediate: true, deep: true }
    );

    return {
      createNewMitigatingAction,
      editPartsDialogVisible,
      fetchingMitigation,
      mitigationParts,
      newMitigatingAction,
      selectedMitigationAsEntity,

      t,
      upperFirst,
      mdiFileDocumentMultiple,
      mdiInformationOutline
    };
  }
});
</script>

<i18n>
{
  "en": {
    "createNewMitigation": "create new mitigating action",
    "editParts": "edit parts",
    "mitigatingAction": "Mitigating action for \"{0}\"",
    "mitigation": "mitigation",
    "mitigationAreaOfApplicationExplanation": "Mitigating actions are applied across protection goals and risk definitions,{0} meaning only one mitigation action can be applied to a risk",
    "mitigationSection": "risk reduction actions (mitigating actions)",
    "useExistingMitigation": "use existing mitigating action"
  },
  "de": {
    "createNewMitigation": "Neue mitigierende Maßnahme erstellen",
    "editParts": "Teile bearbeiten",
    "mitigatingAction": "Mitigierende Maßnahme für \"{0}\"",
    "mitigation": "Gegenmaßnahme",
    "mitigationAreaOfApplicationExplanation": "Mitigierende Maßnahmen gelten über Schutzziele und Risikodefinitionen hinweg,{0} d.h. es kann immer nur eine migitierende Maßnahme pro Risiko ausgewählt werden",
    "mitigationSection": "Maßnahmen zur Risikoreduktion (Mitigierende Maßnahmen)",
    "useExistingMitigation": "Vorhandene mitigierende Maßnahme nutzen"
  }
}
</i18n>
