<template>
  <div>
    <!-- The following html looks bad formatted, as correctly formatting it would insert a whitespace -->
    <v-btn
      :color="color"
      outlined
      :disabled="disabled"
      class="veo-hierarchical-table__expandable-menu-default-button"
      @click="$emit(buttonEvent)"
    >
      {{ buttonText }}</v-btn
    ><v-menu bottom left offset-y>
      <template v-slot:activator="{ on }">
        <v-btn
          :color="color"
          :disabled="menuItems.length === 0"
          outlined
          v-on="on"
          class="veo-hierarchical-table__expandable-menu-expand-button"
        >
          <v-icon>mdi-chevron-down</v-icon>
        </v-btn>
      </template>
      <v-list>
        <v-list-item
          v-for="(item, index) in menuItems"
          :key="index"
          :disabled="item.disabled"
          @click="$emit(item.eventName)"
        >
          <v-list-item-title>{{ item.name }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </div>
</template>
<script lang="ts">
import {
  defineComponent,
  PropType
} from '@nuxtjs/composition-api'

export interface IVeoMenuButtonItem {
  disabled: boolean
  eventName: string
  name: string
}

interface IProps {
  menuItems: IVeoMenuButtonItem[]
  disabled: boolean
  color: string
  buttonText: string
  buttonEvent: string
}

export default defineComponent<IProps>({
  props: {
    menuItems: {
      type: Array as PropType<IVeoMenuButtonItem[]>,
      default: () => []
    },
    disabled: {
      type: Boolean,
      default: false
    },
    color: {
      type: String,
      default: 'primary'
    },
    buttonText: {
      type: String,
      required: true
    },
    buttonEvent: {
      type: String,
      default: 'click'
    }
  },
  setup(_props, _context) {}
})
</script>
<style lang="scss" scoped>
.v-btn.veo-hierarchical-table__expandable-menu-expand-button {
  border-bottom-left-radius: 0;
  border-left: 0;
  border-top-left-radius: 0;

  min-width: 32px;
  width: 32px;
}

.v-btn.veo-hierarchical-table__expandable-menu-default-button {
  border-bottom-right-radius: 0;
  border-top-right-radius: 0;
}
</style>
