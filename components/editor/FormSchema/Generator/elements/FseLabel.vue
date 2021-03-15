<template>
  <v-card elevation="0" class="fse-label mx-3 my-2 px-2">
    <v-row no-gutters>
      <v-col cols="auto">
        <v-icon small class="handle pr-1">mdi-menu</v-icon>
      </v-col>
      <v-col>
        <div class="text-caption text-truncate">
          {{ label }}
        </div>
      </v-col>
      <v-col cols="auto" class="text-right">
        <v-btn icon x-small @click="showEdit">
          <v-icon dense small>mdi-pencil</v-icon>
        </v-btn>
        <v-btn icon x-small @click="showDelete">
          <v-icon dense small>mdi-delete</v-icon>
        </v-btn>
      </v-col>
    </v-row>

    <VEOFSEEditLabelDialog
      v-if="editDialog"
      v-bind="$props"
      v-model="editDialog"
      :formSchema="value"
      :name="name"
      @edit="onEdit"
      @update-custom-translation="onUpdateCustomTranslation"
    />
    <VEOFSEDeleteDialog v-model="deleteDialog" @delete="onDelete" />
  </v-card>
</template>

<script lang="ts">
import Vue from 'vue'
import { PropOptions } from 'vue/types/options'
import VEOFSEEditLabelDialog from '~/components/dialogs/SchemaEditors/VEOFSEEditLabelDialog.vue'
import VEOFSEDeleteDialog from '~/components/dialogs/SchemaEditors/VEOFSEDeleteDialog.vue'
import {
  IVEOFormSchemaCustomTranslationEvent,
  IVEOFormSchemaItemDeleteEvent,
  IVEOFormSchemaItemUpdateEvent,
  IVEOFormSchemaTranslationCollectionItem
} from 'veo-formschema'

export default Vue.extend({
  name: 'FseLabel',
  components: {
    VEOFSEEditLabelDialog,
    VEOFSEDeleteDialog
  },
  props: {
    value: {
      type: Object,
      default: () => undefined
    },
    name: {
      type: String,
      required: true
    },
    options: Object,
    customTranslation: {
      type: Object,
      default: () => {}
    } as PropOptions<IVEOFormSchemaTranslationCollectionItem>,
    formSchemaPointer: String
  },
  data() {
    return {
      editDialog: false,
      deleteDialog: false,
      label: ''
    }
  },
  watch: {
    customTranslation: {
      immediate: true,
      handler() {
        this.setLabel()
      }
    }
  },
  methods: {
    showEdit() {
      this.editDialog = true
    },
    showDelete() {
      this.deleteDialog = true
    },
    onEdit(data: IVEOFormSchemaItemUpdateEvent['data']) {
      this.$emit('update', { formSchemaPointer: this.formSchemaPointer, data } as IVEOFormSchemaItemUpdateEvent)
      this.editDialog = false
    },
    onDelete() {
      this.$emit('delete', { formSchemaPointer: this.formSchemaPointer } as IVEOFormSchemaItemDeleteEvent)
      this.deleteDialog = false
    },
    onUpdateCustomTranslation(event: IVEOFormSchemaCustomTranslationEvent) {
      this.$emit('update-custom-translation', event)
    },
    setLabel() {
      this.label = (this.name && this.customTranslation?.[this.name]) || ''
    }
  }
})
</script>

<style lang="scss" scoped>
@import '~/assets/vuetify.scss';

.fse-label {
  border: 1px solid $grey;
  min-width: 300px;
  overflow: hidden;

  .row {
    flex-wrap: nowrap;

    .col {
      align-items: center;
      display: flex;
      height: 36px;
    }
  }
}
</style>
