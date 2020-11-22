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
          <div class="text-caption text-truncate">
            {{ options && options.label }}
          </div>
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
    value: {
      type: Object,
      default: () => undefined
    },
    formSchemaPointer: String,
    disabled: Boolean,
    visible: Boolean
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

<style lang="scss" scoped></style>
