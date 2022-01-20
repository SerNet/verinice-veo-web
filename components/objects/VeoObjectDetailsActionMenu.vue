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
  <div>
    <v-menu offset-y>
      <template #activator="{ on, attrs }">
        <v-btn
v-cy-name="'create-button'"
color="primary"
text
v-bind="attrs"
v-on="on">
          <v-icon left>{{ mdiPlus }}</v-icon>
          <span>{{ t('createType', [t(type)]) }}</span>
        </v-btn>
      </template>
      <v-list>
        <v-list-item
v-for="action in allowedActions"
:key="action.key"
@click="action.action">
          <v-list-item-title>{{ upperFirst(t(action.key).toString()) }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
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
      @create-entity="onCreateEntity($event, createEntityDialog.parent)"
    />
    <VeoCreateObjectDialog
      v-if="createObjectDialog.objectType"
      v-model="createObjectDialog.value"
      :domain-id="domainId"
      :object-type="createObjectDialog.objectType"
      @success="onCreateObjectSuccess"
    />
  </div>
</template>

<script lang="ts">
import { useRoute, ref, computed, PropOptions, useContext } from '@nuxtjs/composition-api';
import { defineComponent, onMounted } from '@vue/composition-api';
import { upperFirst } from 'lodash';
import { useI18n } from 'nuxt-i18n-composable';
import { mdiPlus } from '@mdi/js';
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
    const domainId = computed(() => separateUUIDParam(route.value.params.id).id);
    const unitId = computed(() => separateUUIDParam(route.value.params.unit).id);

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
        key: 'createObject',
        types: ['subEntities', 'parents'],
        action: () => onCreateObject()
      },
      {
        key: 'createScope',
        types: ['subEntities', 'parents'],
        action: () => onCreateScope()
      },
      {
        key: 'linkObject',
        types: ['subEntities'],
        action: () => onLinkObject()
      },
      {
        key: 'linkScope',
        types: ['subEntities'],
        action: () => onLinkScope()
      }
    ];
    // filter allowed actions for current type
    const allowedActions = computed(() => actions.filter((a) => a.types.includes(props.type)));

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
      emit('link-success');
    };
    const onAddEntityError = (error) => {
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
      createEntityDialog.value.parent = props.object; // at first, open dialog for object type selection
      createEntityDialog.value.value = true;
    };
    // after object type selection open object creation dialog
    const onCreateEntity = (type?: string, _parent?: IVeoEntity) => {
      createObjectDialog.value.objectType = type;
      createEntityDialog.value.value = false;
      createObjectDialog.value.value = true;
    };

    // emit after new object creation for linking
    const onCreateObjectSuccess = (newObjectId: string) => {
      emit('new-object-created', newObjectId, createObjectDialog.value.objectType);
    };

    return {
      onCreateObjectSuccess,
      createEntitySchemas,
      createEntityDialog,
      createObjectDialog,
      onAddEntitySuccess,
      onAddEntityError,
      addEntityDialog,
      onCreateEntity,
      allowedActions,
      upperFirst,
      domainId,

      t,
      mdiPlus
    };
  }
});
</script>

<i18n>
{
  "en": {
    "createObject": "create object",
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