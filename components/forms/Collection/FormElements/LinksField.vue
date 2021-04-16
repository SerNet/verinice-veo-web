<template>
  <div
    v-if="visible"
    class="vf-links-field vf-form-element"
    :class="options && options.class"
    :style="options && options.style"
  >
    <div class="d-flex">
      <span v-if="options && options.label" class="subtitle-1 mb-2">
        {{ options && options.label }}
      </span>
      <v-spacer />
    </div>
    <v-list dense class="py-0">
      <v-list-item v-for="(val, i) in localValue" :key="i" class="links-field-item my-2 pt-2">
        <v-list-item-content>
          <LinksFieldRow
            :key="i"
            :index="i"
            :value="localValue[i]"
            :name="name"
            :selected.sync="selected[i]"
            :schema="schema"
            :options="options"
            :elements="elements"
            :validation="validation"
            :disabled="disabled"
            :visible="visible"
            :general-translation="generalTranslation"
            :custom-translation="customTranslation"
            :api="api"
            @input="onInput"
          />
        </v-list-item-content>
        <v-list-item-action>
          <v-btn :disabled="!localValue" depressed text fab small @click="removeRow(i)">
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </v-list-item-action>
      </v-list-item>
    </v-list>
    <v-btn small text color="primary" @click="addRow()">
      <v-icon small>mdi-plus</v-icon>
      <span>{{ $t('add') }}</span>
    </v-btn>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { PropOptions } from 'vue/types/options'
import { JSONSchema7 } from 'json-schema'
import {
  calculateConditionsScore,
  FormElementProps,
  Helpful
} from '~/components/forms/Collection/utils/helpers'
import { BaseObject, IApi } from '~/components/forms/utils'

import {
  IVeoFormSchemaTranslationCollectionItem,
  IVeoTranslation
} from '~/types/VeoTypes'
import { UISchemaElement } from '~/types/UISchema'

interface IData {
  selected: string[]
  localValue: any
}

export default Vue.extend({
  name: 'LinksField',
  props: {
    value: {
      type: Array,
      default: () => []
    } as PropOptions<BaseObject[]>,
    name: {
      type: String,
      default: ''
    },
    schema: {
      type: Object,
      default: () => undefined
    } as PropOptions<JSONSchema7>,
    options: {
      type: Object,
      default: () => undefined
    },
    validation: {
      type: Object,
      default: () => undefined
    },
    disabled: Boolean,
    visible: Boolean,
    generalTranslation: {
      type: Object,
      default: () => {}
    } as PropOptions<IVeoTranslation>,
    customTranslation: {
      type: Object,
      default: () => {}
    } as PropOptions<IVeoFormSchemaTranslationCollectionItem>,
    elements: {
      type: Array,
      default: () => []
    } as PropOptions<UISchemaElement[]>,
    api: {
      type: Object,
      default: () => undefined
    } as PropOptions<IApi>
  },
  data(): IData {
    return {
      selected: [],
      localValue: []
    }
  },
  computed: {
    rowToAdd(): any {
      return {}
    }
  },
  created() {
    if (!this.value || this.value.length === 0) {
      this.localValue = [{ ...this.rowToAdd }]
    } else {
      this.localValue = JSON.parse(JSON.stringify(this.value))
    }
  },
  methods: {
    addRow() {
      this.localValue.push({ ...this.rowToAdd })
      this.$emit('input', this.localValue)
    },
    removeRow(rowIndex: number) {
      // If only one link exists, empty it instead of deleting it.
      if (this.localValue.length === 1) {
        this.selected = []
        this.localValue = [{ ...this.rowToAdd }]
        this.$emit('input', undefined)
      } else {
        this.selected.splice(rowIndex, 1)
        this.localValue.splice(rowIndex, 1)
        this.$emit('input', this.localValue)
      }
    },
    onInput() {
      this.$emit('input', this.localValue)
    }
  }
})

export const helpers: Helpful<FormElementProps> = {
  matchingScore(props) {
    const schemaItemsProperties =
      props.schema &&
      props.schema.items &&
      typeof props.schema.items === 'object' &&
      !Array.isArray(props.schema.items) &&
      props.schema.items.properties &&
      props.schema.items.properties
    const isTarget = !!(schemaItemsProperties && schemaItemsProperties.target)
    return calculateConditionsScore([props.schema.type === 'array', typeof props.elements !== 'undefined', isTarget])
  }
}
</script>

<i18n>
{
  "en": {
    "add": "Add link"
  },
  "de": {
    "add": "Link hinzufügen"
  }
}
</i18n>

<style lang="scss" scoped>
@import '~/assets/vuetify.scss';

.links-field-item {
  border: 1px solid $grey;
  border-radius: 4px;
}

.links-field-item ::v-deep .vf-layout {
  padding-left: 0;
  padding-right: 0;
}
</style>
