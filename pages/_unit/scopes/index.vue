<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  middleware({ redirect, params }) {
    redirect(`/${params.unit}/scopes/-/list`)
  }
})
</script>

<style lang="scss" scoped></style>
