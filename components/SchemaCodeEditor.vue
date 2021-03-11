<template>
  <div>
    <CodeEditor :value="code" @input="onInput" />
    <div v-if="!readonly" class="veo-editor-save-button">
      <v-btn class="mx-4 my-2" color="primary" outlined :disabled="saveButtonDisabled" @click="updateSchema()">{{
        $t('editor.editor.button.save')
      }}</v-btn>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from '@nuxtjs/composition-api'
import { VeoEvents } from '~/types/VeoGlobalEvents'

interface IProps {
  value: string
  readonly: boolean
}

export default defineComponent<IProps>({
  props: {
    value: { type: String, default: '' },
    readonly: { type: Boolean, default: false }
  },
  setup(props, context) {
    const code = ref('')
    const saveButtonDisabled = ref(true)

    watch(
      () => props.value,
      () => {
        code.value = props.value
      },
      {
        immediate: true
      }
    )

    function onInput(event: string) {
      saveButtonDisabled.value = false
      code.value = event
      context.emit('input', event)
    }

    function updateSchema() {
      if (!props.readonly) {
        try {
          const updatedSchema = JSON.parse(code.value)
          context.emit('schema-updated', updatedSchema)
          context.root.$emit(VeoEvents.SNACKBAR_SUCCESS, {
            title: context.root.$i18n.t('editor.code.save.success'),
            text: ''
          })
        } catch (e) {
          context.root.$emit(VeoEvents.ALERT_ERROR, {
            title: context.root.$i18n.t('editor.code.save.error'),
            text: e.message
          })
        }
      }
      saveButtonDisabled.value = true
    }

    return {
      code,
      saveButtonDisabled,
      onInput,
      updateSchema
    }
  }
})
</script>

<style scoped></style>
