<template>
  <VeoDialog v-model="dialog" :headline="$t('headline')">
    <template #default>
      {{ $t('create_entity') }}
      <v-select
        v-model="type"
        :items="schemas"
      />
    </template>
    <template #dialog-options>
      <v-btn text color="primary" @click="$emit('input', false)">
        {{ $t('global.button.cancel') }}
      </v-btn>
      <v-spacer />
      <v-btn
        text
        color="primary"
        :disabled="!type"
        @click="$emit('create-entity', type)"
      >
        {{ $t('global.button.save') }}
      </v-btn>
    </template>
  </VeoDialog>
</template>
<i18n>
{
  "en": {
    "create_entity": "Please specify the type of the new object.",
    "headline": "Create new object"
  },
  "de": {
    "create_entity": "Bitte wählen Sie den Typ des neuen Objektes.",
    "headline": "Objekt erstellen"
  }
}
</i18n>

<script lang="ts">
import Vue from 'vue'
import { Prop } from 'vue/types/options'

import VeoDialog from '~/components/layout/VeoDialog.vue'

interface IData {
  dialog: boolean
  noWatch: boolean
  type?: string
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
    schemas: {
      type: Array as Prop<string[]>,
      default: () => []
    }
  },
  data() {
    return {
      dialog: false,
      noWatch: false,
      type: undefined
    } as IData
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

      if (newValue) {
        this.type = undefined
      }
    }
  },
  mounted() {
    this.dialog = this.value
  }
})
</script>
