<template>
  <v-list-item style="background-color: #FAFAFA" two-line>
    <v-list-item-content>
      <v-list-item-title class="body-1 font-weight-bold d-flex align-center">
        {{ item.title }}
      </v-list-item-title>
      <v-list-item-subtitle v-text="$tc('editor.itemlist.attributecount', item.attributes.length || 0)" />
    </v-list-item-content>
    <v-list-item-action class="ml-3">
      <v-chip v-if="styling" :color="styling.color" class="mr-2" small label outlined>
        <span v-if="$props.translate">
          {{ $t(`editor.inputtypes.${styling.name}`) }}
        </span>
        <span v-else-if="styling.name">
          {{ capitalize(styling.name, true) }}
        </span>
      </v-chip>
    </v-list-item-action>

    <v-list-item-action class="ml-0 d-flex flex-row">
      <v-btn icon @click="$emit('edit-item', $event)">
        <v-icon>
          mdi-pencil
        </v-icon>
      </v-btn>
      <v-btn icon @click="$emit('delete-item', $event)">
        <v-icon>
          mdi-delete
        </v-icon>
      </v-btn>
    </v-list-item-action>
  </v-list-item>
</template>
<script lang="ts">
import { defineComponent } from '@nuxtjs/composition-api'

import { IVeoOSHCustomAspect, IVeoOSHCustomLink } from '~/lib/ObjectSchemaHelper2'
import { IInputType } from '~/types/VEOEditor'
import { capitalize } from '~/lib/utils'

interface IProps {
  item: IVeoOSHCustomAspect | IVeoOSHCustomLink
  styling: IInputType
}

export default defineComponent<IProps>({
  props: {
    item: { type: Object, required: true },
    styling: { type: Object, default: () => {} },
    translate: {
      type: Boolean,
      default: false
    }
  },
  setup() {
    return {
      capitalize
    }
  }
})
</script>
