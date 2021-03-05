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
              <v-btn v-on="on" disabled @click="navigateTree()">
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
          :button-text="$t('scope_create')"
          button-event="create-scope"
          @create-entity="navigateCreate()"
          @add-entity="showAddEntitiesDialog()"
          @create-scope="showCreateScopeDialog()"
          @add-scope="showAddScopeDialog()"
        />
      </v-col>
    </v-row>
    <VeoObjectList :items="objects" @duplicate="doDuplicateEntity" @delete="showDeleteEntityDialog" />
    <VeoDeleteEntityDialog v-model="deleteDialog.value" :form="deleteDialog.item" @delete="doDeleteEntityDialog" />
    <VeoAddEntityDialog
      v-model="addDialog.value"
      :entities="addDialog.items"
      :current-entity="currentEntity"
      @add-entities="doAddEntitiesDialog"
    />
    <VeoCreateScopeDialog v-model="createScopeDialog" @create-scope="doCreateScope" />
  </VeoPage>
</template>
<i18n>
{
  "en": {
    "clone": "Clone",
    "detail_view": "Detail view",
    "list_view": "List view",
    "object_add": "Link object",
    "object_cloned": "Object cloned successfully",
    "object_create": "Create object",
    "of": "of",
    "scope_add": "Link scope",
    "scope_create": "Create scope",
    "showing": "Showing",
    "tree_view": "Tree view"
  },
  "de": {
    "clone": "Klon",
    "detail_view": "Detailansicht",
    "list_view": "Listenansicht",
    "object_add": "Objekt verknüpfen",
    "object_cloned": "Objekt wurde geklont",
    "object_create": "Objekt erstellen",
    "of": "von",
    "scope_add": "Scope verknüpfen",
    "scope_create": "Scope erstellen",
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
import { IVeoEntity, IVeoScope } from '~/types/VeoTypes'
import VeoDeleteEntityDialog from '~/components/objects/VeoDeleteEntityDialog.vue'
import VeoAddEntityDialog from '~/components/objects/VeoAddEntityDialog.vue'
import VeoCreateScopeDialog from '~/components/objects/VeoCreateScopeDialog.vue'
import { VeoEvents } from '~/types/VeoGlobalEvents'
import { getSchemaName } from '~/plugins/api/schema'
import { separateUUIDParam } from '~/lib/utils'

export default Vue.extend({
  components: {
    VeoPage,
    VeoObjectList,
    VeoMenuButton,
    VeoDeleteEntityDialog,
    VeoAddEntityDialog,
    VeoCreateScopeDialog
  },
  async fetch() {
    if (this.$route.params.scope === '-') {
      this.objects = await this.$api.scope.fetchAll()
      this.scopes = this.objects as IVeoScope[]
    } else {
      this.objects = await this.$api.scope.fetchScopeMembers(this.$route.params.scope)
    }
  },
  computed: {
    menuItems(): IVeoMenuButtonItem[] {
      const dummy = []

      if (this.$route.params.scope !== '-') {
        dummy.push({
          name: this.$t('scope_add') as string,
          eventName: 'add-scope',
          disabled: false
        })
        dummy.push({
          name: this.$t('object_create') as string,
          eventName: 'create-entity',
          disabled: false
        })
        dummy.push({
          name: this.$t('object_add') as string,
          eventName: 'add-entity',
          disabled: false
        })
      }

      return dummy
    },
    title(): string {
      return capitalize(this.$route.params.type)
    },
    objectType(): string {
      return capitalize(getSchemaName(this.$route.params.type) || '')
    },
    unitID(): string {
      return separateUUIDParam(this.$route.params.unit).id
    }
  },
  data() {
    return {
      objects: [] as IVeoEntity[] | IVeoScope[],
      addDialog: { value: false, items: [] } as { value: boolean; items: (IVeoEntity | IVeoScope)[] },
      createScopeDialog: false as boolean,
      deleteDialog: { value: false as boolean, item: undefined as IVeoEntity | IVeoScope | undefined },
      currentEntity: undefined as undefined | IVeoEntity | IVeoScope,
      entities: [] as IVeoEntity[],
      scopes: [] as IVeoScope[]
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
    showAddEntitiesDialog() {
      if (this.entities.length === 0) {
        this.$api.entity.fetchAll(this.$route.params.type).then((entities: IVeoEntity[]) => {
          this.entities = entities
        })
      }

      this.addDialog.items = this.entities
      this.addDialog.value = true
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
          this.addDialog.value = false
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
    showAddScopeDialog() {
      if (this.entities.length === 0) {
        /*this.$api.entity.fetchAll(this.$route.params.type).then((entities: IVeoEntity[]) => {
          this.entities = entities
        })*/
      }

      if (this.scopes.length === 0) {
        this.$api.scope.fetchAll().then((scopes: IVeoScope[]) => {
          this.scopes = scopes
        })
      }

      this.addDialog.items = [...this.entities, ...this.scopes]
      this.addDialog.value = true
    },
    showCreateScopeDialog() {
      this.createScopeDialog = true
    },
    doCreateScope(scope: IVeoScope) {
      this.$api.scope
        .create({
          ...scope,
          owner: {
            targetUri: `/units/${this.unitID}`
          }
        })
        .then(async data => {
          if (this.$route.params.scope !== '-') {
            const parent = await this.$api.scope.fetch(this.$route.params.scope)
            parent.members.push({
              targetUri: `${this.$config.apiUrl}/scopes/${data.resourceId}`
            } as any)
            this.$api.scope.update(parent.id, parent).then(() => {
              this.$fetch()
              this.createScopeDialog = false
            })
          } else {
            this.$fetch()
            this.createScopeDialog = false
          }
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
