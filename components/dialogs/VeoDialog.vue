<template>
  <v-dialog v-model="dialog" max-width="80%" :persistent="persistent" :width="large ? '900px' : '450px'">
    <v-card>
      <v-card-title class="headline" :class="large ? '' : 'pl-4 pr-0 py-0'">
        <span>{{ headline }}</span>
        <v-spacer />
        <v-btn :disabled="closeDisabled" fab elevation="0" class="close-button">
          <v-icon color="white" @click="closeDialog()">mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      <v-card-text class="pa-4" style="position: relative;">
        <slot />
      </v-card-text>
      <v-card-actions v-if="hasActions" class="pb-3 px-4">
        <slot name="dialog-options" />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  props: {
    value: {
      type: Boolean,
      default: false
    },
    headline: {
      type: String,
      required: true
    },
    large: {
      type: Boolean,
      default: false
    },
    persistent: {
      type: Boolean,
      default: false
    },
    closeDisabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      dialog: false as boolean,
      noWatch: false as boolean
    }
  },
  computed: {
    hasActions(): boolean {
      return (this.$slots['dialog-options']?.length || 0) > 0
    }
  },
  watch: {
    value(newValue) {
      this.noWatch = true
      this.dialog = newValue
      this.noWatch = false
    },
    dialog(newValue) {
      if (!this.noWatch) {
        if (newValue) {
          this.dialog = newValue
        } else {
          this.$emit('input', false)
        }
      }
    }
  },
  mounted() {
    this.noWatch = true
    this.dialog = this.value
    this.noWatch = false
  },
  methods: {
    closeDialog() {
      this.$emit('input', false)
    }
  }
})
</script>
<style lang="scss" scoped>
@import '~/assets/vuetify.scss';

.headline {
  background-color: $primary;
  color: white;
}

.v-btn.close-button {
  background-color: $primary !important;
}
</style>
