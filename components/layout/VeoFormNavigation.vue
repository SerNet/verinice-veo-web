<template>
  <v-list dense class="pa-0">
    <template v-for="item in items">
      <v-list-item :key="item.initialId + '0'" @click="onClick(item.initialId)">
        <v-list-item-content>
          <v-list-item-title :class="currentLevelLeftMargin">{{ item.text }}</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
      <VeoFormNavigation
        :formSchema="item.layout"
        :initialId="item.initialId"
        :key="item.initialId + '1'"
        :nestingLevel="nextNestingLevel"
      />
    </template>
  </v-list>
</template>

<script lang="ts">
import Vue from 'vue'
import { UISchema } from '~/types/UISchema'

interface IItem {
  initialId: string
  text: string
  layout: UISchema
}

interface IProps {
  formSchema: UISchema
  initialFormSchemaPointer: string
}

interface IData {
  items: IItem[]
  scrollWrapper: HTMLElement | null
}

export default Vue.extend({
  // Component is recursive and name is required!!!
  name: 'VeoFormNavigation',
  props: {
    formSchema: {
      type: Object,
      required: true
    },
    initialId: {
      type: String,
      default: ''
    },
    nestingLevel: {
      type: Number,
      default: 0
    }
  },
  data(): IData {
    return {
      items: [],
      scrollWrapper: null
    }
  },
  computed: {
    nextNestingLevel(): number {
      return this.nestingLevel + 1
    },
    currentLevelLeftMargin(): string {
      return `ml-${this.nestingLevel * 4}`
    }
  },
  watch: {
    formSchema: {
      immediate: true,
      deep: true,
      handler() {
        this.items = this.formSchema?.elements
          ?.map((el: any, index: number) => {
            // Important to iterate on all elements to have correct indices of Layouts in FormSchema
            return el.type === 'Layout' && el.options && el.options.format === 'group'
              ? {
                  // "" + "elements-0"
                  // "elements" + "-elements-0"
                  initialId: `${this.initialId}${this.initialId ? '-' : ''}elements-${index}`,
                  text: el.options.label,
                  layout: el
                }
              : {} // This is generated for non LayoutGroup elements and filtered in the next step
          })
          .filter((el: any) => !!el.text)
      }
    }
  },
  methods: {
    onClick(groupId: string) {
      this.scroll(groupId)
    },
    scroll(groupId: string): void {
      // Scroll problems with sticky header solve with https://github.com/iamdustan/smoothscroll/issues/47#issuecomment-350810238
      // What we want to scroll to
      const item = document.getElementById(groupId)
      // The wrapper we will scroll inside
      const wrapper = this.scrollWrapper
      const header = this.scrollWrapper?.getElementsByClassName('veo-page__header')[0] as HTMLElement | null
      if (item && wrapper && header) {
        // header.offsetHeight =  extra distance from top (=sticky-header height)
        let count = item.offsetTop - wrapper.scrollTop - header.offsetHeight
        wrapper.scrollBy({ top: count, left: 0, behavior: 'smooth' })
      }
    }
  },
  mounted() {
    // Cache scrollWrapper element
    this.scrollWrapper = document.getElementById('scroll-wrapper')
  }
})
</script>

<style lang="scss" scoped>
@import '~/assets/vuetify.scss';
</style>
