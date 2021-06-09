<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  middleware({ route, redirect }) {
    redirect(`/${route.params.unit}`);
  }
});
</script>
