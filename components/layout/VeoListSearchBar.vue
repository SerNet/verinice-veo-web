<template>
  <v-form
    v-model="formIsValid"
    @submit.prevent="onSubmit"
  >
    <v-row no-gutters>
      <v-col cols="4">
        <v-select
          v-model="property"
          required
          hide-details
          dense
          outlined
          :rules="rules"
          class="veo-list-searchbar__select"
          :label="$t('property')"
          :items="searchableFields"
        />
      </v-col>
      <v-col
        cols="8"
        class="d-flex"
      >
        <v-text-field
          v-model="searchValue"
          hide-details
          dense
          outlined
          class="veo-list-searchbar__input"
          :placeholder="$t('search')"
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
      </v-col>
    </v-row>
  </v-form>
</template>

<script lang="ts">
import Vue from 'vue';
import { Prop } from 'vue/types/options';

export interface IVeoFilter {
  property: string;
  value: string;
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
      property: undefined as string | undefined,
      searchValue: undefined as string | undefined,
      formIsValid: undefined as any
    };
  },
  computed: {
    searchableFields(): { text: string; value: string }[] {
      return [
        {
          text: this.$t('objectlist.designator').toString(),
          value: 'designator'
        },
        {
          text: this.$t('objectlist.title').toString(),
          value: 'name'
        },
        {
          text: this.$t('objectlist.description').toString(),
          value: 'description'
        },
        {
          text: this.$t('objectlist.updatedby').toString(),
          value: 'editor'
        },
        ...(this.objectType === 'process'
          ? [
              {
                text: this.$t('objectlist.status').toString(),
                value: 'status'
              }
            ]
          : [])
      ];
    },
    rules(): ((value: string) => boolean)[] {
      return [(value: string) => !!value && value.length > 0];
    }
  },
  watch: {
    value: {
      handler(newValue: IVeoFilter) {
        if (newValue) {
          this.property = newValue.property;
          this.searchValue = newValue.value;
        }
      },
      immediate: true
    }
  },
  methods: {
    onSubmit() {
      if (this.formIsValid) {
        this.$emit('input', {
          property: this.property,
          value: this.searchValue
        } as IVeoFilter);
      }
    }
  }
});
</script>

<style lang="scss" scoped>
.veo-list-searchbar__select {
  border-bottom-right-radius: 0;
  border-top-right-radius: 0;
}

.veo-list-searchbar__button {
  border-bottom-left-radius: 0;
  border-top-left-radius: 0;
  height: auto !important;
}

.veo-list-searchbar__input {
  border-radius: 0;
}
</style>

<i18n>
{
  "en": {
    "property": "Property",
    "search": "Search..."
  },
  "de": {
    "property": "Eigenschaft",
    "search": "Suchen..."
  }
}
</i18n>