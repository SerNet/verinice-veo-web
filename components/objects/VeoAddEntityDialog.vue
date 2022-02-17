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
    :headline="$t('headline')"
    :persistent="saving"
    :close-disabled="saving"
    fixed-header
    fixed-footer
  >
    <template #default>
      {{ $t('add_subentities', { displayName: entityDisplayName }) }}
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
            <v-icon>{{ mdiFilter }}</v-icon> {{ upperFirst($t('filter').toString()) }}
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
        :loading="$fetchState.pending || loading"
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
        {{ $t('global.button.cancel') }}
      </v-btn>
      <v-spacer />
      <v-btn
        text
        color="primary"
        :data-cy="$utils.prefixCyData($options, 'save-button')"
        :disabled="saving"
        @click="addEntities"
      >
        {{ $t('add') }}
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
import Vue from 'vue';
import { upperFirst } from 'lodash';
import { Prop } from 'vue/types/options';
import { mdiFilter } from '@mdi/js';
import { getEntityDetailsFromLink, IBaseObject, separateUUIDParam } from '~/lib/utils';

import { getSchemaEndpoint, getSchemaName, IVeoSchemaEndpoint } from '~/plugins/api/schema';
import { IVeoEntity, IVeoFormSchemaMeta, IVeoLink, IVeoPaginatedResponse, IVeoTranslations } from '~/types/VeoTypes';

export default Vue.extend({
  props: {
    value: {
      type: Boolean,
      required: true
    },
    addType: {
      type: String as Prop<'entity' | 'scope' | undefined>,
      default: undefined
    },
    editedEntity: {
      type: Object as Prop<IVeoEntity | undefined>,
      default: undefined
    }
  },
  data() {
    return {
      filter: {} as IBaseObject,
      selectedItems: [] as { id: string; type: string }[],
      saving: false as boolean,
      entities: {
        items: [],
        page: 1,
        pageCount: 0,
        totalItemCount: 0
      } as IVeoPaginatedResponse<IVeoEntity[]>,
      loading: false as boolean,
      schemas: [] as IVeoSchemaEndpoint[],
      formschemas: [] as IVeoFormSchemaMeta[],
      filterDialogVisible: false,
      filterKeys: ['objectType', 'subType', 'designator', 'name', 'status', 'description', 'updatedBy', 'notPartOfGroup', 'hasChildObjects', 'hasLinks'],
      translations: {} as IVeoTranslations['lang'],
      mdiFilter,
      upperFirst
    };
  },
  async fetch() {
    this.schemas = await this.$api.schema.fetchAll();
    this.formschemas = await this.$api.form.fetchAll(this.domainId);
    this.translations = (await this.$api.translation.fetch(['de', 'en'])).lang;
  },
  computed: {
    entityDisplayName(): string {
      return this.editedEntity?.displayName || '';
    },
    allowedObjectTypes(): IVeoSchemaEndpoint[] {
      let schemas = [...this.schemas];
      // Filter out scopes if the user wants to add objects and the parent is a scope
      if (this.editedEntity?.type === 'scope' && this.addType === 'entity') {
        schemas = schemas.filter((item) => item.endpoint !== 'scopes');
      }
      // Only scope if the user wants to add scopes and the parent is a scope
      if (this.editedEntity?.type === 'scope' && this.addType === 'scope') {
        schemas = schemas.filter((item) => item.endpoint === 'scopes');
      }
      // Only own object type if the user wants to add objects and the parent is a object
      if (this.editedEntity?.type !== 'scope' && this.addType === 'entity') {
        schemas = schemas.filter((item) => item.schemaName === this.editedEntity?.type);
      }

      return schemas;
    },
    dialog: {
      get(): boolean {
        return this.value;
      },
      set(newValue: boolean) {
        // reset dialog items + filter before close
        this.entities = {
          items: [],
          page: 1,
          pageCount: 0,
          totalItemCount: 0
        };
        this.$emit('input', newValue);
      }
    },
    domainId(): string {
      return separateUUIDParam(this.$route.params.domain).id;
    },
    activeFilterKeys(): string[] {
      return this.filterKeys.filter((k) => this.filter[k] !== undefined);
    }
  },
  watch: {
    value(newValue: boolean) {
      if (newValue) {
        this.filter = { objectType: this.allowedObjectTypes[0].schemaName };
        this.fetchEntities({ page: 1, sortBy: 'name', sortDesc: false });

        let presetEntities: IVeoLink[];
        if (!this.editedEntity) {
          presetEntities = [];
        } else if (this.editedEntity.type === 'scope') {
          presetEntities = this.editedEntity.members;
        } else {
          presetEntities = this.editedEntity.parts;
        }

        this.selectedItems = presetEntities.map((member) => {
          const details = getEntityDetailsFromLink(member);
          const id = details.id;
          let type = details.type;
          type = getSchemaName(this.schemas, type) || type;

          return { id, type };
        });
      }
    },
    filter() {
      if (this.filter.objectType) this.fetchEntities({ page: 1, sortBy: 'name', sortDesc: false });
    }
  },
  methods: {
    async addEntities() {
      if (!this.editedEntity) {
        return;
      }

      this.saving = true;
      const _editedEntity = await this.$api.entity.fetch(this.editedEntity.type, this.editedEntity.id);

      const children = this.selectedItems.map((item) => {
        return {
          targetUri: `${this.$config.apiUrl}/${getSchemaEndpoint(this.schemas, item.type) || item.type}/${item.id}`
        };
      });
      if (this.editedEntity.type === 'scope') {
        // @ts-ignore
        _editedEntity.members = children;
      } else {
        // @ts-ignore
        _editedEntity.parts = children;
      }

      this.$api.entity
        .update(this.editedEntity.type, this.editedEntity.id, _editedEntity)
        .then(() => {
          this.$emit('success');
        })
        .catch((error: any) => {
          this.$emit('error', error);
        })
        .finally(() => {
          this.saving = false;
        });
    },
    async fetchEntities(options: { page: number; sortBy: string; sortDesc: boolean }) {
      this.loading = true;
      this.entities = await this.$api.entity.fetchAll(this.filter.objectType, options.page, {
        size: this.$user.tablePageSize,
        sortBy: options.sortBy,
        sortOrder: options.sortDesc ? 'desc' : 'asc',
        ...(this.filter || {})
      });
      this.loading = false;
    },
    formatLabel(label: string) {
      return upperFirst(this.$t(`objectlist.${label}`).toString());
    },
    formatValue(label: string, value?: string) {
      switch (label) {
        // Uppercase object types
        case 'objectType':
          return upperFirst(value);
        // Translate sub types
        case 'subType':
          return this.formschemas.find((formschema) => formschema.subType === value)?.name?.[this.$i18n.locale] || value;
        case 'status':
          return this.translations[this.$i18n.locale]?.[`${this.filter.objectType}_${this.filter.subType}_status_${value}`] || value;
        default:
          return value;
      }
    },
    clearFilter(key: string) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [key]: remove, ...rest } = this.filter;
      this.filter = { ...rest };
    },
    updateFilter(filter: IBaseObject) {
      this.filter = { ...filter };
    },
    // refetch on page or sort changes (in VeoObjectTable)
    async onPageChange(opts: { newPage: number; sortBy: string; sortDesc?: boolean }) {
      await this.fetchEntities({ page: opts.newPage, sortBy: opts.sortBy, sortDesc: !!opts.sortDesc });
    }
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
