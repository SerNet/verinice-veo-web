<template>
  <VeoWidget :title="$t('myLatestRevisions')">
    <ul>
      <li>Revision 1</li>
      <li>Revision 1</li>
      <li>Revision 1</li>
    </ul>
  </VeoWidget>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  props: {},
  async fetch() {
    const test = await this.$api.history.fetchLatest();
    console.log(test);
  }
});
</script>

<style lang="scss" scoped>
p {
  margin-bottom: 4px !important;
}

.v-card__text {
  font-size: 1rem;
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