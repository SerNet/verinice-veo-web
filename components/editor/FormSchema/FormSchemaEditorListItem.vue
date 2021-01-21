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
<style lang="scss" scoped>
::v-deep .v-list-item__content {
  padding: 0;
}

::v-deep .v-list-item__content > .v-list-item__title {
  text-overflow: initial;
  overflow: auto;
  height: 48px;
  display: flex;
  align-items: center;
}
</style>
