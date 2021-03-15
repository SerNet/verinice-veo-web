<template>
  <VeoDialog v-model="dialog" :headline="$t('headline')">
    <template #default>
      <v-form v-model="form.valid" @submit.prevent>
        <v-text-field v-model="form.data.name" :rules="form.rules.name" required :label="$t('scope_name')" />
        <v-text-field
          v-model="form.data.abbreviation"
          :rules="form.rules.abbreviation"
          required
          :label="$t('scope_abbreviation')"
        />
      </v-form>
    </template>
    <template #dialog-options>
      <v-btn text color="primary" @click="$emit('input', false)">
        {{ $t('global.button.cancel') }}
      </v-btn>
      <v-spacer />
      <v-btn
        text
        color="primary"
        :disabled="!form.valid"
        @click="$emit('create-scope', { name: form.data.name, abbreviation: form.data.abbreviation })"
      >
        {{ $t('global.button.save') }}
      </v-btn>
    </template>
  </VeoDialog>
</template>
<i18n>
{
  "en": {
    "add_subentities": "Add sub objects to \"{name}\"",
    "headline": "Create new scope",
    "scope_abbreviation": "Abbreviation of the new scope",
    "scope_name": "Name of the new scope"
  },
  "de": {
    "add_subentities": "Unterobjekte zu \"{name}\" hinzufügen",
    "headline": "Neues Scope erstellen",
    "scope_abbreviation": "Abkürzung des neuen Scopes",
    "scope_name": "Name des neuen Scopes"
  }
}
</i18n>

<script lang="ts">
import { trim } from 'lodash'
import Vue from 'vue'

import VeoDialog from '~/components/dialogs/VeoDialog.vue'

interface IData {
  dialog: boolean
  noWatch: boolean
  form: {
    valid: boolean
    data: {
      name: string
      abbreviation: string
    }
    rules: {
      [key: string]: ((input: string) => boolean)[]
    }
  }
}

export default Vue.extend({
  components: {
    VeoDialog
  },
  props: {
    value: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      dialog: false,
      noWatch: false,
      form: {
        valid: false,
        data: {
          name: '',
          abbreviation: ''
        },
        rules: {
          name: [(input: string) => trim(input).length > 0 || this.$t('global.input.required')],
          abbreviation: [(input: string) => trim(input).length > 0 || this.$t('global.input.required')]
        }
      }
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
        this.form.data.name = ''
        this.form.data.abbreviation = ''
      }
    }
  },
  mounted() {
    this.dialog = this.value
  }
})
</script>

<style lang="scss" scoped></style>
