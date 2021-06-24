<script lang="ts">
import Vue from 'vue';

import VeoScopesEditPage from '~/pages/_unit/scopes/_entity/edit.vue';

export default Vue.extend({
  extends: VeoScopesEditPage,
  computed: {
    rootRoute(): string {
      return `/${this.$route.params.unit}/objects/${this.$route.params.type}`;
    }
  }
});
</script>
