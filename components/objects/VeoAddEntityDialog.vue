<template>
  <VeoDialog v-model="dialog" large :headline="$t('headline')" :persistent="saving" :close-disabled="saving">
    <template #default>
      {{ $t('add_subentities', { name: entityName }) }}
      <VeoEntitySelectionList :selected-items="selectedItems" :items="items" :loading="$fetchState.pending" @new-subentities="onNewSubEntities" />
    </template>
    <template #dialog-options>
      <v-btn text color="primary" :disabled="saving" @click="$emit('input', false)">
        {{ $t('global.button.cancel') }}
      </v-btn>
      <v-spacer />
      <v-btn
        text
        color="primary"
        :disabled="saving"
        @click="addEntities"
      >
        {{ $t('add') }}
      </v-btn>
    </template>
  </VeoDialog>
</template>

<script lang="ts">
import Vue from 'vue'
import { Prop } from 'vue/types/options'

import VeoDialog from '~/components/dialogs/VeoDialog.vue'
import VeoEntitiySelectionList from '~/components/objects/VeoEntitySelectionList.vue'
import { endpoints, getSchemaEndpoint, getSchemaName } from '~/plugins/api/schema'
import { IVeoEntity, IVeoLink } from '~/types/VeoTypes'

interface IData {
  dialog: boolean
  noWatch: boolean
  selectedItems: { id: string, type: string }[]
  saving: boolean
  entities: IVeoEntity[]
  loading: boolean
}

export default Vue.extend({
  components: {
    VeoDialog,
    VeoEntitiySelectionList
  },
  props: {
    value: {
      type: Boolean,
      required: true
    },
    addType: {
      type: String as Prop<'entity' | 'scope' | undefined>,
      default: undefined
    },
    editedEntity: {
      type: Object as Prop<IVeoEntity | undefined>,
      default: undefined
    },
  },
  data(): IData {
    return {
      dialog: false,
      noWatch: false,
      selectedItems: [],
      saving: false,
      entities: [],
      loading: false
    }
  },
  async fetch() {
    this.entities = []
    for(let index in endpoints) {
      // @ts-ignore
      this.entities.push(...await this.$api.entity.fetchAll(endpoints[index]))
    }
  },
  computed: {
    entityName(): string {
      return this.editedEntity?.name || ''
    },
    items(): IVeoEntity[] {
      if(this.addType === 'scope') {
        return this.entities.filter((entity: IVeoEntity) => entity.type === 'scope' && entity.id !== this.editedEntity?.id)
      } else if(this.addType === 'entity') {
        if(this.editedEntity?.type === 'scope') {
          return this.entities.filter((entity: IVeoEntity) => entity.type !== 'scope' && entity.id !== this.editedEntity?.id)
        } else {
          return this.entities.filter((entity: IVeoEntity) => entity.type === this.editedEntity?.type && entity.id !== this.editedEntity?.id)
        }
      } else {
        return this.entities.filter(entity => entity.id !== this.editedEntity?.id && entity.id !== this.editedEntity?.id)
      }
    }
  },
  watch: {
    value(newValue: boolean) {
      this.noWatch = true
      this.dialog = newValue
      this.noWatch = false

      if(newValue) {
        let presetEntities: IVeoLink[]
        if(!this.editedEntity) {
          presetEntities = []
        } else if(this.editedEntity.type === 'scope') {
          presetEntities = this.editedEntity.members
        } else {
          presetEntities = this.editedEntity.parts
        }
        
        this.selectedItems = presetEntities.map(member => {
          const destructedLink = member.targetUri.split('/')
          const id = destructedLink.pop() || ''
          let type = destructedLink.pop() || ''
          type = getSchemaName(type) || type

          return { id, type }
        })
        
        if(this.entities.length === 0) {
          this.loading = true
          this.$api.schema.fetchAll().then(async (data) => {
            return await data.forEach(async schema => {
              this.entities = [ ...this.entities, ...await this.$api.entity.fetchAll(schema.endpoint) ]
            })
          }).finally(() => {
            this.loading = false
          })
        }
      }
    },
    dialog(newValue: boolean) {
      if (!this.noWatch) {
        this.$emit('input', newValue)
      }
    }
  },
  methods: {
    async addEntities() {
      if(!this.editedEntity) {
        return
      }

      this.saving = true
      const _editedEntity = await this.$api.entity.fetch(this.editedEntity.type, this.editedEntity.id)

      const children = this.selectedItems.map(item => {
        return {
          targetUri: `/${ getSchemaEndpoint(item.type) || item.type }/${item.id}`
        }
      })
      if(this.editedEntity.type === 'scope') {
        // @ts-ignore
        _editedEntity.members = children
      } else {
        // @ts-ignore
        _editedEntity.parts = children
      }

      await this.$api.entity.update(this.editedEntity.type, this.editedEntity.id, _editedEntity).then(() => {
        this.$emit('success')
      }).catch((error: any) => {
        this.$emit('error', error)
      }).finally(() => {
        this.saving = false
      })
    },
    onNewSubEntities(items: { type: string, id: string }[]) {
      this.selectedItems = items
    }
  },
  mounted() {
    this.dialog = this.value
  }
})
</script>

<i18n>
{
  "en": {
    "add": "Add",
    "add_subentities": "Add sub objects to \"{name}\"",
    "headline": "Edit sub objects"
  },
  "de": {
    "add": "Hinzufügen",
    "add_subentities": "Unterobjekte zu \"{name}\" hinzufügen",
    "headline": "Unterobjekte bearbeiten"
  }
}
</i18n>

<style lang="scss" scoped></style>
