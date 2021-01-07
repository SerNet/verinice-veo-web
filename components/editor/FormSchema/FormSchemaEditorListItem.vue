<template>
  <EditorListItem :title="title" :styling="styling"></EditorListItem>
</template>
<script lang="ts">
import { defineComponent } from '@nuxtjs/composition-api'
import { IVEOBasicProperty, IVEOCustomAspect, IVEOCustomLink } from '~/lib/ObjectSchemaHelper'
import { IInputType } from '~/types/VEOEditor'

interface IProps {
  title: string
  description: string
  styling: IInputType
  disabled: boolean
}

export default defineComponent<IProps>({
  props: {
    title: {
      type: String
    },
    styling: {
      type: Object,
      default: () => {}
    }
  }
})
</script>
<style lang="scss" scoped></style>
