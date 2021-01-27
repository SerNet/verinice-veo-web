<template>
  <v-list dense>
    <v-list-item v-for="item in items" :key="item.id" @click="onClick(item.id)">
      <v-list-item-content>
        <v-list-item-title>{{ item.text }} </v-list-item-title>
      </v-list-item-content>
    </v-list-item>
  </v-list>
</template>

<script lang="ts">
import Vue from 'vue'
import { defineComponent, PropOptions } from '@nuxtjs/composition-api'
import { UISchema } from '~/types/UISchema'
import { JsonPointer } from 'json-ptr'

interface IItem {
  id: string
  text: string
}

interface IProps {
  formSchema: UISchema
}

interface IData {
  items: IItem[]
  scrollWrapper: HTMLElement | null
}

export default Vue.extend({
  props: {
    formSchema: {
      type: Object,
      required: true
    }
  },
  data(): IData {
    return {
      items: [],
      scrollWrapper: null
    }
  },
  watch: {
    formSchema: {
      immediate: true,
      deep: true,
      handler() {
        const flattened = JsonPointer.flatten(this.formSchema)
        // const pattern = /(\/elements\/\d+)+/g
        const layoutPointers = Object.entries<any>(flattened)
          .filter(
            ([key, value]) =>
              !!key &&
              value.type === 'Layout' &&
              value.options &&
              value.options.format === 'group' &&
              value.options.label
          )
          .map(([key, value]) => ({
            id: key.slice(1).replaceAll('/', '-'),
            text: value.options.label as string
          }))

        this.items = layoutPointers

        console.log(flattened, layoutPointers)
      }
    }
  },
  methods: {
    onClick(groupId: string) {
      this.scroll(groupId)
    },
    scroll(groupId: string): void {
      const item = document.getElementById(groupId) // what we want to scroll to
      const wrapper = this.scrollWrapper // the wrapper we will scroll inside
      if (item && wrapper) {
        let count = item.offsetTop - wrapper.scrollTop - 68 // xx = any extra distance from top ex. 60
        wrapper.scrollBy({ top: count, left: 0, behavior: 'smooth' })
      }
    }
  },
  mounted() {
    this.scrollWrapper = document.getElementById('scroll-wrapper')
  }
})
</script>

<style lang="scss" scoped>
@import '~/assets/vuetify.scss';
</style>
