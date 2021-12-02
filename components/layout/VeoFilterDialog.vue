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
        <!-- bumble chips raus nehmen, dass sind keine Akzeptanzkriterien -->
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
      </v-col>

    </v-row>
    <VeoDialog
      v-model="showFilterDialog"
      :headline="'Liste filtern'"
      :close-hidden="true"
      :persistent="true">
      <template #default>
        <template v-for="(key, index) of (expanded ? filterFieldsExpanded : filterFieldsReduced)">
          <v-list-item :key="index">
            <v-select
              v-if="key==='objectType'"
              v-model="filter.objectType"
              hide-details
              dense
              outlined
              :label="objectTypeRequired ? $t('objectlist.objectType') + '*' : $t('objectlist.objectType')"
              :items="formattedObjectTypes"
              item-text="text"
              item-value="value"
              :rules="objectTypeRequired ? [(v) => !!v || 'Required'] : []"
              :required="objectTypeRequired"
            />
              <v-select
              v-else-if="key==='subType'"
              v-model="filter.subType"
              :disabled="!filter.objectType"
              hide-details
              dense
              outlined
              :label="$t('objectlist.subType')"
              :items="formattedSubTypes"
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
        <v-btn
          text
          class="text-center"
          @click="toggle"
        >
          <template v-if="expanded">
             {{$t(`global.button.showLess`)}}
          </template>
          <template v-else>
             {{$t(`global.button.showMore`)}}
          </template>
        </v-btn>
      </template>
      <v-divider></v-divider>

      <template #dialog-options>
        <v-btn
          color="primary"
          text
          @click="onReset"
        >
          {{$t(`resetFilter`)}}
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          text
          :disabled="objectTypeRequired && (filter.objectType === undefined)"
          @click="onSubmit"
        >
          {{$t(`submitFilter`)}}
        </v-btn>
      </template>
    </VeoDialog>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, computed, Ref, watch, useFetch, useContext } from '@nuxtjs/composition-api';
import { useI18n } from 'nuxt-i18n-composable';
import { capitalize } from 'lodash';
import { IVeoTranslations } from '~/types/VeoTypes';
import { IVeoSchemaEndpoint } from '~/plugins/api/schema';

export interface IVeoFilter {
  objectType: string | undefined;
  subType: string | undefined;
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
    objectTypeRequired: {
      type: Boolean,
      default: false
    },
    objectType: {
      type: String,
      default: undefined
    },
    presetFilter: {
      type: Object as PropType<IVeoFilter>,
      default: undefined
    }
  },
  setup(props, context) {
    const { t, locale } = useI18n();
    const { $api } = useContext();
    let translations = { lang: {} } as IVeoTranslations;

    const showFilterDialog = ref(false);
    const filter = ref({
      objectType: props.objectType,
      subType: undefined,
      designator: undefined,
      name: undefined,
      status: undefined,
      description: undefined,
      updatedBy: undefined,
      notPartOfGroup: undefined,
      hasChildObjects: undefined,
      hasLinks: undefined
    }) as Ref<IVeoFilter>;

    const filterFieldsReduced = ['objectType', 'subType', 'designator', 'name', 'status'];
    const filterFieldsExpanded = Object.keys(filter.value);

    const expanded = ref(false);
    const preset = ref(false);

    const formattedObjectTypes = ref([]) as Ref<any>;
    const formattedSubTypes = ref([]) as Ref<any>;

    useFetch(async () => {
      translations = await $api.translation.fetch(locale as any);
    });

    useFetch(async () => {
      const schema = await $api.schema.fetchAll();
      formattedObjectTypes.value = schema.map((value: any) => ({
        text: capitalize(value.schemaName),
        value: value.schemaName
      }));
    });

    useFetch(async () => {
      const forms = await $api.form.fetchAll();
      formattedSubTypes.value = forms
        .filter((value: any) => value.modelType === filter.value.objectType)
        .map((value: any) => ({
          text: value.subType,
          value: value.subType
        }));
    });

    watch(
      () => props.value,
      (newValue: IVeoFilter) => {
        if (preset.value === false) {
          filter.value = props.presetFilter;
          preset.value = true;
        } else {
          filter.value = { ...newValue };
        }
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
      if (props.objectTypeRequired) {
        if (filter.value.objectType) {
          showFilterDialog.value = false;
          for (const prop in filter.value) {
            if (filter.value[prop] === '') {
              filter.value[prop] = undefined;
            }
          }
          context.emit('input', filter.value);
        }
      } else {
        showFilterDialog.value = false;
        for (const prop in filter.value) {
          if (filter.value[prop] === '') {
            filter.value[prop] = undefined;
          }
        }
        context.emit('input', filter.value);
      }
    }
    function toggle() {
      expanded.value = !expanded.value;
    }

    function onResetChip(key: string) {
      filter.value[key] = undefined;
      context.emit('reset', filter.value);
    }

    function onReset() {
      showFilterDialog.value = false;
      preset.value = false;
      if (props.presetFilter) {
        filter.value = props.presetFilter;
      } else {
        Object.keys(filter.value).forEach((prop) => (filter.value[prop] = undefined));
      }
      context.emit('reset', filter.value);
    }

    return {
      t,
      formattedSubTypes,
      formattedObjectTypes,
      filter,
      filterFieldsReduced,
      filterFieldsExpanded,
      expanded,
      toggle,
      showFilterDialog,
      status,
      onSubmit,
      onReset,
      onResetChip
    };
  }
});
</script>

<style lang="scss" scoped>

</style>

<i18n>
{
  "en": {
    "resetFilter": "Reset Filter",
    "submitFilter": "Submit Filter"
  },
  "de": {
    "resetFilter": "Filter zurücksetzen",
    "submitFilter": "Filter anwenden"
  }
}
</i18n>