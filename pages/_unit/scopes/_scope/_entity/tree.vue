<template>
  <VeoPage :title="title" fullsize>
    <v-row class="justify-space-between">
      <v-col cols="auto">
        <v-btn-toggle mandatory :value="1" color="primary" dense>
          <v-tooltip bottom>
            <template #activator="{on}">
              <v-btn v-on="on" @click="navigateList()">
                <v-icon>mdi-menu</v-icon>
              </v-btn>
            </template>
            <template #default>
              {{ $t('list_view') }}
            </template>
          </v-tooltip>
          <v-tooltip bottom>
            <template #activator="{on}">
              <v-btn v-on="on">
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
          button-event="create-entity"
          @create-entity="navigateCreate()"
          @add-entity="showAddEntitiesDialog()"
        />
      </v-col>
    </v-row>
    <VeoObjectTree :items="objects" @duplicate="doDuplicateEntity" @delete="showDeleteEntityDialog" />
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
import VeoObjectTree from '~/components/objects/VeoObjectTree.vue'
import VeoMenuButton, { IVeoMenuButtonItem } from '~/components/layout/VeoMenuButton.vue'
import { IVeoEntity } from '~/types/VeoTypes'
import VeoDeleteEntityDialog from '~/components/objects/VeoDeleteEntityDialog.vue'
import VeoAddEntityDialog from '~/components/objects/VeoAddEntityDialog.vue'
import { VeoEvents } from '~/types/VeoGlobalEvents'
import { getSchemaName } from '~/plugins/api/schema'

export default Vue.extend({
  components: {
    VeoPage,
    VeoObjectTree,
    VeoMenuButton,
    VeoDeleteEntityDialog,
    VeoAddEntityDialog
  },
  async fetch() {
    if (this.$route.params.entity !== '-') {
      this.objects = await this.$api.entity.fetchSubEntities(this.$route.params.type, this.$route.params.entity)
      this.currentEntity = await this.$api.entity.fetch(this.$route.params.type, this.$route.params.entity)
    } else {
      this.objects = await this.$api.entity.fetchAll(this.$route.params.type)
      this.currentEntity = undefined
    }
  },
  computed: {
    menuItems(): IVeoMenuButtonItem[] {
      if (this.$route.params.entity === '-') {
        return []
      } else {
        return [
          {
            name: this.$t('object_add', { type: this.objectType }) as string,
            eventName: 'add-entity',
            disabled: false
          }
        ]
      }
    },
    title(): string {
      return capitalize(this.$route.params.type)
    },
    objectType(): string {
      return capitalize(getSchemaName(this.$route.params.type) || '')
    }
  },
  data() {
    return {
      objects: [] as IVeoEntity[],
      addDialog: false as boolean,
      deleteDialog: { value: false as boolean, item: undefined as IVeoEntity | undefined },
      currentEntity: undefined as undefined | IVeoEntity,
      entities: [] as IVeoEntity[]
    }
  },
  methods: {
    navigateList() {
      this.$router.push(
        `/${this.$route.params.unit}/objects/${this.$route.params.type}/${this.$route.params.entity}/list`
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
    showAddEntitiesDialog() {
      if (this.entities.length === 0) {
        this.$api.entity
          .fetchAll(this.$route.params.type)
          .then((entities: IVeoEntity[]) => {
            this.entities = entities
          })
          .finally(() => {
            this.addDialog = true
          })
      } else {
        this.addDialog = true
      }
    },
    doAddEntitiesDialog(entities: string[]) {
      if (this.currentEntity) {
        const children = entities.map((entity: string) => {
          return {
            targetUri: `${this.$config.apiUrl}/${this.$route.params.type}/${entity}`
          }
        })

        this.currentEntity.parts = children
        this.$api.entity.update(this.$route.params.type, this.$route.params.entity, this.currentEntity).finally(() => {
          this.addDialog = false
          this.$fetch()
        })
      }
    },
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
