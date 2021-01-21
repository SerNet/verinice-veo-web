<template>
  <VeoDialog v-model="dialog.value" :headline="$t('unit.forms.delete.headline')">
    <template #default>
      {{ $t('unit.forms.delete', { name }) }}
    </template>
    <template #dialog-options>
      <v-btn text color="primary" @click="$emit('input', false)">
        {{ $t('global.button.no') }}
      </v-btn>
      <v-spacer />
      <v-btn text color="primary" :disabled="!$props.form" @click="$emit('delete', $props.form.id)">
        {{ $t('global.button.delete') }}
      </v-btn>
    </template>
  </VeoDialog>
</template>
<script lang="ts">
import { computed, defineComponent, PropType, ref, watch } from '@nuxtjs/composition-api'

import { IBaseObject } from '~/lib/utils'

interface IProps {
  value: boolean
  form: IBaseObject
}

export default defineComponent<IProps>({
  props: {
    value: {
      type: Boolean,
      required: true
    },
    form: {
      type: Object as PropType<IBaseObject>,
      default: undefined
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

    watch(
      () => dialog.value.value,
      (val: boolean) => {
        if (!val) {
          context.emit('input', val)
        }
      }
    )

    const name = computed(() => props.form?.name ?? '')

    return { dialog, name }
  }
})
</script>

<style lang="scss" scoped>
@import '~/assets/vuetify.scss';
</style>
