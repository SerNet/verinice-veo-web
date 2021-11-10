<!--
   - verinice.veo web
   - Copyright (C) 2021  Jonas Heitmann, Davit Svandize, Tino Groteloh, Jessica Lühnen
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
          v-show="(value && value.length) || selectedItems.length"
          icon
          style="margin-left: -6px;"
          @click="clearSelection"
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
    <template #item.status="{ item }">
      {{ translations.lang && translations.lang[$i18n.locale] ? translations.lang[$i18n.locale][convertStatusToI18nKey(item.entity)] : item.entity.domains[domainId] ? item.entity.domains[domainId].status : '' }}
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
import Vue from 'vue';
import { Prop } from 'vue/types/options';
import { formatDate, formatTime } from '~/lib/utils';

import { IVeoEntity, IVeoPaginatedResponse, IVeoTranslations } from '~/types/VeoTypes';

export default Vue.extend({
  props: {
    value: {
      type: Array as Prop<{ id: string; type: string }[]>,
      default: undefined
    },
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
    },
    objectType: {
      type: String,
      default: undefined
    }
  },
  data() {
    return {
      sortBy: 'name' as string,
      sortDesc: false as boolean,
      translations: { lang: {} } as IVeoTranslations
    };
  },
  async fetch() {
    this.translations = await this.$api.translation.fetch(this.$i18n.locales as any);
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
          selected: this.value?.some((selectedItem) => selectedItem.id === item.id) || this.selectedItems.some((selectedItem) => selectedItem.id === item.id)
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
          value: 'designator',
          width: 120
        },
        {
          text: this.$t('objectlist.name'),
          value: 'name'
        },
        {
          text: this.$t('objectlist.status'),
          value: 'status',
          width: 100
        },
        {
          text: this.$t('objectlist.description'),
          filterable: false,
          sortable: false,
          value: 'description'
        },
        {
          text: this.$t('objectlist.updatedBy'),
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
      return this.value?.[0]?.id || this.selectedItems[0]?.id;
    },
    itemsPerPage(): number {
      return this.$user.tablePageSize;
    },
    domainId(): string {
      return this.$user.lastDomain || '';
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
      let newValues;

      if (this.value) {
        newValues = [...this.value];
      } else {
        newValues = [...this.selectedItems];
      }

      if (singleItem) {
        newValues = [{ id: item.entity.id, type: item.entity.type }];
      } else if (newValues.some((selectedItem) => selectedItem.id === item.entity.id)) {
        newValues = newValues.filter((selectedItem) => selectedItem.id !== item.entity.id);
      } else {
        newValues.push({ id: item.entity.id, type: item.entity.type });
      }

      this.$emit('new-subentities', newValues);
      this.$emit('input', newValues);
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
    },
    convertStatusToI18nKey(entity: IVeoEntity): string {
      const domainDetails = entity.domains[this.domainId];

      return domainDetails ? `${this.objectType}_${domainDetails.subType}_status_${domainDetails.status}` : '';
    },
    clearSelection() {
      this.$emit('new-subentities', []);
      this.$emit('input', []);
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
