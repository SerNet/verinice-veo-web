<script lang="ts">
import Vue from 'vue';
import { endpoints } from '~/plugins/api/schema';

export default Vue.extend({
  middleware({ redirect, params }) {
    redirect(`/${params.unit}/objects/${Object.values(endpoints)[0]}/-/list`);
  }
});
</script>
