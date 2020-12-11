<template>
  <v-card rounded elevation="0" class="fse-input mx-3 my-2">
    <v-card-text class="pa-0">
      <v-row no-gutters>
        <v-col cols="auto" class="text-right px-1 fse-input-dragbar" :class="color">
          <v-icon class="handle" color="white">mdi-menu</v-icon>
        </v-col>
        <v-col class="px-2">
          <div style="white-space: nowrap">
            <span class="fse-input-title">{{ options && options.label }}</span>
            <span class="fse-input-type">{{ currentType }}</span>
          </div>
        </v-col>
        <v-col cols="auto" class="text-right pr-2">
          <v-btn icon x-small @click="showEdit">
            <v-icon dense small>mdi-pencil</v-icon>
          </v-btn>
          <v-btn icon x-small @click="showDelete">
            <v-icon dense small>mdi-delete</v-icon>
          </v-btn>
        </v-col>
      </v-row>
    </v-card-text>
    <VEOFSEEditControlDialog v-model="editDialog" v-bind="$props" :type="currentType" @edit="doEdit" />
    <VEOFSEDeleteControlDialog v-model="deleteDialog" :name="name" @delete="doDelete" />
  </v-card>
</template>
<script lang="ts">
import Vue from 'vue'
import { Prop } from 'vue/types/options'
import { JSONSchema7 } from 'json-schema'
import { UISchemaElement } from '@/types/UISchema'

import { VEOTypeNameRAW } from 'veo-objectschema-7'
import { BaseObject } from '~/components/forms/utils'
import { eligibleInputElements, IInputElement, INPUT_TYPES } from '~/types/VEOEditor'
import VEOFSEEditControlDialog from '~/components/dialogs/SchemaEditors/VEOFSEEditControlDialog.vue'
import VEOFSEDeleteControlDialog from '~/components/dialogs/SchemaEditors/VEOFSEDeleteControlDialog.vue'

export default Vue.extend({
  components: {
    VEOFSEEditControlDialog,
    VEOFSEDeleteControlDialog
  },
  props: {
    name: {
      type: String,
      required: true
    },
    schema: {
      type: Object as Prop<JSONSchema7>,
      required: true
    },
    lang: {
      type: Object as Prop<BaseObject>,
      default: () => {}
    },
    options: {
      type: Object,
      default: () => {}
    },
    elements: {
      type: Array as Prop<UISchemaElement[]>,
      default: () => []
    },
    value: {
      type: Object,
      default: () => undefined
    },
    disabled: {
      type: Boolean,
      default: false
    },
    visible: {
      type: Boolean,
      default: true
    },
    scope: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      availableElements: [] as IInputElement[],
      editDialog: false as boolean,
      deleteDialog: false as boolean
    }
  },
  computed: {
    color(): string {
      return INPUT_TYPES[this.type].color
    },
    currentType(): string {
      return this.availableElements[0]?.name || 'Unknown'
    },
    type(): VEOTypeNameRAW {
      return this.schema.type ? this.schema.type as any : (this.schema.enum) ? 'enum' : 'default'
    }
  },
  watch: {
    name() {
      this.availableElements = eligibleInputElements(this.type, this.$props)
    },
    options() {
      this.availableElements = eligibleInputElements(this.type, this.$props)
    }
  },
  mounted() {
    this.availableElements = eligibleInputElements(this.type, this.$props)
  },
  methods: {
    showEdit() {
      this.editDialog = true
    },
    doEdit(data: any) {
      this.$emit('update', data)
      this.editDialog = false
    },
    showDelete() {
      this.deleteDialog = true
    },
    doDelete() {
      this.$emit('delete')
      this.deleteDialog = false
    }
  }
})
</script>

<style lang="scss" scoped>
@import '~/assets/vuetify.scss';

.fse-input {
  border: 2px solid $grey;
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

.fse-input-title {
  color: black;
  font-size: 1.1rem;
  font-weight: bold;
  padding-right: 4px;
}
</style>
