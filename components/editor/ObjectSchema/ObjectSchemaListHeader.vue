<template>
  <v-list-item style="background-color: #FAFAFA" two-line @click="$emit('click', $event)">
    <v-list-item-content>
      <v-list-item-title class="body-1 font-weight-bold" v-text="item.title" />
      <v-list-item-subtitle v-text="subtitle" />
    </v-list-item-content>
    <v-list-item-action class="ml-3">
      <v-chip v-if="styling" :color="styling.color" class="mr-2" small label outlined>{{ styling.name }}</v-chip>
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
import { defineComponent, computed } from '@nuxtjs/composition-api'
import { ITypeInfo } from './ObjectSchemaEditor.vue'
import { VEOCustomAspect, VEOCustomLink } from '~/lib/ObjectSchemaHelper'

interface IProps {
  item: VEOCustomAspect | VEOCustomLink
  styling: ITypeInfo
}

export default defineComponent<IProps>({
  props: {
    item: { type: Object, required: true },
    styling: { type: Object, default: () => {} }
  },
  setup(props) {
    const subtitle = computed(() => {
      const count = props.item.attributes.length
      if (!count) { return 'Keine Attribute' }
      return `${count} ${count === 1 ? 'Attribut' : 'Attribute'}`
    })
    return {
      subtitle
    }
  }
})
</script>
