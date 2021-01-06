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
    <v-list dense class="py-0 ml-2">
      <v-list-item v-for="(val, i) in localValue" :key="i" class="links-field-item my-2 pt-2">
        <v-list-item-content>
          <LinksFieldRow
            :key="i"
            :index="i"
            :name="name"
            :selected.sync="selected[i]"
            :schema="schema"
            :lang="lang"
            :options="options"
            :elements="elements"
            :validation="validation"
            :value="localValue[i]"
            :disabled="disabled"
            :visible="visible"
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
      <span>{{ $t('forms.input.linkadd') }}</span>
    </v-btn>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Prop } from 'vue/types/options'
import { JSONSchema7 } from 'json-schema'
import { calculateConditionsScore, FormElementProps, Helpful } from '~/components/forms/Collection/utils/helpers'
import { BaseObject, IApi } from '~/components/forms/utils'

import LinksFieldRow from '~/components/forms/Collection/FormElements/LinksFieldRow.vue'

interface IData {
  selected: string[]
  localValue: any
}

export default Vue.extend({
  name: 'LinksField',
  components: {
    LinksFieldRow
  },
  props: {
    name: String,
    schema: Object as Prop<JSONSchema7>,
    lang: Object as Prop<BaseObject>,
    options: Object,
    elements: Array,
    validation: Object,
    value: {
      type: Array as Prop<BaseObject[]>
    },
    disabled: Boolean,
    visible: Boolean,
    api: Object as Prop<IApi>
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

<style lang="scss" scoped>
@import '~/assets/vuetify.scss';

.links-field-item {
  border: 1px solid $grey;
  border-radius: 4px;
}
</style>
