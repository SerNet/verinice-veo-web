<template>
  <v-card rounded elevation="0" class="fse-input mx-3 my-2">
    <v-card-text class="pa-0">
      <v-row no-gutters>
        <v-col cols="auto" class="text-right px-1 fse-input-dragbar" :style="{ backgroundColor: color }">
          <v-icon class="handle">mdi-menu</v-icon>
        </v-col>
        <v-col class="px-2">
          <div style="white-space: nowrap">
            <span class="fse-input-title">{{ options && options.label }}</span>
            <span class="fse-input-type">{{ currentType }}</span>
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
    </v-card-text>
    <VEOFSEEditControlDialog v-model="editDialog" :available-controls="availableElements" v-bind="$props" />
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

export default Vue.extend({
  components: {
    VEOFSEEditControlDialog
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
    }
  },
  data() {
    return {
      currentType: 'Unknown' as string,
      editDialog: false as boolean,
      deleteDialog: false as boolean
    }
  },
  computed: {
    availableElements(): IInputElement[] {
      return eligibleInputElements(this.$props)
    },
    color(): string {
      return INPUT_TYPES[this.schema.type as VEOTypeNameRAW].color
    }
  },
  mounted() {
    this.currentType = this.availableElements[0]?.name || 'Unknown'
  },
  methods: {
    showEdit() {
      this.editDialog = true
    },
    showDelete() {
      this.deleteDialog = true
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

.fse-input-dragbar {
  color: white;

  i {
    color: white;
  }
}
</style>
