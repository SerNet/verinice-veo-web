<template>
  <v-list-item style="background-color: #FAFAFA" two-line>
    <v-list-item-content>
      <v-list-item-title class="body-1 font-weight-bold" v-text="item.title" />
      <v-list-item-subtitle v-text="$tc('editor.itemlist.attributecount', item.attributes.length || 0)" />
    </v-list-item-content>
    <v-list-item-action class="ml-3">
      <v-chip v-if="styling" :color="styling.color" class="mr-2" small label outlined>{{ styling.name }}</v-chip>
    </v-list-item-action>

    <v-list-item-action class="ml-0">
      <v-btn icon @click="$emit('edit-item', $event)">
        <v-icon>
          mdi-pencil
        </v-icon>
      </v-btn>
    </v-list-item-action>
  </v-list-item>
</template>
<script lang="ts">
import { defineComponent } from '@nuxtjs/composition-api'
import { ITypeInfo } from './ObjectSchemaEditor.vue'
import { IVEOCustomAspect, IVEOCustomLink } from '~/lib/ObjectSchemaHelper'

interface IProps {
  item: IVEOCustomAspect | IVEOCustomLink
  styling: ITypeInfo
}

export default defineComponent<IProps>({
  props: {
    item: { type: Object, required: true },
    styling: { type: Object, default: () => {} }
  }
})
</script>
