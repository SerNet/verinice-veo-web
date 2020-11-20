<template>
  <v-list-item two-line>
    <v-list-item-avatar size="32">
      <v-icon v-if="styling" small :class="styling.color" color="white" outlined dark v-text="styling.icon" />
    </v-list-item-avatar>
    <v-list-item-content>
      <v-list-item-title class="caption" v-text="item.title" />
      <v-list-item-subtitle>
        <span v-text="item.description" />
      </v-list-item-subtitle>
    </v-list-item-content>
    <v-list-item-action class="ml-3">
      <v-chip v-if="styling" :color="styling.color" class="mr-2" small label outlined>{{ styling.name }}</v-chip>
    </v-list-item-action>
    <v-list-item-action class="ml-0" style="width: 36px;" />
  </v-list-item>
</template>
<script lang="ts">
import { defineComponent } from '@nuxtjs/composition-api'
import { ITypeInfo } from './ObjectSchemaEditor.vue'
import { IVEOBasicProperty, IVEOCustomAspect, IVEOCustomLink } from '~/lib/ObjectSchemaHelper'

interface IProps {
  item: IVEOCustomAspect | IVEOCustomLink | IVEOBasicProperty
  styling: ITypeInfo
  disabled: boolean
}

export default defineComponent<IProps>({
  props: {
    item: {
      type: Object,
      required: true
    },
    styling: {
      type: Object,
      default: () => {}
    }
  }
})
</script>
<style lang="scss" scoped>

</style>
