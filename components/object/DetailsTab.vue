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
    <ObjectTable
      :additional-headers="additionalHeaders"
      :default-headers="defaultHeaders"
      :items="items"
      :loading="tableIsLoading"
      @click="openItem"
    >
      <template #actions="{item}">
        <v-tooltip
          v-for="btn in actions"
          :key="btn.id"
          location="bottom"
        >
          <template #activator="{ props }">
            <v-btn
              v-bind="props"
              icon
              :disabled="ability.cannot('manage', 'objects')"
              @click="btn.action(item)"
            >
              <v-icon :icon="btn.icon" />
            </v-btn>
          </template>
          {{ btn.label }}
        </v-tooltip>
      </template>
    </ObjectTable>
    <!-- dialogs -->
    <ObjectUnlinkDialog
      v-model="unlinkEntityDialog.value"
      v-bind="unlinkEntityDialog"
      @success="onUnlinkEntitySuccess"
      @error="onUnlinkEntityError"
    />
    <RiskCreateDialogSingle
      v-model="editRiskDialog.visible"
      v-bind="editRiskDialog"
      :domain-id="domainId"
      :object-type="object && object.type"
      :object-id="object && object.id"
    />
  </div>
</template>
<script lang="ts">
import { PropType } from 'vue';
import { upperFirst } from 'lodash';
import { mdiArrowDown, mdiArrowRight, mdiCheck, mdiContentCopy, mdiLinkOff, mdiTransitDetour, mdiTrashCanOutline } from '@mdi/js';
import { VIcon, VTooltip } from 'vuetify/components';

import { ObjectTableHeader } from './Table.vue';
import { createUUIDUrlParam, getEntityDetailsFromLink, separateUUIDParam } from '~/lib/utils';
import { IVeoCustomLink, IVeoEntity, IVeoPaginatedResponse, IVeoRisk } from '~/types/VeoTypes';
import { useVeoAlerts } from '~/composables/VeoAlert';
import { useCloneObject, useLinkObject } from '~/composables/VeoObjectUtilities';
import { useVeoPermissions } from '~/composables/VeoPermissions';
import { useFetchSchemas } from '~/composables/api/schemas';
import { useDeleteRisk, useFetchChildObjects, useFetchChildScopes, useFetchParentObjects, useFetchRisks } from '~/composables/api/objects';
import { useFetchDomain } from '~/composables/api/domains';

export default defineComponent({
  props: {
    type: { type: String, default: '' },
    object: {
      type: Object as PropType<IVeoEntity>,
      default: undefined
    },
    dense: {
      type: Boolean,
      default: false
    },
    domainId: {
      type: String,
      required: true
    }
  },
  emits: ['reload'],
  setup(props, { emit }) {
    const { t, locale } = useI18n();
    const route = useRoute();
    const { $api } = useNuxtApp();
    const router = useRouter();
    const { ability } = useVeoPermissions();

    const { displayErrorMessage, displaySuccessMessage } = useVeoAlerts();
    const { link } = useLinkObject();
    const { clone } = useCloneObject();

    const unitId = computed(() => separateUUIDParam(route.params.unit as string).id);

    // Fetching different queries for the table
    const { data: schemas } = useFetchSchemas();
    const parentScopesQueryParameters = computed(() => ({ parentEndpoint: 'scopes', childObjectId: props.object?.id || '', unitId: unitId.value }));
    const parentScopesQueryEnabled = computed(() => props.type !== 'risks' && !!props.object?.id);
    const { data: parentScopes, isFetching: parentScopesIsFetching } = useFetchParentObjects(parentScopesQueryParameters, { enabled: parentScopesQueryEnabled }); // Used by table and cloning objects
    const parentObjectsQueryParameters = computed(() => ({
      parentEndpoint: schemas.value?.[props.object?.type || ''] || '',
      childObjectId: props.object?.id || '',
      unitId: unitId.value
    }));
    const parentObjectsQueryEnabled = computed(() => props.type === 'parentObjects' && !!props.object?.id);
    const { data: parentObjects, isFetching: parentObjectsIsFetching } = useFetchParentObjects(parentObjectsQueryParameters, { enabled: parentObjectsQueryEnabled });
    const childScopesQueryParameters = computed(() => ({ id: props.object?.id || '' }));
    const childScopesQueryEnabled = computed(() => props.type === 'childScopes' && !!props.object?.id);
    const { data: childScopes, isFetching: childScopesIsFetching } = useFetchChildScopes(childScopesQueryParameters, { enabled: childScopesQueryEnabled });
    const childObjectsQueryParameters = computed(() => ({ id: props.object?.id || '', endpoint: schemas.value?.[props.object?.type || ''] || '' }));
    const childObjectsQueryEnabled = computed(() => props.type === 'childObjects' && !!props.object?.id);
    const { data: childObjects, isFetching: childObjectsIsFetching } = useFetchChildObjects(childObjectsQueryParameters, { enabled: childObjectsQueryEnabled });
    const risksQueryParameters = computed(() => ({ id: props.object?.id || '', endpoint: schemas.value?.[props.object?.type || ''] || '' }));
    const risksQueryEnabled = computed(() => props.type === 'risks' && !!props.object?.id);
    const { data: risks, isFetching: risksIsFetching } = useFetchRisks(risksQueryParameters, { enabled: risksQueryEnabled });

    const tableIsLoading = computed(
      () => parentScopesIsFetching.value || parentObjectsIsFetching.value || childScopesIsFetching.value || childObjectsIsFetching.value || risksIsFetching.value
    );

    const items = computed<IVeoEntity[] | IVeoPaginatedResponse<IVeoEntity[]>>(() => {
      switch (props.type) {
        case 'childScopes':
          return childScopes.value || [];
        case 'childObjects':
          return childObjects.value || [];
        case 'parentScopes':
          return parentScopes.value || [];
        case 'parentObjects':
          return parentObjects.value || [];
        case 'risks':
          return risks.value || [];
        case 'links':
        default:
          return Object.values(props.object?.links || {}).reduce((linkArray: { id: string; name?: string; type: string }[], links: IVeoCustomLink[]) => {
            for (const link of links) {
              linkArray.push(createEntityFromLink(link));
            }
            return linkArray;
          }, []) as any[];
      }
    });

    // Crud stuff
    const { mutateAsync: deleteRisk } = useDeleteRisk();

    const createEntityFromLink = (link: IVeoCustomLink) => {
      const name = link.target.displayName;
      const splitted = link.target.targetUri.split('/');
      const type = Object.entries(schemas.value || {}).find(([_key, value]) => value === splitted[4])?.[0] || splitted[4];
      const id = splitted[5];
      return { id, name, type };
    };

    const defaultHeaders = computed(() =>
      props.type !== 'risks' && props.type !== 'links'
        ? ['icon', 'designator', 'abbreviation', 'name', 'status', 'description', 'updatedBy', 'updatedAt', 'actions']
        : props.type === 'links'
          ? ['icon', 'name']
          : ['designator', 'updatedAt', 'updatedBy', 'actions']
    );

    const additionalHeaders = computed<ObjectTableHeader[]>(() =>
      props.type === 'risks'
        ? [
          {
            value: 'scenario.displayName',
            text: t('scenario').toString(),
            cellClass: ['font-weight-bold'],
            width: 200,
            truncate: true,
            priority: 100,
            order: 40,
            render: ({ value }: { value: string }) => {
              // The display name contains designator, abbreviation and name of the scenario, however we only want the name, so we split the string
              // As the abbreviation is optional and at this point we have no ability to check whether it is set here, we simply remove the designator and display everything else
              return value.split(' ').slice(1).join(' ');
            }
          },
          ...['C', 'I', 'A', 'R'].map((categoryId, index) => ({
            value: `riskValues_${categoryId}`,
            text: domainData.value?.categories?.find((category) => category.id === categoryId)?.translations[locale.value].name || '',
            render: ({ item }: { item: any }) => {
              const { inherentRisk, residualRisk } = getInherentAndResidualRisk(item, categoryId);
              const riskTreatments = getRiskTreatments(item, categoryId);
              const values = domainData.value?.riskValues;

              const translatedInherentRisk = values?.find((entry) => entry.ordinalValue === inherentRisk)?.translations[locale.value].name;
              const translatedResidualRisk = values?.find((entry) => entry.ordinalValue === residualRisk)?.translations[locale.value].name;

              return h('div', [
                translatedInherentRisk
                  ? h(VTooltip, {
                    location: 'bottom',
                    maxWidth: 600
                  }, {
                    activator: ({ attrs, on }) => h('span', { attrs, on, class: 'text-grey text--darken-4' }, translatedInherentRisk),
                    default: () => h('span', t('inherentRisk').toString()) })
                  : undefined,
                translatedInherentRisk && translatedResidualRisk ? h('span', ' / ') : undefined,
                translatedResidualRisk
                  ? h(VTooltip, {
                    location: 'bottom',
                    maxWidth: 600
                  }, {
                    activator: ({ attrs, on }) => h('span', { attrs, on, class: 'pr-1' }, translatedResidualRisk),
                    default: () => h('span', t('residualRisk').toString())
                  })
                  : undefined,
                riskTreatments.map((riskTreatment) => {
                  let icon = mdiCheck;
                  switch (riskTreatment) {
                    case 'RISK_TREATMENT_AVOIDANCE':
                      icon = mdiTransitDetour;
                      break;
                    case 'RISK_TREATMENT_REDUCTION':
                      icon = mdiArrowDown;
                      break;
                    case 'RISK_TREATMENT_TRANSFER':
                      icon = mdiArrowRight;
                      break;
                  }

                  return h(VTooltip, {
                    location: 'bottom',
                    maxWidth: 600
                  }, {
                    activator: ({ attrs, on }) => h(VIcon, { attrs, on, props: { small: true } }, icon),
                    default: () => h('span', t(`riskTreatments.${riskTreatment}`).toString())
                  });
                })
              ]);
            },
            priority: 89 - index,
            order: 41 + index,
            width: 100
          }))
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
                await deleteRisk({ objectId: props.object?.id, endpoint: schemas.value?.[props.object?.type || ''] || '', scenarioId: id });
                displaySuccessMessage(upperFirst(t('riskDeleted').toString()));
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
                const clonedObjectId = (
                  await clone(
                    item,
                    (parentScopes.value?.items || []).map((item) => item.id)
                  )
                ).resourceId;
                const clonedObject = await $api.entity.fetch(schemas.value?.[item.type] || '', clonedObjectId);
                if (props.object) {
                  if (['childScopes', 'childObjects'].includes(props.type)) {
                    await link(props.object, clonedObject);
                  } else {
                    await link(clonedObject, props.object);
                  }
                }
                displaySuccessMessage(upperFirst(t('objectCloned').toString()));
              } catch (e: any) {
                displayErrorMessage(upperFirst(t('errors.clone').toString()), e.message);
              }
            }
          },
          {
            id: 'unlink',
            label: upperFirst(t(props.object?.type === 'scope' || props.type === 'parentScopes' ? 'removeFromScope' : 'removeFromObject').toString()),
            icon: mdiLinkOff,
            action: async (item: IVeoEntity) => {
              const parent = await $api.entity.fetch(schemas.value?.[item.type] || '', item.id);
              if (['parentScopes', 'parentObjects'].includes(props.type)) {
                unlinkEntityDialog.value.objectToRemove = props.object;
                unlinkEntityDialog.value.parent = parent;
              } else {
                unlinkEntityDialog.value.objectToRemove = parent;
                unlinkEntityDialog.value.parent = props.object;
              }

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
      objectToRemove: undefined as IVeoEntity | undefined,
      parent: undefined as IVeoEntity | undefined
    });

    const onUnlinkEntitySuccess = () => {
      unlinkEntityDialog.value.value = false;
      displaySuccessMessage(
        upperFirst(
          t(
            props.type === 'parentScopes' && props.object?.type === 'scope'
              ? 'removeScopeFromScopeSuccess'
              : props.type === 'parentScopes'
                ? 'removeObjectFromScopeSuccess'
                : 'removeObjectFromObjectSuccess'
          ).toString()
        )
      );
      onRelatedObjectModified();
    };

    const onUnlinkEntityError = (error: any) => {
      unlinkEntityDialog.value.value = false;
      displayErrorMessage(
        upperFirst(
          t(
            props.type === 'parentScopes' && props.object?.type === 'scope'
              ? 'removeScopeFromScopeError'
              : props.type === 'parentScopes'
                ? 'removeObjectFromScopeError'
                : 'removeObjectFromObjectError'
          ).toString()
        ),
        error?.toString()
      );
    };

    // Edit risk dialog stuff
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
          name: 'unit-domains-domain-objects-object',
          params: {
            ...route.params,
            object: createUUIDUrlParam(item.type, item.id)
          }
        });
      }
    };

    // Risk tab related stuff
    const fetchDomainQueryParameters = computed(() => ({ id: props.domainId }));
    const { data: domain } = useFetchDomain(fetchDomainQueryParameters);
    const domainData = computed(() => domain.value?.riskDefinitions?.DSRA);

    const getInherentAndResidualRisk = (item: IVeoRisk, protectionGoal: string) => {
      const category = item.domains?.[props.domainId]?.riskDefinitions?.DSRA?.riskValues?.find((category: any) => category.category === protectionGoal);

      return {
        inherentRisk: category?.inherentRisk,
        residualRisk: category?.userDefinedResidualRisk || category?.residualRisk
      };
    };

    const getRiskTreatments = (item: IVeoRisk, protectionGoal: string) =>
      item.domains?.[props.domainId]?.riskDefinitions?.DSRA?.riskValues?.find((category: any) => category.category === protectionGoal)?.riskTreatments || [];

    const onRelatedObjectModified = () => {
      emit('reload');
    };

    return {
      ability,
      additionalHeaders,
      defaultHeaders,
      editRiskDialog,
      onUnlinkEntitySuccess,
      onUnlinkEntityError,
      unlinkEntityDialog,
      openItem,
      tableIsLoading,
      actions,
      items,

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
    "objectCloned": "Object successfully cloned.",
    "errors": {
      "clone": "Could not clone object.",
      "link": "Could not link new object.",
      "risk": "Couldn't delete risk"
    },
    "inherentRisk": "Inherent risk",
    "parentType": "parent type",
    "removeFromObject": "Remove from object",
    "removeFromScope": "Remove from scope",
    "removeObjectFromObjectError": "Couldn't remove object",
    "removeObjectFromObjectSuccess": "Object was removed successfully",
    "removeObjectFromScopeError": "Couldn't remove object from scope",
    "removeObjectFromScopeSuccess": "Object was removed from scope",
    "removeScopeFromScopeError": "Couldn't remove scope",
    "removeScopeFromScopeSuccess": "Scope was removed successfully",
    "residualRisk": "Residual risk",
    "riskDeleted": "The risk was removed",
    "riskTreatments": {
      "RISK_TREATMENT_ACCEPTANCE": "risk retention",
      "RISK_TREATMENT_AVOIDANCE": "risk avoidance",
      "RISK_TREATMENT_REDUCTION": "risk reduction",
      "RISK_TREATMENT_TRANSFER": "risk transfer"
    },
    "scenario": "Scenario"

  },
  "de": {
    "cloneObject": "Objekt duplizieren",
    "deleteRisk": "Risiko löschen",
    "objectCloned": "Das Objekt wurde erfolgreich dupliziert.",
    "errors": {
      "clone": "Das Objekt konnte nicht dupliziert werden.",
      "link": "Das neue Objekt konnte nicht verknüpft werden.",
      "risk": "Risiko konnte nicht gelöscht werden"
    },
    "inherentRisk": "Bruttorisiko",
    "parentType": "Elterntyp",
    "removeFromObject": "Aus Objekt entfernen",
    "removeFromScope": "Aus Scope entfernen",
    "removeObjectFromObjectError": "Objekt konnte nicht entfernt werden",
    "removeObjectFromObjectSuccess": "Objekt wurde entfernt",
    "removeObjectFromScopeError": "Objekt konnte nicht aus Scope entfernt werden",
    "removeObjectFromScopeSuccess": "Objekt wurde aus Scope entfernt",
    "removeScopeFromScopeError": "Scope konnte nicht entfernt werden",
    "removeScopeFromScopeSuccess": "Scope wurde entfernt",
    "residualRisk": "Nettorisiko",
    "riskDeleted": "Das Risiko wurde entfernt",
    "riskTreatments": {
      "RISK_TREATMENT_ACCEPTANCE": "Risikoakzeptanz",
      "RISK_TREATMENT_AVOIDANCE": "Risikovermeidung",
      "RISK_TREATMENT_REDUCTION": "Risikoreduktion",
      "RISK_TREATMENT_TRANSFER": "Risikotransfer"
    },
    "scenario": "Szenario"
  }
}
</i18n>
