<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  validate({ redirect }) {
    redirect('/help/forms/docs')
    return false
  }
})
</script>

<style lang="scss" scoped>

</style>
