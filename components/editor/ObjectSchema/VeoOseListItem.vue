<template>
  <VeoEditorListItem :title="title" :styling="styling" :translate="translate" two-line>
    <template #description>
      <v-list-item-subtitle><span v-text="localizedDescription"/></v-list-item-subtitle>
    </template>
    <template #right-space><v-list-item-action class="ml-0" style="width: 36px;"/></template>
  </VeoEditorListItem>
</template>
<script lang="ts">
import { defineComponent, inject, onMounted, ref, Ref, watch } from '@nuxtjs/composition-api'
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

    /**
     * We sadly can't use a computed ref to get the localized description as vue won't
     * pick up changes in the translations array in the object schema helper.
     */
    const localizedDescription = ref(props.description)
    watch(() => objectSchemaHelper?.value, () => {
      i18n();
    }, { deep: true })

    watch(() => displayLanguage?.value, () => {
      i18n();
    })

    function i18n() {
      if(objectSchemaHelper && displayLanguage) {
        const _localizedDescription = (objectSchemaHelper.value as ObjectSchemaHelper).getTranslation(
          displayLanguage.value as string,
          `${props.prefix}${props.title}`
        );

        localizedDescription.value = _localizedDescription || props.description || ''
      }
    }

    onMounted(() => {
      i18n();
    });

    return {
      localizedDescription
    }
  }
})
</script>
