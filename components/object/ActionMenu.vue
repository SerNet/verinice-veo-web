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
    <v-menu v-model="speedDialIsOpen" location="top left">
      <template #activator="{ props: menuProps }">
        <v-btn
          :icon="speedDialIsOpen && !disabled && allowedActions.length ? mdiClose : mdiPlus"
          :disabled="!allowedActions.length || disabled"
          class="veo-primary-action-fab mr-2"
          color="primary"
          data-component-name="object-details-actions-button"
          v-bind="menuProps"
        />
      </template>
      <template v-if="allowedActions.length && !disabled" #default>
        <v-list>
          <v-list-item
            v-for="action in allowedActions"
            :key="action.key"
            :title="action.title"
            :prepend-icon="action.icon"
            density="compact"
            @click="action.action"
          />
        </v-list>
      </template>
    </v-menu>
    <!-- dialogs -->
    <ObjectLinkDialog
      v-if="addEntityDialog.object"
      v-model="addEntityDialog.value"
      v-bind="addEntityDialog"
      @success="onAddEntitySuccess"
      @error="onAddEntityError"
      @update:preselected-items="onItemsUpdated"
    />
    <ObjectSelectObjectTypeDialog
      v-model="createEntityDialog.value"
      :v-bind="createEntityDialog"
      @create-entity="openCreateObjectDialog($event.type, $event.addAsChild)"
    />
    <ObjectCreateDialog
      v-if="createObjectDialog.objectType"
      v-model="createObjectDialog.value"
      :domain-id="$route.params.domain as string"
      :object-type="createObjectDialog.objectType"
      :sub-type="subType"
      :parent-scope-ids="createObjectDialog.parentScopeIds"
      @success="onCreateObjectSuccess"
    />
    <RiskCreateDialog
      v-if="object && createRiskDialogVisible"
      v-model="createRiskDialogVisible"
      :domain-id="$route.params.domain as string"
      :object-id="object.id"
      @success="onCreateRiskSuccess"
    />
  </div>
</template>

<script lang="ts">
import { PropType } from 'vue';
import { upperFirst, cloneDeep } from 'lodash';
import { mdiClose, mdiLinkPlus, mdiPlus } from '@mdi/js';

import { IVeoEntity, IVeoLink } from '~/types/VeoTypes';
import { useVeoAlerts } from '~/composables/VeoAlert';
import { useLinkObject, useCreateLink } from '~/composables/VeoObjectUtilities';
import translationQueryDefinitions from '~/composables/api/queryDefinitions/translations';
import schemaQueryDefinitions from '~/composables/api/queryDefinitions/schemas';
import objectQueryDefinitions from '~/composables/api/queryDefinitions/objects';
import { useQuery, useQuerySync } from '~/composables/api/utils/query';
import { useMutation } from '~/composables/api/utils/mutation';
import { useQueryClient } from '@tanstack/vue-query';

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
    const { t, locale } = useI18n();
    const route = useRoute();
    const { displaySuccessMessage, displayErrorMessage } = useVeoAlerts();
    const { link } = useLinkObject();
    const { createLink } = useCreateLink();
    const queryClient = useQueryClient();

    const { data: endpoints } = useQuery(schemaQueryDefinitions.queries.fetchSchemas);

    const fetchTranslationsQueryParameters = computed(() => ({
      languages: [locale.value],
      domain: route.params.domain as string
    }));
    const { data: translations } = useQuery(
      translationQueryDefinitions.queries.fetch,
      fetchTranslationsQueryParameters
    );
    const { mutateAsync: updateObject } = useMutation(objectQueryDefinitions.mutations.updateObject);
    const speedDialIsOpen = ref(false);

    // configure possible action items
    const actions = computed(() => [
      {
        key: 'createObject',
        title: t('createObject', [
          props.object?.type !== 'scope' ?
            translations.value?.lang[locale.value]?.[props.object?.type || '']
          : t('object')
        ]).toString(),
        icon: mdiPlus,
        tab: ['childObjects', 'parentObjects'],
        objectTypes: ['entity'],
        action: () =>
          openCreateObjectDialog(
            props.object?.type === 'scope' ? undefined : props.object?.type,
            props.type === 'childObjects'
          )
      },
      {
        key: 'linkObject',
        title: t('linkObject', [
          props.type === 'controls' ?
            locale.value === 'de' ?
              'Maßnahmen'
            : 'Controls'
          : props.object?.type !== 'scope' ? translations.value?.lang[locale.value]?.[props.object?.type || '']
          : t('object')
        ]).toString(),
        icon: mdiLinkPlus,
        tab: ['childObjects', 'parentObjects', 'controls'],
        objectTypes: ['entity'],
        action: () => {
          let type = props.object?.type;

          if (props.object?.type === 'scope') {
            type = undefined;
          }
          if (props.type === 'controls') {
            type === 'control';
          }
          openLinkObjectDialog(type, props.type !== 'parentObjects', props.type === 'controls');
        }
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
    const addEntityDialog = ref<{
      object: IVeoEntity | undefined;
      editScopeRelationship: boolean;
      value: boolean;
      editParents: boolean;
      preselectedItems: (IVeoLink | IVeoEntity)[];
      returnObjects: boolean;
      preselectedFilters: Record<string, any>;
      disabledFields: string[];
    }>({
      object: undefined,
      editScopeRelationship: false,
      value: false,
      editParents: false,
      preselectedItems: [],
      returnObjects: false,
      preselectedFilters: {},
      disabledFields: []
    });

    const createEntityDialog = ref({
      value: false,
      eventPayload: undefined as undefined | Record<string, any>
    });
    const createObjectDialog = ref({
      value: false as boolean,
      objectType: undefined as undefined | string,
      hierarchicalContext: 'parent',
      parentScopeIds: undefined as undefined | string[]
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
          hierarchicalContext: addAsChild === undefined || addAsChild ? 'child' : 'parent',
          parentScopeIds: props.object?.type === 'scope' ? [props.object?.id] : undefined
        };
      }
    };

    // control dialogs
    const openLinkObjectDialog = (objectType?: string, addAsChild?: boolean, isControlImplementation?: boolean) => {
      addEntityDialog.value = {
        object: isControlImplementation ? { type: 'control', displayName: 'CI' } : props.object,
        editScopeRelationship: objectType === 'scope',
        value: true,
        editParents: addAsChild !== undefined && !addAsChild,
        preselectedItems:
          isControlImplementation ? props.object?.controlImplementations?.map((control) => control.control) : [],
        returnObjects: !!isControlImplementation,
        preselectedFilters: isControlImplementation ? { subType: 'CTL_Module' } : {},
        disabledFields: isControlImplementation ? ['subType'] : []
      };
    };

    const onItemsUpdated = async (newItems: (IVeoEntity | IVeoLink)[]) => {
      const copy = cloneDeep(props.object);
      if (!copy) return;
      copy.controlImplementations?.push(
        ...newItems.map((item) => {
          return {
            control: 'targetUri' in item ? item : createLink('controls', item.id)
          };
        })
      );
      await updateObject({
        domain: route.params.domain,
        endpoint: route.params?.objectType,
        id: copy?.id,
        object: copy
      });
      displaySuccessMessage(upperFirst(t('objectLinked').toString()));
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
    const subType = computed(() =>
      props.object?.type !== 'scope' && props.type.endsWith('Objects') ? props.object?.subType : undefined
    );
    // emit after new object creation for linking
    const onCreateObjectSuccess = async (newObjectId: string) => {
      if (props.object) {
        try {
          const createdObject = await useQuerySync(
            objectQueryDefinitions.queries.fetch,
            {
              domain: route.params.domain as string,
              endpoint: endpoints.value?.[createObjectDialog.value?.objectType || ''] || '',
              id: newObjectId
            },
            queryClient
          );
          if (createObjectDialog.value.hierarchicalContext === 'child') {
            if (createObjectDialog.value.parentScopeIds?.length) {
              return; // do not link if scope (current object) has already been linked
            }
            await link(props.object, createdObject);
          } else {
            await link(createdObject, props.object);
          }
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
    };

    return {
      createEntityDialog,
      createObjectDialog,
      createRiskDialogVisible,
      onAddEntitySuccess,
      onAddEntityError,
      onCreateObjectSuccess,
      onCreateRiskSuccess,
      onItemsUpdated,
      openCreateObjectDialog,
      openLinkObjectDialog,
      addEntityDialog,
      speedDialIsOpen,
      subType,
      allowedActions,

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
    "objectNotLinked": "The links could not be updated."
  },
  "de": {
    "createObject": "{0} erstellen",
    "createRisk": "Risiko hinzufügen",
    "linkObject": "{0} auswählen",
    "createScope": "Scope erstellen",
    "linkScope": "Scope auswählen",
    "object": "Objekt",
    "objectLinked": "Die Verknüpfungen wurden erfolgreich aktualisiert.",
    "objectNotLinked": "Die Verknüpfungen konnten nicht aktualisiert werden."
  }
}
</i18n>

<style lang="scss" scoped>
:deep(.v-speed-dial__list) {
  align-items: flex-end !important;
  text-align: right;
}
</style>
