<template>
  <v-card rounded elevation="0" class="fse-input mx-3 my-2">
    <v-card-text class="pa-0">
      <v-row no-gutters>
        <v-col cols="auto" class="text-right px-1 fse-input-dragbar" :class="color">
          <v-icon class="handle" color="white">mdi-menu</v-icon>
        </v-col>
        <v-col class="mx-2" style="overflow: auto">
          <div>
            <div class="fse-input-title mt-1 mb-1">{{ label }}</div>
            <div class="fse-input-property-name mb-1">{{ name }}</div>
            <div class="fse-input-type mb-1">{{ currentType }}</div>
          </div>
        </v-col>
        <v-col cols="auto" class="text-right pr-2">
          <v-btn icon x-small disabled>
            <v-icon dense small>{{ ruleDisplayIcon }}</v-icon>
          </v-btn>
          <v-btn icon x-small @click="showEdit">
            <v-icon dense small>mdi-pencil</v-icon>
          </v-btn>
          <v-btn icon x-small @click="showDelete">
            <v-icon dense small>mdi-delete</v-icon>
          </v-btn>
        </v-col>
      </v-row>
    </v-card-text>
    <VeoFseEditControlDialog
      v-if="editDialog"
      v-model="editDialog"
      v-bind="$props"
      :formSchema="value"
      :type="currentType"
      @edit="doEdit"
      @update-custom-translation="onUpdateCustomTranslation"
    />
    <VeoFseDeleteDialog v-model="deleteDialog" @delete="doDelete" />
  </v-card>
</template>

<script lang="ts">
import Vue, { PropOptions } from 'vue'
import { Prop } from 'vue/types/options'
import { JSONSchema7 } from 'json-schema'
import { UISchemaElement } from '@/types/UISchema'

import {
  eligibleInputElements,
  IInputElement,
  INPUT_TYPES
} from '~/types/VeoEditor'
import {
  IVeoFormSchemaCustomTranslationEvent,
  IVeoFormSchemaItemDeleteEvent,
  IVeoFormSchemaItemUpdateEvent,
  IVeoFormSchemaTranslationCollectionItem,
  IVeoTranslationCollection
} from '~/types/VeoTypes'
import { getRuleEffectIcons } from '~/lib/FormSchemaHelper'

export default Vue.extend({
  props: {
    name: {
      type: String,
      required: true
    },
    schema: {
      type: Object as Prop<JSONSchema7>,
      required: true
    },
    generalTranslation: {
      type: Object,
      default: () => {}
    } as PropOptions<IVeoTranslationCollection>,
    customTranslation: {
      type: Object,
      default: () => {}
    } as PropOptions<IVeoFormSchemaTranslationCollectionItem>,
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
    formSchemaPointer: {
      type: String,
      default: ''
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
      deleteDialog: false as boolean,
      label: '' as string
    }
  },
  computed: {
    color(): string {
      return INPUT_TYPES[this.type].color
    },
    currentType(): string {
      return this.availableElements[0]?.name || 'Unknown'
    },
    type(): string {
      return Array.isArray(this.schema.enum)
        ? 'enum'
        : this.schema.type && !Array.isArray(this.schema.type)
        ? this.schema.type
        : 'default'
    },
    ruleDisplayIcon(): string | undefined {
      return getRuleEffectIcons(this.value?.rule?.effect)
    }
  },
  watch: {
    name() {
      this.availableElements = eligibleInputElements(this.type, this.$props)
      this.setLabel()
    },
    options() {
      this.availableElements = eligibleInputElements(this.type, this.$props)
    },
    generalTranslation() {
      this.setLabel()
    },
    customTranslation() {
      this.setLabel()
    }
  },
  methods: {
    showEdit() {
      this.editDialog = true
    },
    doEdit(data: IVeoFormSchemaItemUpdateEvent['data']) {
      this.$emit('update', { formSchemaPointer: this.formSchemaPointer, data } as IVeoFormSchemaItemUpdateEvent)
      this.editDialog = false
    },
    showDelete() {
      this.deleteDialog = true
    },
    doDelete() {
      this.$emit('delete', { formSchemaPointer: this.formSchemaPointer } as IVeoFormSchemaItemDeleteEvent)
      this.deleteDialog = false
    },
    setLabel(): void {
      this.label = this.customTranslation?.[this.name] || this.generalTranslation?.[this.name] || this.name
    },
    onUpdateCustomTranslation(event: IVeoFormSchemaCustomTranslationEvent) {
      this.$emit('update-custom-translation', event)
    }
  },
  mounted() {
    this.availableElements = eligibleInputElements(this.type, this.$props)
    this.setLabel()
  }
})
</script>

<style lang="scss" scoped>
@import '~/assets/vuetify.scss';

.fse-input {
  border: 1px solid $grey;
  min-width: 300px;
  overflow: hidden;

  .row {
    flex-wrap: nowrap;

    .col {
      align-items: center;
      display: flex;
      // height: 36px;
    }
  }
}

.fse-input-title {
  // color: black;
  // font-size: 1.1rem;
  // font-weight: bold;
  font-size: 1rem;
  line-height: 1.2;
  color: rgba(0, 0, 0, 0.87);
}

.fse-input-property-name,
.fse-input-type {
  font-size: 0.75rem;
  line-height: 1.2;
  color: rgba(0, 0, 0, 0.6);
}
</style>
