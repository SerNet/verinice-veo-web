<template>
  <v-card
    width="300"
    outlined
    color="grey lighten-4"
    class="vf-input-text vf-form-element ma-2"
  >
    <v-row no-gutters>
      <v-col cols="auto">
        <v-icon dense small class="handle pa-2">mdi-menu</v-icon>
      </v-col>
      <v-col cols="auto">
        <div style="max-width: 220px;">
          <div class="text-caption text-truncate">{{ name }}</div>
          <div class="text-caption text-truncate">
            Control (InputText)
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
import Vue from 'vue'
import { Prop } from 'vue/types/options'
import { JSONSchema7 } from 'json-schema'
import {
  calculateConditionsScore,
  FormElementProps,
  Helpful
} from '~/components/forms/Collection/utils/helpers'
import { BaseObject, IApi } from '~/components/forms/utils'

export default Vue.extend({
  name: 'InputText',
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
  methods: {
    clear() {
      // TODO: it needs two nested $nextTick()-s to work properly and update value to undefined.
      // Check if there is other easier way. This function is implemented  in all other FormElements. Check them also.
      this.$nextTick(() => this.$nextTick(() => this.$emit('input', undefined)))
    }
  }
})

export const helpers: Helpful<FormElementProps> = {
  matchingScore(props) {
    // Add Number.EPSILON, because InputText must be PREFERRED as Default,
    // if other fields have the same number of true conditions
    // if other fields are appropriate, they MUST have more true conditions

    return calculateConditionsScore(
      [props.schema.type === 'string'],
      Number.EPSILON
    )
  }
}
</script>

<style lang="scss" scoped>
.vf-input-text {
  width: 250px;
}
</style>
