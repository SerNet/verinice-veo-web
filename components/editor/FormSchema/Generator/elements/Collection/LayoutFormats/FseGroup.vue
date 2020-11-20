<template>
  <v-card outlined color="grey lighten-4" class="vf-layout vf-group  ma-2">
    <v-row no-gutters>
      <v-col>
        <v-icon dense small class="handle pa-2">mdi-menu</v-icon>
      </v-col>
      <v-spacer></v-spacer>
      <v-col class="text-right">
        <v-btn icon>
          <v-icon dense small class="pa-2">mdi-pencil</v-icon>
        </v-btn>
      </v-col>
    </v-row>
    <v-row no-gutters>
      <v-col>
        <Draggable
          class="dragArea d-flex"
          tag="div"
          style="overflow: auto; min-width:300; min-height:100px"
          :list="formSchema.elements"
          :class="dynamicClasses"
          handle=".handle"
          :group="{ name: 'g1' }"
        >
          <slot />
        </Draggable>
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
  Helpful,
  LayoutProps
} from '~/components/forms/Collection/utils/helpers'
import Draggable from 'vuedraggable'

export default Vue.extend({
  name: 'FseGroup',
  components: {
    Draggable
  },
  props: {
    options: Object,
    formSchema: Object,
    disabled: Boolean,
    visible: Boolean
  },
  computed: {
    directionClass(): string {
      if (this.options && this.options.direction === 'horizontal') {
        return 'flex-row direction-horizontal'
      } else {
        return 'flex-column direction-vertical'
      }
    },
    highlightClass() {
      if (this.options && this.options.highlight === false) {
        return 'no-highlight'
      } else {
        return 'highlight'
      }
    },
    dynamicClasses(): string[] {
      return [
        this.directionClass,
        this.highlightClass,
        this.options && this.options.class ? this.options.class : ''
      ]
    }
  }
})

export const helpers: Helpful<LayoutProps> = {
  matchingScore(props) {
    return calculateConditionsScore(
      [
        typeof props.options !== 'undefined' && props.options.format === 'group'
      ],
      Number.EPSILON
    )
  }
}
</script>

<style lang="scss" scoped></style>
