<script lang="ts">
import Vue from 'vue'

import List from '~/pages/_unit/objects/_type/_entity/list.vue'
import VeoObjectTree, { ITreeEntry } from '~/components/objects/VeoObjectTree.vue'
import { IVeoEntity } from '~/types/VeoTypes'

export default Vue.extend({
  extends: List,
  components: {
    VeoObjectTree
  },
  data() {
    return {
      component: VeoObjectTree,
      activeView: 1
    }
  },
  methods: {
    sortingFunction(a: ITreeEntry, b: ITreeEntry) {
      if(a.entry && b.entry) {
        return a.entry.name.localeCompare(b.entry.name)
      } else {
        return 0
      }
    },
    loadSubEntities(parent: ITreeEntry) {
      let id = 0;
      return this.$api.entity.fetchSubEntities(this.$route.params.type, parent.entry.id).then((data: IVeoEntity[]) => {
        parent.children = data.map((item: IVeoEntity) => {
          if (item.parts.length > 0) {
            return { entry: item, children: [] as ITreeEntry[], id: parent.id + '.'+id++ }
          } else {
            return { entry: item, id: parent.id + '.'+id++ }
          }
        }).sort(this.sortingFunction)
      })
    },
  }
})
</script>

<style lang="scss" scoped></style>
