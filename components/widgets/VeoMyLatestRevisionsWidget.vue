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
              :to="createUrlByType(revision)"
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
import { IVeoFormSchemaMeta, IVeoObjectHistoryEntry } from '~/types/VeoTypes';

export default Vue.extend({
  props: {},
  data() {
    return {
      revisions: [] as IVeoObjectHistoryEntry[],
      forms: [] as IVeoFormSchemaMeta[]
    };
  },
  async fetch() {
    this.revisions = await this.$api.history.fetchLatest(this.unitId);
    this.forms = await this.$api.form.fetchAll();
  },
  computed: {
    unitId() {
      return separateUUIDParam(this.$route.params.unit).id;
    }
  },
  methods: {
    createUUIDUrlParam,
    createUrlByType(revision: IVeoObjectHistoryEntry) {
      let url = '';
      if (revision.content.type === 'asset') {
        const form = this.forms.find((form) => form.subType === 'AST_Datatype');
        url = `/${this.$route.params.unit}/domains/${this.$route.params.domain}/forms/${createUUIDUrlParam('form', form?.id || '')}/${createUUIDUrlParam(
          'asset',
          revision.content.id
        )}`;
      } else if (revision.content.type === 'scope') {
        url = `/${this.$route.params.unit}/scopes/${createUUIDUrlParam('scope', revision.content.id)}/edit`;
      } else {
        url = `/${this.$route.params.unit}/objects/${revision.uri.split('/')[1]}/${createUUIDUrlParam(revision.content.type, revision.content.id)}/edit`;
      }
      return url;
    }
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