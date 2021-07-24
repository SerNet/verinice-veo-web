<template>
  <v-row no-gutters>
    <v-col cols="4">
      <v-select
        hide-details
        dense
        outlined
        class="veo-list-searchbar__select"
        :label="$t('property')"
        :items="searchableFields"
      />
    </v-col>
    <v-col cols="8">
      <v-text-field
        hide-details
        dense
        outlined
        class="veo-list-searchbar__input"
        :placeholder="$t('search')"
      />
    </v-col>
  </v-row>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  props: {
    objectType: {
      type: String,
      default: undefined
    }
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
          text: this.$t('objectlist.updatedby').toString(),
          value: 'editor'
        },
        ...(this.objectType === 'status'
          ? [
              {
                text: this.$t('objectlist.status').toString(),
                value: 'status'
              }
            ]
          : [])
      ];
    }
  }
});
</script>

<style lang="scss" scoped>
.veo-list-searchbar__select {
  border-bottom-right-radius: 0;
  border-top-right-radius: 0;
}

.veo-list-searchbar__input {
  border-bottom-left-radius: 0;
  border-top-left-radius: 0;
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