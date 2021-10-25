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
        class="d-flex"
      >
        <template v-for="(key, index) of filterFields">
          <v-select
            v-if="objectType === 'process' && key==='status'"
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
      status: [
        {
          value: Status.NEW,
          text: this.$t('status.new').toString()
        },
        {
          value: Status.IN_PROGRESS,
          text: this.$t('status.inProgress').toString()
        },
        {
          value: Status.FOR_REVIEW,
          text: this.$t('status.forReview').toString()
        },
        {
          value: Status.RELEASED,
          text: this.$t('status.released').toString()
        },
        {
          value: Status.ARCHIVED,
          text: this.$t('status.archived').toString()
        }
      ]
    };
  },
  computed: {
    filterFields(): string[] {
      return Object.keys(this.filter);
    },
    resetDisabled(): boolean {
      for (const key in this.filter) {
        if ((this.filter as { [key: string]: any })[key]) {
          return false;
        }
      }
      return true;
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
      (this.$refs.form as any).reset();
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
    "search": "Search...",
    "status": {
      "new": "New",
      "inProgress": "In progress",
      "forReview": "For review",
      "released": "Released",
      "archived": "Archived"
    }
  },
  "de": {
    "search": "Suche...",
    "status": {
      "new": "Neu",
      "inProgress": "In Bearbeitung",
      "forReview": "Zur Prüfung",
      "released": "Freigegeben",
      "archived": "Archiviert"
    }
  }
}
</i18n>