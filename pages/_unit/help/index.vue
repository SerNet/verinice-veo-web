<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  middleware({ redirect, route }) {
    redirect(`${route.path}/forms/docs`)
  }
})
</script>

<style lang="scss" scoped>

</style>
