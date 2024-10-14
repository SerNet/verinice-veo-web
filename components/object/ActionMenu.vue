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
  <div class="mb-3" style="position: relative">
    <component
      :is="currentTabComponent"
      :object="object"
      :disabled="disabled"
      :add-entity-dialog="addEntityDialog"
      @update:add-entity-dialog="addEntityDialog = $event"
      @reload="handleReload"
      @parent-create-success="onParentCreateObjectSuccess"
      @child-create-success="onChildCreateObjectSuccess"
    >
      <template #default="{ actions }">
        <v-menu v-model="speedDialIsOpen" location="top left">
          <template #activator="{ props: menuProps }">
            <v-btn
              :icon="speedDialIsOpen && !disabled && actions.length ? mdiClose : mdiPlus"
              :disabled="!actions.length || disabled"
              class="veo-primary-action-fab mr-2"
              color="primary"
              data-component-name="object-details-actions-button"
              v-bind="menuProps"
            />
          </template>
          <template v-if="actions.length && !disabled" #default>
            <v-list>
              <v-list-item
                v-for="action in actions"
                :key="action.key"
                :title="action.title.value"
                :prepend-icon="action.icon"
                density="compact"
                @click="action.action"
              />
            </v-list>
          </template>
        </v-menu>
      </template>
    </component>

    <v-btn
      v-if="type === 'links'"
      :icon="mdiPlus"
      :disabled="true"
      class="veo-primary-action-fab mr-2"
      color="primary"
      data-component-name="object-details-actions-button"
    />

    <!-- @vue-ignore TODO #3066 not assignable -->
    <ObjectLinkDialog
      v-if="addEntityDialog.object"
      :key="linkDialogKey"
      v-model="addEntityDialog.value"
      v-bind="addEntityDialog"
      @success="onAddEntitySuccess"
      @error="onAddEntityError"
      @update:preselected-items="onItemsUpdated"
    />
  </div>
</template>

<script lang="ts">
import { mdiClose, mdiPlus } from '@mdi/js';
import { cloneDeep, upperFirst } from 'lodash';
import { PropType } from 'vue';
import { useI18n } from 'vue-i18n';
import ObjectActionMenusChildObjectsTab from '~/components/object/actionMenus/ChildObjectsTab.vue';
import ObjectActionMenusChildScopesTab from '~/components/object/actionMenus/ChildScopesTab.vue';
import ObjectActionMenusControlsTab from '~/components/object/actionMenus/ControlsTab.vue';
import ObjectActionMenusParentObjectsTab from '~/components/object/actionMenus/ParentObjectsTab.vue';
import ObjectActionMenusParentScopesTab from '~/components/object/actionMenus/ParentScopesTab.vue';
import ObjectActionMenusRisksTab from '~/components/object/actionMenus/RisksTab.vue';
import ObjectActionMenusTargetsTab from '~/components/object/actionMenus/TargetsTab.vue';

import { useQueryClient } from '@tanstack/vue-query';
import { computed, ref } from 'vue';
import { useVeoAlerts } from '~/composables/VeoAlert';
import { useCreateLink, useLinkObject } from '~/composables/VeoObjectUtilities';
import objectQueryDefinitions from '~/composables/api/queryDefinitions/objects';
import schemaQueryDefinitions from '~/composables/api/queryDefinitions/schemas';
import { useMutation } from '~/composables/api/utils/mutation';
import { useQuery, useQuerySync } from '~/composables/api/utils/query';
import type { IVeoEntity, IVeoLink } from '~/types/VeoTypes';

export default defineComponent({
  props: {
    type: {
      type: String,
      default: ''
    },
    object: {
      type: Object as PropType<IVeoEntity | undefined>,
      default: undefined
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  emits: ['reload'],
  setup(props, { emit }) {
    const { t } = useI18n();
    const route = useRoute();
    const { createLink } = useCreateLink();
    const { link } = useLinkObject();
    const queryClient = useQueryClient();
    const { data: endpoints } = useQuery(schemaQueryDefinitions.queries.fetchSchemas);
    const { displaySuccessMessage, displayErrorMessage } = useVeoAlerts();
    const { mutateAsync: updateObject } = useMutation(objectQueryDefinitions.mutations.updateObject);
    const speedDialIsOpen = ref(false);

    const addEntityDialog = ref<{
      object: IVeoEntity | undefined;
      editRelationship: string | undefined;
      value: boolean;
      editParents: boolean;
      preselectedItems: (IVeoLink | IVeoEntity)[];
      returnObjects: boolean;
      preselectedFilters: Record<string, any>;
      disabledFields: string[];
      linkRiskAffected: boolean;
    }>({
      object: undefined,
      editRelationship: '',
      value: false,
      editParents: false,
      preselectedItems: [],
      returnObjects: false,
      preselectedFilters: {},
      disabledFields: [],
      linkRiskAffected: false
    });

    // force ObjectLinkDialog to rerender, and thus update correctly
    const linkDialogKey = ref(0);
    const forceRerender = () => {
      linkDialogKey.value += 1;
    };

    watch(addEntityDialog, () => {
      forceRerender();
    });

    // Update Item on Return Objects
    const onItemsUpdated = async (newItems: (IVeoEntity | IVeoLink)[]) => {
      if (!props.object) return;

      const copy = cloneDeep(props.object);
      copy.controlImplementations ??= [];

      const newImplementations = newItems
        .filter((item) => !copy.controlImplementations.some((impl) => impl.control.id === item.id))
        .map((item) => ({
          control: 'targetUri' in item ? item : createLink('controls', item.id)
        }));

      copy.controlImplementations.push(...newImplementations);

      try {
        await updateObject({
          domain: route.params.domain,
          endpoint: route.params?.objectType,
          id: copy.id,
          object: copy
        });
        displaySuccessMessage(upperFirst(t('objectLinked').toString()));
      } catch (error) {
        console.error('Error updating object:', error);
        displayErrorMessage(upperFirst(t('objectNotLinked').toString()), JSON.stringify(error));
      }
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

    const handleReload = () => {
      emit('reload');
    };
    const currentTabComponent = computed(() => {
      const componentsMap = {
        childObjects: ObjectActionMenusChildObjectsTab,
        parentObjects: ObjectActionMenusParentObjectsTab,
        controls: ObjectActionMenusControlsTab,
        childScopes: ObjectActionMenusChildScopesTab,
        parentScopes: ObjectActionMenusParentScopesTab,
        risks: ObjectActionMenusRisksTab,
        targets: ObjectActionMenusTargetsTab
      };
      return componentsMap[props.type];
    });
    const handleCreateObjectSuccess = async (
      newObjectId: string,
      createObjectDialog: any,
      linkObjects: (obj1: any, obj2: any) => Promise<void>
    ) => {
      if (!props.object) return;

      try {
        const createdObject = await useQuerySync(
          objectQueryDefinitions.queries.fetch,
          {
            domain: route.params.domain as string,
            endpoint: endpoints.value?.[createObjectDialog?.objectType || ''] || '',
            id: newObjectId
          },
          queryClient
        );

        await linkObjects(props.object, createdObject);
        displaySuccessMessage(t('objectLinked').toString());
        handleReload();
      } catch (e: any) {
        displayErrorMessage(upperFirst(t('objectNotLinked').toString()), e.message);
      }
    };

    const onParentCreateObjectSuccess = (newObjectId: string, createObjectDialog: any) => {
      handleCreateObjectSuccess(newObjectId, createObjectDialog, async (parent, child) => {
        await link(child, parent);
      });
    };

    const onChildCreateObjectSuccess = (newObjectId: string, createObjectDialog: any) => {
      handleCreateObjectSuccess(newObjectId, createObjectDialog, async (parent, child) => {
        if (!createObjectDialog?.parentScopeIds?.length) {
          await link(parent, child);
        }
      });
    };

    provide('t', t);
    return {
      currentTabComponent,
      onAddEntitySuccess,
      onAddEntityError,
      onItemsUpdated,
      handleReload,
      addEntityDialog,
      speedDialIsOpen,
      t,
      upperFirst,
      mdiClose,
      mdiPlus,
      linkDialogKey,
      onParentCreateObjectSuccess,
      onChildCreateObjectSuccess
    };
  }
});
</script>

<i18n>
{
  "en": {
    "createObject": "Create {0}",
    "createRisk": "Create risk",
    "createScope": "Create scope",
    "linkScope": "Select scope",
    "linkAsset": "Select asset",
    "linkProcess": "Select process",
    "object": "object",
    "objectLinked": "The links were successfully updated.",
    "objectNotLinked": "The links could not be updated.",
    "create_entity": "Please specify the type of the new object.",
    "select_entity": "Please specify the type of the object to add.",
    "headline_create": "Create new object",
    "headline_select": "Select object type",
    "select": "Select",
    "create": "Create",

  },
  "de": {
    "createObject": "{0} erstellen",
    "createRisk": "Risiko hinzufügen",
    "createScope": "Scope erstellen",
    "linkScope": "Scope auswählen",
    "linkAsset": "Asset auswählen",
    "linkProcess": "Prozess auswählen",
    "object": "Objekt",
    "objectLinked": "Die Verknüpfungen wurden erfolgreich aktualisiert.",
    "objectNotLinked": "Die Verknüpfungen konnten nicht aktualisiert werden.",
    "create_entity": "Bitte wählen Sie den Typ des neuen Objektes.",
    "select_entity": "Bitte wählen Sie den Typ des Objekts, das Sie hinzufügen wollen.",
    "headline": "Objekt erstellen",
    "headline_create": "Objekt erstellen",
    "headline_select": "Objektstyp auswählen",
    "select": "Auswählen",
    "create": "Erstellen"
  }
}
</i18n>

<style lang="scss" scoped>
:deep(.v-speed-dial__list) {
  align-items: flex-end !important;
  text-align: right;
}
</style>
