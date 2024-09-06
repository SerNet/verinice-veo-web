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
    <ObjectSelectObjectTypeDialog
      v-if="isCreateMode"
      v-model="createEntityDialog.value"
      :title="t('headline_create')"
      :description-text="t('create_entity')"
      :cancel-text="$t('global.button.cancel')"
      :action-button-text="t('create')"
      :action="'create-entity'"
      :event-payload="{ addAsChild: createEntityDialog.eventPayload }"
      @create-entity="openCreateObjectDialog($event.type, $event.addAsChild)"
    />
    <!-- @vue-ignore TODO #3066 $route does not exist -->
    <ObjectSelectObjectTypeDialog
      v-else
      v-model="selectEntityDialog"
      :title="t('headline_select')"
      :description-text="t('select_entity')"
      :cancel-text="$t('global.button.cancel')"
      :action-button-text="t('select')"
      :action="'select-entity'"
      :target-element-type="objectType"
      @select-entity="linkObjectCallback($event.type)"
    />
    <!-- @vue-ignore TODO #3066 $route does not exist -->
    <ObjectCreateDialog
      v-if="createObjectDialog.objectType"
      v-model="createObjectDialog.value"
      :domain-id="$route.params.domain"
      :object-type="createObjectDialog.objectType"
      :sub-type="subType"
      :parent-scope-ids="createObjectDialog.parentScopeIds"
      @success="onCreateObjectSuccess"
    />
    <!-- @vue-ignore TODO #3066 $route does not exist -->
    <RiskCreateDialog
      v-if="object && createRiskDialogVisible"
      v-model="createRiskDialogVisible"
      :domain-id="$route.params.domain"
      :object-id="object.id"
      @success="onCreateRiskSuccess"
    />
  </div>
</template>

<script lang="ts">
import { mdiClose, mdiLinkPlus, mdiPlus } from '@mdi/js';
import { cloneDeep, upperFirst } from 'lodash';
import { PropType } from 'vue';

import { useQueryClient } from '@tanstack/vue-query';
import { useVeoAlerts } from '~/composables/VeoAlert';
import { useCreateLink, useLinkObject } from '~/composables/VeoObjectUtilities';
import objectQueryDefinitions from '~/composables/api/queryDefinitions/objects';
import schemaQueryDefinitions from '~/composables/api/queryDefinitions/schemas';
import { useMutation } from '~/composables/api/utils/mutation';
import { useQuery, useQuerySync } from '~/composables/api/utils/query';
import type { IVeoControlImplementation, IVeoEntity, IVeoLink } from '~/types/VeoTypes';

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
    const { data: translations } = useTranslations({
      domain: route.params.domain as string,
      languages: [locale.value]
    });

    const { mutateAsync: updateObject } = useMutation(objectQueryDefinitions.mutations.updateObject);
    const speedDialIsOpen = ref(false);

    // Helper functions
    const getCreateObjectTranslationParams = () => {
      if (props.object?.type === 'scope') {
        return t('object');
      }
      return translations.value?.lang[locale.value]?.[props.object?.type || ''] || t('object');
    };

    const getLinkObjectTranslationParams = () => {
      if (props.type === 'controls') {
        return t('controls');
      }
      return getCreateObjectTranslationParams();
    };

    const getLinkObjectTranslation = () => {
      if (props.type === 'controls') {
        return t('linkControl', [getLinkObjectTranslationParams()]);
      }
      return t('linkObject', [getLinkObjectTranslationParams()]);
    };

    // Action functions
    const createObjectAction = () =>
      openCreateObjectDialog(
        props.object?.type === 'scope' ? undefined : props.object?.type,
        props.type === 'childObjects'
      );

    const determineType = () => {
      if (props.object?.type === 'scope') return undefined;
      if (props.type === 'controls') return 'control';
      return props.object?.type;
    };

    const openDialog = (objectType: string, typeTarget?: string) => {
      openLinkObjectDialog(
        objectType,
        props.type !== 'parentObjects' && (props.type === 'childScopes' || props.type !== 'targets'),
        props.type === 'controls',
        typeTarget
      );
    };

    // Action functions
    const linkObjectAction = () => {
      if (props.object?.type === 'scope') {
        selectEntityDialog.value = true;
      } else {
        linkObjectCallback(props.object?.type);
      }
    };

    const linkObjectCallback = (typeTarget: any) => {
      selectEntityDialog.value = false;
      openDialog(determineType(), typeTarget);
    };

    const createScopeAction = () => openCreateObjectDialog('scope', props.type === 'childScopes');
    const linkScopeAction = () => openDialog('scope', 'scope');
    const linkAssetAction = () => openDialog('asset', props.object?.type);
    const linkProcessAction = () => openDialog('process', props.object?.type);
    const createRiskAction = () => onCreateRisk();

    // Action configuration
    const actionConfigs = [
      {
        key: 'createObject',
        title: computed(() => t('createObject', [getCreateObjectTranslationParams()])),
        icon: mdiPlus,
        tab: ['childObjects', 'parentObjects'],
        objectTypes: ['entity'],
        action: createObjectAction
      },
      {
        key: 'linkObject',
        title: computed(() => getLinkObjectTranslation()),
        icon: mdiLinkPlus,
        tab: ['childObjects', 'parentObjects', 'controls'],
        objectTypes: ['entity'],
        action: linkObjectAction
      },
      {
        key: 'createScope',
        title: computed(() => t('createScope')),
        icon: mdiPlus,
        tab: ['childScopes', 'parentScopes'],
        objectTypes: ['scope', 'entity'],
        action: createScopeAction
      },
      {
        key: 'linkScope',
        title: computed(() => t('linkScope')),
        icon: mdiLinkPlus,
        tab: ['childScopes', 'parentScopes', 'targets'],
        objectTypes: ['scope', 'entity', 'targets'],
        action: linkScopeAction
      },
      {
        key: 'linkProcess',
        title: computed(() => t('linkProcess')),
        icon: mdiLinkPlus,
        tab: ['targets'],
        objectTypes: ['entity', 'targets'],
        action: linkProcessAction
      },
      {
        key: 'linkAsset',
        title: computed(() => t('linkAsset')),
        icon: mdiLinkPlus,
        tab: ['targets'],
        objectTypes: ['entity', 'targets'],
        action: linkAssetAction
      },
      {
        key: 'createRisk',
        title: computed(() => t('createRisk')),
        icon: mdiPlus,
        tab: ['risks'],
        objectTypes: ['entity'],
        action: createRiskAction
      }
    ];

    // Create actions dynamically
    const actions = computed(() =>
      actionConfigs.map((config) => ({
        key: config.key,
        title: config.title.value.toString(),
        icon: config.icon,
        tab: config.tab,
        objectTypes: config.objectTypes,
        action: config.action
      }))
    );

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
    const selectEntityDialog = ref(false);
    const createEntityDialog = ref({
      value: false,
      eventPayload: undefined as undefined | Record<string, any>
    });
    const isCreateMode = computed(() => {
      return createEntityDialog.value.value;
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

    // force ObjectLinkDialog to rerender, and thus update correctly
    const linkDialogKey = ref(0);
    const forceRerender = () => {
      linkDialogKey.value += 1;
    };

    // Control dialog function
    const openLinkObjectDialog = (
      objectType?: string,
      addAsChild?: boolean,
      isControlImplementation?: boolean,
      preSelectedFilter?: string
    ) => {
      addEntityDialog.value = {
        object: props.object,
        editRelationship: objectType,
        value: true,
        editParents: addAsChild === false,
        preselectedItems: getPreselectedItems(isControlImplementation),
        returnObjects: !!isControlImplementation,
        preselectedFilters: getPreselectedFilters(isControlImplementation, preSelectedFilter),
        disabledFields: getDisabledFields(isControlImplementation),
        linkRiskAffected: props.type === 'targets'
      };
      forceRerender();
    };

    // Helper functions for openLinkObjectDialog
    const getPreselectedItems = (isControlImplementation?: boolean): IVeoLink[] => {
      if (!isControlImplementation) return [];

      return (props.object?.controlImplementations ?? []).map((ci: IVeoControlImplementation) => ci.control);
    };

    const getPreselectedFilters = (isControlImplementation?: boolean, preSelectedFilter?: string) => {
      return isControlImplementation ? { subType: 'CTL_Module' } : { objectType: preSelectedFilter };
    };

    const getDisabledFields = (isControlImplementation?: boolean) => {
      return isControlImplementation ? ['subType'] : [];
    };

    // Update Item on Return Objects
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
    const objectType = computed(() => props.object?.type);
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
      linkObjectCallback,
      addEntityDialog,
      speedDialIsOpen,
      subType,
      objectType,
      allowedActions,
      selectEntityDialog,
      t,
      upperFirst,
      mdiClose,
      mdiPlus,
      linkDialogKey,
      isCreateMode
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
