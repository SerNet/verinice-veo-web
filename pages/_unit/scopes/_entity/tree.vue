<script lang="ts">
import Vue from 'vue'

import List from '~/pages/_unit/scopes/_entity/list.vue'
import VeoObjectTree, { ITreeEntry } from '~/components/objects/VeoObjectTree.vue'
import { IVeoEntity, IVeoScope } from '~/types/VeoTypes'
import { getSchemaEndpoint } from '~/plugins/api/schema'

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
      if(parent.entry.$type === 'scope') {
        return this.$api.scope.fetchScopeMembers(parent.entry.id).then((data: (IVeoEntity | IVeoScope)[]) => {
          parent.children = data.map((item: IVeoEntity | IVeoScope) => {
            if (item.$type === 'scope' && (item as IVeoScope).members.length > 0) {
              return { entry: item, children: [] as ITreeEntry[], id: ''+id++ }
            } else if (item.parts && item.parts.length > 0) {
              return { entry: item, children: [] as ITreeEntry[], id: parent.id + '.'+id++ }
            } else {
              return { entry: item, id: parent.id + '.'+id++ }
            }
          }).sort(this.sortingFunction)
        })
      } else {
        return this.$api.entity.fetchSubEntities(getSchemaEndpoint(parent.entry.$type) || '', parent.entry.id).then((data: IVeoEntity[]) => {
          parent.children = data.map((item: IVeoEntity) => {
            if (item.$type === 'scope' && (item as IVeoScope).members.length > 0) {
              return { entry: item, children: [] as ITreeEntry[], id: ''+id++ }
            } else if (item.parts && item.parts.length > 0) {
              return { entry: item, children: [] as ITreeEntry[], id: parent.id + '.'+id++ }
            } else {
              return { entry: item, id: parent.id + '.'+id++ }
            }
          }).sort(this.sortingFunction)
        })
      }
    },
  }
})
</script>

<style lang="scss" scoped></style>
