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
  <v-container>
    <v-row>
      <v-col>
        <VeoObjectTable
          :items="items"
          :loading="fetchState.pending"
          :dense="dense"
          :simple="type==='links'"
          :risk="type==='risks'"
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
      </v-col>
    </v-row>
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
    />
  </v-container>
</template>
<script lang="ts">
import { defineComponent, useRoute, ref, computed, PropOptions, useContext, useFetch, useRouter, watch } from '@nuxtjs/composition-api';
import { upperFirst } from 'lodash';
import { useI18n } from 'nuxt-i18n-composable';
import { mdiContentCopy, mdiLinkOff, mdiTrashCan } from '@mdi/js';
import { createUUIDUrlParam, getEntityDetailsFromLink } from '~/lib/utils';
import { IVeoCustomLink, IVeoEntity, IVeoRisk } from '~/types/VeoTypes';
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

    const items = ref<IVeoEntity[]>();

    /**
     * fetch sub entities or links
     * and execute fetch on mounted
     */

    const { fetchState, fetch } = useFetch(async () => {
      if (props.type === 'subEntities' && props.object) {
        items.value = await $api.entity.fetchSubEntities(props.object.type, props.object.id);
      } else if (props.type === 'risks' && props.object) {
        items.value = await $api.entity.fetchRisks(props.object.type, props.object.id);
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

    /**
     * actions for cloning or unlinking objects
     */

    const actions = computed(() =>
      props.type === 'risks'
        ? [
            {
              id: 'delete',
              label: upperFirst(t('deleteRisk').toString()),
              icon: mdiTrashCan,
              async action(item: IVeoRisk) {
                try {
                  const { id } = getEntityDetailsFromLink(item.scenario);
                  await $api.entity.deleteRisk(props.object?.type || '', props.object?.id || '', id);
                  displaySuccessMessage(upperFirst(t('riskDeleted').toString()));
                  fetch();
                } catch (error: any) {
                  displayErrorMessage(upperFirst(t('deleteRiskError').toString()), error?.toString());
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
                } catch (error: any) {
                  displayErrorMessage(upperFirst(t('errors.clone').toString()), error?.toString());
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
    const editRiskDialog = ref<{ visible: boolean; risk?: IVeoEntity }>({
      visible: false,
      risk: undefined
    });

    // push to object detail site (on click in table)
    const openItem = ({ item }: { item: IVeoEntity }) => {
      if (props.type === 'risks') {
        editRiskDialog.value.risk = item;
        editRiskDialog.value.visible = true;
      } else {
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
      editRiskDialog,
      onUnlinkEntitySuccess,
      onUnlinkEntityError,
      unlinkEntityDialog,
      fetchState,
      openItem,
      actions,
      fetch,
      items,

      t
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
    "riskDeleted": "The risk was removed"

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
    "riskDeleted": "Das Risiko wurde entfernt"
  }
}
</i18n>