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
        <p>bumble {{value}} bumble value in veofilterdialog</p>
        <p>bumble {{filter}} bumble filter in veofilterdialog</p>


          <v-btn
            icon
            large
            color="primary"
            @click="showFilterDialog = true"
          >
            <v-icon>mdi-home</v-icon>
          </v-btn>

<VeoDialog
v-model="showFilterDialog"
:headline="'Liste filtern'">

        <template #default>
          <v-list-item>
            <v-list-item-content>
              <template v-for="(key, index) of filterFields">
                <v-select
                  v-if="key==='status'"
                  :key="index + '_s'"
                  v-model="filter.status"
                  hide-details
                  dense
                  outlined
                  :label="$t('objectlist.status')"
                  :items="status"
                  item-text="text"
                  item-value="value"
                />
                <v-text-field
                  v-if="key!=='status'"
                  :key="index"
                  v-model="filter[key]"
                  hide-details
                  dense
                  outlined
                  :placeholder="$t(`objectlist.${key}`).toString()"
                />
              </template>
            </v-list-item-content>
          </v-list-item>

          <v-list-item>
            <v-list-item-content>
              <v-list-item-title>{{filterFields}}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-card-text>
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
  designator: string | undefined;
  name: string | undefined;
  status: string | undefined;
  description: string | undefined;
  updatedBy: string | undefined;
  [key: string]: string | undefined;
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
    const filter = ref({ designator: undefined, name: undefined, status: undefined, description: undefined, updatedBy: undefined }) as Ref<IVeoFilter>;
    const filterFields = Object.keys(filter.value);
    const translations = { lang: {} } as IVeoTranslations;

    /*     watch(
      () => filter,
      (newValue: IVeoFilter, oldValue: IVeoFilter) => {
        filter = { ...newValue };
        console.log('watch newValue veofilterdialog', newValue);
        console.log('watch oldValue veofilterdialog', oldValue);
        console.log('watch filter veofilterdialog', filter);
        console.log('watch props.value veofilterdialog', props.value);
      }
    ); */

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
      console.log('function filter ----------------');
      for (const prop in filter.value) {
        console.log('bla', prop, filter.value[prop], 'bla');

        showFilterDialog.value = false;
        if (filter.value[prop] === '') {
          filter.value[prop] = undefined;
        }
      }
      context.emit('input', filter.value);
    }

    function onReset() {
      showFilterDialog.value = false;
      Object.keys(filter.value).forEach((prop) => (filter.value[prop] = undefined));
      console.log('onReset filterdialog filter', filter.value);
      context.emit('reset', filter.value);
    }

    return { t, filter, filterFields, showFilterDialog, status, onSubmit, onReset, translations };
  },
  async fetch() {
    this.translations = await this.$api.translation.fetch(this.$i18n.locales as any);
    console.log('translations', this.translations);
  },
  watch: {
    value: {
      handler(newValue: IVeoFilter) {
        this.filter = { ...newValue };
      },
      immediate: true
    }
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