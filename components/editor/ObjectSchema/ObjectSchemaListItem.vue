<template>
  <v-list-item two-line @click="$emit('click', $event)">
    <v-list-item-avatar size="32">
      <v-icon small :class="color" color="white" outlined dark v-text="icon" />
    </v-list-item-avatar>
    <v-list-item-content>
      <v-list-item-title class="caption" v-text="name" />
      <v-list-item-subtitle>
        <strong v-text="title" />
        <span v-if="title && description">
          &mdash;
        </span>
        <span v-text="description" />
      </v-list-item-subtitle>
    </v-list-item-content>
    <v-list-item-action class="ml-3">
      <v-chip v-for="(label, index) in labels" :key="index" :color="label.color" class="mr-2" small label outlined>{{ label.name }}</v-chip>
    </v-list-item-action>
  </v-list-item>
</template>
<script lang="ts">
import { defineComponent, PropOptions, PropType } from '@nuxtjs/composition-api'

interface ILabel {
    color: string
    name: string
}

interface IProps {
  color: string
  icon: string
  name: string
  title: string
  description: string
  labels: string
}

export default defineComponent<IProps>({
  props: {
    color: { type: String, default: 'white' },
    icon: { type: String, default: 'mdi-help' },
    name: { type: String, default: '' },
    title: { type: String, default: '' },
    description: { type: String, default: '' },
    labels: { type: Array as PropType<ILabel[]>, default: () => [] }
  },
  setup(props) {

  }
})
</script>
<style lang="scss" scoped>

</style>
