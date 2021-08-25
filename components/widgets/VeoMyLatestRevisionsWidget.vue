<template>
  <VeoWidget :title="$t('myLatestRevisions')">
    <v-simple-table dense>
      <tbody>
        <tr
          v-for="(revision, key) in revisions"
          :key="key"
        >
          <td>
            <nuxt-link
              :to="`/${$route.params.unit}/domains/${$route.params.domain}/forms/${createUUIDUrlParam('asset', revision.content.id)}`"
            >
              <b>{{ revision.content.designator }} {{ revision.content.name }}</b>
            </nuxt-link>
          </td>
          <td
            class="text-right"
          >
            {{ new Date(revision.time).toLocaleString($i18n.locale) }}
          </td>
        </tr>
      </tbody>
    </v-simple-table>
  </VeoWidget>
</template>

<script lang="ts">
import Vue from 'vue';
import { separateUUIDParam, createUUIDUrlParam } from '~/lib/utils';
import { IVeoObjectHistoryEntry } from '~/types/VeoTypes';

export default Vue.extend({
  props: {},
  data() {
    return {
      revisions: [] as IVeoObjectHistoryEntry[]
    };
  },
  async fetch() {
    this.revisions = await this.$api.history.fetchLatest(this.unitId);
  },
  computed: {
    unitId() {
      return separateUUIDParam(this.$route.params.unit).id;
    }
  },
  methods: {
    createUUIDUrlParam
  }
});
</script>

<style lang="scss" scoped>
a {
  text-decoration: none;
}
</style>

<i18n>
{
  "en": {
    "myLatestRevisions": "My latest edited revisions"
  },
  "de": {
    "myLatestRevisions": "Meine zuletzt bearbeiteten Objekte"
  }
}
</i18n>