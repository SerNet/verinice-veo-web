<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  middleware({ redirect, route }) {
    redirect(
      `/${route.path
        .split('/')
        .filter((el: string) => el !== '')
        .slice(0, -1)
        .join('/')}/`
    )
  }
})
</script>

<style lang="scss" scoped></style>
