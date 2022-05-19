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
    class="mb-3"
    style="position: relative;"
  >
    <v-speed-dial
      v-model="speedDialIsOpen"
      v-cy-name="'action-menu'"
      direction="top"
      transition="slide-y-reverse"
      absolute
      right
      style="bottom: 12px"
    >
      <template #activator>
        <v-tooltip
          left
          :disabled="!tooltipText"
        >
          <template #activator="{ on }">
            <div v-on="on">
              <v-btn
                v-cy-name="'show-actions-button'"
                color="primary"
                :disabled="!allowedActions.length || disabled"
                depressed
                fab
                data-component-name="object-details-actions-button"
              >
                <v-icon v-if="speedDialIsOpen && !disabled && allowedActions.length">
                  {{ mdiClose }}
                </v-icon>
                <v-icon v-else>
                  {{ mdiPlus }}
                </v-icon>
              </v-btn>
            </div>
          </template>
          <template #default>
            {{ tooltipText }}
          </template>
        </v-tooltip>
      </template>
      <template
        v-if="allowedActions.length && !disabled"
        #default
      >
        <div v-cy-name="'action-list'">
          <v-btn
            v-for="action in allowedActions"
            :key="action.key"
            depressed
            rounded
            color="grey"
            @click="action.action"
          >
            {{ action.title }}
            <v-icon right>
              {{ action.icon }}
            </v-icon>
          </v-btn>
        </div>
      </template>
    </v-speed-dial>
    <!-- dialogs -->
    <VeoLinkObjectDialog
      v-model="addEntityDialog.value"
      v-bind="addEntityDialog"
      @success="onAddEntitySuccess"
      @error="onAddEntityError"
    />
    <VeoCreateEntityDialog
      v-model="createEntityDialog.value"
      :schemas="createEntitySchemas"
      :v-bind="createEntityDialog"
      @create-entity="openCreateObjectDialog($event.type, $event.addAsChild)"
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
import { defineComponent, onMounted, useRoute, ref, computed, useContext, watch, PropType } from '@nuxtjs/composition-api';
import { upperFirst } from 'lodash';
import { useI18n } from 'nuxt-i18n-composable';
import { mdiClose, mdiLinkPlus, mdiPlus } from '@mdi/js';
import { IBaseObject, separateUUIDParam } from '~/lib/utils';
import { IVeoEntity } from '~/types/VeoTypes';
import { IVeoSchemaEndpoint } from '~/plugins/api/schema';
import { useVeoAlerts } from '~/composables/VeoAlert';
import { useVeoObjectUtilities } from '~/composables/VeoObjectUtilities';

export default defineComponent({
  name: 'VeoObjectActionMenu',
  props: {
    type: {
      type: String,
      default: ''
    },
    object: {
      type: Object as PropType<IVeoEntity | undefined>,
      default: undefined
    }
  },
  setup(props, { emit }) {
    const { t } = useI18n();
    const route = useRoute();
    const { $api } = useContext();
    const { displaySuccessMessage, displayErrorMessage } = useVeoAlerts();
    const { linkObject } = useVeoObjectUtilities();

    // general stuff
    const schemas = ref<IVeoSchemaEndpoint[]>([]);
    const domainId = computed(() => separateUUIDParam(route.value.params.domain).id);
    const unitId = computed(() => separateUUIDParam(route.value.params.unit).id);

    const speedDialIsOpen = ref(false);
    const tooltipText = ref<string | undefined>(undefined);
    const disabled = computed(() => props.type === 'risks' && !hasScopeWithRiskDefinitionAsParent(parents.value));

    // fetch schemas from api
    onMounted(async () => {
      const fetchedSchemas = await $api.schema.fetchAll(false, {
        unit: unitId.value
      });
      schemas.value = fetchedSchemas;

      // For some reason an error gets thrown if this watch isn't in the unmounted
      watch(
        () => disabled.value,
        (newValue) => {
          if (newValue) {
            tooltipText.value = t('parentScopeNoRiskDefinition').toString();
          } else {
            tooltipText.value = undefined;
          }
        },
        {
          immediate: true
        }
      );
    });

    // configure possible action items
    const actions = computed(() => [
      {
        key: 'createObject',
        title: t('createObject', [props.object?.type !== 'scope' ? props.object?.type : t('object')]).toString(),
        icon: mdiPlus,
        tab: ['childObjects', 'parentObjects'],
        objectTypes: ['entity'],
        action: () => openCreateObjectDialog(props.object?.type === 'scope' ? undefined : props.object?.type, props.type === 'childObjects')
      },
      {
        key: 'linkObject',
        title: t('linkObject', [props.object?.type !== 'scope' ? props.object?.type : t('object')]).toString(),
        icon: mdiLinkPlus,
        tab: ['childObjects', 'parentObjects'],
        objectTypes: ['entity'],
        action: () => openLinkObjectDialog(props.object?.type === 'scope' ? undefined : props.object?.type, props.type === 'childObjects')
      },
      {
        key: 'createScope',
        title: t('createScope').toString(),
        icon: mdiPlus,
        tab: ['childScopes', 'parentScopes'],
        objectTypes: ['scope', 'entity'],
        action: () => openCreateObjectDialog('scope', props.type === 'childScopes')
      },
      {
        key: 'linkScope',
        title: t('linkScope').toString(),
        icon: mdiLinkPlus,
        tab: ['childScopes', 'parentScopes'],
        objectTypes: ['scope', 'entity'],
        action: () => openLinkObjectDialog('scope', props.type === 'childScopes')
      },
      {
        key: 'createRisk',
        title: t('createRisk').toString(),
        icon: mdiPlus,
        tab: ['risks'],
        objectTypes: ['entity'],
        action: () => onCreateRisk()
      }
    ]);
    // filter allowed actions for current type
    const allowedActions = computed(() => {
      let allowed = actions.value.filter((a) => a.tab.includes(props.type)); // filter by type
      if (props.object?.type !== 'scope') {
        allowed = allowed.filter((a) => a.objectTypes.includes('entity')); // filter by objecttype if scope
      }
      return allowed;
    });

    /**
     * link scopes & objects
     */

    // dialog options
    const addEntityDialog = ref<{ editedEntity: IVeoEntity | undefined; addType: 'scope' | 'entity'; value: boolean; hierarchicalContext: 'child' | 'parent' }>({
      editedEntity: undefined,
      addType: 'scope' as 'scope' | 'entity',
      value: false,
      hierarchicalContext: 'child'
    });

    // object types for object type selection in CreateEntityDialog
    const createEntitySchemas = computed(() => {
      return schemas.value
        .filter((filter) => filter.schemaName !== 'scope')
        .map((schema: IVeoSchemaEndpoint) => ({
          text: upperFirst(schema.schemaName),
          value: schema.schemaName
        }));
    });

    const createEntityDialog = ref({
      value: false,
      eventPayload: undefined as undefined | IBaseObject
    });
    const createObjectDialog = ref({
      value: false as boolean,
      objectType: undefined as undefined | string,
      hierarchicalContext: 'parent'
    });

    // control dialogs
    const openCreateObjectDialog = (objectType?: string, addAsChild?: boolean) => {
      if (!objectType) {
        createEntityDialog.value = {
          value: true,
          eventPayload: { objectType, addAsChild }
        };
      } else {
        createEntityDialog.value.value = false;
        createObjectDialog.value = {
          objectType,
          value: true,
          hierarchicalContext: addAsChild === undefined || addAsChild ? 'child' : 'parent'
        };
      }
    };

    // control dialogs
    const openLinkObjectDialog = (objectType?: string, addAsChild?: boolean) => {
      addEntityDialog.value = {
        editedEntity: props.object,
        addType: objectType === 'scope' ? 'scope' : 'entity',
        value: true,
        hierarchicalContext: addAsChild === undefined || addAsChild ? 'child' : 'parent'
      };
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

    // emit after new object creation for linking
    const onCreateObjectSuccess = async (newObjectId: string) => {
      if (props.object) {
        try {
          await linkObject(
            createObjectDialog.value.hierarchicalContext as any,
            { objectType: props.object.type, objectId: props.object.id },
            { objectType: createObjectDialog.value.objectType as string, objectId: newObjectId }
          );
          displaySuccessMessage(t('objectLinked').toString());
          emit('reload');
        } catch (e: any) {
          displayErrorMessage(upperFirst(t('errors.link').toString()), e.message);
        }
      }
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

    const hasScopeWithRiskDefinitionAsParent = (eligibleEntities: IVeoEntity[]) => eligibleEntities.some((entity) => !!entity.domains?.[domainId.value]?.riskDefinition);

    const parents = ref<IVeoEntity[]>([]);
    watch(
      () => props.object,
      async (newValue) => {
        if (newValue) {
          parents.value = (await $api.entity.fetchParents('scope', newValue.id)).items;
        }
      },
      {
        immediate: true
      }
    );

    return {
      createEntitySchemas,
      createEntityDialog,
      createObjectDialog,
      createRiskDialogVisible,
      onAddEntitySuccess,
      onAddEntityError,
      onCreateObjectSuccess,
      onCreateRiskSuccess,
      openCreateObjectDialog,
      openLinkObjectDialog,
      addEntityDialog,
      speedDialIsOpen,
      allowedActions,
      disabled,
      domainId,
      tooltipText,

      t,
      upperFirst,
      mdiClose,
      mdiPlus
    };
  }
});
</script>

<i18n>
{
  "en": {
    "createObject": "create {0}",
    "createRisk": "create risk",
    "linkObject": "select {0}",
    "createScope": "create scope",
    "linkScope": "select scope",
    "object": "object",
    "objectLinked": "The links were successfully updated.",
    "objectNotLinked": "The links could not be updated.",
    "parentScopeNoRiskDefinition": "This object needs a parent scope with a risk definition to create a risk"
  },
  "de": {
    "createObject": "{0} erstellen",
    "createRisk": "Risiko hinzufügen",
    "linkObject": "{0} auswählen",
    "createScope": "Scope erstellen",
    "linkScope": "Scope auswählen",
    "object": "Objekt",
    "objectLinked": "Die Verknüpfungen wurden erfolgreich aktualisiert.",
    "objectNotLinked": "Die Verknüpfungen konnten nicht aktualisiert werden.",
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
