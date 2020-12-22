<template>
  <VeoDialog v-model="dialog.value" :headline="$t('editor.formschema.delete.control.headline')">
    <template #default>
      <v-card-subtitle>{{ $t('editor.formschema.delete.control.text', { element: name }) }}</v-card-subtitle>
    </template>
    <template #dialog-options>
      <v-spacer />
      <v-btn text color="primary" outlined @click="close()">
        {{ $t('global.button.no') }}
      </v-btn>
      <v-btn text color="primary" outlined @click="doDelete()">
        {{ $t('global.button.delete') }}
      </v-btn>
    </template>
  </VeoDialog>
</template>
<script lang="ts">
import { defineComponent, ref, watch } from '@nuxtjs/composition-api'

interface IProps {
  value: boolean
  name: string
}

export default defineComponent<IProps>({
  props: {
    value: {
      type: Boolean,
      required: true
    },
    name: {
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

    function close() {
      context.emit('input', false)
    }

    /**
     * Control types related stuff
     */
    function doDelete() {
      context.emit('delete')
    }

    return { dialog, close, doDelete }
  }
})
</script>

<style lang="scss" scoped>
@import '~/assets/vuetify.scss';
</style>
