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
  <div>
    <v-select
      v-if="type === 'parents'"
      v-model="parentType"
      background-color="rgb(0, 0, 0, 0.06)"
      dense
      :disabled="object.type === 'scope'"
      flat
      hide-details
      :items="parentTypeItems"
      :label="upperFirst(t('parentType').toString())"
      :menu-props="{ offsetY: true, bottom: true }"
      solo
      style="width: 150px"
    />
    <VeoObjectTable
      :additional-headers="additionalHeaders"
      :default-headers="defaultHeaders"
      :items="items"
      :loading="fetchState.pending"
      @click="openItem"
    >
      <template #actions="{item}">
        <v-tooltip
          v-for="btn in actions"
          :key="btn.id"
          bottom
        >
          <template #activator="{on}">
            <v-btn
              icon
              @click="btn.action(item)"
              v-on="on"
            >
              <v-icon v-text="btn.icon" />
            </v-btn>
          </template>
          {{ btn.label }}
        </v-tooltip>
      </template>
    </VeoObjectTable>
    <!-- dialogs -->
    <VeoUnlinkEntityDialog
      v-model="unlinkEntityDialog.value"
      v-bind="unlinkEntityDialog"
      @success="onUnlinkEntitySuccess"
      @error="onUnlinkEntityError"
    />
    <VeoCreateRiskDialogSingle
      v-model="editRiskDialog.visible"
      v-bind="editRiskDialog"
      :domain-id="domainId"
      :object-type="object && object.type"
      :object-id="object && object.id"
      @reload="fetch"
    />
  </div>
</template>
<script lang="ts">
import { defineComponent, useRoute, ref, computed, PropOptions, useContext, useFetch, useRouter, watch, useAsync } from '@nuxtjs/composition-api';
import { upperFirst } from 'lodash';
import { useI18n } from 'nuxt-i18n-composable';
import { mdiContentCopy, mdiLinkOff, mdiTrashCanOutline } from '@mdi/js';
import { createUUIDUrlParam, getEntityDetailsFromLink } from '~/lib/utils';
import { IVeoCustomLink, IVeoEntity, IVeoPaginatedResponse, IVeoRisk } from '~/types/VeoTypes';
import { useVeoAlerts } from '~/composables/VeoAlert';
import { useVeoObjectUtilities } from '~/composables/VeoObjectUtilities';

export default defineComponent({
  name: 'VeoObjectDetailsTab',
  props: {
    type: { type: String, default: '' },
    object: {
      type: Object,
      default: undefined
    } as PropOptions<IVeoEntity>,
    dense: {
      type: Boolean,
      default: false
    },
    domainId: {
      type: String,
      required: true
    }
  },
  setup(props, { emit }) {
    const { t } = useI18n();
    const route = useRoute();
    const { $api } = useContext();
    const router = useRouter();

    const { displayErrorMessage, displaySuccessMessage } = useVeoAlerts();
    const { cloneObject } = useVeoObjectUtilities();

    const items = ref<IVeoEntity[] | IVeoPaginatedResponse<IVeoEntity[]>>();

    /**
     * Stuff for fetching parents
     */
    const objectTypes = useAsync(() => $api.schema.fetchAll());
    const parentTypeItems = computed(() =>
      (objectTypes.value || [])
        .map((type) => ({ text: upperFirst(type.schemaName), value: type.schemaName }))
        .filter((item) => item.value === 'scope' || item.value === props.object?.type)
    );
    const parentType = ref(props.object?.type);

    watch(
      () => parentType.value,
      () => fetch()
    );

    /**
     * fetch sub entities or links
     * and execute fetch on mounted
     */

    const { fetchState, fetch } = useFetch(async () => {
      if (props.type === 'subEntities' && props.object) {
        items.value = await $api.entity.fetchSubEntities(props.object.type, props.object.id);
      } else if (props.type === 'parents' && props.object && parentType.value) {
        items.value = await $api.entity.fetchParents(parentType.value, props.object.id);
      } else if (props.type === 'risks' && props.object) {
        items.value = (await $api.entity.fetchRisks(props.object.type, props.object.id)) as any;
      } else {
        // create entities for table from links
        const links: Partial<IVeoEntity>[] = [];
        for (const linkName in props.object?.links) {
          (props.object?.links[linkName] as any).forEach((link: IVeoCustomLink) => {
            links.push(createEntityFromLink(link));
          });
        }
        items.value = links as any;
      }
    });

    const createEntityFromLink = (link: IVeoCustomLink) => {
      const name = link.target.displayName;
      const splitted = link.target.targetUri.split('/');
      const type = splitted[4];
      const id = splitted[5];
      return { id, name, type };
    };

    watch(
      () => props.object,
      () => fetch(),
      {
        deep: true,
        immediate: true
      }
    );

    const defaultHeaders = computed(() =>
      props.type === 'parents' || props.type === 'subEntities'
        ? ['icon', 'designator', 'abbreviation', 'name', 'status', 'description', 'updatedBy', 'updatedAt', 'actions']
        : props.type === 'links'
        ? ['icon', 'name']
        : ['designator', 'updatedAt', 'updatedBy', 'actions']
    );

    const additionalHeaders = computed(() =>
      props.type === 'risks'
        ? [
            {
              value: 'scenario.displayName',
              text: t('scenario').toString(),
              cellClass: ['font-weight-bold'],
              width: 200,
              truncate: true,
              importance: 100,
              order: 40,
              render: ({ value }: { value: string }) => {
                // The display name contains designator, abbreviation and name of the scenario, however we only want the name, so we split the string
                // As the abbreviation is optional and at this point we have no ability to check whether it is set here, we simply remove the designator and display everything else
                return value.split(' ').slice(1).join(' ');
              }
            }
          ]
        : []
    );

    /**
     * actions for cloning or unlinking objects
     */

    const actions = computed(() =>
      props.type === 'risks'
        ? [
            {
              id: 'delete',
              label: upperFirst(t('deleteRisk').toString()),
              icon: mdiTrashCanOutline,
              async action(item: IVeoRisk) {
                try {
                  const { id } = getEntityDetailsFromLink(item.scenario);
                  await $api.entity.deleteRisk(props.object?.type || '', props.object?.id || '', id);
                  displaySuccessMessage(upperFirst(t('riskDeleted').toString()));
                  fetch();
                } catch (e: any) {
                  displayErrorMessage(upperFirst(t('deleteRiskError').toString()), e.message);
                }
              }
            }
          ]
        : [
            {
              id: 'clone',
              label: upperFirst(t('cloneObject').toString()),
              icon: mdiContentCopy,
              async action(item: IVeoEntity) {
                try {
                  await cloneObject(item);
                  displaySuccessMessage(upperFirst(t('objectCloned').toString()));
                  fetch();
                } catch (e: any) {
                  displayErrorMessage(upperFirst(t('errors.clone').toString()), e.message);
                }
              }
            },
            {
              id: 'unlink',
              label: upperFirst(t('unlinkObject').toString()),
              icon: mdiLinkOff,
              action(item: IVeoEntity) {
                unlinkEntityDialog.value.item = item;
                unlinkEntityDialog.value.parent = props.object;
                unlinkEntityDialog.value.value = true;
              }
            }
          ]
    );

    /**
     * control unlink dialogs
     */

    const unlinkEntityDialog = ref({
      value: false as boolean,
      item: undefined as IVeoEntity | undefined,
      parent: undefined as IVeoEntity | undefined
    });

    const onUnlinkEntitySuccess = () => {
      unlinkEntityDialog.value.value = false;
      displaySuccessMessage(upperFirst(t('objectUnlinked').toString()));
      emit('new-object-created'); // emit to page for refetching object
      fetch();
    };

    const onUnlinkEntityError = (error: any) => {
      unlinkEntityDialog.value.value = false;
      displayErrorMessage(upperFirst(t('errors.unlink').toString()), error?.toString());
    };

    /**
     * risks edit dialog
     */
    const editRiskDialog = ref<{ visible: boolean; scenarioId?: string }>({
      visible: false,
      scenarioId: undefined
    });

    // push to object detail site (on click in table)
    const openItem = ({ item }: { item: IVeoEntity | IVeoRisk }) => {
      if (props.type === 'risks') {
        item = item as IVeoRisk;
        editRiskDialog.value.scenarioId = getEntityDetailsFromLink(item.scenario).id;
        editRiskDialog.value.visible = true;
      } else {
        item = item as IVeoEntity;
        router.push({
          name: 'unit-domains-domain-objects-entity',
          params: {
            ...route.value.params,
            entity: createUUIDUrlParam(item.type, item.id)
          }
        });
      }
    };

    return {
      additionalHeaders,
      defaultHeaders,
      editRiskDialog,
      onUnlinkEntitySuccess,
      onUnlinkEntityError,
      unlinkEntityDialog,
      fetchState,
      openItem,
      actions,
      fetch,
      items,
      parentType,
      parentTypeItems,

      t,
      upperFirst
    };
  }
});
</script>

<i18n>
{
  "en": {
    "cloneObject": "clone object",
    "deleteRisk": "delete risk",
    "unlinkObject": "unlink object",
    "objectCloned": "Object successfully cloned.",
    "objectUnlinked": "Object successfully unlinked.",
    "errors": {
      "clone": "Could not clone object.",
      "unlink": "Could not unlink object.",
      "link": "Could not link new object.",
      "risk": "Couldn't delete risk"
    },
    "parentType": "parent type",
    "riskDeleted": "The risk was removed",
    "scenario": "Scenario"

  },
  "de": {
    "cloneObject": "Objekt duplizieren",
    "deleteRisk": "Risiko löschen",
    "unlinkObject": "Verknüpfung entfernen",
    "objectCloned": "Das Objekt wurde erfolgreich dupliziert.",
    "objectUnlinked": "Die Verknüpfung wurde erfolgreich entfernt.",
    "errors": {
      "clone": "Das Objekt konnte nicht dupliziert werden.",
      "unlink": "Die Verknüpfung konnte nicht entfernt werden.",
      "link": "Das neue Objekt konnte nicht verknüpft werden.",
      "risk": "Risiko konnte nicht gelöscht werden"
    },
    "parentType": "Elterntyp",
    "riskDeleted": "Das Risiko wurde entfernt",
    "scenario": "Szenario"
  }
}
</i18n>