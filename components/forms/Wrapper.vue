<template>
  <div class="vf-wrapper d-flex flex-column">
    <v-pagination v-if="length > 1" :value="page" :length="length" :total-visible="7" @input="onPageChange" class="mt-3" />
    <slot />
    <v-pagination v-if="length > 1" :value="page" :length="length" :total-visible="7" @input="onPageChange" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
  name: 'Wrapper',
  props: {
    page: {
      type: Number,
      default: 1
    },
    length: {
      type: Number,
      default: 1
    }
  },
  methods: {
    onPageChange(event: any) {
      this.$emit('input', event)
      const scrollingLayout = document.querySelector('.vf-wrapper > .vf-layout.vf-group') as Element

      if (scrollingLayout !== null) {
        scrollingLayout.scrollTo(0, 0)
      } else {
        console.error("Selector '#app .veo-form' does not exist. Please, look in app.vue, how .veo-form is defined")
      }
    }
  }
})
</script>

<style lang="scss" scoped>
::v-deep {
  button:focus {
    outline: none;
  }
}
</style>
