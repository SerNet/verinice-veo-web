<template>
  <v-list-item :two-line="twoLine">
    <v-list-item-avatar size="32">
      <v-icon v-if="styling" small :class="styling.color" color="white" outlined dark v-text="styling.icon" />
    </v-list-item-avatar>
    <v-list-item-content>
      <v-list-item-title class="caption" v-text="title" />
      <slot name="description"></slot>
    </v-list-item-content>
    <v-list-item-action class="ml-3">
      <v-chip v-if="styling" :color="styling.color" class="mr-2" small label outlined>
        <span v-if="$props.translate">
          {{ $t(`editor.inputtypes.${styling.name}`) }}
        </span>
        <span v-else>
          {{ styling.name }}
        </span>
      </v-chip>
    </v-list-item-action>
    <slot name="right-space"></slot>
  </v-list-item>
</template>
<script lang="ts">
import { defineComponent } from '@nuxtjs/composition-api'

import { IInputType } from '~/types/VEOEditor'

interface IProps {
  styling: IInputType
  disabled: boolean
  translate: boolean
}

export default defineComponent<IProps>({
  props: {
    title: {
      type: String
    },
    twoLine: {
      type: Boolean
    },
    styling: {
      type: Object,
      default: () => {}
    },
    translate: {
      type: Boolean,
      default: false
    }
  }
})
</script>
<style lang="scss" scoped></style>
