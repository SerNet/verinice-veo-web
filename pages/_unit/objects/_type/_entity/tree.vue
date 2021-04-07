<script lang="ts">
import Vue from 'vue'

import { separateUUIDParam } from '~/lib/utils'
import { IVeoMenuButtonItem } from '~/components/layout/VeoMenuButton.vue'
import VeoScopesTreePage from '~/pages/_unit/scopes/_entity/tree.vue'
import { ITreeEntry } from '~/components/objects/VeoObjectTree.vue'
import { IVeoEntity } from '~/types/VeoTypes'

interface IData {
  objects: IVeoEntity[]
  currentEntity: undefined | IVeoEntity
  showParentLink: boolean
}

export default Vue.extend({
  name: 'VeoObjectsTreePage',
  extends: VeoScopesTreePage,
  asyncData({ from, route }) {
    // Super dirty fix in order to allow navigation to parent object if the user clicked on a child previously.
    // For some reason the page gets recreated completely, rendering beforeRouteUpdate and watch $route completely useless
    return {
      showParentLink: route.name === from.name && route.path !== from.path && route.params.entity !== '-'
    }
  },
  data(): IData {
    return {
      objects: [],
      currentEntity: undefined,
      showParentLink: false
    }
  },
  computed: {
    unitId(): string {
      return separateUUIDParam(this.$route.params.unit).id
    },
    entityId(): string {
      return separateUUIDParam(this.$route.params.entity).id
    },
    entityType(): string {
      return separateUUIDParam(this.$route.params.entity).type
    },
    title(): string {
      return this.currentEntity
        ? this.currentEntity.name
        : this.entityType !== '-'
        ? this.entityId
        : this.$t('breadcrumbs.objects').toString()
    },
    menuButton(): IVeoMenuButtonItem {
      return {
        name: this.$t('object_create').toString(),
        event: {
          name: 'create-entity',
          params: {
            parent: this.currentEntity
          }
        },
        disabled: false
      }
    },
    menuItems(): IVeoMenuButtonItem[] {
      const dummy: IVeoMenuButtonItem[] = []

      // Allow entity management on all levels but the root level
      if (this.entityType !== '-') {
        dummy.push({
          name: this.$t('object_add') as string,
          event: {
            name: 'add-entity',
            params: {
              parent: this.currentEntity
            }
          },
          disabled: false
        })
      }

      return dummy
    },
    rootRoute(): string {
      return `/${this.$route.params.unit}/objects/${this.$route.params.type}`
    }
  },
  head(): any {
    return {
      title: `${this.title} - ${this.$t('breadcrumbs.objects')}`
    }
  },
  methods: {
    sortingFunction(a: ITreeEntry, b: ITreeEntry) {
      if (a.entry && b.entry) {
        return a.entry.name.localeCompare(b.entry.name)
      } else {
        return 0
      }
    }
  }
})
</script>
