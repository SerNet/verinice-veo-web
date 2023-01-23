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
    <v-menu
      v-model="speedDialIsOpen"
      location="top left"
    >
      <template #activator="{ props: menuProps }">
        <v-btn
          color="primary"
          :disabled="!allowedActions.length || disabled"
          :icon="speedDialIsOpen && !disabled && allowedActions.length ? mdiClose : mdiPlus"
          data-component-name="object-details-actions-button"
          v-bind="menuProps"
          class="veo-primary-action-fab"
        />
      </template>
      <template
        v-if="allowedActions.length && !disabled"
        #default
      >
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
    />
    <ObjectSelectObjectTypeDialog
      v-model="createEntityDialog.value"
      :v-bind="createEntityDialog"
      @create-entity="openCreateObjectDialog($event.type, $event.addAsChild)"
    />
    <ObjectCreateDialog
      v-if="createObjectDialog.objectType"
      v-model="createObjectDialog.value"
      :domain-id="domainId"
      :object-type="createObjectDialog.objectType"
      :sub-type="subType"
      @success="onCreateObjectSuccess"
    />
    <RiskCreateDialog
      v-if="object && createRiskDialogVisible"
      v-model="createRiskDialogVisible"
      :domain-id="domainId"
      :object-id="object.id"
      @success="onCreateRiskSuccess"
    />
  </div>
</template>

<script lang="ts">
import { PropType } from 'vue';
import { upperFirst } from 'lodash';
import { mdiClose, mdiLinkPlus, mdiPlus } from '@mdi/js';

import { separateUUIDParam } from '~/lib/utils';
import { IVeoEntity } from '~/types/VeoTypes';
import { useVeoAlerts } from '~/composables/VeoAlert';
import { useLinkObject } from '~/composables/VeoObjectUtilities';
import { useFetchTranslations } from '~/composables/api/translations';
import { useFetchSchemas } from '~/composables/api/schemas';

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
    const { $api } = useNuxtApp();
    const { t, locale } = useI18n();
    const route = useRoute();
    const { displaySuccessMessage, displayErrorMessage } = useVeoAlerts();
    const { link } = useLinkObject();

    const { data: endpoints } = useFetchSchemas();

    const fetchTranslationsQueryParameters = computed(() => ({ languages: [locale.value] }));
    const { data: translations } = useFetchTranslations(fetchTranslationsQueryParameters);

    // general stuff
    const domainId = computed(() => separateUUIDParam(route.params.domain as string).id);

    const speedDialIsOpen = ref(false);

    // configure possible action items
    const actions = computed(() => [
      {
        key: 'createObject',
        title: t('createObject', [props.object?.type !== 'scope' ? translations.value?.lang[locale.value]?.[props.object?.type || ''] : t('object')]).toString(),
        icon: mdiPlus,
        tab: ['childObjects', 'parentObjects'],
        objectTypes: ['entity'],
        action: () => openCreateObjectDialog(props.object?.type === 'scope' ? undefined : props.object?.type, props.type === 'childObjects')
      },
      {
        key: 'linkObject',
        title: t('linkObject', [props.object?.type !== 'scope' ? translations.value?.lang[locale.value]?.[props.object?.type || ''] : t('object')]).toString(),
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
    const addEntityDialog = ref<{ object: IVeoEntity | undefined; editScopeRelationship: boolean; value: boolean; editParents: boolean }>({
      object: undefined,
      editScopeRelationship: false,
      value: false,
      editParents: false
    });

    const createEntityDialog = ref({
      value: false,
      eventPayload: undefined as undefined | Record<string, any>
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
        object: props.object,
        editScopeRelationship: objectType === 'scope',
        value: true,
        editParents: addAsChild !== undefined && !addAsChild
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
    const subType = computed(() => (props.object?.type === 'scope' && props.type === 'childObjects' ? undefined : props.object?.domains?.[domainId.value]?.subType));

    // emit after new object creation for linking
    const onCreateObjectSuccess = async (newObjectId: string) => {
      if (props.object) {
        try {
          const createdObject = await $api.entity.fetch(endpoints.value?.[createObjectDialog.value.objectType || ''] || '', newObjectId);
          if (createObjectDialog.value.hierarchicalContext === 'child') {
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
      openCreateObjectDialog,
      openLinkObjectDialog,
      addEntityDialog,
      speedDialIsOpen,
      subType,
      allowedActions,
      domainId,

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
