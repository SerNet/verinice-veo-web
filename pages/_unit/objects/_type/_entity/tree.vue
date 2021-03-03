<script lang="ts">
import List from '~/pages/_unit/objects/_type/_entity/list.vue'
import VeoObjectTree from '~/components/objects/VeoObjectTree.vue'

export default List.extend({
  components: {
    VeoObjectTree
  },
  data() {
    return {
      component: VeoObjectTree,
      activeView: 1
    }
  }
})
</script>

<style lang="scss" scoped></style>
