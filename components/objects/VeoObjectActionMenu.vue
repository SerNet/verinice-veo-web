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
      :style="speedDialStyle"
    >
      <template #activator>
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
      v-if="addEntityDialog.editedObject"
      v-model="addEntityDialog.value"
      v-bind="addEntityDialog"
      @success="onAddEntitySuccess"
      @error="onAddEntityError"
    />
    <VeoCreateEntityDialog
      v-model="createEntityDialog.value"
      :v-bind="createEntityDialog"
      @create-entity="openCreateObjectDialog($event.type, $event.addAsChild)"
    />
    <VeoCreateObjectDialog
      v-if="createObjectDialog.objectType"
      v-model="createObjectDialog.value"
      :domain-id="domainId"
      :object-type="createObjectDialog.objectType"
      :sub-type="subType"
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
import { defineComponent, useRoute, ref, computed, PropType } from '@nuxtjs/composition-api';
import { pick, upperFirst } from 'lodash';
import { useI18n } from 'nuxt-i18n-composable';
import { mdiClose, mdiLinkPlus, mdiPlus } from '@mdi/js';

import { IBaseObject, separateUUIDParam } from '~/lib/utils';
import { IVeoEntity } from '~/types/VeoTypes';
import { useVeoAlerts } from '~/composables/VeoAlert';
import { useVeoObjectUtilities } from '~/composables/VeoObjectUtilities';
import { useFetchTranslations } from '~/composables/api/translations';
import { useFetchSchemas } from '~/composables/api/schemas';

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
    },
    disabled: {
      type: Boolean,
      default: false
    },
    speedDialStyle: {
      type: String,
      default: undefined
    }
  },
  setup(props, { emit }) {
    const { t, locale } = useI18n();
    const route = useRoute();
    const { displaySuccessMessage, displayErrorMessage } = useVeoAlerts();
    const { linkObject } = useVeoObjectUtilities();

    const fetchTranslationsQueryParameters = computed(() => ({ languages: [locale.value] }));
    const { data: translations } = useFetchTranslations(fetchTranslationsQueryParameters);

    // general stuff
    const { data: schemas } = useFetchSchemas();
    const domainId = computed(() => separateUUIDParam(route.value.params.domain).id);

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
    const addEntityDialog = ref<{ editedObject: IVeoEntity | undefined; addType: 'scope' | 'entity'; value: boolean; hierarchicalContext: 'child' | 'parent' }>({
      editedObject: undefined,
      addType: 'scope' as 'scope' | 'entity',
      value: false,
      hierarchicalContext: 'child'
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
        editedObject: props.object,
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
    const subType = computed(() => (props.object?.type === 'scope' && props.type === 'childObjects' ? undefined : props.object?.domains?.[domainId.value]?.subType));

    // emit after new object creation for linking
    const onCreateObjectSuccess = async (newObjectId: string) => {
      if (props.object) {
        try {
          await linkObject(schemas.value || {}, createObjectDialog.value.hierarchicalContext as any, pick(props.object, 'id', 'type'), {
            type: createObjectDialog.value.objectType as string,
            id: newObjectId
          });
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
::v-deep .v-speed-dial__list {
  align-items: flex-end !important;
  text-align: right;
}
</style>
