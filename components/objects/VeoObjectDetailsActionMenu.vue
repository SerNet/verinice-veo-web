<!--
   - verinice.veo web
   - Copyright (C) 2022  Jessica Lühnen
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
    class="mb-3"
    style="position: relative;"
  >
    <v-speed-dial
      v-model="speedDialIsOpen"
      direction="top"
      transition="slide-y-reverse"
      absolute
      right
      style="bottom: 12px"
    >
      <template #activator>
        <v-btn
          v-model="speedDialIsOpen"
          color="primary"
          :disabled="!allowedActions.length"
          depressed
          fab
        >
          <v-icon v-if="speedDialIsOpen">
            {{ mdiClose }}
          </v-icon>
          <v-icon v-else>
            {{ mdiPlus }}
          </v-icon>
        </v-btn>
      </template>
      <template #default>
        <div
          v-for="action in allowedActions"
          :key="action.key"
          @click="action.action"
        >
          <v-btn
            depressed
            rounded
            color="grey"
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
    <VeoAddEntityDialog
      v-model="addEntityDialog.value"
      v-bind="addEntityDialog"
      @success="onAddEntitySuccess"
      @error="onAddEntityError"
    />
    <VeoCreateEntityDialog
      v-model="createEntityDialog.value"
      :schemas="createEntitySchemas"
      @create-entity="onObjectTypeSelected($event, createEntityDialog.parent)"
    />
    <VeoCreateObjectDialog
      v-if="createObjectDialog.objectType"
      v-model="createObjectDialog.value"
      :domain-id="domainId"
      :object-type="createObjectDialog.objectType"
      @success="onCreateObjectSuccess"
    />
    <VeoCreateRiskDialog
      v-if="object && createRiskDialogVisible"
      v-model="createRiskDialogVisible"
      :domain-id="domainId"
      :object-id="object.id"
      @success="onCreateRiskSuccess"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, useRoute, ref, computed, PropOptions, useContext } from '@nuxtjs/composition-api';
import { upperFirst } from 'lodash';
import { useI18n } from 'nuxt-i18n-composable';
import { mdiClose, mdiLinkPlus, mdiPlus } from '@mdi/js';
import { separateUUIDParam } from '~/lib/utils';
import { IVeoEntity } from '~/types/VeoTypes';
import { IVeoSchemaEndpoint } from '~/plugins/api/schema';
import { useVeoAlerts } from '~/composables/VeoAlert';

export default defineComponent({
  name: 'VeoObjectDetailsActionMenu',
  props: {
    type: { type: String, default: '' },
    object: {
      type: Object,
      default: undefined
    } as PropOptions<IVeoEntity>
  },
  setup(props, { emit }) {
    const { t } = useI18n();
    const route = useRoute();
    const { $api } = useContext();
    const { displaySuccessMessage, displayErrorMessage } = useVeoAlerts();

    // general stuff
    const schemas = ref<IVeoSchemaEndpoint[]>([]);
    const domainId = computed(() => separateUUIDParam(route.value.params.domain).id);
    const unitId = computed(() => separateUUIDParam(route.value.params.unit).id);

    const speedDialIsOpen = ref(false);

    // fetch schemas from api
    onMounted(async () => {
      const fetchedSchemas = await $api.schema.fetchAll(false, {
        unit: unitId.value
      });
      schemas.value = fetchedSchemas;
    });

    // configure possible action items
    const actions = [
      {
        key: 'linkObject',
        icon: mdiLinkPlus,
        tab: ['subEntities'],
        objectTypes: ['scope', 'entity'],
        action: () => onLinkObject()
      },
      {
        key: 'createObject',
        icon: mdiPlus,
        tab: ['subEntities', 'parents'],
        objectTypes: ['scope', 'entity'],
        action: () => onCreateObject()
      },
      {
        key: 'linkScope',
        icon: mdiLinkPlus,
        tab: ['subEntities'],
        objectTypes: ['scope'],
        action: () => onLinkScope()
      },
      {
        key: 'createScope',
        icon: mdiPlus,
        tab: ['subEntities', 'parents'],
        objectTypes: ['scope'],
        action: () => onCreateScope()
      },
      {
        key: 'createRisk',
        icon: mdiPlus,
        tab: ['risks'],
        objectTypes: ['entity'],
        action: () => onCreateRisk()
      }
    ];
    // filter allowed actions for current type
    const allowedActions = computed(() => {
      let allowed = actions.filter((a) => a.tab.includes(props.type)); // filter by type
      if (props.object?.type !== 'scope') {
        allowed = allowed.filter((a) => a.objectTypes.includes('entity')); // filter by objecttype if scope
      }
      return allowed;
    });

    /**
     * link scopes & objects
     */

    // dialog options
    const addEntityDialog = ref({
      editedEntity: undefined as IVeoEntity | undefined,
      addType: 'scope' as 'scope' | 'entity',
      value: false as boolean
    });

    // control dialogs
    const onLinkScope = () => {
      addEntityDialog.value.addType = 'scope';
      addEntityDialog.value.editedEntity = props.object;
      addEntityDialog.value.value = true;
    };
    const onLinkObject = () => {
      addEntityDialog.value.addType = 'entity';
      addEntityDialog.value.editedEntity = props.object;
      addEntityDialog.value.value = true;
    };

    // show error or success message
    const onAddEntitySuccess = () => {
      displaySuccessMessage(upperFirst(t('objectLinked').toString()));
      addEntityDialog.value.value = false;
      emit('reload');
    };
    const onAddEntityError = (error: any) => {
      displayErrorMessage(upperFirst(t('objectNotLinked').toString()), JSON.stringify(error));
      addEntityDialog.value.value = false;
    };

    /**
     * create scopes & objects
     */

    // dialog options
    const createEntityDialog = ref({
      value: false as boolean,
      parent: undefined as IVeoEntity | undefined
    });
    const createObjectDialog = ref({
      value: false as boolean,
      objectType: undefined as undefined | string
    });
    // object types for object type selection in CreateEntityDialog
    const createEntitySchemas = computed(() => {
      return schemas.value.map((schema: IVeoSchemaEndpoint) => {
        return {
          text: upperFirst(schema.schemaName),
          value: schema.schemaName
        };
      });
    });

    // control dialogs
    const onCreateScope = () => {
      createObjectDialog.value.objectType = 'scope';
      createObjectDialog.value.value = true;
    };
    const onCreateObject = () => {
      if (props.object?.type === 'scope') {
        createEntityDialog.value.parent = props.object; // at first, open dialog for object type selection (only for scopes)
        createEntityDialog.value.value = true;
      } else {
        createObjectDialog.value.objectType = props.object?.type; // open object creation dialog instantly for any other object types
        createObjectDialog.value.value = true;
      }
    };
    // after object type selection open object creation dialog
    const onObjectTypeSelected = (type?: string, _parent?: IVeoEntity) => {
      createObjectDialog.value.objectType = type;
      createEntityDialog.value.value = false;
      createObjectDialog.value.value = true;
    };

    // emit after new object creation for linking
    const onCreateObjectSuccess = (newObjectId: string) => {
      emit('new-object-created', newObjectId, createObjectDialog.value.objectType);
    };

    // Risk stuff
    const createRiskDialogVisible = ref(false);

    const onCreateRisk = () => {
      createRiskDialogVisible.value = true;
    };

    const onCreateRiskSuccess = () => {
      createRiskDialogVisible.value = false;
      emit('reload');
    };

    return {
      createEntitySchemas,
      createEntityDialog,
      createObjectDialog,
      createRiskDialogVisible,
      onAddEntitySuccess,
      onAddEntityError,
      onCreateObjectSuccess,
      onCreateRiskSuccess,
      addEntityDialog,
      onObjectTypeSelected,
      speedDialIsOpen,
      allowedActions,
      upperFirst,
      domainId,

      t,
      mdiClose,
      mdiPlus
    };
  }
});
</script>

<i18n>
{
  "en": {
    "createObject": "create object",
    "createRisk": "create risk",
    "linkObject": "link object",
    "createScope": "create scope",
    "linkScope": "link scope",
    "subEntities": "subentities",
    "parents": "parents",
    "objectLinked": "The links are successfully updated.",
    "objectNotLinked": "The links could not be updated.",
    "createType": "create {0}"
  },
  "de": {
    "createObject": "Objekt erstellen",
    "createRisk": "Risiko hinzufügen",
    "linkObject": "Objekt verknüpfen",
    "createScope": "Scope erstellen",
    "linkScope": "Scope verknüpfen",
    "subEntities": "Unterobjekte",
    "parents": "Eltern",
    "objectLinked": "Die Verknüpfungen wurden erfolgreich aktualisiert.",
    "objectNotLinked": "Die Verknüpfungen konnten nicht aktualisiert werden.",
    "createType": "{0} erstellen"
  }
}
</i18n>

<style lang="scss" scoped>
::v-deep .v-speed-dial__list {
  align-items: flex-end !important;
}
</style>