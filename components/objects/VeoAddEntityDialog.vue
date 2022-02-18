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
    :headline="t('headline')"
    :persistent="saving"
    :close-disabled="saving"
    fixed-header
    fixed-footer
  >
    <template #default>
      {{ t('add_subentities', { displayName: entityDisplayName }) }}
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
            style="border: 1px solid black"
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
        :items="entities"
        :loading="fetchState.pending || loading"
        @page-change="onPageChange"
      />
    </template>
    <template #dialog-options>
      <v-btn
        text
        color="primary"
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
        :disabled="saving"
        @click="addEntities"
      >
        {{ t('add') }}
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
import { defineComponent, useRoute, ref, computed, useContext, useFetch, useRouter, watch, PropOptions } from '@nuxtjs/composition-api';
import { upperFirst } from 'lodash';
import { useI18n } from 'nuxt-i18n-composable';
import { mdiFilter } from '@mdi/js';
import { getEntityDetailsFromLink, IBaseObject, separateUUIDParam } from '~/lib/utils';
import { getSchemaEndpoint, getSchemaName, IVeoSchemaEndpoint } from '~/plugins/api/schema';
import { IVeoEntity, IVeoFormSchemaMeta, IVeoLink, IVeoPaginatedResponse, IVeoTranslations } from '~/types/VeoTypes';

export default defineComponent({
  name: 'VeoAddEntityDialog',
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
    } as PropOptions<IVeoEntity | undefined>
  },
  setup(props, { emit }) {
    const route = useRoute();
    const { t, locale } = useI18n();
    const { $api, $config, $user } = useContext();

    const filter = ref<IBaseObject>({});
    const selectedItems = ref<{ id: string; type: string }[]>([]);
    const saving = ref(false); // saving status for adding entities
    const loading = ref(false); // loading status for fetch entities
    const entities = ref<IVeoPaginatedResponse<IVeoEntity[]>>({ items: [], page: 1, pageCount: 0, totalItemCount: 0 });
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
      (newValue: boolean) => {
        if (newValue) {
          filter.value = { objectType: allowedObjectTypes.value[0].schemaName };
          fetchEntities({ page: 1, sortBy: 'name', sortDesc: false });

          let presetEntities: IVeoLink[];
          if (!props.editedEntity) {
            presetEntities = [];
          } else if (props.editedEntity.type === 'scope') {
            presetEntities = props.editedEntity.members;
          } else {
            presetEntities = props.editedEntity.parts;
          }

          selectedItems.value = presetEntities.map((member) => {
            const details = getEntityDetailsFromLink(member);
            const id = details.id;
            let type = details.type;
            type = getSchemaName(schemas.value, type) || type;

            return { id, type };
          });
        }
      }
    );

    /**
     * filter stuff
     */

    // available & active filter options
    const filterKeys = ['objectType', 'subType', 'designator', 'name', 'status', 'description', 'updatedBy', 'notPartOfGroup', 'hasChildObjects', 'hasLinks'];
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
          return formschemas.value.find((formschema) => formschema.subType === value)?.name?.[locale] || value;
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
      let _schemas = [...schemas.value];
      // Filter out scopes if the user wants to add objects and the parent is a scope
      if (props.editedEntity?.type === 'scope' && props.addType === 'entity') {
        _schemas = _schemas.filter((item) => item.endpoint !== 'scopes');
      }
      // Only scope if the user wants to add scopes and the parent is a scope
      if (props.editedEntity?.type === 'scope' && props.addType === 'scope') {
        _schemas = _schemas.filter((item) => item.endpoint === 'scopes');
      }
      // Only own object type if the user wants to add objects and the parent is a object
      if (props.editedEntity?.type !== 'scope' && props.addType === 'entity') {
        _schemas = _schemas.filter((item) => item.schemaName === props.editedEntity?.type);
      }
      return _schemas;
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
      const _editedEntity = await $api.entity.fetch(props.editedEntity.type, props.editedEntity.id);

      const children = selectedItems.value.map((item) => {
        return {
          targetUri: `${$config.apiUrl}/${getSchemaEndpoint(schemas.value, item.type) || item.type}/${item.id}`
        };
      });
      if (props.editedEntity.type === 'scope') {
        // @ts-ignore
        _editedEntity.members = children;
      } else {
        // @ts-ignore
        _editedEntity.parts = children;
      }

      $api.entity
        .update(props.editedEntity.type, props.editedEntity.id, _editedEntity)
        .then(() => {
          emit('success');
        })
        .catch((error: any) => {
          emit('error', error);
        })
        .finally(() => {
          saving.value = false;
        });
    };

    return {
      dialog,
      filter,
      saving,
      loading,
      entities,
      domainId,
      fetchState,
      selectedItems,
      activeFilterKeys,
      entityDisplayName,
      allowedObjectTypes,
      filterDialogVisible,

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
    "add": "Add",
    "add_subentities": "Add sub objects to \"{displayName}\"",
    "headline": "Edit sub objects",
    "filter": "filter"
  },
  "de": {
    "add": "Hinzufügen",
    "add_subentities": "Unterobjekte zu \"{displayName}\" hinzufügen",
    "headline": "Unterobjekte bearbeiten",
    "filter": "filter"
  }
}
</i18n>
