<!--
   - verinice.veo web
   - Copyright (C) 2021  Jonas Heitmann, Jessica Lühnen, Annemarie Bufe
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
  <v-form
    ref="form"
    width="100%"
    @submit.prevent="onSubmit"
  >
    <v-row no-gutters>  
      <v-col
        class="d-flex mb-4"
      >
        <template v-for="(key, index) of filterFields">
          <v-select
            v-if="key==='status'"
            :key="index + '_s'"
            v-model="filter.status"
            hide-details
            dense
            outlined
            class="veo-list-searchbar__input"
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
            :class="{ 'veo-list-searchbar__first-input': index === 0, 'veo-list-searchbar__input': index > 0 }"
            :placeholder="$t(`objectlist.${key}`).toString()"
          />
        </template>

        <v-btn
          outlined
          color="primary"
          class="veo-list-searchbar__button"
          role="submit"
          type="submit"
        >
          <v-icon>
            mdi-magnify
          </v-icon>
        </v-btn>
        <v-btn
          outlined
          color="primary"
          class="veo-list-searchbar__last-button"
          :disabled="resetDisabled"
          @click="reset"
        >
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </v-col>
    </v-row>
  </v-form>
</template>

<script lang="ts">
import Vue from 'vue';
import { Prop } from 'vue/types/options';
import { omit } from 'lodash';
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

export default Vue.extend({
  props: {
    value: {
      type: Object as Prop<IVeoFilter>,
      default: undefined
    },
    objectType: {
      type: String,
      default: undefined
    }
  },
  data() {
    return {
      filter: {
        designator: undefined,
        name: undefined,
        status: undefined,
        description: undefined,
        updatedBy: undefined
      } as IVeoFilter,
      translations: { lang: {} } as IVeoTranslations
    };
  },
  async fetch() {
    this.translations = await this.$api.translation.fetch(this.$i18n.locales as any);
  },
  computed: {
    filterFields(): string[] {
      return Object.keys(this.filter);
    },
    resetDisabled(): boolean {
      return Object.values(this.filter).every((f: any) => !f);
    },
    status(): { value: string; text: string }[] {
      return [
        {
          value: Status.NEW,
          text: this.translations.lang?.[this.$i18n.locale]?.process_status_NEW || 'NEW'
        },
        {
          value: Status.IN_PROGRESS,
          text: this.translations.lang?.[this.$i18n.locale]?.process_status_IN_PROGRESS || 'IN_PROGRESS'
        },
        {
          value: Status.FOR_REVIEW,
          text: this.translations.lang?.[this.$i18n.locale]?.process_status_FOR_REVIEW || 'FOR_REVIEW'
        },
        {
          value: Status.RELEASED,
          text: this.translations.lang?.[this.$i18n.locale]?.process_status_RELEASED || 'RELEASED'
        },
        {
          value: Status.ARCHIVED,
          text: this.translations.lang?.[this.$i18n.locale]?.process_status_ARCHIVED || 'ARCHIVED'
        }
      ];
    }
  },
  watch: {
    value: {
      handler(newValue: IVeoFilter) {
        this.filter = { ...newValue };
      },
      immediate: true
    }
  },
  methods: {
    onSubmit() {
      for (const prop in this.filter) {
        if (this.filter[prop] === '') {
          this.filter[prop] = undefined;
        }
      }
      this.$emit('input', this.filter);
    },
    reset() {
      Object.keys(this.filter).forEach((k) => (this.filter[k] = undefined));
      this.$emit('reset', this.filter);
    },
    omit
  }
});
</script>

<style lang="scss" scoped>
.veo-list-searchbar__button {
  border-radius: 0;
  height: auto !important;
  border-right: 0;
}

.veo-list-searchbar__last-button {
  border-bottom-left-radius: 0;
  border-top-left-radius: 0;
  height: auto !important;
}

.veo-list-searchbar__first-input {
  border-bottom-right-radius: 0;
  border-top-right-radius: 0;
}

.veo-list-searchbar__input {
  border-radius: 0;
}
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