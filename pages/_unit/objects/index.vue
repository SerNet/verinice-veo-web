<script lang="ts">
import Vue from 'vue'
import { endpoints } from '~/plugins/api/schema'

export default Vue.extend({
  middleware({ redirect, params }) {
    for (let entry in endpoints) {
      // @ts-ignore
      redirect(`/${params.unit}/objects/${endpoints[entry]}/-/list`)
      break
    }
  }
})
</script>
