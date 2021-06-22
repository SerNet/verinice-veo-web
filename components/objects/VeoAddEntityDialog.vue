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
      <v-row v-if="editedEntity && editedEntity.type === 'scope' && addType === 'entity'">
        <v-col
          lg="3"
          md="6"
          cols="12"
        >
          <span>
            Zu verknüpfender Objekttyp:
          </span>
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
      <VeoEntitySelectionList
        :selected-items="selectedItems"
        :items="entities"
        :loading="$fetchState.pending"
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
      >
        {{ $t('global.button.cancel') }}
      </v-btn>
      <v-spacer />
      <v-btn
        text
        color="primary"
        :disabled="saving"
        @click="addEntities"
      >
        {{ $t('add') }}
      </v-btn>
    </template>
  </VeoDialog>
</template>

<script lang="ts">
import Vue from 'vue';
import { upperFirst } from 'lodash';
import { Prop } from 'vue/types/options';

import { getSchemaEndpoint, getSchemaName, ISchemaEndpoint } from '~/plugins/api/schema';
import { IVeoEntity, IVeoLink, IVeoPaginatedResponse } from '~/types/VeoTypes';

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
      selectedItems: [] as { id: string; type: string }[],
      saving: false as boolean,
      entities: { items: [], page: 1, pageCount: 0, totalItemCount: 0 } as IVeoPaginatedResponse<IVeoEntity[]>,
      loading: false as boolean,
      objectType: '' as string,
      schemas: [] as ISchemaEndpoint[]
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
      let schemas = this.schemas.map((schema: ISchemaEndpoint) => ({
        text: upperFirst(schema.schemaName),
        value: schema.endpoint
      }));

      // Filter out scopes if the user wants to add objects and the parent is a scope
      if (this.editedEntity?.type === 'scope') {
        schemas = schemas.filter((item) => item.value !== 'scopes');
      }

      return schemas;
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
          const destructedLink = member.targetUri.split('/');
          const id = destructedLink.pop() || '';
          let type = destructedLink.pop() || '';
          type = getSchemaName(type) || type;

          return { id, type };
        });
      }
    },
    objectType(_newValue: string, oldValue: string) {
      if (oldValue) {
        this.fetchEntities({ page: 1, sortBy: 'name', sortDesc: false });
      }
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
          targetUri: `/${getSchemaEndpoint(item.type) || item.type}/${item.id}`
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
        sortOrder: options.sortDesc ? 'desc' : 'asc'
      });
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
    "object_type": "Object type"
  },
  "de": {
    "add": "Hinzufügen",
    "add_subentities": "Unterobjekte zu \"{displayName}\" hinzufügen",
    "headline": "Unterobjekte bearbeiten",
    "object_type": "Objekttyp"
  }
}
</i18n>
