<template>
  <VeoDialog v-model="dialog" :headline="$t('unit.data.delete.headline')">
    <template #default>
      {{ $t('unit.data.delete', { name }) }}
    </template>
    <template #dialog-options>
      <v-btn text color="primary" @click="$emit('input', false)">
        {{ $t('global.button.cancel') }}
      </v-btn>
      <v-spacer />
      <v-btn text color="primary" :disabled="!form" @click="$emit('delete', form.id)">
        {{ $t('global.button.save') }}
      </v-btn>
    </template>
  </VeoDialog>
</template>
<script lang="ts">
import Vue from 'vue'
import { Prop } from 'vue/types/options'

import VeoDialog from '~/components/dialogs/VeoDialog.vue'
import { IBaseObject } from '~/lib/utils'

interface IData {
  dialog: boolean
  noWatch: boolean
}

export default Vue.extend({
  components: {
    VeoDialog
  },
  props: {
    value: {
      type: Boolean,
      required: true
    },
    form: {
      type: Object as Prop<IBaseObject>,
      default: undefined
    }
  },
  data() {
    return {
      dialog: false,
      noWatch: false
    } as IData
  },
  computed: {
    name(): string {
      return this.form?.name ?? ''
    }
  },
  watch: {
    value(newValue: boolean) {
      this.noWatch = true
      this.dialog = newValue
      this.noWatch = false
    },
    dialog(newValue: boolean) {
      if (!this.noWatch) {
        this.$emit('input', newValue)
      }
    }
  },
  mounted() {
    this.dialog = this.value
  }
})
</script>

<style lang="scss" scoped></style>
