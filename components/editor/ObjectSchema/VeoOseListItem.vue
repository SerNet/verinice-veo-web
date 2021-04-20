<template>
  <VeoEditorListItem :title="title" :styling="styling" :translate="translate" two-line>
    <template #description>
      <v-list-item-subtitle><span v-text="description"/></v-list-item-subtitle>
    </template>
    <template #right-space><v-list-item-action class="ml-0" style="width: 36px;"/></template>
  </VeoEditorListItem>
</template>
<script lang="ts">
import { defineComponent } from '@nuxtjs/composition-api'
import { IInputType } from '~/types/VeoEditor'

interface IProps {
  title: string
  description: string
  styling: IInputType
}

export default defineComponent<IProps>({
  props: {
    title: {
      type: String
    },
    description: {
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
