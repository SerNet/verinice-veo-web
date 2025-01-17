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
  <div :data-veo-test="`object-details-tab-table-${type}`">
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
              <div v-bind="props">
                <v-btn
                  :class="{ 'custom-readonly-btn': btn.isDisabled(item) }"
                  :icon="btn.icon"
                  size="small"
                  variant="flat"
                  :readonly="btn.isDisabled(item)"
                  :disabled="ability.cannot('manage', 'objects')"
                  :data-veo-test="`object-details-action-btn-${btn.id}`"
                  @click="btn.action(item)"
                />
              </div>
            </template>
            {{ btn.label(item) }}
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
      v-if="controlsEditDialogVisible"
      :control-index="index"
      :object="object"
      :show-dialog="controlsEditDialogVisible"
      @update:model-value="controlsEditDialogVisible = false"
    />
  </div>
</template>

<script lang="ts">
import {
  mdiArrowCollapseRight,
  mdiArrowDown,
  mdiArrowExpandRight,
  mdiArrowLeftRight,
  mdiArrowRight,
  mdiCheck,
  mdiContentCopy,
  mdiDownload,
  mdiLinkOff,
  mdiTransitDetour,
  mdiTrashCanOutline,
  mdiUpload
} from '@mdi/js';
import { cloneDeep, upperFirst } from 'lodash';
import type { ComputedRef, PropType, Ref } from 'vue';
import { VIcon, VTooltip } from 'vuetify/components';

import { mdiTextBoxCheckOutline } from '@mdi/js';
import { useQueryClient } from '@tanstack/vue-query';
import { TableHeader } from '~/components/base/Table.vue';
import { useVeoAlerts } from '~/composables/VeoAlert';
import { useCloneObject, useLinkObject } from '~/composables/VeoObjectUtilities';
import { useVeoPermissions } from '~/composables/VeoPermissions';
import { useFetchParentObjects } from '~/composables/api/objects';
import domainQueryDefinitions from '~/composables/api/queryDefinitions/domains';
import elementsQueryDefinitions from '~/composables/api/queryDefinitions/elements';
import objectQueryDefinitions, {
  IVeoFetchControlImplementationsParameters,
  IVeoFetchRisksParameters,
  IVeoFetchScopeChildrenParameters
} from '~/composables/api/queryDefinitions/objects';
import schemaQueryDefinitions from '~/composables/api/queryDefinitions/schemas';
import { useMutation } from '~/composables/api/utils/mutation';
import { useQuery, useQuerySync } from '~/composables/api/utils/query';
import { ROUTE_NAME as OBJECT_DETAIL_ROUTE } from '~/pages/[unit]/domains/[domain]/[objectType]/[subType]/[object].vue';
import type {
  IInOutLink,
  IVeoControlImplementation,
  IVeoEntity,
  IVeoLink,
  IVeoPaginatedResponse,
  IVeoRisk,
  IVeoRiskCategory,
  IVeoRiskDefinition,
  IVeoRiskValue,
  VeoLinkItem,
  VeoRiskTreatment,
  VeoSort
} from '~/types/VeoTypes';
import { VeoElementTypePlurals } from '~/types/VeoTypes';
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
    // i18n
    const { t, locale } = useI18n();
    const { t: globalT } = useI18n({ useScope: 'global' });
    // Routing
    const route = useRoute();
    const router = useRouter();
    // Permissions and User Settings
    const { ability } = useVeoPermissions();
    const { tablePageSize } = useVeoUser();
    // Alerts
    const { displayErrorMessage, displaySuccessMessage } = useVeoAlerts();
    // Object Operations
    const { link } = useLinkObject();
    const { clone } = useCloneObject();
    // Query Client
    const queryClient = useQueryClient();
    // State
    const page = ref(0);
    const getDefaultSortBy = (tab: string): VeoSort[] => {
      if (tab === 'controls') {
        return [{ key: 'abbreviation', order: 'asc' }];
      }
      return [{ key: 'name', order: 'asc' }];
    };
    const sortBy = ref<VeoSort[]>(getDefaultSortBy(props.type));
    const resetQueryOptions = () => {
      page.value = 0;
      sortBy.value = [{ key: 'name', order: 'asc' }];
    };
    watch(() => props.type, resetQueryOptions);

    // Computed Properties
    const tableSize = computed(() => (tablePageSize?.value === -1 ? 1000 : tablePageSize.value));

    const children = computed(() => (props.object?.type === 'scope' ? scopeChildren.value : objectChildren.value));

    const tableIsLoading = computed(
      () =>
        parentScopesIsFetching.value ||
        parentObjectsIsFetching.value ||
        childScopesIsFetching.value ||
        childObjectsIsFetching.value ||
        risksIsFetching.value ||
        domainIsFetching.value ||
        linksIsFetching.value ||
        cisIsFetching.value
    );

    const createEntityFromLink = (link: IInOutLink): VeoLinkItem => {
      const { linkedElement, direction, linkType } = link;
      const { displayName: name, abbreviation, type, id, subType } = linkedElement;
      return {
        id,
        name,
        type,
        abbreviation,
        directionIcon: direction === 'INBOUND' ? mdiDownload : mdiUpload,
        direction,
        from: direction === 'INBOUND' ? name : props.object?.displayName,
        to: direction === 'INBOUND' ? props.object?.displayName : name,
        linkType,
        subType
      };
    };

    function mapItems<T extends IVeoControlImplementation | IInOutLink, U extends IVeoEntity | VeoLinkItem>(
      cis: globalThis.Ref<IVeoPaginatedResponse<T[]>>,
      mapFunction: (item: T) => U
    ): IVeoPaginatedResponse<U[]> {
      if (!Array.isArray(cis.value?.items) || cis.value.items.length === 0) {
        return {
          items: [],
          totalItemCount: 0,
          pageCount: 0,
          page: 0
        } as IVeoPaginatedResponse<U[]>;
      }

      return {
        ...cis.value,
        items: cis.value.items.map(mapFunction)
      };
    }
    // TODO #3066 fix type (it can also return risks or control implementations)
    const items = computed<IVeoEntity[] | IVeoPaginatedResponse<IVeoEntity[]> | IVeoPaginatedResponse<VeoLinkItem[]>>(
      () => {
        switch (props.type) {
          case 'childScopes':
          case 'childObjects':
            return children.value;
          case 'parentScopes':
            return cloneDeep(parentScopes.value || []);
          case 'parentObjects':
            return parentObjects.value || [];
          case 'risks':
            // TODO #3066 find out why on earth this even compiles
            return risks.value || [];
          case 'controls':
            return mapItems(cis, (ci) => {
              return {
                ...ci,
                type: ci.control.type,
                name: ci.control.name,
                id: ci.control.id
              } as unknown as IVeoEntity;
            });
          case 'targets':
            return mapItems(cis, (ci) => {
              return {
                ...ci.owner,
                type: ci.owner.type,
                responsible: ci.responsible?.name
              } as unknown as IVeoEntity;
            });
          case 'links':
            return mapItems(links, (link) => createEntityFromLink(link));
          default:
            return [];
        }
      }
    );
    /**
     * Fetch Data
     */
    const { data: translations } = useTranslations({ domain: props.domainId });
    const { data: schemas } = useQuery(schemaQueryDefinitions.queries.fetchSchemas);

    const parentScopesQueryParameters = computed(() => ({
      parentEndpoint: 'scopes',
      childObjectId: props.object?.id || '',
      unitId: route.params.unit as string,
      sortBy: sortBy.value[0]?.key,
      sortOrder: sortBy.value[0]?.order as 'asc' | 'desc',
      page: page.value
    }));
    const parentScopesQueryEnabled = computed(() => props.type === 'parentScopes');
    const { data: parentScopes, isFetching: parentScopesIsFetching } = useFetchParentObjects(
      parentScopesQueryParameters,
      {
        enabled: parentScopesQueryEnabled
      }
    ); // Used by table and cloning objects

    const linksQueryParameters = computed(() => ({
      id: props.object?.id || '',
      endpoint: schemas.value?.[props.object?.type || ''] || '',
      domain: (route.params.domain as string) || '',
      sortBy: mapLinkSortKey(sortBy.value[0]?.key),
      sortOrder: sortBy.value[0]?.order as 'asc' | 'desc',
      page: page.value,
      size: tableSize.value
    }));
    const linksQueryEnabled = computed(() => props.type === 'links');
    const {
      data: links,
      isFetching: linksIsFetching,
      refetch: refetchLinks
    } = useQuery(elementsQueryDefinitions.queries.fetchObjectLinks, linksQueryParameters, {
      enabled: linksQueryEnabled
    });
    function mapLinkSortKey(key: string) {
      switch (key) {
        case 'name':
          return 'LINKED_ELEMENT_NAME';
        case 'abbreviation':
          return 'LINKED_ELEMENT_ABBREVIATION';
        case 'direction':
          return 'DIRECTION';
        default:
          return key;
      }
    }

    const fetchControlImplementationsQueryParameters: Ref<IVeoFetchControlImplementationsParameters> = computed(() => ({
      domain: route.params.domain as string,
      endpoint: route.params.objectType as string,
      id: route.params.object as string,
      purpose: 'COMPLIANCE',
      sortBy: mapCisSortingKey(sortBy.value[0]?.key),
      sortOrder: sortBy.value[0]?.order as 'asc' | 'desc',
      page: page.value,
      size: tableSize.value
    }));
    const cisQueryEnabled = computed(() => props.type === 'controls' || props.type === 'targets');
    const {
      data: cis,
      isFetching: cisIsFetching,
      refetch: refetchCis
    } = useQuery(
      objectQueryDefinitions.queries.fetchObjectControlImplementations,
      fetchControlImplementationsQueryParameters,
      {
        enabled: cisQueryEnabled,
        keepPreviousData: true
      }
    );
    function mapCisSortingKey(key: string) {
      if (cisQueryEnabled.value) {
        switch (key) {
          case 'name':
            return 'control.name';
          case 'abbreviation':
            return 'control.abbreviation';
          case 'responsibility':
            return 'responsible.name';
          default:
            return key;
        }
      }
    }

    const parentObjectsQueryParameters = computed(() => ({
      parentEndpoint: schemas.value?.[props.object?.type || ''] || '',
      childObjectId: props.object?.id || '',
      unitId: route.params.unit as string,
      sortBy: sortBy.value[0]?.key,
      sortOrder: sortBy.value[0]?.order as 'asc' | 'desc',
      page: page.value
    }));
    const parentObjectsQueryEnabled = computed(() => props.type === 'parentObjects');
    const { data: parentObjects, isFetching: parentObjectsIsFetching } = useFetchParentObjects(
      parentObjectsQueryParameters,
      {
        enabled: parentObjectsQueryEnabled
      }
    );
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

    const childScopesQueryEnabled = computed(() => props.type.startsWith('child') && props.object?.type === 'scope');
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
    const childObjectsQueryEnabled = computed(() => props.type.startsWith('child') && props.object?.type !== 'scope');
    const { data: objectChildren, isFetching: childObjectsIsFetching } = useQuery(
      objectQueryDefinitions.queries.fetchObjectChildren,
      childObjectsQueryParameters,
      { enabled: childObjectsQueryEnabled }
    );
    const risksQueryParameters = computed<IVeoFetchRisksParameters>(() => ({
      id: props.object?.id || '',
      endpoint: schemas.value?.[props.object?.type || ''] || ''
    }));
    const risksQueryEnabled = computed(() => props.type === 'risks');
    const { data: risks, isFetching: risksIsFetching } = useQuery(
      objectQueryDefinitions.queries.fetchRisks,
      risksQueryParameters,
      { enabled: risksQueryEnabled }
    );

    const fetchDomainQueryParameters = computed(() => ({
      id: props.domainId as string
    }));
    const { data: domain, isFetching: domainIsFetching } = useQuery(
      domainQueryDefinitions.queries.fetchDomain,
      fetchDomainQueryParameters
    );
    /**
     * Headers
     */
    const defaultHeaders = computed(() => {
      switch (props.type) {
        case 'links':
          return ['icon'];
        case 'controls':
          return ['icon', 'actions'];
        case 'risks':
          return ['designator', 'updatedAt', 'updatedBy', 'actions'];
        case 'targets':
          return ['icon', 'abbreviation', 'name', 'responsible', 'actions'];
        default:
          return [
            'icon',
            'designator',
            'abbreviation',
            'name',
            'status',
            'description',
            'updatedAt',
            'updatedBy',
            'actions'
          ];
      }
    });
    const useHeaders = () => {
      const createScenarioAbbreviationHeader = () => ({
        value: 'scenario.abbreviation',
        key: 'scenario.abbreviation',
        text: t('controls.abbreviation').toString(),
        width: 50,
        truncate: false,
        priority: 100,
        order: 30,
        render: (data: any) =>
          h('span', { 'data-veo-test': 'scenario-abbreviation' }, data.internalItem.raw.scenario?.abbreviation || '')
      });

      const createScenarioDisplayNameHeader = () => ({
        value: 'scenario.displayName',
        key: 'scenario.displayName',
        text: t('scenario').toString(),
        cellClass: ['font-weight-bold'],
        width: 200,
        truncate: true,
        priority: 100,
        order: 40,
        render: (data: any) => {
          const sliceIndex = data.internalItem.raw?.scenario?.abbreviation ? 2 : 1;
          return data.internalItem.raw.scenario.displayName.split(' ').slice(sliceIndex).join(' ');
        }
      });

      const createRiskCategoryHeaders = () => {
        return riskDefinitionCategories.value.map((categoryId: string, index: number) => ({
          value: `riskValues_${categoryId}`,
          key: `riskValues_${categoryId}`,
          text:
            riskDefinition.value?.categories?.find((category: IVeoRiskCategory) => category.id === categoryId)
              ?.translations[locale.value].name || '',
          sortable: false,
          sort: (a: any, b: any) => {
            const values = riskDefinition.value?.riskValues;
            const { inherentRisk: inherentRisk1 } = getInherentAndResidualRisk(a, categoryId);
            const translatedInherentRisk1 = values?.find((entry) => entry.ordinalValue === inherentRisk1)?.translations[
              locale.value
            ].name;
            const { inherentRisk: inherentRisk2 } = getInherentAndResidualRisk(b, categoryId);
            const translatedInherentRisk2 = values?.find((entry) => entry.ordinalValue === inherentRisk2)?.translations[
              locale.value
            ].name;
            return (translatedInherentRisk1 || '').localeCompare(translatedInherentRisk2 || '');
          },
          render: (data: any) => {
            const { inherentRisk, residualRisk } = getInherentAndResidualRisk(data.internalItem.raw, categoryId);
            const riskTreatments = getRiskTreatments(data.item, categoryId);
            const values = riskDefinition.value?.riskValues;
            const translatedInherentRisk = values?.find((entry) => entry.ordinalValue === inherentRisk)?.translations[
              locale.value
            ].name;
            const translatedResidualRisk = values?.find((entry) => entry.ordinalValue === residualRisk)?.translations[
              locale.value
            ].name;
            return h('div', [
              translatedInherentRisk ?
                h(
                  VTooltip,
                  { location: 'bottom', maxWidth: 600 },
                  {
                    activator: ({ attrs, props }: any) =>
                      h('span', { ...attrs, ...props, class: 'text-grey text--darken-4' }, translatedInherentRisk),
                    default: () => h('span', t('inherentRisk').toString())
                  }
                )
              : undefined,
              translatedInherentRisk && translatedResidualRisk ? h('span', ' / ') : undefined,
              translatedResidualRisk ?
                h(
                  VTooltip,
                  { location: 'bottom', maxWidth: 600 },
                  {
                    activator: ({ attrs, props }: any) =>
                      h('span', { ...attrs, ...props, class: 'pr-1' }, translatedResidualRisk),
                    default: () => h('span', t('residualRisk').toString())
                  }
                )
              : undefined,
              ...riskTreatments.map((riskTreatment) => {
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
                  { location: 'bottom', maxWidth: 600 },
                  {
                    activator: ({ attrs, props }: any) => h(VIcon, { ...attrs, ...props, size: 'small', icon }),
                    default: () => h('span', t(`riskTreatments.${riskTreatment}`).toString())
                  }
                );
              })
            ]);
          },
          priority: 89 - index,
          order: 41 + index,
          width: 150
        }));
      };

      const createRiskHeaders = () => {
        if (!riskDefinitionCategories.value || !riskDefinitionId.value) return [];
        return [createScenarioAbbreviationHeader(), createScenarioDisplayNameHeader(), ...createRiskCategoryHeaders()];
      };

      // Helper function to create a direction icon
      const createDirectionIcon = (direction: string) =>
        h(VIcon, {
          icon: direction === 'INBOUND' ? mdiArrowCollapseRight : mdiArrowExpandRight,
          size: 'small'
        });

      // Helper function to create a styled span
      const createStyledSpan = (content: string, isBold: boolean = false) =>
        h('span', { style: isBold ? 'font-weight: bold;' : '' }, content);

      const createLinkHeaders = () => [
        {
          value: 'from',
          key: 'from',
          sortable: false,
          text: t('from'),
          width: 150,
          truncate: false,
          priority: 100,
          order: 20,
          render: (data: any) =>
            createStyledSpan(
              data.internalItem.raw?.from || '',
              data.internalItem.raw?.from === props.object?.displayName
            )
        },
        {
          value: 'direction',
          key: 'direction',
          text: t('direction'),
          headerIcon: mdiArrowLeftRight,
          width: 20,
          truncate: false,
          priority: 100,
          order: 20,
          render: (data: any) =>
            h('span', data.internalItem.raw?.direction ? [createDirectionIcon(data.internalItem.raw.direction)] : '')
        },
        {
          value: 'linkId',
          key: 'linkId',
          sortable: false,
          order: 30,
          priority: 100,
          text: t('linkName'),
          width: 150,
          render: (data: any) =>
            h(
              'span',
              translations.value?.lang?.[locale.value]?.[data.internalItem.raw.linkType] ||
                data.internalItem.raw.linkType
            )
        },
        {
          value: 'to',
          key: 'to',
          sortable: false,
          text: t('to'),
          width: 150,
          truncate: false,
          priority: 100,
          order: 30,
          render: (data: any) =>
            createStyledSpan(data.internalItem.raw?.to || '', data.internalItem.raw?.to === props.object?.displayName)
        }
      ];

      const createControlHeaders = () => [
        {
          value: 'abbreviation',
          key: 'abbreviation',
          text: t('controls.abbreviation'),
          width: 50,
          truncate: false,
          priority: 100,
          order: 20,
          render: (data: any) =>
            h('span', { 'data-veo-test': 'control-abbreviation' }, data.internalItem.raw.control?.abbreviation || '')
        },
        {
          value: 'name',
          key: 'name',
          text: 'Name',
          width: 200,
          truncate: true,
          priority: 100,
          order: 30,
          render: (data: any) =>
            h('span', { 'data-veo-test': 'control-name' }, data.internalItem.raw.control?.name || '')
        },
        {
          value: 'description',
          key: 'description',
          text: t('controls.description'),
          width: 200,
          truncate: false,
          priority: 20,
          order: 35,
          render: (data: any) =>
            h('span', { 'data-veo-test': 'control-description' }, data.internalItem.raw.description || '')
        },
        {
          value: 'responsibility',
          key: 'responsibility',
          text: t('controls.responsible'),
          width: 100,
          truncate: false,
          priority: 50,
          order: 50,
          render: (data: any) =>
            h(
              'span',
              { class: 'text-truncate d-inline-block', 'data-veo-test': 'control-responsibility' },
              data.internalItem.raw.responsible?.name || ''
            )
        }
      ];

      const createTargetHeaders = computed(() => [
        {
          value: 'responsible',
          key: 'responsible',
          text: t('controls.responsible'),
          width: 100,
          truncate: false,
          priority: 50,
          order: 50,
          render: (data: any) =>
            h('span', { class: 'text-truncate d-inline-block' }, data.internalItem.raw.responsible || '')
        }
      ]);

      return {
        createRiskHeaders,
        createLinkHeaders,
        createControlHeaders,
        createTargetHeaders
      };
    };
    const { createRiskHeaders, createLinkHeaders, createControlHeaders, createTargetHeaders } = useHeaders();
    const additionalHeaders = computed<TableHeader[]>(() => {
      switch (props.type) {
        case 'risks':
          return createRiskHeaders();
        case 'links':
          return createLinkHeaders();
        case 'controls':
          return createControlHeaders();
        case 'targets':
          return createTargetHeaders.value;
        default:
          return [];
      }
    });

    // Crud stuff
    const { mutateAsync: deleteRisk } = useMutation(objectQueryDefinitions.mutations.deleteRisk);
    const { mutateAsync: updateObject } = useMutation(objectQueryDefinitions.mutations.updateObject);

    async function onDeleteControl(item: any) {
      try {
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
        displaySuccessMessage(t('controlDeleted'));
      } catch (error) {
        displayErrorMessage(t('errors.control'), JSON.stringify(error));
      } finally {
        confirmationDialogVisible.value = false;
      }
    }

    /**
     * actions for cloning or unlinking objects
     */
    const controlsEditDialogVisible = ref<boolean>(false);
    const confirmationDialogVisible = ref(false);
    const confirmationDialogCallBack = ref<(...args: any[]) => any>(() => {});
    const controlNameToUnlink = ref<string>('');
    const index = ref<number>();

    const actions = computed(() => {
      switch (props.type) {
        case 'risks':
          return [
            {
              id: 'implementations',
              name: 'risks',
              label: (item: any) => (!item.mitigation ? t('noImplementations') : t('implementations')),
              icon: mdiTextBoxCheckOutline,
              isDisabled: (item: any) => !item.mitigation, // Disable if mitigation exists (coerce to boolean)
              async action(item: any) {
                // Check for mitigation and navigate accordingly
                if (item.mitigation) {
                  return navigateTo({
                    name: 'unit-domains-domain-compliance',
                    query: {
                      type: props.object?.type,
                      targetObject: props.object?.id,
                      control: item?.mitigation?.id
                    }
                  });
                }
              }
            },
            {
              id: 'delete',
              label: (_item: any) => upperFirst(t('deleteRisk').toString()),
              icon: mdiTrashCanOutline,
              isDisabled: (_item: any) => false, // Disable if mitigation exists (coerce to boolean)
              async action(item: IVeoRisk) {
                try {
                  await deleteRisk({
                    objectId: props.object?.id,
                    endpoint: schemas.value?.[props.object?.type || ''] || '',
                    scenarioId: item.scenario.id
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
              id: 'implementations',
              name: 'controls',
              label: (_item: any) => t('implementations'),
              icon: mdiTextBoxCheckOutline,
              isDisabled: (_item: any) => false, // Disable if mitigation exists (coerce to boolean)

              async action(item: IVeoLink) {
                return navigateTo({
                  name: 'unit-domains-domain-compliance',
                  query: {
                    type: props.object?.type,
                    targetObject: props.object?.id,
                    control: item.id
                  }
                });
              }
            },
            {
              id: 'delete',
              label: (_item: any) => upperFirst(t('deleteDialogTitle').toString()),
              icon: mdiLinkOff,
              isDisabled: (_item: any) => false, // Disable if mitigation exists (coerce to boolean)

              async action(item: any) {
                controlNameToUnlink.value = item.name;
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
              label: (_item: any) => upperFirst(t('cloneObject').toString()),
              icon: mdiContentCopy,
              isDisabled: (_item: any) => false, // Disable if mitigation exists (coerce to boolean)

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
              label: (_item: any) =>
                upperFirst(
                  t(
                    props.object?.type === 'scope' || props.type === 'parentScopes' ?
                      'removeFromScope'
                    : 'removeFromObject'
                  ).toString()
                ),
              icon: mdiLinkOff,
              isDisabled: (_item: any) => false, // Disable if mitigation exists (coerce to boolean)

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

    // push to object detail site (on click in table)
    const openItem = ({ internalItem }) => {
      switch (props.type) {
        case 'risks':
          editRiskDialog.value.scenarioId = (internalItem.raw as IVeoRisk).scenario.id;
          editRiskDialog.value.visible = true;
          break;
        case 'controls':
          index.value = (props.object?.controlImplementations || []).findIndex(
            (ci) => ci.control.id === internalItem.raw.control.id
          );
          controlsEditDialogVisible.value = true;
          break;
        default:
          openObject(internalItem.raw as IVeoEntity);
      }
    };

    function openObject(object: IVeoEntity) {
      router.push({
        ...route.params,
        name: OBJECT_DETAIL_ROUTE,
        params: {
          object: object.id,
          objectType: VeoElementTypePlurals[object.type as keyof typeof VeoElementTypePlurals],
          subType: object.subType
        }
      });
    }

    /**
     * Risk tab
     */
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

    watch(
      () => [props.object.links, props.object.controlImplementations],
      ([newLinks, newCis], [oldLinks, oldCis]) => {
        if (newLinks !== oldLinks) {
          refetchLinks();
        }
        if (newCis !== oldCis) {
          refetchCis();
        }
      }
    );

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
    "direction": "Direction",
    "from": "From",
    "to": "To",
    "outbound": "Outgoing",
    "inbound": "Ingoing",
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
    "scenario": "Scenario",
    "implementations": "Show implementations",
    "noImplementations": "No mitigating controls"
  },
  "de": {
    "cloneObject": "Objekt duplizieren",
    "controlDeleted": "Die Bausteinmodellierung wurde entfernt",
    "controls": {
      "abbreviation": "Abkürzung",
      "description": "Beschreibung",
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
    "linkName": "Verknüpfung",
    "direction": "Richtung",
    "from": "Von",
    "to": "Nach",
    "outbound": "Ausgehend",
    "inbound": "Eingehend",
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
    "scenario": "Szenario",
    "implementations": "Umsetzung anzeigen",
    "noImplementations": "Keine mitigierenden Maßnahmen"

  }
}
</i18n>
<style>
.custom-readonly-btn .v-icon {
  opacity: 0.5;
}
</style>
