<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  validate({ redirect, route }) {
    redirect(`${route.path}/forms/docs`)
    return false
  }
})
</script>

<style lang="scss" scoped>

</style>
