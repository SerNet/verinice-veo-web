<!--
   - verinice.veo web
   - Copyright (C) 2021  Annemarie Bufe
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
  <div>
    <v-row>
      <v-col>
        <template
          v-for="(element, key) in filter"
        >
          <v-chip
            v-if="element"
            :key="key"
            close
            outlined
            label
            class="mr-2"
            color="primary"
            @click:close="onResetChip(key)"
            >
              {{$t(`objectlist.${key}`).toString()}}: {{element}}
          </v-chip>
        </template>
      </v-col>
      <v-col class="text-right">
        <v-btn
          icon    
          large
          color="primary"
          @click="showFilterDialog = true"
        >
          <v-icon>mdi-filter</v-icon>
        </v-btn>
        <p>{{objectType}} bumble</p>
      </v-col>
    </v-row>
    <VeoDialog
      v-model="showFilterDialog"
      :headline="'Liste filtern'">
      <template #default>
        <template v-for="(key, index) of filterFields">
          <v-list-item :key="index">
            <v-select
              v-if="key==='type'"
              v-model="filter.type"
              hide-details
              dense
              outlined
              :label="$t('objectlist.type')"
              :items="status"
              item-text="text"
              item-value="value"
            />
            <v-select
              v-else-if="key==='status'"
              v-model="filter.status"
              hide-details
              dense
              outlined
              :label="$t('objectlist.status')"
              :items="status"
              item-text="text"
              item-value="value"
            />
            <v-checkbox
              v-else-if="key === 'notPartOfGroup'"
              v-model="filter[key]"
              :label="$t('objectlist.notPartOfGroup')"
            />
            <v-checkbox
              v-else-if="key === 'hasChildObjects'"
              v-model="filter[key]"
              :label="$t('objectlist.hasChildObjects')"
            />
            <v-checkbox
              v-else-if="key === 'hasLinks'"
              v-model="filter[key]"
              :label="$t('objectlist.hasLinks')"
            />
            <v-text-field
              v-else
              v-model="filter[key]"
              hide-details
              dense
              outlined
              :placeholder="$t(`objectlist.${key}`).toString()"
            />
          </v-list-item>
        </template>
      </template>
      <v-divider></v-divider>
      <template #dialog-options>
        <v-btn
          color="primary"
          text
          @click="onReset"
        >
           Filter zurücksetzen
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          text
          @click="onSubmit"
        >
          Filter anwenden
        </v-btn>
      </template>
    </VeoDialog>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, computed, Ref, watch } from '@nuxtjs/composition-api';
import { useI18n } from 'nuxt-i18n-composable';
import { IVeoTranslations } from '~/types/VeoTypes';

export interface IVeoFilter {
  type: string | undefined;
  designator: string | undefined;
  name: string | undefined;
  status: string | undefined;
  description: string | undefined;
  updatedBy: string | undefined;
  notPartOfGroup?: boolean | undefined;
  hasChildObjects?: boolean | undefined;
  hasLinks?: boolean | undefined;
  [key: string]: string | boolean | undefined;
}

enum Status {
  NEW = 'NEW',
  IN_PROGRESS = 'IN_PROGRESS',
  FOR_REVIEW = 'FOR_REVIEW',
  RELEASED = 'RELEASED',
  ARCHIVED = 'ARCHIVED'
}

export default defineComponent({
  props: {
    value: {
      type: Object as PropType<IVeoFilter>,
      default: undefined
    },
    objectType: {
      type: String,
      default: undefined
    }
  },
  setup(props, context) {
    const { t, locale } = useI18n();
    const showFilterDialog = ref(false);
    const filter = ref({
      type: undefined,
      designator: undefined,
      name: undefined,
      status: undefined,
      description: undefined,
      updatedBy: undefined,
      notPartOfGroup: undefined,
      hasChildObjects: undefined,
      hasLinks: undefined
    }) as Ref<IVeoFilter>;
    const filterFields = Object.keys(filter.value);
    const translations = { lang: {} } as IVeoTranslations;

    watch(
      () => props.value,
      (newValue: IVeoFilter) => {
        filter.value = { ...newValue };
      }
    );

    const status = computed(() => [
      {
        value: Status.NEW,
        text: translations.lang?.[locale.value]?.process_status_NEW || 'NEW'
      },
      {
        value: Status.IN_PROGRESS,
        text: translations.lang?.[locale.value]?.process_status_IN_PROGRESS || 'IN_PROGRESS'
      },
      {
        value: Status.FOR_REVIEW,
        text: translations.lang?.[locale.value]?.process_status_FOR_REVIEW || 'FOR_REVIEW'
      },
      {
        value: Status.RELEASED,
        text: translations.lang?.[locale.value]?.process_status_RELEASED || 'RELEASED'
      },
      {
        value: Status.ARCHIVED,
        text: translations.lang?.[locale.value]?.process_status_ARCHIVED || 'ARCHIVED'
      }
    ]);

    function onSubmit() {
      showFilterDialog.value = false;
      for (const prop in filter.value) {
        if (filter.value[prop] === '') {
          filter.value[prop] = undefined;
        }
      }
      context.emit('input', filter.value);
    }

    function onResetChip(key: string) {
      filter.value[key] = undefined;
      context.emit('reset', filter.value);
    }

    function onReset() {
      showFilterDialog.value = false;
      Object.keys(filter.value).forEach((prop) => (filter.value[prop] = undefined));
      context.emit('reset', filter.value);
    }

    return { t, filter, filterFields, showFilterDialog, status, onSubmit, onReset, onResetChip, translations };
  },
  async fetch() {
    this.translations = await this.$api.translation.fetch(this.$i18n.locales as any);
  }
});
</script>

<style lang="scss" scoped>

</style>

<i18n>
{
  "en": {
    "search": "Search..."
  },
  "de": {
    "search": "Suche..."
  }
}
</i18n>