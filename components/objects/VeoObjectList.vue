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
    @click:row="sendEvent('click', $event)"
    @update:items-per-page="onPageSizeChange"
    @update:sort-by="refetch"
    @update:sort-desc="refetch"
  >
    <template #no-data>
      <span
        v-if="$route.params.param === '-'"
        class="text-center"
      >{{ $t('no_objects') }}</span>
      <span
        v-else
        class="text-center"
      >
        {{ $t('no_child_objects') }}
        <nuxt-link :to="editItemLink">{{ $t('object_edit') }}</nuxt-link>
      </span>
    </template>
    <template
      v-if="showParentLink"
      #body.prepend
    >
      <tr @click="$emit('navigate-parent')">
        <td>
          <v-icon>mdi-arrow-left</v-icon>
        </td>
        <td colspan="5">
          <i>{{ $t('parent_object') }}</i>
        </td>
      </tr>
    </template>
    <template #item.designator="{ item }">
      <div class="veo-object-list__abbreviation nowrap">
        <v-tooltip
          v-if="item.type !== 'scope' && item.parts.length > 0"
          bottom
        >
          <template #activator="{ on }">
            <v-icon v-on="on">
              mdi-file-document-multiple
            </v-icon>
          </template>
          <template #default>
            <span class="d-inline-block text-center">
              {{ $t('object_has_subobjects') }}
              <br>
              {{ $t('object_has_subobjects_amount', { amount: item.parts.length }) }}
            </span>
          </template>
        </v-tooltip>
        <v-tooltip
          v-else-if="item.type === 'scope' && item.members.length > 0"
          bottom
        >
          <template #activator="{ on }">
            <v-icon v-on="on">
              mdi-archive-arrow-down
            </v-icon>
          </template>
          <template #default>
            <span
              class="d-inline-block text-center"
            >{{ $t('scope_children', { amount: item.members.length }) }}</span>
          </template>
        </v-tooltip>
        <v-tooltip
          v-else-if="item.type === 'scope'"
          bottom
        >
          <template #activator="{ on }">
            <v-icon v-on="on">
              mdi-archive
            </v-icon>
          </template>
          <template #default>
            <span>{{ $t('scope_empty') }}</span>
          </template>
        </v-tooltip>
        <v-tooltip
          v-else
          bottom
        >
          <template #activator="{ on }">
            <v-icon v-on="on">
              mdi-file-document
            </v-icon>
          </template>
          <template #default>
            <span>{{ $t('object_has_no_subobjects') }}</span>
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
      <div class="d-flex flex-nowrap justify-end">
        <v-tooltip bottom>
          <template #activator="{on}">
            <v-btn
              icon
              @click.stop="sendEvent('edit', item, currentItem)"
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
              @click.stop="sendEvent('duplicate', item, currentItem)"
              v-on="on"
            >
              <v-icon>mdi-content-copy</v-icon>
            </v-btn>
          </template>
          <template #default>
            {{ $t('clone') }}
          </template>
        </v-tooltip>
        <v-tooltip
          v-if="$route.params.entity === '-'"
          bottom
        >
          <template #activator="{on}">
            <v-btn
              icon
              @click.stop="sendEvent('delete', item, currentItem)"
              v-on="on"
            >
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </template>
          <template #default>
            {{ $t('delete') }}
          </template>
        </v-tooltip>
        <v-tooltip
          v-else
          bottom
        >
          <template #activator="{on}">
            <v-btn
              icon
              @click.stop="sendEvent('unlink', item, currentItem)"
              v-on="on"
            >
              <v-icon>mdi-link-off</v-icon>
            </v-btn>
          </template>
          <template #default>
            {{ $t('unlink') }}
          </template>
        </v-tooltip>
      </div>
    </template>
  </v-data-table>
</template>

<script lang="ts">
import Vue from 'vue';
import { Prop } from 'vue/types/options';
import { formatDate, formatTime } from '~/lib/utils';

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
    showParentLink: {
      type: Boolean,
      default: false
    },
    currentItem: {
      type: Object as Prop<IVeoEntity | undefined>,
      default: undefined
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
    sendEvent(event: string, item: IVeoEntity, parent?: IVeoEntity) {
      this.$emit(event, { item, parent });
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
    "clone": "Clone object",
    "created_at": "Created",
    "delete": "Delete object",
    "edit": "Edit object",
    "no_objects": "There are no objects",
    "no_child_objects": "This object has no sub objects",
    "object_edit": "Edit this object",
    "object_has_no_subobjects": "Standard object",
    "object_has_subobjects": "Composite object",
    "object_has_subobjects_amount": "({amount} sub objects)",
    "parent_object": "Parent object",
    "scope_children": "Scope with members",
    "scope_empty": "Empty scope",
    "unlink": "Remove link",
    "updated_at": "Updated"
  },
  "de": {
    "by": "von",
    "clone": "Objekt klonen",
    "created_at": "Erstellt",
    "delete": "Objekt löschen",
    "edit": "Objekt bearbeiten",
    "no_objects": "Es existieren keine Objekte!",
    "no_child_objects": "Dieses Objekt hat keine Unterobjekte.",
    "object_edit": "Dieses Objekt bearbeiten",
    "object_has_no_subobjects": "Standardobjekt",
    "object_has_subobjects": "Zusammengesetztes Objekt",
    "object_has_subobjects_amount": "({amount} Unterobjekte)",
    "parent_object": "Übergeordnetes Objekt",
    "scope_children": "Scope mit Inhalt",
    "scope_empty": "Scope ohne Inhalt",
    "unlink": "Verknüpfung entfernen",
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

::v-deep .nowrap {
  white-space: nowrap;
}
</style>
