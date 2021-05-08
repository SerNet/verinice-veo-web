<template>
  <VeoEditorListItem :title="title" :styling="styling" :translate="translate" two-line>
    <template #description>
      <v-list-item-subtitle><span v-text="localizedDescription"/></v-list-item-subtitle>
    </template>
    <template #right-space><v-list-item-action class="ml-0" style="width: 36px;"/></template>
  </VeoEditorListItem>
</template>
<script lang="ts">
import { computed, ComputedRef, defineComponent, inject, Ref } from '@nuxtjs/composition-api'
import ObjectSchemaHelper from '~/lib/ObjectSchemaHelper2'
import { IInputType } from '~/types/VeoEditor'

interface IProps {
  title: string
  prefix: string
  description: string
  twoLine: boolean
  styling: IInputType
  translate: boolean
}

export default defineComponent<IProps>({
  props: {
    title: {
      type: String
    },
    prefix: {
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
  },
  setup(props) {
    const displayLanguage: Ref<string> | undefined = inject('displayLanguage');
    const objectSchemaHelper: Ref<ObjectSchemaHelper> | undefined = inject('objectSchemaHelper');

    const localizedDescription: ComputedRef<string> = computed(() => {
      let localizedDescription
      if(displayLanguage && objectSchemaHelper) {
        localizedDescription = (objectSchemaHelper.value as ObjectSchemaHelper).getTranslation(
          displayLanguage.value as string,
          `${props.prefix}${props.title}`
        );
      }

      return localizedDescription ?? props.description
    })

    return {
      localizedDescription
    }
  }
})
</script>
