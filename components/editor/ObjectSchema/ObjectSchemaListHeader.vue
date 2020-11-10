<template>
  <v-list-item style="background-color: #FAFAFA" two-line @click="$emit('click', $event)">
    <v-list-item-content>
      <v-list-item-title class="body-1 font-weight-bold" v-text="name" />
      <v-list-item-subtitle v-text="subtitle" />
    </v-list-item-content>
    <v-list-item-action class="ml-3">
      <v-chip v-for="(label, index) in labels" :key="index" :color="label.color" class="mr-2" small label outlined>{{ label.name }}</v-chip>
    </v-list-item-action>
    <v-list-item-action class="ml-0">
      <v-btn icon>
        <v-icon>
          mdi-chevron-right
        </v-icon>
      </v-btn>
    </v-list-item-action>
  </v-list-item>
</template>
<script lang="ts">
import { defineComponent, computed, PropType } from '@nuxtjs/composition-api'

interface ILabel {
    color: string
    name: string
}

export default defineComponent({
  props: {
    color: { type: String, default: 'white' },
    icon: { type: String, default: 'mdi-help' },
    name: { type: String, default: '' },
    children: { type: Array, default: () => [] },
    labels: { type: Array as PropType<ILabel[]>, default: () => [] }
  },
  setup(props) {
    const subtitle = computed(() => {
      const count = props.children.length
      if (!count) { return 'Keine Attribute' }
      return `${count} ${count === 1 ? 'Attribut' : 'Attribute'}`
    })
    return {
      subtitle
    }
  }
})
</script>
