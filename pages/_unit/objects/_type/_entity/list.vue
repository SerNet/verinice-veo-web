<template>
  <VeoPage :title="title" fullsize>
    <v-row class="justify-space-between">
      <v-col cols="auto">
        <v-btn-toggle mandatory :value="0" color="primary" dense>
          <v-tooltip bottom>
            <template #activator="{on}">
              <v-btn v-on="on">
                <v-icon>mdi-menu</v-icon>
              </v-btn>
            </template>
            <template #default>
              {{ $t('list_view') }}
            </template>
          </v-tooltip>
          <v-tooltip bottom>
            <template #activator="{on}">
              <v-btn v-on="on" @click="navigateTree()">
                <v-icon>mdi-file-tree</v-icon>
              </v-btn>
            </template>
            <template #default>
              {{ $t('tree_view') }}
            </template>
          </v-tooltip>
          <v-tooltip bottom>
            <template #activator="{on}">
              <v-btn v-on="on" :disabled="$route.params.entity === '-'" @click="navigateDetails()">
                <v-icon>mdi-file</v-icon>
              </v-btn>
            </template>
            <template #default>
              {{ $t('detail_view') }}
            </template>
          </v-tooltip>
        </v-btn-toggle>
      </v-col>
      <v-col cols="auto" class="mr-4">
        <VeoMenuButton
          :menu-items="menuItems"
          :button-text="$t('object_create', { type: objectType })"
          button-event="create-asset"
          @create-asset="navigateCreate()"
          @add-asset="showAddEntitiesDialog()"
        />
      </v-col>
    </v-row>
    <VeoObjectList :items="displayedObjects" @duplicate="doDuplicateEntity" @delete="showDeleteEntityDialog" />
    <v-row class="justify-end mr-2">
      <v-col cols="auto">
        <span> {{ $t('showing') }} {{ start + 1 }} - {{ end }} {{ $t('of') }} {{ maxObjects }} </span>
        <v-btn icon :disabled="currentPage == 0" @click="currentPage--">
          <v-icon>mdi-chevron-left</v-icon>
        </v-btn>
        <v-btn icon :disabled="(currentPage + 1) * itemsPerPage >= maxObjects" @click="currentPage++">
          <v-icon>mdi-chevron-right</v-icon>
        </v-btn>
      </v-col>
    </v-row>
    <VeoDeleteEntityDialog v-model="deleteDialog.value" :form="deleteDialog.item" @delete="doDeleteEntityDialog" />
    <VeoAddEntityDialog
      v-model="addDialog"
      :entities="entities"
      :current-entity="currentEntity"
      @add-entities="doAddEntitiesDialog"
    />
  </VeoPage>
</template>
<i18n>
{
  "en": {
    "clone": "Clone",
    "detail_view": "Detail view",
    "list_view": "List view",
    "object_add": "Link {type}",
    "object_cloned": "Object cloned successfully",
    "object_create": "Create {type}",
    "of": "of",
    "showing": "Showing",
    "tree_view": "Tree view"
  },
  "de": {
    "clone": "Klon",
    "detail_view": "Detailansicht",
    "list_view": "Listenansicht",
    "object_add": "{type} verknüpfen",
    "object_cloned": "Objekt wurde geklont",
    "object_create": "{type} erstellen",
    "of": "von",
    "showing": "Zeige",
    "tree_view": "Baumansicht"
  }
}
</i18n>
<script lang="ts">
import Vue from 'vue'
import { capitalize } from 'lodash'

import VeoPage from '~/components/layout/VeoPage.vue'
import VeoObjectList from '~/components/objects/VeoObjectList.vue'
import VeoMenuButton, { IVeoMenuButtonItem } from '~/components/layout/VeoMenuButton.vue'
import { IVeoEntity } from '~/types/VeoTypes'
import VeoDeleteEntityDialog from '~/components/objects/VeoDeleteEntityDialog.vue'
import VeoAddEntityDialog from '~/components/objects/VeoAddEntityDialog.vue'
import { VeoEvents } from '~/types/VeoGlobalEvents'
import { getSchemaName } from '~/plugins/api/schema'

export default Vue.extend({
  components: {
    VeoPage,
    VeoObjectList,
    VeoMenuButton,
    VeoDeleteEntityDialog,
    VeoAddEntityDialog
  },
  async fetch() {
    if (this.$route.params.entity !== '-') {
      this.objects = await this.$api.entity.fetchSubEntities(this.$route.params.type, this.$route.params.entity)
    } else {
      this.objects = await this.$api.entity.fetchAll(this.$route.params.type)
    }
    this.maxObjects = this.objects.length
    this.currentPage = 0
  },
  computed: {
    menuItems(): IVeoMenuButtonItem[] {
      if (this.$route.params.type === '-') {
        return []
      } else {
        return [
          {
            name: this.$t('object_add', { type: this.objectType }) as string,
            eventName: 'add-asset',
            disabled: false
          }
        ]
      }
    },
    title(): string {
      return capitalize(this.$route.params.type)
    },
    start(): number {
      const start = this.currentPage * this.itemsPerPage
      return this.maxObjects === 0 ? -1 : start
    },
    end(): number {
      const end = this.currentPage * this.itemsPerPage + this.itemsPerPage
      return end > this.maxObjects ? this.maxObjects : end
    },
    displayedObjects(): IVeoEntity[] {
      return this.objects.slice(this.start, this.end)
    },
    objectType(): string {
      return capitalize(getSchemaName(this.$route.params.type) || '')
    }
  },
  data() {
    return {
      objects: [] as IVeoEntity[],
      currentPage: 0 as number,
      maxObjects: 0 as number,
      itemsPerPage: 10 as number,
      addDialog: false as boolean,
      deleteDialog: { value: false as boolean, item: undefined as IVeoEntity | undefined },
      currentEntity: undefined as undefined | IVeoEntity,
      entities: [] as IVeoEntity[]
    }
  },
  methods: {
    navigateTree() {
      this.$router.push(
        `/${this.$route.params.unit}/objects/${this.$route.params.type}/${this.$route.params.entity}/tree`
      )
    },
    navigateDetails() {
      this.$router.push(
        `/${this.$route.params.unit}/objects/${this.$route.params.type}/${this.$route.params.entity}/edit`
      )
    },
    navigateCreate() {
      this.$router.push(
        `/${this.$route.params.unit}/objects/${this.$route.params.type}/${this.$route.params.entity}/create`
      )
    },
    showAddEntitiesDialog() {},
    doAddEntitiesDialog(entities: string[]) {},
    showDeleteEntityDialog(item: IVeoEntity) {
      this.deleteDialog.item = item
      this.deleteDialog.value = true
    },
    doDeleteEntityDialog(id: string) {
      this.deleteDialog.value = false
      this.$api.entity.delete(this.$route.params.type, id).then(() => {
        this.$fetch()
      })
    },
    doDuplicateEntity(item: IVeoEntity) {
      const newItem = item
      item.name = `${item.name} (${this.$t('clone')})`
      this.$api.entity.create(this.$route.params.type, newItem).then(() => {
        this.$fetch()
        this.$root.$emit(VeoEvents.SNACKBAR_SUCCESS, {
          text: this.$t('object_cloned')
        })
      })
    }
  }
})
</script>

<style lang="scss" scoped></style>
