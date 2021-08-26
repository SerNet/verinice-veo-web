<template>
  <v-form
    ref="form"
    @submit.prevent="onSubmit"
  >
    <v-row no-gutters>
      <v-col
        class="d-flex"
      >
        <v-text-field
          v-model="filter.designator"
          hide-details
          dense
          outlined
          class="veo-list-searchbar__first-input"
          :placeholder="$t('objectlist.designator').toString()"
        />
        <v-text-field
          v-model="filter.name"
          hide-details
          dense
          outlined
          class="veo-list-searchbar__input"
          :placeholder="$t('objectlist.title').toString()"
        />
        <v-text-field
          v-model="filter.description"
          hide-details
          dense
          outlined
          class="veo-list-searchbar__input"
          :placeholder="$t('objectlist.description').toString()"
        />
        <v-text-field
          v-model="filter.editor"
          hide-details
          dense
          outlined
          class="veo-list-searchbar__input"
          :placeholder="$t('objectlist.updatedby').toString()"
        />
        <v-select
          v-if="objectType === 'process'"
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
          @click="$refs.form.reset()"
        >
          {{ $t('global.button.reset') }}
        </v-btn>
      </v-col>
    </v-row>
  </v-form>
</template>

<script lang="ts">
import Vue from 'vue';
import { Prop } from 'vue/types/options';

export interface IVeoFilter {
  designator: string | undefined;
  name: string | undefined;
  description: string | undefined;
  editor: string | undefined;
  status: string | undefined;
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
        designator: undefined
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
      this.$emit('input', this.filter);
    }
  }
});
</script>

<style lang="scss" scoped>
.veo-list-searchbar__button {
  border-radius: 0;
  height: auto !important;
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