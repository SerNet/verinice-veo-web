<template>
  <v-card
    width="300"
    outlined
    color="grey lighten-4"
    class="vf-input-text-multiline vf-form-element fse-os-string ma-2"
  >
    <v-row no-gutters>
      <v-col cols="auto">
        <v-icon dense small class="handle pa-2">mdi-menu</v-icon>
      </v-col>
      <v-col cols="auto">
        <div style="max-width: 220px;">
          <div class="text-caption text-truncate">{{ name }}</div>
          <div class="text-caption text-truncate">
            Control (InputTextMultiline)
          </div>
        </div>
      </v-col>
      <v-spacer></v-spacer>
      <v-col cols="auto" class="text-right">
        <v-btn icon>
          <v-icon dense small class="pa-2">mdi-pencil</v-icon>
        </v-btn>
      </v-col>
    </v-row>
  </v-card>
</template>

<script lang="ts">
import Vue, { VueConstructor } from 'vue'
import { Prop } from 'vue/types/options'
import { JSONSchema7 } from 'json-schema'
import { BaseObject, IApi } from '~/components/forms/utils'
import {
  calculateConditionsScore,
  FormElementProps,
  Helpful
} from '~/components/forms/Collection/utils/helpers'

export default (Vue as VueConstructor<
  Vue & { $refs: { textarea: any } }
>).extend({
  name: 'InputTextMultiline',
  props: {
    name: String,
    schema: Object as Prop<JSONSchema7>,
    lang: Object as Prop<BaseObject>,
    options: Object,
    value: {},
    validation: Object,
    disabled: Boolean,
    visible: Boolean,
    api: Object as Prop<IApi>
  },
  computed: {
    textareaCSS(): CSSStyleDeclaration {
      return window.getComputedStyle(this.$refs.textarea.$refs.input)
    },
    lineHeight() {
      // TODO: review code and test, if this is convenient way to get textarea line-height
      const lineHeight: string = this.textareaCSS.getPropertyValue(
        'line-height'
      )
      const lineHeightNumber = parseFloat(lineHeight)
      return lineHeightNumber
        ? {
            value: lineHeightNumber,
            unit: lineHeight.replace(lineHeightNumber.toString(), '')
          }
        : undefined
    },
    paddingHeight(): number {
      return [this.textareaCSS.getPropertyValue('padding-top')]
        .map(el => parseFloat(el))
        .reduce((a, b) => a + b, 0)
    },
    maxRows(): number {
      return this.options && this.options.maxRows
        ? (this.options.maxRows as number)
        : 10
    },
    maxHeight(): string {
      if (this.lineHeight) {
        return `calc(${this.maxRows * this.lineHeight.value}${
          this.lineHeight.unit
        } + ${this.paddingHeight}px)`
      } else {
        return ''
      }
    }
  },
  watch: {
    visible: {
      immediate: true,
      handler(val) {
        this.$nextTick(() => {
          if (val) {
            if (this.$refs.textarea) {
              this.$refs.textarea.$refs.input.style.maxHeight = this.maxHeight
            } else {
              console.warn(
                'Could not find $refs.textarea element in InputTextMultiline'
              )
            }
          }
        })
      }
    }
  },
  methods: {
    clear() {
      this.$nextTick(() => this.$nextTick(() => this.$emit('input', undefined)))
    }
  }
})

export const helpers: Helpful<FormElementProps> = {
  matchingScore(props) {
    return calculateConditionsScore([
      props.schema.type === 'string',
      typeof props.options !== 'undefined' &&
        props.options.format === 'multiline'
    ])
  }
}
</script>

<style lang="scss" scoped>
.vf-input-text-multiline {
  width: 250px;
}
.v-text-field >>> .v-input__control > .v-input__slot:after,
.v-text-field >>> .v-input__control > .v-input__slot:before {
  /* width: calc(100% - 30px); */
}
.v-text-field >>> .v-input__control > .v-input__slot textarea {
  overflow: auto;
}
</style>
