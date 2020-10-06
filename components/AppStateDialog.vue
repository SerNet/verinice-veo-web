<template>
  <v-dialog :value="value" persistent max-width="290" @input="$emit('input', $event)">
    <v-card>
      <v-card-title v-if="title" class="headline" v-text="title" />
      <v-card-text>
        <slot />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn v-for="btn in btns" :key="btn.id" text @click="onClick(btn)" v-text="btn.text" />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script lang="ts">
import Vue, { PropOptions } from 'vue'

const BUTTON_MAP = {
  yes: 'Ja',
  no: 'Nein',
  ok: 'OK',
  cancel: 'Abbrechen'
}

interface IButton {
  id: string
  text: string
}

type Btn = keyof typeof BUTTON_MAP | IButton

export default Vue.extend({
  props: {
    title: { type: String, default: '' },
    text: { type: String, default: '' },
    buttons: { type: [Array], default: () => ['yes', 'no'] } as PropOptions<Btn[]>,
    value: { type: undefined, default: false }
  },
  computed: {
    btns(): any {
      return this.buttons.map((btn) => {
        return typeof btn === 'object' ? btn : { id: btn, text: BUTTON_MAP[btn] }
      })
    }
  },
  methods: {
    onClick(btn: IButton) {
      this.$emit('input', false)
      this.$emit(btn.id)
      this.$emit('action', btn.id)
    }
  }
})
</script>
