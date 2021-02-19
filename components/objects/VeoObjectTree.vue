<template>
  <div class="pa-4 pl-0">
    <v-row dense style="font-size: 0.85em; margin-left: 64px; margin-right: 4px;">
      <v-col :cols="1">Abk.</v-col>
      <v-col :cols="3">
        Objektname
      </v-col>
      <v-col :cols="5">
        Beschreibung
      </v-col>
      <v-col :cols="2">
        Bearbeiter
      </v-col>
      <v-col :cols="1">
        Datum
      </v-col>
    </v-row>
    <v-treeview v-model="tree" :items="items" item-key="id" open-on-click activatable>
      <template #prepend="{ item, open }">
        <v-icon v-if="item.parts.length > 0">
          {{ open ? 'mdi-folder-open' : 'mdi-folder' }}
        </v-icon>
        <v-icon v-else>mdi-file</v-icon>
      </template>
      <template #label="{item}">
        <v-row dense class="align-center tree-item">
          <v-col :cols="1" class="d-flex align-center">
            {{ item.abbreviation }}
          </v-col>
          <v-col :cols="3" class="list__title-col">{{ item.name }}</v-col>
          <v-col :cols="4" class="list__description-col">{{ item.description }}</v-col>
          <v-col :cols="2">{{ item.updatedBy }}</v-col>
          <v-col :cols="2" class="list-date justify-end text-right">
            <div>
              {{
                new Date(item.updatedAt).toLocaleDateString('de-DE', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                })
              }}
              {{ new Date(item.updatedAt).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) }}
            </div>
          </v-col>
          <v-col :cols="2" class="list-actions flex-row align-center justify-end">
            <v-tooltip bottom>
              <template #activator="{on}">
                <v-btn icon @click.stop="editSubItem(item)" v-on="on">
                  <v-icon>
                    mdi-pencil
                  </v-icon>
                </v-btn>
              </template>
              <template #default>
                {{ $t('unit.objects.tooltip.edit') }}
              </template>
            </v-tooltip>
            <v-tooltip bottom>
              <template #activator="{on}">
                <v-btn icon @click.stop="duplicateSubItem(item)" v-on="on">
                  <v-icon>
                    mdi-content-copy
                  </v-icon>
                </v-btn>
              </template>
              <template #default>
                {{ $t('unit.objects.tooltip.clone') }}
              </template>
            </v-tooltip>
            <v-tooltip bottom>
              <template #activator="{on}">
                <v-btn icon @click.stop="showDelete(item)" v-on="on">
                  <v-icon>
                    mdi-delete
                  </v-icon>
                </v-btn>
              </template>
              <template #default>
                {{ $t('unit.objects.tooltip.delete') }}
              </template>
            </v-tooltip>
          </v-col>
        </v-row>
      </template>
    </v-treeview>
    <DeleteObjectDialog v-model="deleteDialog.value" :form="deleteDialog.item" @delete="doDelete" />
  </div>
</template>
<script lang="ts">
import Vue from 'vue'
import { Prop } from 'vue/types/options'

import DeleteObjectDialog from '~/components/objects/VeoDeleteEntityDialog.vue'
import { VeoEvents } from '~/types/VeoGlobalEvents'
import { IVeoEntity } from '~/types/VeoTypes'

export default Vue.extend({
  components: {
    DeleteObjectDialog
  },
  props: {
    title: {
      type: String,
      default: ''
    },
    items: {
      type: Array as Prop<IVeoEntity[]>,
      default: () => []
    }
  },
  computed: {
    headers() {
      return [
        {
          text: this.$t('unit.list.header.abbreviation'),
          value: 'abbreviation'
        },
        {
          text: this.$t('unit.list.header.title'),
          value: 'name'
        },
        {
          text: this.$t('unit.list.header.description'),
          value: 'description',
          sortable: false
        },
        {
          text: this.$t('unit.list.header.updatedby'),
          value: 'updatedBy'
        },
        {
          text: this.$t('unit.list.header.updatedat'),
          value: 'updatedAt'
        },
        {
          text: '',
          value: 'actions',
          sortable: false
        }
      ]
    },
    editItemLink(): string {
      return `/${this.$route.params.unit}/objects/${this.$route.params.type}/${this.$route.params.entity}/edit`
    }
  },
  data() {
    return {
      deleteDialog: { value: false as boolean, item: undefined as IVeoEntity | undefined },
      tree: []
    }
  },
  methods: {
    goToItem(item: IVeoEntity) {
      this.$router.push(`/${this.$route.params.unit}/objects/${this.$route.params.type}/${item.id}/list`)
    },
    goToParent() {},
    editSubItem(item: IVeoEntity) {
      this.$router.push(`/${this.$route.params.unit}/objects/${this.$route.params.type}/${item.id}/edit`)
    },
    duplicateSubItem(item: IVeoEntity) {
      const newItem = item
      item.name = `${item.name} (Klon)`
      this.$api.entity.create(this.$route.params.type, newItem).then(() => {
        this.$emit('fetch')
        this.$root.$emit(VeoEvents.SNACKBAR_SUCCESS, {
          text: 'Objekt wurde dupliziert'
        })
      })
    },
    showDelete(item: IVeoEntity) {
      this.deleteDialog.item = item
      this.deleteDialog.value = true
    },
    doDelete(id: string) {
      this.deleteDialog.value = false
      this.$api.entity.delete(this.$route.params.type, id).then(() => {
        this.$emit('fetch')
      })
    }
  }
})
</script>
<style lang="scss" scoped>
@import '~/assets/vuetify.scss';

.list__description-col {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.list__title-col {
  font-weight: bold;
  white-space: nowrap;
}

.list-date {
  display: flex;
}

.tree-item:hover {
  .list-actions {
    display: flex;
  }

  .list-date {
    display: none;
  }
}

.list-actions {
  display: none;
}
</style>
