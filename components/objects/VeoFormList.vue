<template>
  <v-data-table
    :items="displayedItems.items"
    item-key="id"
    :headers="headers"
    :items-per-page="itemsPerPage"
    :loading="loading"
    :options="{ mustSort: true }"
    :page.sync="page"
    :server-items-length="items.totalItemCount"
    :footer-props="{ itemsPerPageOptions: [ 5, 10, 25, 50 ] }"
    :sort-by.sync="sortBy"
    :sort-desc.sync="sortDesc"
    class="veo-object-list"
    :data-cy="$utils.prefixCyData($options, 'forms-table')"
    @update:items-per-page="onPageSizeChange"
    @update:sort-by="refetch"
    @update:sort-desc="refetch"
  >
    <template #no-data>
      <span class="text-center">{{ $t('no_objects') }}</span>
    </template>
    <template #item.designator="{ item }">
      <div class="veo-object-list__abbreviation nowrap">
        <v-tooltip bottom>
          <template #activator="{ on }">
            <v-icon v-on="on">
              mdi-format-list-checks
            </v-icon>
          </template>
          <template #default>
            <span>{{ $t('form') }}</span>
          </template>
        </v-tooltip>
        {{ item.designator }}
      </div>
    </template>
    <template #item.name="{ item }">
      <div class="veo-object-list__title">
        {{ item.abbreviation }} {{ item.name }}
      </div>
    </template>
    <template #item.description="{ item, value }">
      <div class="veo-object-list__description">
        <v-tooltip
          v-if="item.descriptionShort"
          bottom
        >
          <template #activator="{ on }">
            <span
              class="veo-object-list__abbreviation--abbreviation"
              v-on="on"
            >{{ item.descriptionShort }}</span>
          </template>
          <template #default>
            <span>{{ value }}</span>
          </template>
        </v-tooltip>
        <span v-else>{{ value }}</span>
      </div>
    </template>
    <template #item.updatedAt="{ item }">
      <div class="veo-object-list__updated-at nowrap">
        <v-tooltip bottom>
          <template #activator="{ on }">
            <span v-on="on">{{ formatDate(item.updatedAt) }}</span>
          </template>
          <template #default>
            {{ $t('created_at') }}: {{ formatDate(item.createdAt) }} {{ $t('by') }} {{ item.createdBy }}
            <br>
            {{ $t('updated_at') }}: {{ formatDate(item.updatedAt) }} {{ $t('by') }} {{ item.updatedBy }}
          </template>
        </v-tooltip>
      </div>
    </template>
    <template #item.actions="{ item }">
      <div class="veo-object-list__actions">
        <v-tooltip bottom>
          <template #activator="{on}">
            <v-btn
              icon
              :data-cy="$utils.prefixCyData($options, 'edit-item')"
              @click.stop="sendEvent('edit', item, true)"
              v-on="on"
            >
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
          </template>
          <template #default>
            {{ $t('edit') }}
          </template>
        </v-tooltip>
        <v-tooltip bottom>
          <template #activator="{on}">
            <v-btn
              icon
              :data-cy="$utils.prefixCyData($options, 'clone-item')"
              @click.stop="sendEvent('duplicate', item)"
              v-on="on"
            >
              <v-icon>mdi-content-copy</v-icon>
            </v-btn>
          </template>
          <template #default>
            {{ $t('clone') }}
          </template>
        </v-tooltip>
        <v-tooltip bottom>
          <template #activator="{on}">
            <v-btn
              icon
              :data-cy="$utils.prefixCyData($options, 'delete-item')"
              @click.stop="sendEvent('delete', item)"
              v-on="on"
            >
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </template>
          <template #default>
            {{ $t('delete') }}
          </template>
        </v-tooltip>
      </div>
    </template>
  </v-data-table>
</template>

<script lang="ts">
import Vue from 'vue';
import { Prop } from 'vue/types/options';
import { createUUIDUrlParam, formatDate, formatTime } from '~/lib/utils';

import { IVeoEntity, IVeoPaginatedResponse } from '~/types/VeoTypes';

export default Vue.extend({
  props: {
    items: {
      type: Object as Prop<IVeoPaginatedResponse<IVeoEntity[]>>,
      default: () => ({ items: [], page: 1, pageCount: 0, totalItemCount: 0 })
    },
    loading: {
      type: Boolean,
      default: false
    },
    rootRoute: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      sortBy: 'name' as string,
      sortDesc: false as boolean
    };
  },
  computed: {
    displayedItems(): IVeoPaginatedResponse<IVeoEntity[]> {
      this.items.items.map((item) => {
        // For some reason setting a max width on a table cell gets ignored when calculating each columns width, so we have to manipulate the data
        if (item.description && item.description.length > 40) {
          item.descriptionShort = item.description.substring(0, 40) + '...';

          if (item.description.length > 1000) {
            item.description = item.description.substring(0, 1000) + '...';
          }
        }

        return item;
      });

      return this.items;
    },
    itemsPerPage(): number {
      return this.$user.tablePageSize;
    },
    page: {
      set(page: number) {
        this.$emit('page-change', { newPage: page, sortBy: this.sortBy, sortDesc: this.sortDesc });
      },
      get(): number {
        return this.items.page;
      }
    },
    editItemLink(): string {
      return `/${this.$route.params.unit}/objects/${this.$route.params.type}/${this.$route.params.entity}/edit`;
    },
    headers(): any[] {
      return [
        {
          text: this.$t('objectlist.designator'),
          value: 'designator'
        },
        {
          text: this.$t('objectlist.title'),
          value: 'name'
        },
        {
          text: this.$t('objectlist.description'),
          filterable: false,
          sortable: false,
          value: 'description'
        },
        {
          text: this.$t('objectlist.updatedby'),
          value: 'updatedBy',
          class: 'nowrap'
        },
        {
          align: 'end',
          text: this.$t('objectlist.updatedat'),
          value: 'updatedAt'
        },
        {
          align: 'end',
          filterable: false,
          sortable: false,
          text: '',
          value: 'actions',
          width: 108 /* 3*widthOfButton */
        }
      ];
    }
  },
  methods: {
    formatDate(date: string) {
      return formatDate(new Date(date)) + ' ' + formatTime(new Date(date));
    },
    generatePath(entity: IVeoEntity) {
      return `${this.rootRoute}/${createUUIDUrlParam(entity.type, entity.id)}`;
    },
    sendEvent(event: string, item: IVeoEntity, addPath: boolean = false) {
      this.$emit(event, { item, path: addPath ? this.generatePath(item) : undefined });
    },
    onPageSizeChange(newSize: number | undefined) {
      if (newSize) {
        this.$user.tablePageSize = newSize;
        this.refetch();
      }
    },
    refetch() {
      this.$emit('refetch-data', {
        sortBy: this.sortBy,
        sortDesc: this.sortDesc,
        page: 1
      });
    }
  }
});
</script>

<i18n>
{
  "en": {
    "by": "by",
    "clone": "Clone form",
    "created_at": "Created",
    "delete": "Delete form",
    "edit": "Edit form",
    "form": "Form",
    "no_objects": "There are no forms",
    "object_edit": "Edit this form",
    "updated_at": "Updated"
  },
  "de": {
    "by": "von",
    "clone": "Formular klonen",
    "created_at": "Erstellt",
    "delete": "Formular löschen",
    "edit": "Formular bearbeiten",
    "form": "Formular",
    "no_objects": "Es existieren keine Formulare!",
    "object_edit": "Dieses Formular bearbeiten",
    "updated_at": "Aktualisiert"
  }
}
</i18n>

<style lang="scss" scoped>
@import '~/assets/vuetify.scss';

.veo-object-list {
  cursor: pointer;
}

.veo-object-list__abbreviation {
  display: flex;
  flex-wrap: nowrap;

  .veo-object-list__abbreviation--abbreviation {
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.veo-object-list__title {
  font-weight: bold;
  white-space: nowrap;
}

.veo-object-list__description {
  overflow: hidden;
  white-space: nowrap;
}

.veo-object-list__actions {
  display: flex;
  flex-wrap: nowrap;
  justify-content: flex-end;
}

::v-deep .nowrap {
  white-space: nowrap;
}
</style>
