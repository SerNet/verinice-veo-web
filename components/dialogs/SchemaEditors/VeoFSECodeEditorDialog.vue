<template>
  <VeoDialog v-model="dialog.value" large fixed-header fixed-footer :headline="$t('editor.formschema.formschema')">
    <template #default>
      <div style="min-height: 20vh">
        <CodeEditor v-model="$props.code" readonly />
      </div>
    </template>
    <template #dialog-options>
      <v-spacer />
      <v-btn text color="primary" @click="$emit('input', false)">
        {{ $t('global.button.close') }}
      </v-btn>
    </template>
  </VeoDialog>
</template>
<script lang="ts">
import { defineComponent, ref, watch } from '@nuxtjs/composition-api'

import VeoDialog from '~/components/dialogs/VeoDialog.vue'

interface IProps {
  value: boolean
  code: string
}

export default defineComponent<IProps>({
  components: {
    VeoDialog
  },
  props: {
    value: {
      type: Boolean,
      required: true
    },
    code: {
      type: String,
      required: true
    }
  },
  setup(props, context) {
    /**
     * Common dialog stuff (opening and closing)
     */
    const dialog = ref({ value: props.value })

    watch(
      () => props.value,
      (val: boolean) => {
        dialog.value.value = val
      }
    )

    watch(
      () => dialog.value.value,
      (val: boolean) => {
        if (!val) {
          context.emit('input', val)
        }
      }
    )

    return { dialog, close }
  }
})
</script>

<style lang="scss" scoped>
@import '~/assets/vuetify.scss';
</style>
