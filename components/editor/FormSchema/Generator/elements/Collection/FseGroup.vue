<template>
  <v-card v-if="level === 0" flat class="fse-group level-0 fill-width fill-height">
    <div v-if="value.elements.length === 0" class="dropzone-placeholder">
      <div class="dropzone-placeholder-text subtitle-1">{{ $t('editor.formschema.dropzone.placeholder') }}</div>
    </div>
    <Draggable
      class="dragArea d-flex fill-width fill-height"
      tag="div"
      style="overflow: auto;"
      :list="value.elements"
      :class="dynamicClasses"
      handle=".handle"
      :group="{ name: 'g1' }"
    >
      <slot />
    </Draggable>
  </v-card>
  <v-card v-else elevation="0" class="fse-group mx-3 my-2 px-2 pb-2">
    <v-row no-gutters align="center">
      <v-col cols="auto">
        <v-icon dense small class="handle pr-1">mdi-menu</v-icon>
      </v-col>
      <v-col>
        <div class="text-caption text-truncate">{{ $t('editor.formschema.elements.group.name') }}</div>
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
    <v-row no-gutters>
      <v-col>
        <div v-if="label" class="text-subtitle-1 mb-2">{{ label }}</div>
        <Draggable
          class="dragArea d-flex"
          tag="div"
          style="overflow: auto; min-width:300; min-height:100px"
          :list="value.elements"
          :class="dynamicClasses"
          handle=".handle"
          :group="{ name: 'g1' }"
        >
          <slot />
        </Draggable>
      </v-col>
    </v-row>

    <VEOFSEEditGroupDialog
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
import Draggable from 'vuedraggable'
import VEOFSEEditGroupDialog from '~/components/dialogs/SchemaEditors/VEOFSEEditGroupDialog.vue'
import VEOFSEDeleteDialog from '~/components/dialogs/SchemaEditors/VEOFSEDeleteDialog.vue'
import {
  IVEOFormSchemaCustomTranslationEvent,
  IVEOFormSchemaItemDeleteEvent,
  IVEOFormSchemaItemUpdateEvent,
  IVEOFormSchemaTranslationCollectionItem
} from 'veo-formschema'

export default Vue.extend({
  name: 'FseGroup',
  components: {
    Draggable,
    VEOFSEEditGroupDialog,
    VEOFSEDeleteDialog
  },
  props: {
    value: {
      type: Object,
      default: () => undefined
    },
    name: {
      type: String
    },
    options: Object,
    customTranslation: {
      type: Object,
      default: () => {}
    } as PropOptions<IVEOFormSchemaTranslationCollectionItem>,
    formSchemaPointer: String,
    level: Number
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
  computed: {
    directionClass(): string {
      if (this.options && this.options.direction === 'horizontal') {
        return 'flex-row direction-horizontal'
      } else {
        return 'flex-column direction-vertical'
      }
    },
    dynamicClasses(): string[] {
      return [this.directionClass]
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

.fse-group {
  border: 1px solid $grey;
}

.dropzone-placeholder {
  position: absolute;
  width: 100%;
  top: 50%;
  transform: translateY(-50%);
}

.dropzone-placeholder-text {
  text-align: center;
  color: $grey;
}

.level-0 {
  border: 0
}
</style>
