<template>
  <EditorListItem :title="title" :styling="styling" :translate="translate" />
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
  translate: boolean
}

export default defineComponent<IProps>({
  props: {
    title: {
      type: String
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
<style lang="scss" scoped></style>
