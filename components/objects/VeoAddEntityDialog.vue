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
  >
    <template #default>
      {{ $t('add_subentities', { displayName: entityDisplayName }) }}
      <v-row
dense
class="justify-space-between">
        <v-col
          v-if="editedEntity && editedEntity.type === 'scope' && addType === 'entity'"
          lg="3"
          md="6"
          cols="12"
        >
          <span>{{ $t('shown_objecttype') }}:</span>
          <v-select
            v-model="objectType"
            :label="$t('object_type')"
            :items="objectTypes"
            class="mt-2"
            outlined
            dense
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col class="flex-grow-1 search-bar">
          <VeoListSearchBar
v-model="filter"
:object-type="objectName"
@reset="filter = $event" />
        </v-col>
      </v-row>
      <VeoEntitySelectionList
        :selected-items="selectedItems"
        :items="entities"
        :loading="$fetchState.pending || loading"
        :object-type="objectName"
        @new-subentities="onNewSubEntities"
        @page-change="fetchEntities"
        @refetch="fetchEntities"
      />
    </template>
    <template #dialog-options>
      <v-btn
        text
        color="primary"
        :disabled="saving"
        @click="$emit('input', false)"
      >{{ $t('global.button.cancel') }}</v-btn>
      <v-spacer />
      <v-btn
text
color="primary"
        :data-cy="$utils.prefixCyData($options, 'save-button')"
:disabled="saving"
@click="addEntities">{{ $t('add') }}</v-btn>
    </template>
  </VeoDialog>
</template>

<script lang="ts">
import Vue from 'vue';
import { upperFirst } from 'lodash';
import { Prop } from 'vue/types/options';
import { getEntityDetailsFromLink } from '~/lib/utils';

import { getSchemaEndpoint, getSchemaName, IVeoSchemaEndpoint } from '~/plugins/api/schema';
import { IVeoEntity, IVeoLink, IVeoPaginatedResponse } from '~/types/VeoTypes';
import { IVeoFilter } from '~/components/layout/VeoListSearchBar.vue';

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
      filter: {
        designator: undefined,
        name: undefined,
        description: undefined,
        updatedBy: undefined,
        status: undefined
      } as IVeoFilter | undefined,
      selectedItems: [] as { id: string; type: string }[],
      saving: false as boolean,
      entities: {
        items: [],
        page: 1,
        pageCount: 0,
        totalItemCount: 0
      } as IVeoPaginatedResponse<IVeoEntity[]>,
      loading: false as boolean,
      objectType: '' as string,
      schemas: [] as IVeoSchemaEndpoint[]
    };
  },
  async fetch() {
    this.schemas = await this.$api.schema.fetchAll();
    this.objectType = this.objectTypes[0].value;

    this.fetchEntities({ page: 1, sortBy: 'name', sortDesc: false });
  },
  computed: {
    entityDisplayName(): string {
      return this.editedEntity?.displayName || '';
    },
    objectTypes(): { value: string; text: string }[] {
      let schemas = this.schemas.map((schema: IVeoSchemaEndpoint) => ({
        text: upperFirst(schema.schemaName),
        value: schema.endpoint
      }));

      // Filter out scopes if the user wants to add objects and the parent is a scope
      if (this.editedEntity?.type === 'scope') {
        schemas = schemas.filter((item) => item.value !== 'scopes');
      }

      return schemas;
    },
    objectName(): string | undefined {
      return this.schemas.find((schema) => schema.endpoint === this.objectType)?.schemaName;
    },
    dialog: {
      get(): boolean {
        return this.value;
      },
      set(newValue: boolean) {
        this.$emit('input', newValue);
      }
    }
  },
  watch: {
    value(newValue: boolean) {
      if (newValue) {
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
    objectType(_newValue: string, oldValue: string) {
      if (oldValue) {
        this.fetchEntities({ page: 1, sortBy: 'name', sortDesc: false });
      }
    },
    filter() {
      this.$fetch();
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
    onNewSubEntities(items: { type: string; id: string }[]) {
      this.selectedItems = items;
    },
    async fetchEntities(options: { page: number; sortBy: string; sortDesc: boolean }) {
      this.loading = true;
      let _objectType = '';

      // If add type is scope, only load scopes
      if (this.addType === 'scope') {
        _objectType = 'scope';
      } else if (this.addType === 'entity') {
        // If add type is entity and parent type is scope, allow the user to choose all object types but scope
        if (this.editedEntity?.type === 'scope') {
          _objectType = this.objectType;
        } else {
          // If add type is entity and parent type is anything but scope, only show entities of the same type
          _objectType = (this.editedEntity as IVeoEntity).type;
        }
      }

      this.entities = await this.$api.entity.fetchAll(_objectType, options.page, {
        size: this.$user.tablePageSize,
        sortBy: options.sortBy,
        sortOrder: options.sortDesc ? 'desc' : 'asc',
        ...(this.filter || {})
      });
      this.loading = false;
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
    "object_type": "Object type",
    "shown_objecttype": "Object type to link"
  },
  "de": {
    "add": "Hinzufügen",
    "add_subentities": "Unterobjekte zu \"{displayName}\" hinzufügen",
    "headline": "Unterobjekte bearbeiten",
    "object_type": "Objekttyp",
    "shown_objecttype": "Zu verknüpfender Objekttyp"
  }
}
</i18n>

<style lang="scss" scoped>
.search-bar-desktop {
  margin: 0 100px;
}
</style>
