<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  middleware({ params, redirect }) {
    redirect(`/${params.unit}`);
  }
});
</script>
