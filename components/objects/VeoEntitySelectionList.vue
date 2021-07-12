<template>
  <v-data-table
    :items="displayedItems"
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
    @click:row="selectItem($event, singleSelect)"
    @update:items-per-page="onPageSizeChange"
    @update:sort-by="refetch"
    @update:sort-desc="refetch"
  >
    <template #no-data>
      <span class="text-center">{{ $t('no_objects') }}</span>
    </template>
    <template #item.select="{ item }">
      <v-radio-group
        v-if="singleSelect"
        :value="radioSelectedItem"
      >
        <v-radio
          color="primary"
          :value="item.entity.id"
          @click.stop="selectItem(item, true)"
        />
      </v-radio-group>
      <v-checkbox
        v-else
        v-model="item.selected"
        @click.stop="selectItem(item)"
      />
    </template>
    <template #header.select>
      <v-fade-transition>
        <v-btn
          v-show="selectedItems.length"
          icon
          style="margin-left: -6px;"
          @click="$emit('new-subentities', [])"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-fade-transition>
    </template>
    <template #item.designator="{ item }">
      <div class="veo-object-list__abbreviation nowrap">
        <v-tooltip
          v-if="item.entity.type !== 'scope' && item.entity.parts.length > 0"
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
              {{ $t('object_has_subobjects_amount', { amount: item.entity.parts.length }) }}
            </span>
          </template>
        </v-tooltip>
        <v-tooltip
          v-else-if="item.entity.type === 'scope' && item.entity.members.length > 0"
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
            >{{ $t('scope_children', { amount: item.entity.members.length }) }}</span>
          </template>
        </v-tooltip>
        <v-tooltip
          v-else-if="item.entity.type === 'scope'"
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
        {{ item.entity.designator }}
      </div>
    </template>
    <template #item.name="{ item }">
      <div class="veo-object-list__title">
        {{ item.entity.abbreviation }} {{ item.entity.name }}
      </div>
    </template>
    <template #item.description="{ item }">
      <div class="veo-object-list__description">
        <v-tooltip
          v-if="item.entity.descriptionShort"
          bottom
        >
          <template #activator="{ on }">
            <span
              class="veo-object-list__abbreviation--abbreviation"
              v-on="on"
            >{{ item.entity.descriptionShort }}</span>
          </template>
          <template #default>
            <span>{{ item.entity.description }}</span>
          </template>
        </v-tooltip>
        <span v-else>{{ item.entity.description }}</span>
      </div>
    </template>
    <template #item.updatedBy="{ item }">
      {{ item.entity.updatedBy }}
    </template>
    <template #item.updatedAt="{ item }">
      <div class="veo-object-list__updated-at nowrap">
        <v-tooltip bottom>
          <template #activator="{ on }">
            <span v-on="on">{{ formatDate(item.entity.updatedAt) }}</span>
          </template>
          <template #default>
            {{ $t('created_at') }}: {{ formatDate(item.entity.createdAt) }} {{ $t('by') }} {{ item.entity.createdBy }}
            <br>
            {{ $t('updated_at') }}: {{ formatDate(item.entity.updatedAt) }} {{ $t('by') }} {{ item.entity.updatedBy }}
          </template>
        </v-tooltip>
      </div>
    </template>
  </v-data-table>
</template>

<script lang="ts">
import { clone } from 'lodash';
import Vue from 'vue';
import { Prop } from 'vue/types/options';
import { formatDate, formatTime } from '~/lib/utils';

import { IVeoEntity, IVeoPaginatedResponse } from '~/types/VeoTypes';

export default Vue.extend({
  props: {
    selectedItems: {
      type: Array as Prop<{ id: string; type: string }[]>,
      default: () => []
    },
    items: {
      type: Object as Prop<IVeoPaginatedResponse<IVeoEntity[]>>,
      default: () => ({ items: [], page: 1, pageCount: 0, totalItemCount: 0 })
    },
    loading: {
      type: Boolean,
      default: false
    },
    singleSelect: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      sortBy: 'name' as string,
      sortDesc: false as boolean
    };
  },
  computed: {
    displayedItems(): { entity: IVeoEntity; selected: boolean }[] {
      return this.items.items.map((item) => {
        // For some reason setting a max width on a table cell gets ignored when calculating each columns width, so we have to manipulate the data
        if (item.description && item.description.length > 40) {
          item.descriptionShort = item.description.substring(0, 40) + '...';

          if (item.description.length > 1000) {
            item.description = item.description.substring(0, 1000) + '...';
          }
        }

        return {
          entity: item,
          selected: this.selectedItems.some((selectedItem) => {
            return selectedItem.id === item.id;
          })
        };
      });
    },
    headers(): any[] {
      return [
        {
          filterable: false,
          sortable: false,
          text: '',
          value: 'select',
          width: 32
        },
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
        }
      ];
    },
    // As the radio button needs a wrapper and this wapper has no comparator function (even though the docs says it does), we have to dumb it down)
    radioSelectedItem() {
      return this.selectedItems[0]?.id;
    },
    itemsPerPage(): number {
      return this.$user.tablePageSize;
    },
    page: {
      set(page: number) {
        this.$emit('page-change', { page, sortBy: this.sortBy, sortDesc: this.sortDesc });
      },
      get(): number {
        return this.items.page;
      }
    }
  },
  methods: {
    formatDate(date: string) {
      return formatDate(new Date(date)) + ' ' + formatTime(new Date(date));
    },
    selectItem(item: { entity: IVeoEntity; selected: boolean }, singleItem: boolean = false) {
      let dummy = clone(this.selectedItems);

      if (singleItem) {
        this.$emit('new-subentities', [{ id: item.entity.id, type: item.entity.type }]);
      } else if (dummy.some((selectedItem) => selectedItem.id === item.entity.id)) {
        dummy = dummy.filter((selectedItem) => selectedItem.id !== item.entity.id);
        this.$emit('new-subentities', dummy);
      } else {
        dummy.push({ id: item.entity.id, type: item.entity.type });
        this.$emit('new-subentities', dummy);
      }
    },
    onPageSizeChange(newSize: number | undefined) {
      if (newSize) {
        this.$user.tablePageSize = newSize;
        this.refetch();
      }
    },
    refetch() {
      this.$emit('refetch', {
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
    "created_at": "Created",
    "no_objects": "There are no objects",
    "object_has_no_subobjects": "Standard object",
    "object_has_subobjects": "Composite object",
    "object_has_subobjects_amount": "({amount} sub objects)",
    "scope_children": "Scope with members",
    "scope_empty": "Empty scope",
    "updated_at": "Updated"
  },
  "de": {
    "by": "von",
    "created_at": "Erstellt",
    "no_objects": "Es existieren keine Objekte!",
    "object_has_no_subobjects": "Standardobjekt",
    "object_has_subobjects": "Zusammengesetztes Objekt",
    "object_has_subobjects_amount": "({amount} Unterobjekte)",
    "scope_children": "Scope mit Inhalt",
    "scope_empty": "Scope ohne Inhalt",
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
