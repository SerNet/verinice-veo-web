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
      v-model:page="page"
      v-model:sort-by="sortBy"
      :additional-headers="additionalHeaders"
      :default-headers="defaultHeaders"
      :items="items"
      :loading="tableIsLoading"
      enable-click
      @click="openItem"
    >
      <template #actions="{ item }">
        <div class="d-flex justify-end">
          <v-tooltip v-for="btn in actions" :key="btn.id" location="bottom">
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                :icon="btn.icon"
                size="small"
                variant="flat"
                :disabled="ability.cannot('manage', 'objects')"
                @click="btn.action(item)"
              />
            </template>
            {{ btn.label }}
          </v-tooltip>
        </div>
      </template>
    </ObjectTable>
    <!-- dialogs -->
    <UtilConfirmationDialog
      v-model="confirmationDialogVisible"
      :text="t('deleteDialogText', { name: controlNameToUnlink })"
      :title="t('deleteDialogTitle')"
      :confirmation-text="globalT('global.button.delete')"
      :callback="confirmationDialogCallBack"
      @success="displaySuccessMessage(t('controlDeleted'))"
      @error="displayErrorMessage(t('errors.control'), JSON.stringify($event))"
    />
    <ObjectUnlinkDialog
      v-model="unlinkEntityDialog.value"
      v-bind="unlinkEntityDialog"
      @success="onUnlinkEntitySuccess"
      @error="onUnlinkEntityError"
    />
    <RiskCreateDialogSingle
      v-if="object"
      v-model="editRiskDialog.visible"
      v-bind="editRiskDialog"
      :domain-id="domainId"
      :object-type="object.type"
      :object-id="object.id"
    />
    <ControlsEditDialog
      :control-index="index"
      :object="object"
      :show-dialog="controlsEditDialogVisible"
      @update:model-value="controlsEditDialogVisible = false"
    />
  </div>
</template>

<script lang="ts">
import { PropType } from 'vue';
import { cloneDeep, upperFirst } from 'lodash';
import {
  mdiArrowDown,
  mdiArrowRight,
  mdiCheck,
  mdiContentCopy,
  mdiLinkOff,
  mdiPencil,
  mdiTransitDetour,
  mdiTrashCanOutline
} from '@mdi/js';
import { VIcon, VTooltip } from 'vuetify/components';

import { TableHeader } from '~/components/base/Table.vue';
import { ROUTE_NAME as OBJECT_DETAIL_ROUTE } from '~/pages/[unit]/domains/[domain]/[objectType]/[subType]/[object].vue';
import { getEntityDetailsFromLink } from '~/lib/utils';
import {
  IVeoCustomLink,
  IVeoEntity,
  IVeoPaginatedResponse,
  IVeoRisk,
  IVeoRiskCategory,
  IVeoRiskDefinition,
  IVeoRiskValue,
  VeoRiskTreatment
} from '~/types/VeoTypes';
import { useVeoAlerts } from '~/composables/VeoAlert';
import { useCloneObject, useLinkObject } from '~/composables/VeoObjectUtilities';
import { useVeoPermissions } from '~/composables/VeoPermissions';
import schemaQueryDefinitions from '~/composables/api/queryDefinitions/schemas';
import objectQueryDefinitions, {
  IVeoFetchRisksParameters,
  IVeoFetchScopeChildrenParameters
} from '~/composables/api/queryDefinitions/objects';
import { useFetchParentObjects } from '~/composables/api/objects';
import domainQueryDefinitions from '~/composables/api/queryDefinitions/domains';
import translationQueryDefinitions from '~/composables/api/queryDefinitions/translations';
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
    const { t: globalT } = useI18n({ useScope: 'global' });
    const route = useRoute();
    const router = useRouter();
    const { ability } = useVeoPermissions();
    const { tablePageSize } = useVeoUser();

    const { displayErrorMessage, displaySuccessMessage } = useVeoAlerts();
    const { link } = useLinkObject();
    const { clone } = useCloneObject();
    const queryClient = useQueryClient();

    // Fetching different queries for the table
    const page = ref(1);
    const sortBy = ref([{ key: 'name', order: 'asc' }]);
    const resetQueryOptions = () => {
      page.value = 1;
      sortBy.value = [{ key: 'name', order: 'asc' }];
    };
    watch(() => props.type, resetQueryOptions);

    const fetchTranslationsQueryParameters = computed(() => ({
      languages: [locale.value],
      domain: props.domainId
    }));
    const { data: translations } = useQuery(
      translationQueryDefinitions.queries.fetch,
      fetchTranslationsQueryParameters
    );

    const { data: schemas } = useQuery(schemaQueryDefinitions.queries.fetchSchemas);
    const parentScopesQueryParameters = computed(() => ({
      parentEndpoint: 'scopes',
      childObjectId: props.object?.id || '',
      unitId: route.params.unit as string,
      sortBy: sortBy.value[0]?.key,
      sortOrder: sortBy.value[0]?.order as 'asc' | 'desc',
      page: page.value
    }));
    const parentScopesQueryEnabled = computed(() => props.type !== 'risks' && !!props.object?.id);
    const { data: parentScopes, isFetching: parentScopesIsFetching } = useFetchParentObjects(
      parentScopesQueryParameters,
      {
        enabled: parentScopesQueryEnabled
      }
    ); // Used by table and cloning objects
    const parentObjectsQueryParameters = computed(() => ({
      parentEndpoint: schemas.value?.[props.object?.type || ''] || '',
      childObjectId: props.object?.id || '',
      unitId: route.params.unit as string,
      sortBy: sortBy.value[0]?.key,
      sortOrder: sortBy.value[0]?.order as 'asc' | 'desc',
      page: page.value
    }));
    const parentObjectsQueryEnabled = computed(() => props.type === 'parentObjects' && !!props.object?.id);
    const { data: parentObjects, isFetching: parentObjectsIsFetching } = useFetchParentObjects(
      parentObjectsQueryParameters,
      {
        enabled: parentObjectsQueryEnabled
      }
    );

    const tableSize = computed(() => (tablePageSize?.value === -1 ? 1000 : tablePageSize.value));

    const childScopesQueryParameters = computed<IVeoFetchScopeChildrenParameters>(() => ({
      id: props.object?.id || '',
      domain: (route.params.domain as string) || '',
      elementType:
        props.type === 'childObjects' ?
          ['asset', 'person', 'incident', 'process', 'document', 'scenario', 'control']
        : ['scope'],
      sortBy: sortBy.value[0]?.key,
      sortOrder: sortBy.value[0]?.order as 'asc' | 'desc',
      page: page.value,
      size: tableSize.value
    }));

    const childScopesQueryEnabled = computed(
      () => props.type.startsWith('child') && props.object?.type === 'scope' && !!props.object?.id
    );
    const { data: scopeChildren, isFetching: childScopesIsFetching } = useQuery(
      objectQueryDefinitions.queries.fetchScopeChildren,
      childScopesQueryParameters,
      { enabled: childScopesQueryEnabled }
    );

    const childObjectsQueryParameters = computed(() => ({
      id: props.object?.id || '',
      endpoint: schemas.value?.[props.object?.type || ''] || '',
      domain: (route.params.domain as string) || '',
      elementType:
        props.type === 'childObjects' ?
          ['asset', 'person', 'incident', 'process', 'document', 'scenario', 'control']
        : ['scope'],
      sortBy: sortBy.value[0]?.key,
      sortOrder: sortBy.value[0]?.order as 'asc' | 'desc',
      page: page.value,
      size: tableSize.value
    }));
    const childObjectsQueryEnabled = computed(
      () => props.type.startsWith('child') && props.object?.type !== 'scope' && !!props.object?.id
    );
    const { data: objectChildren, isFetching: childObjectsIsFetching } = useQuery(
      objectQueryDefinitions.queries.fetchObjectChildren,
      childObjectsQueryParameters,
      { enabled: childObjectsQueryEnabled }
    );
    const risksQueryParameters = computed<IVeoFetchRisksParameters>(() => ({
      id: props.object?.id || '',
      endpoint: schemas.value?.[props.object?.type || ''] || ''
    }));
    const risksQueryEnabled = computed(() => props.type === 'risks' && !!props.object?.id);
    const { data: risks, isFetching: risksIsFetching } = useQuery(
      objectQueryDefinitions.queries.fetchRisks,
      risksQueryParameters,
      { enabled: risksQueryEnabled }
    );

    const children = computed(() => (props.object?.type === 'scope' ? scopeChildren.value : objectChildren.value));

    const tableIsLoading = computed(
      () =>
        parentScopesIsFetching.value ||
        parentObjectsIsFetching.value ||
        childScopesIsFetching.value ||
        childObjectsIsFetching.value ||
        risksIsFetching.value ||
        domainIsFetching.value
    );

    const createEntityFromLink = (link: IVeoCustomLink) => {
      const name = link.target.displayName;
      const splitted = link.target.targetUri.split('/');
      const type =
        Object.entries(schemas.value || {}).find(([_key, value]) => value === splitted[4])?.[0] || splitted[4];
      const id = splitted[5];
      return { id, name, type };
    };

    const items = computed<IVeoEntity[] | IVeoPaginatedResponse<IVeoEntity[]>>(() => {
      switch (props.type) {
        case 'childScopes':
        case 'childObjects':
          return children.value;
        case 'parentScopes':
          return cloneDeep(parentScopes.value || []);
        case 'parentObjects':
          return parentObjects.value || [];
        case 'risks':
          return risks.value || [];
        case 'controls':
          return (props.object?.controlImplementations || []).map((control) => {
            const details = getEntityDetailsFromLink(control.control);
            return {
              ...control,
              type: details.type,
              name: details.name,
              id: details.id
            };
          });
        case 'links':
        default:
          return Object.entries(props.object?.links || {}).reduce(
            (
              linkArray: {
                id: string;
                name?: string;
                type: string;
                linkId: string;
              }[],
              [linkId, links]: [string, IVeoCustomLink[]]
            ) => {
              for (const link of links) {
                linkArray.push({ ...createEntityFromLink(link), linkId });
              }
              return linkArray;
            },
            []
          ) as any[];
      }
    });

    const defaultHeaders = computed(() =>
      props.type !== 'risks' && props.type !== 'links' && props.type !== 'controls' ?
        ['icon', 'designator', 'abbreviation', 'name', 'status', 'description', 'updatedAt', 'updatedBy', 'actions']
      : props.type === 'links' ? ['icon', 'name']
      : props.type === 'controls' ? ['icon', 'actions']
      : ['designator', 'updatedAt', 'updatedBy', 'actions']
    );

    const additionalHeaders = computed<TableHeader[]>(() => {
      if (!riskDefinitionCategories.value || !riskDefinitionId.value) return [];
      return (
        props.type === 'risks' ?
          [
            {
              value: 'scenario.abbreviation',
              key: 'scenario.abbreviation',
              text: t('controls.abbreviation').toString(),
              width: 50,
              truncate: false,
              priority: 100,
              order: 30,
              render: (data: any) => data.internalItem.raw.scenario?.abbreviation || ''
            },
            {
              value: 'scenario.displayName',
              key: 'scenario.displayName',
              text: t('scenario').toString(),
              cellClass: ['font-weight-bold'],
              width: 200,
              truncate: true,
              priority: 100,
              order: 40,
              render: (data: any) => {
                // The display name contains designator, abbreviation and name of the scenario, however we only want the name, so we split the string
                // As the abbreviation is optional, we check for it and slice accordingly
                const sliceIndex = data.internalItem.raw?.scenario?.abbreviation ? 2 : 1;
                return data.internalItem.raw.scenario.displayName.split(' ').slice(sliceIndex).join(' ');
              }
            },
            ...riskDefinitionCategories.value.map((categoryId: string, index: number) => ({
              value: `riskValues_${categoryId}`,
              key: `riskValues_${categoryId}`,
              text:
                riskDefinition.value?.categories?.find((category: IVeoRiskCategory) => category.id === categoryId)
                  ?.translations[locale.value].name || '',
              sortable: false, // TODO 2023-02-27: Currently disabled, as sort is not working at the moment (vuetify 3.1.6)
              sort: (a: any, b: any) => {
                const values = riskDefinition.value?.riskValues;

                const { inherentRisk: inherentRisk1 } = getInherentAndResidualRisk(a, categoryId);
                const translatedInherentRisk1 = values?.find((entry) => entry.ordinalValue === inherentRisk1)
                  ?.translations[locale.value].name;

                const { inherentRisk: inherentRisk2 } = getInherentAndResidualRisk(b, categoryId);
                const translatedInherentRisk2 = values?.find((entry) => entry.ordinalValue === inherentRisk2)
                  ?.translations[locale.value].name;

                return (translatedInherentRisk1 || '').localeCompare(translatedInherentRisk2 || '');
              },
              render: (data: any) => {
                const { inherentRisk, residualRisk } = getInherentAndResidualRisk(data.internalItem.raw, categoryId);
                const riskTreatments = getRiskTreatments(data.item, categoryId);
                const values = riskDefinition.value?.riskValues;

                const translatedInherentRisk = values?.find((entry) => entry.ordinalValue === inherentRisk)
                  ?.translations[locale.value].name;
                const translatedResidualRisk = values?.find((entry) => entry.ordinalValue === residualRisk)
                  ?.translations[locale.value].name;

                return h('div', [
                  translatedInherentRisk ?
                    h(
                      VTooltip,
                      {
                        location: 'bottom',
                        maxWidth: 600
                      },
                      {
                        activator: ({ attrs, props }: any) =>
                          h(
                            'span',
                            {
                              ...attrs,
                              ...props,
                              class: 'text-grey text--darken-4'
                            },
                            translatedInherentRisk
                          ),
                        default: () => h('span', t('inherentRisk').toString())
                      }
                    )
                  : undefined,
                  translatedInherentRisk && translatedResidualRisk ? h('span', ' / ') : undefined,
                  translatedResidualRisk ?
                    h(
                      VTooltip,
                      {
                        location: 'bottom',
                        maxWidth: 600
                      },
                      {
                        activator: ({ attrs, props }: any) =>
                          h('span', { ...attrs, ...props, class: 'pr-1' }, translatedResidualRisk),
                        default: () => h('span', t('residualRisk').toString())
                      }
                    )
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

                    return h(
                      VTooltip,
                      {
                        location: 'bottom',
                        maxWidth: 600
                      },
                      {
                        activator: ({ attrs, props }: any) =>
                          h(VIcon, {
                            ...attrs,
                            ...props,
                            size: 'small',
                            icon
                          }),
                        default: () => h('span', t(`riskTreatments.${riskTreatment}`).toString())
                      }
                    );
                  })
                ]);
              },
              priority: 89 - index,
              order: 41 + index,
              width: 150
            }))
          ]
        : props.type === 'links' ?
          [
            {
              value: 'abbreviation',
              key: 'abbreviation',
              text: t('controls.abbreviation'),
              width: 50,
              truncate: false,
              priority: 100,
              order: 20,
              render: (data: any) => h('span', data.internalItem.raw?.abbreviation || '')
            },
            {
              value: 'linkId',
              key: 'linkId',
              order: 30,
              priority: 60,
              text: t('linkName'),
              width: 150,
              render: (data: any) =>
                h(
                  'span',
                  translations.value?.lang?.[locale.value]?.[data.internalItem.raw.linkId] ||
                    data.internalItem.raw.linkId
                )
            }
          ]
        : props.type === 'controls' ?
          [
            {
              value: 'abbreviation',
              key: 'abbreviation',
              text: t('controls.abbreviation'),
              width: 50,
              truncate: false,
              priority: 100,
              order: 20,
              render: (data: any) => h('span', data.internalItem.raw.control?.abbreviation || '')
            },
            {
              value: 'name',
              key: 'name',
              text: 'Name',
              width: 200,
              truncate: true,
              priority: 100,
              order: 30,
              render: (data: any) => h('span', data.internalItem.raw.control?.name || '')
            },
            {
              value: 'description',
              key: 'description',
              text: t('controls.description'),
              width: 200,
              truncate: false,
              priority: 20,
              order: 35,
              render: (data: any) => h('span', data.internalItem.raw.description || '')
            },
            {
              value: 'responsibility',
              key: 'responsibility',
              text: t('controls.responsible'),
              width: 100,
              truncate: false,
              priority: 50,
              order: 50,
              render: (data) =>
                h('span', { class: 'text-truncate d-inline-block' }, data.internalItem.raw.responsible?.name || '')
            }
          ]
        : []
      );
    }); // end additionalHeaders

    // Crud stuff
    const { mutateAsync: deleteRisk } = useMutation(objectQueryDefinitions.mutations.deleteRisk);
    const { mutateAsync: updateObject } = useMutation(objectQueryDefinitions.mutations.updateObject);

    async function onDeleteControl(item: any) {
      const controlId = item.control?.id;
      // since props mustn't be mutated, we need a shallow copy of the object which can be changed
      const copy = cloneDeep(props.object);
      // if the ID matches, get the appropriate CI index that will be deleted from the object
      const controlIndex = (copy?.controlImplementations || []).findIndex((ci) =>
        ci.control.targetUri.endsWith(controlId)
      );
      // finally mutate the object, if an ID matched
      if (controlIndex >= 0) {
        // delete the appropriate key at <controlIndex>
        copy?.controlImplementations?.splice(controlIndex, 1);
        // patch the object / PUT changed riskAffected
        await updateObject({
          domain: props.domainId,
          endpoint: route.params?.objectType,
          id: copy?.id,
          object: copy
        });
      }
    }

    const controlsEditDialogVisible = ref<boolean>(false);
    const confirmationDialogVisible = ref(false);
    const confirmationDialogCallBack = ref<(...args: any[]) => any>(() => {});

    const controlNameToUnlink = ref<string>('');
    const index = ref<number>();
    /**
     * actions for cloning or unlinking objects
     */
    const actions = computed(() => {
      switch (props.type) {
        case 'risks':
          return [
            {
              id: 'delete',
              label: upperFirst(t('deleteRisk').toString()),
              icon: mdiTrashCanOutline,

              async action(item: IVeoRisk) {
                try {
                  const { id } = getEntityDetailsFromLink(item.scenario);
                  await deleteRisk({
                    objectId: props.object?.id,
                    endpoint: schemas.value?.[props.object?.type || ''] || '',
                    scenarioId: id
                  });
                  displaySuccessMessage(upperFirst(t('riskDeleted').toString()));
                } catch (e: any) {
                  displayErrorMessage(upperFirst(t('deleteRiskError').toString()), e.message);
                }
              }
            }
          ];
        case 'controls':
          return [
            {
              id: 'edit',
              label: t('controls.edit'),
              icon: mdiPencil,

              async action(item: any) {
                index.value = (props.object?.controlImplementations || []).findIndex((ci) =>
                  ci.control.targetUri.endsWith(item.control.id)
                );
                controlsEditDialogVisible.value = true;
              }
            },
            {
              id: 'delete',
              label: upperFirst(t('deleteDialogTitle').toString()),
              icon: mdiLinkOff,

              async action(item: any) {
                controlNameToUnlink.value = item.name.split(' ').slice(1).join(' ');
                confirmationDialogCallBack.value = () => onDeleteControl(item);
                confirmationDialogVisible.value = true;
              }
            }
          ];
        // element type is neither risk nor control
        default:
          return [
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
                  const clonedObject = await useQuerySync(
                    objectQueryDefinitions.queries.fetch,
                    {
                      domain: route.params.domain as string,
                      endpoint: schemas.value?.[item.type] || '',
                      id: clonedObjectId
                    },
                    queryClient
                  );
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
              label: upperFirst(
                t(
                  props.object?.type === 'scope' || props.type === 'parentScopes' ?
                    'removeFromScope'
                  : 'removeFromObject'
                ).toString()
              ),
              icon: mdiLinkOff,

              action: async (item: IVeoEntity) => {
                const parent = await useQuerySync(
                  objectQueryDefinitions.queries.fetch,
                  {
                    domain: route.params.domain as string,
                    endpoint: schemas.value?.[item.type] || '',
                    id: item.id
                  },
                  queryClient
                );
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
          ];
      }
    });

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
            props.type === 'parentScopes' && props.object?.type === 'scope' ? 'removeScopeFromScopeSuccess'
            : props.type === 'parentScopes' ? 'removeObjectFromScopeSuccess'
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
            props.type === 'parentScopes' && props.object?.type === 'scope' ? 'removeScopeFromScopeError'
            : props.type === 'parentScopes' ? 'removeObjectFromScopeError'
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

    // Map object types to corresponding url paths segments
    type ObjectTypeToUrlMap = { [key: string]: string };
    const OBJECT_TYPE_TO_URL_MAP: ObjectTypeToUrlMap = {
      scope: 'scopes',
      process: 'processes',
      asset: 'assets',
      person: 'persons',
      incident: 'incidents',
      document: 'documents',
      scenario: 'scenarios',
      control: 'controls'
    };
    // push to object detail site (on click in table)
    const openItem = ({ internalItem }) => {
      const item = internalItem.raw as IVeoRisk;
      // assemble route params
      const { id: itemId, type: itemType } = internalItem.raw as IVeoEntity;
      const objectType = OBJECT_TYPE_TO_URL_MAP[itemType] || route.params.objectType;
      const params = {
        ...route.params,
        object: itemId,
        objectType,
        subType: '-'
      };

      switch (props.type) {
        case 'risks':
          editRiskDialog.value.scenarioId = getEntityDetailsFromLink(item.scenario).id;
          editRiskDialog.value.visible = true;
          break;
        case 'controls':
          return navigateTo({
            name: 'unit-domains-domain-compliance',
            query: {
              type: props.object?.type,
              riskAffected: props.object?.id,
              control: internalItem.raw.id
            }
          });
        default:
          router.push({
            name: OBJECT_DETAIL_ROUTE,
            params
          });
      }
    };

    // Risk tab
    const fetchDomainQueryParameters = computed(() => ({
      id: props.domainId as string
    }));
    const { data: domain, isFetching: domainIsFetching } = useQuery(
      domainQueryDefinitions.queries.fetchDomain,
      fetchDomainQueryParameters
    );

    const riskDefinition: ComputedRef<IVeoRiskDefinition> = computed(
      () => Object.values((domain.value?.riskDefinitions as object) || {})[0]
    );
    const riskDefinitionId = computed(() => Object.keys((domain.value?.riskDefinitions as object) || {})[0] ?? '');
    const riskDefinitionCategories = computed(() => riskDefinition.value?.categories.map((cat) => cat.id));

    function getRiskValues(item: IVeoRisk): IVeoRiskValue[] {
      return item?.domains?.[props.domainId]?.riskDefinitions[riskDefinitionId?.value]?.riskValues || [];
    }

    function getInherentAndResidualRisk(
      item: IVeoRisk,
      category: string
    ): { inherentRisk?: number; residualRisk?: number } {
      const riskValues = getRiskValues(item);
      const categorySpecificRiskValues = riskValues.find((cat) => cat.category === category);

      return {
        inherentRisk: categorySpecificRiskValues?.inherentRisk,
        residualRisk: categorySpecificRiskValues?.userDefinedResidualRisk || categorySpecificRiskValues?.residualRisk
      };
    }

    function getRiskTreatments(item: IVeoRisk, category: string): VeoRiskTreatment[] {
      const riskValues = getRiskValues(item);
      return riskValues.find((cat) => cat.category === category)?.riskTreatments || [];
    }

    const onRelatedObjectModified = () => {
      emit('reload');
    };
    return {
      ability,
      additionalHeaders,
      confirmationDialogCallBack,
      confirmationDialogVisible,
      controlNameToUnlink,
      controlsEditDialogVisible,
      defaultHeaders,
      displayErrorMessage,
      displaySuccessMessage,
      editRiskDialog,
      globalT,
      index,
      onUnlinkEntitySuccess,
      onUnlinkEntityError,
      unlinkEntityDialog,
      openItem,
      tableIsLoading,
      actions,
      items,
      page,
      sortBy,

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
    "controlDeleted": "The control implementation has been removed",
    "controls": {
      "abbreviation": "Abbreviation",
      "description": "Description",
      "edit": "Edit control",
      "responsible": "Responsible",
      "status": "Implementation status"
    },
    "deleteDialogText": "Only the control implementation of \"{ name }\" will be removed!",
    "deleteDialogTitle": "Remove control implementation",
    "deleteRisk": "delete risk",
    "errors": {
      "clone": "Could not clone object",
      "control": "Could not remove control implementation link",
      "link": "Could not link new object",
      "risk": "Could not delete risk"
    },
    "inherentRisk": "Inherent risk",
    "linkName": "Link name",
    "no": "no",
    "objectCloned": "Object successfully cloned",
    "partial": "partially",
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
    "controlDeleted": "Die Bausteinmodellierung wurde entfernt",
    "controls": {
      "abbreviation": "Abkürzung",
      "description": "Beschreibung",
      "edit": "Baustein bearbeiten",
      "responsible": "Verantwortlich",
      "status": "Umsetzungsstatus"
    },
    "deleteDialogText": "Es wird nur die Modellierung von Baustein \"{ name }\" entfernt!",
    "deleteDialogTitle": "Bausteinmodellierung entfernen",
    "deleteRisk": "Risiko löschen",
    "errors": {
      "clone": "Das Objekt konnte nicht dupliziert werden",
      "control": "Die Bausteinverknüpfung konnte nicht gelöscht werden",
      "link": "Das neue Objekt konnte nicht verknüpft werden",
      "risk": "Das Risiko konnte nicht gelöscht werden"
    },
    "inherentRisk": "Bruttorisiko",
    "linkName": "Name des Links",
    "objectCloned": "Das Objekt wurde erfolgreich dupliziert",
    "parentType": "Elterntyp",
    "removeFromObject": "Aus Objekt entfernen",
    "removeFromScope": "Aus Scope entfernen",
    "removeObjectFromObjectError": "Objekt konnte nicht entfernt werden",
    "removeObjectFromObjectSuccess": "Objekt wurde entfernt",
    "removeObjectFromScopeError": "Objekt konnte nicht aus Scope entfernt werden",
    "removeObjectFromScopeSuccess": "Objekt wurde aus Scope entfernt",
    "removeScopeFromScopeError": "Scope konnte nicht entfernt werden",
    "removeScopeFromScopeSuccess": "Scope wurde entfernt",
    "residualRisk": "NettoUmsetzungsrisiko",
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
