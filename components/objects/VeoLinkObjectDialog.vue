<!--
   - verinice.veo web
   - Copyright (C) 2021  Jonas Heitmann, Davit Svandize, Jessica Lühnen
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
  <VeoDialog
    v-model="dialog"
    large
    :headline="t('headline', [linkedObjectType])"
    :persistent="saving"
    :close-disabled="saving"
    fixed-footer
  >
    <template #default>
      <p
        v-if="hierarchicalContext === 'child'"
        class="text-body-1"
      >
        {{ t('linkChildExplanation', { displayName: entityDisplayName, linkedObjectType }) }}
      </p>
      <p
        v-else
        class="text-body-1"
      >
        {{ t('linkParentExplanation', { displayName: entityDisplayName, linkedObjectType }) }}
      </p>
      <v-row no-gutters>
        <v-col
          cols="auto"
          class="d-flex align-center"
        >
          <v-btn
            v-cy-name="'filter-button'"
            class="mr-2"
            rounded
            primary
            depressed
            small
            style="outline: 1px solid black"
            @click="filterDialogVisible = true"
          >
            <v-icon>{{ mdiFilter }}</v-icon> {{ upperFirst(t('filter').toString()) }}
          </v-btn>
        </v-col>
        <v-col
          cols="auto"
          class="grow"
        >
          <v-chip-group v-cy-name="'chips'">
            <VeoObjectChip
              v-for="k in activeFilterKeys"
              :key="k"
              :label="formatLabel(k)"
              :value="formatValue(k, filter[k])"
              :close="k!='objectType'"
              @click:close="clearFilter(k)"
            />
          </v-chip-group>
        </v-col>
      </v-row>
      <VeoEntitySelectionList
        v-model="selectedItems"
        :items="availableEntities"
        :loading="fetchState.pending || loading"
        @page-change="onPageChange"
      />
    </template>
    <template #dialog-options>
      <v-btn
        text
        :disabled="saving"
        @click="$emit('input', false)"
      >
        {{ t('global.button.cancel') }}
      </v-btn>
      <v-spacer />
      <v-btn
        text
        color="primary"
        :data-cy="$utils.prefixCyData($options, 'save-button')"
        :loading="saving"
        @click="addEntities"
      >
        {{ t('global.button.save') }}
      </v-btn>
      <VeoFilterDialog
        v-model="filterDialogVisible"
        :domain="domainId"
        :filter="filter"
        :allowed-object-types="allowedObjectTypes"
        object-type-required
        @update:filter="updateFilter"
      />
    </template>
  </VeoDialog>
</template>

<script lang="ts">
import { defineComponent, useRoute, ref, computed, useContext, useFetch, watch, PropOptions, PropType } from '@nuxtjs/composition-api';
import { cloneDeep, differenceBy, upperFirst } from 'lodash';
import { useI18n } from 'nuxt-i18n-composable';
import { mdiFilter } from '@mdi/js';
import { getEntityDetailsFromLink, IBaseObject, separateUUIDParam } from '~/lib/utils';
import { getSchemaName, IVeoSchemaEndpoint } from '~/plugins/api/schema';
import { IVeoEntity, IVeoFormSchemaMeta, IVeoLink, IVeoPaginatedResponse, IVeoTranslations } from '~/types/VeoTypes';
import { useVeoObjectUtilities } from '~/composables/VeoObjectUtilities';

export default defineComponent({
  name: 'VeoLinkObjectDialog',
  props: {
    value: {
      type: Boolean,
      required: true
    },
    addType: {
      type: [String, undefined],
      default: undefined
    } as PropOptions<'entity' | 'scope' | undefined>,
    editedEntity: {
      type: [Object, undefined],
      default: undefined
    } as PropOptions<IVeoEntity | undefined>,
    hierarchicalContext: {
      type: String as PropType<'parent' | 'child'>,
      default: 'child'
    }
  },
  setup(props, { emit }) {
    const route = useRoute();
    const { t, locale } = useI18n();
    const { $api, $user } = useContext();
    const { linkObject, unlinkObject } = useVeoObjectUtilities();

    const filter = ref<IBaseObject>({});
    const selectedItems = ref<{ id: string; type: string }[]>([]);
    const originalSelectedItems = ref<{ id: string; type: string }[]>([]); // Doesn't get modified to compare which parents have been added removed
    const saving = ref(false); // saving status for adding entities
    const loading = ref(false); // loading status for fetch entities
    const entities = ref<IVeoPaginatedResponse<IVeoEntity[]>>({ items: [], page: 1, pageCount: 0, totalItemCount: 0 });
    const availableEntities = computed(() => ({ ...entities.value, items: entities.value.items.filter((item) => item.id !== props.editedEntity?.id) }));
    const schemas = ref<IVeoSchemaEndpoint[]>([]);
    const formschemas = ref<IVeoFormSchemaMeta[]>([]);
    const filterDialogVisible = ref(false);
    const translations = ref<IVeoTranslations['lang']>({});

    const domainId = computed(() => separateUUIDParam(route.value.params.domain).id);

    const { fetchState } = useFetch(async () => {
      const [_schemas, _formschemas, _translations] = await Promise.all([$api.schema.fetchAll(), $api.form.fetchAll(domainId.value), $api.translation.fetch(['de', 'en'])]);
      schemas.value = _schemas;
      formschemas.value = _formschemas;
      translations.value = _translations.lang;
    });

    const entityDisplayName = computed(() => props.editedEntity?.displayName || '');

    // control own dialog
    const dialog = computed({
      get(): boolean {
        return props.value;
      },
      set() {
        entities.value = {
          items: [],
          page: 1,
          pageCount: 0,
          totalItemCount: 0
        };
        emit('input', false);
      }
    });

    // on open dialog do ...
    watch(
      () => props.value,
      async (newValue: boolean) => {
        if (newValue) {
          filter.value = { objectType: allowedObjectTypes.value[0].schemaName };
          fetchEntities({ page: 1, sortBy: 'name', sortDesc: false });

          if (props.editedEntity) {
            if (props.hierarchicalContext === 'parent') {
              const parentType = props.addType === 'entity' ? props.editedEntity.type : 'scope';

              selectedItems.value = (await $api.entity.fetchParents(parentType, props.editedEntity.id)).items.map((item) => ({ id: item.id, type: item.type }));
            } else {
              const childrenProperty = props.editedEntity.type === 'scope' ? 'members' : 'parts';
              selectedItems.value = props.editedEntity[childrenProperty].map((child: IVeoLink) => {
                const details = getEntityDetailsFromLink(child);
                const id = details.id;
                let type = details.type;
                type = getSchemaName(schemas.value, type) || type;

                return { id, type };
              });
            }
            originalSelectedItems.value = cloneDeep(selectedItems.value);
          }
        }
      }
    );

    /**
     * Common stuff
     */
    const linkedObjectType = computed(() => {
      return props.addType === 'scope' ? ['Scope'] : props.editedEntity?.type === 'scope' ? t('object').toString() : upperFirst(props.editedEntity?.type);
    });

    /**
     * filter stuff
     */

    // available & active filter options
    const filterKeys = ['objectType', 'subType', 'designator', 'name', 'status', 'description', 'updatedBy', 'notPartOfGroup', 'hasChildObjects'];
    const activeFilterKeys = computed(() => {
      return filterKeys.filter((k) => filter.value[k] !== undefined);
    });

    // fetch new entities on filters' objectType change
    watch(
      () => filter.value,
      () => {
        if (filter.value.objectType) fetchEntities({ page: 1, sortBy: 'name', sortDesc: false });
      }
    );

    // formatting filter chips and their translations
    const formatLabel = (label: string) => {
      return upperFirst(t(`objectlist.${label}`).toString());
    };
    const formatValue = (label: string, value?: string) => {
      switch (label) {
        // Uppercase object types
        case 'objectType':
          return upperFirst(value);
        // Translate sub types
        case 'subType':
          return formschemas.value.find((formschema) => formschema.subType === value)?.name?.[locale.value] || value;
        case 'status':
          return translations.value[locale.value]?.[`${filter.value.objectType}_${filter.value.subType}_status_${value}`] || value;
        default:
          return value;
      }
    };

    // remove one filter
    const clearFilter = (key: string) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [key]: remove, ...rest } = filter.value;
      filter.value = { ...rest };
    };

    // update filter options
    const updateFilter = (newFilter: IBaseObject) => {
      filter.value = { ...newFilter };
    };

    // get allowed filter-objectTypes for current parent and child type
    const allowedObjectTypes = computed(() => {
      if (props.hierarchicalContext === 'parent') {
        if (props.addType === 'entity') {
          // Only allow the same schema for the parent as the one of the current element...
          return schemas.value.filter((item) => item.schemaName === props.editedEntity?.type);
        } else {
          // ...or a scope
          return schemas.value.filter((item) => item.endpoint === 'scopes');
        }
      } else {
        // Filter out scopes if the user wants to add objects and the parent is a scope
        if (props.editedEntity?.type === 'scope' && props.addType === 'entity') {
          return schemas.value.filter((item) => item.endpoint !== 'scopes');
        }
        // Only scope if the user wants to add scopes and the parent is a scope
        if (props.editedEntity?.type === 'scope' && props.addType === 'scope') {
          return schemas.value.filter((item) => item.endpoint === 'scopes');
        }
        // Only own object type if the user wants to add objects and the parent is a object
        if (props.editedEntity?.type !== 'scope' && props.addType === 'entity') {
          return schemas.value.filter((item) => item.schemaName === props.editedEntity?.type);
        }
      }

      return [];
    });

    /**
     * entity control
     */

    // fetch entities for table
    const fetchEntities = async (options: { page: number; sortBy: string; sortDesc: boolean }) => {
      loading.value = true;
      entities.value = await $api.entity.fetchAll(filter.value.objectType, options.page, {
        size: $user.tablePageSize,
        sortBy: options.sortBy,
        sortOrder: options.sortDesc ? 'desc' : 'asc',
        ...(filter.value || {})
      });
      loading.value = false;
    };

    // refetch entities on page or sort changes (in VeoObjectTable)
    const onPageChange = async (opts: { newPage: number; sortBy: string; sortDesc?: boolean }) => {
      await fetchEntities({ page: opts.newPage, sortBy: opts.sortBy, sortDesc: !!opts.sortDesc });
    };

    // add child entities to parent
    const addEntities = async () => {
      if (!props.editedEntity) {
        return;
      }

      saving.value = true;
      try {
        if (props.hierarchicalContext === 'parent') {
          const parentsToAdd = differenceBy(selectedItems.value, originalSelectedItems.value, 'id');
          const parentsToRemove = differenceBy(originalSelectedItems.value, selectedItems.value, 'id');
          for (const parent of parentsToAdd) {
            await linkObject('parent', { objectId: props.editedEntity.id, objectType: props.editedEntity.type }, { objectId: parent.id, objectType: parent.type });
          }
          for (const parent of parentsToRemove) {
            await unlinkObject(parent.id, props.editedEntity.id, parent.type);
          }
        } else {
          await linkObject(
            props.hierarchicalContext,
            { objectType: props.editedEntity.type, objectId: props.editedEntity.id },
            selectedItems.value.map((item) => ({ objectId: item.id, objectType: item.type }))
          );
        }
        emit('success');
      } catch (error: any) {
        emit('error', error);
      } finally {
        saving.value = false;
      }
    };

    return {
      availableEntities,
      dialog,
      filter,
      saving,
      loading,
      domainId,
      fetchState,
      selectedItems,
      activeFilterKeys,
      entityDisplayName,
      allowedObjectTypes,
      filterDialogVisible,
      linkedObjectType,

      addEntities,
      formatLabel,
      formatValue,
      clearFilter,
      updateFilter,
      onPageChange,

      t,
      upperFirst,
      mdiFilter
    };
  }
});
</script>

<i18n>
{
  "en": {
    "filter": "filter",
    "headline": "select {0}",
    "linkChildEntityExplanation": "Add {linkedObjectType} as a part to \"{parentName}\"",
    "linkParentExplanation": "Add {linkedObjectType} as a parent to \"{parentName}\"",
    "object": "object"
  },
  "de": {
    "filter": "filter",
    "headline": "{0} auswählen",
    "linkChildExplanation": "{linkedObjectType} unter \"{displayName}\" einfügen",
    "linkParentExplanation": "{linkedObjectType} über \"{displayName}\" einfügen",
    "object": "Objekt"
  }
}
</i18n>

<style lang="scss" scoped>
.v-data-table {
  background-color: transparent;
}
</style>
