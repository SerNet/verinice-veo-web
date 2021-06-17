<template>
  <VeoPage :title="$t('moreModules')">
    <span>Soon</span>
  </VeoPage>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  head() {
    return {
      title: this.$t('moreModules').toString()
    };
  }
});
</script>

<i18n>
{
  "en": {
    "moreModules": "More modules"
  },
  "de": {
    "moreModules": "Weitere Module"
  }
}
</i18n>
