<!--
   - verinice.veo web
   - Copyright (C) 2022  Jessica Lühnen, Jonas Heitmann
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
  <div
    class="mb-12"
    style="position: relative;"
  >
    <v-speed-dial
      v-model="speedDialIsOpen"
      v-cy-name="'action-menu'"
      direction="right"
      transition="slide-y-reverse"
      absolute
    >
      <template #activator>
        <v-tooltip
          left
          :disabled="!tooltipText"
        >
          <template #activator="{ on }">
            <div v-on="on">
              <v-btn
                v-model="speedDialIsOpen"
                v-cy-name="'show-actions-button'"
                color="primary"
                :disabled="!allowedActions.length || disabled"
                depressed
                fab
                small
              >
                <v-icon
                  v-if="speedDialIsOpen"
                  small
                >
                  {{ mdiClose }}
                </v-icon>
                <v-icon
                  v-else
                  small
                >
                  {{ mdiDotsVertical }}
                </v-icon>
              </v-btn>
            </div>
          </template>
          <template #default>
            {{ tooltipText }}
          </template>
        </v-tooltip>
      </template>
      <template #default>
        <div v-cy-name="'action-list'">
          <v-btn
            v-for="action in allowedActions"
            :key="action.key"
            depressed
            rounded
            color="grey"
            @click="action.action"
          >
            {{ upperFirst(t(action.key).toString()) }}
            <v-icon right>
              {{ action.icon }}
            </v-icon>
          </v-btn>
        </div>
      </template>
    </v-speed-dial>
    <!-- dialogs -->
    <VeoCreateObjectDialog
      v-if="createObjectDialog.objectType"
      v-model="createObjectDialog.value"
      :domain-id="domainId"
      :object-type="createObjectDialog.objectType"
      :sub-type="createObjectDialog.subType"
      @success="onCreateObjectSuccess"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, useRoute, ref, computed, PropType } from '@nuxtjs/composition-api';
import { upperFirst } from 'lodash';
import { useI18n } from 'nuxt-i18n-composable';
import { mdiClose, mdiPlus, mdiDotsVertical } from '@mdi/js';
import { separateUUIDParam } from '~/lib/utils';
import { IVeoEntity } from '~/types/VeoTypes';

export default defineComponent({
  name: 'VeoObjectActionMenu',
  props: {
    object: {
      type: Object as PropType<IVeoEntity | undefined>,
      default: undefined
    }
  },
  setup(props, { emit }) {
    const { t } = useI18n();
    const route = useRoute();

    // general stuff
    const domainId = computed(() => separateUUIDParam(route.value.params.domain).id);
    const subType = computed(() => props.object?.domains[domainId.value]?.subType);

    const speedDialIsOpen = ref(false);
    const tooltipText = ref<string | undefined>(undefined);
    const disabled = ref(false);

    // configure possible action items
    const actions = [
      {
        key: 'createDPIA',
        icon: mdiPlus,
        objectTypes: ['process'],
        subTypes: ['PRO_DataProcessing'],
        action: () => onCreateDPIA()
      }
    ];

    // filter allowed actions for current type
    const allowedActions = computed(() =>
      actions.filter((a) => props.object?.type && subType.value && a.objectTypes.includes(props.object?.type) && a.subTypes.includes(subType.value))
    );

    // dialog stuff
    const createObjectDialog = ref({
      value: false as boolean,
      objectType: undefined as undefined | string,
      subType: undefined as undefined | string
    });

    const onCreateDPIA = () => {
      createObjectDialog.value.objectType = props.object?.type;
      createObjectDialog.value.subType = 'PRO_DPIA';
      createObjectDialog.value.value = true;
    };

    // emit after new object creation for linking
    const onCreateObjectSuccess = (newObjectId: string) => {
      emit('new-object-created', newObjectId, createObjectDialog.value.objectType);
    };

    return {
      createObjectDialog,
      onCreateObjectSuccess,
      speedDialIsOpen,
      allowedActions,
      disabled,
      domainId,
      tooltipText,

      t,
      upperFirst,
      mdiClose,
      mdiPlus,
      mdiDotsVertical
    };
  }
});
</script>

<i18n>
{
  "en": {
      "createDPIA": "create DPIA",
    "createObject": "create object",
    "createRisk": "create risk",
    "linkObject": "link object",
    "createScope": "create scope",
    "linkScope": "link scope",
    "subEntities": "components",
    "parents": "part of",
    "objectLinked": "The links are successfully updated.",
    "objectNotLinked": "The links could not be updated.",
    "createType": "create {0}",
    "parentScopeNoRiskDefinition": "This object needs a parent scope with a risk definition to create a risk"
  },
  "de": {
      "createDPIA": "DSFA erstellen",
    "createObject": "Objekt erstellen",
    "createRisk": "Risiko hinzufügen",
    "linkObject": "Objekt verknüpfen",
    "createScope": "Scope erstellen",
    "linkScope": "Scope verknüpfen",
    "subEntities": "Bestandteile",
    "parents": "Teil von",
    "objectLinked": "Die Verknüpfungen wurden erfolgreich aktualisiert.",
    "objectNotLinked": "Die Verknüpfungen konnten nicht aktualisiert werden.",
    "createType": "{0} erstellen",
    "parentScopeNoRiskDefinition": "Dieses Objekt muss Teil eines Scopes mit Risikodefinition sein, um ein Risiko zu erstellen"
  }
}
</i18n>

<style lang="scss" scoped>
::v-deep .v-speed-dial__list {
  align-items: flex-end !important;
  text-align: right;
}
</style>
