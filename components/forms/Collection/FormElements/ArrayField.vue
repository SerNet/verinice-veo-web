<template>
  <div
    v-if="visible"
    class="vf-array-field vf-form-element mb-2"
    :class="options && options.class"
    :style="options && options.style"
  >
    <div class="d-flex">
      <span v-if="options && options.label" class="subtitle-1 mb-2">
        {{ options && options.label }}
      </span>
      <v-spacer />
    </div>
    <v-list dense class="py-0 ml-2">
      <v-list-item
        v-for="(val, i) in value"
        :key="i"
        class="vf-array-field-item my-2 pt-2"
        :style="[isDefaultRow[i] ? { opacity: 0.5 } : { opacity: 1 }]"
      >
        <v-list-item-content>
          <VeoForm
            :schema="schema.items"
            :ui="ui"
            :value="value[i]"
            :general-translation="generalTranslation"
            :custom-translation="customTranslation"
            :api="api"
            @input="onInput"
          />
        </v-list-item-content>
        <v-list-item-action>
          <v-btn depressed text fab small class="vf-btn-remove" @click="removeRow(i)">
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </v-list-item-action>
      </v-list-item>
    </v-list>
    <v-btn small text color="primary" class="vf-btn-add" @click="addRow()">
      <v-icon small>mdi-plus</v-icon>
      <span>{{ $t('add') }}</span>
    </v-btn>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { PropOptions } from 'vue/types/options'
import { JSONSchema7 } from 'json-schema'
import { BaseObject, IApi } from '~/components/forms/utils'
import { calculateConditionsScore, FormElementProps, Helpful } from '~/components/forms/Collection/utils/helpers'
import { IVeoFormSchemaTranslationCollectionItem, IVeoTranslation } from '~/types/VeoTypes'

export default Vue.extend({
  name: 'ArrayField',
  components: {
    // !!!IMPORTANT: this line makes sure, that VeoForm.vue component properly works in the project and in Rollup bundle
    VeoForm: async () => (await import('~/components/forms/VeoForm.vue')).default
  },
  props: {
    value: {
      type: Array
    } as PropOptions<BaseObject[]>,
    name: String,
    schema: {
      type: Object
    } as PropOptions<JSONSchema7>,
    generalTranslation: {
      type: Object,
      default: () => {}
    } as PropOptions<IVeoTranslation>,
    customTranslation: {
      type: Object,
      default: () => {}
    } as PropOptions<IVeoFormSchemaTranslationCollectionItem>,
    options: Object,
    elements: Array,
    disabled: Boolean,
    visible: Boolean,
    api: {
      type: Object
    } as PropOptions<IApi>
  },
  computed: {
    ui() {
      return {
        type: 'Layout',
        options: {
          direction: this.options && this.options.direction === 'vertical' ? 'vertical' : 'horizontal',
          format: 'group',
          highlight: false
        },
        elements: this.elements
      }
    },
    rowToAdd(): {} {
      return (
        typeof this.schema.items !== 'undefined' &&
        !Array.isArray(this.schema.items) &&
        typeof this.schema.items !== 'boolean' &&
        typeof this.schema.items.default !== 'undefined' &&
        this.schema.items.default !== null &&
        !Array.isArray(this.schema.items.default) &&
        this.schema.items.default instanceof Object && {
          ...this.schema.items.default
        }
      )
    },
    isDefaultRow(): boolean[] {
      return this.value.map(val => JSON.stringify(val) === JSON.stringify(this.rowToAdd))
    }
  },
  methods: {
    addRow() {
      const value = this.value ? this.value : []
      value.push({ ...this.rowToAdd })
      this.$emit('input', value)
    },
    removeRow(rowIndex: number) {
      this.value.splice(rowIndex, 1)
      this.$emit('input', this.value)
    },
    onInput(event: any) {
      this.$emit('input', this.value)
    },
    isRowExist() {
      return this.value
    }
  }
})

export const helpers: Helpful<FormElementProps> = {
  matchingScore(props) {
    return calculateConditionsScore([props.schema.type === 'array', typeof props.elements !== 'undefined'])
  }
}
</script>

<i18n>
{
  "en": {
    "add": "Add element"
  },
  "de": {
    "add": "Element hinzufügen"
  }
}
</i18n>

<style lang="scss" scoped>
@import '~/assets/vuetify.scss';

.vf-array-field > div {
  transition: opacity 0.7s;
}

.vf-array-field-item {
  border: 1px solid $grey;
  border-radius: 4px;
}

::v-deep .vf-control.col {
  padding: 0 5px 0 0;
}
</style>
