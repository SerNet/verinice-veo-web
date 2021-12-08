<!--
   - verinice.veo web
   - Copyright (C) 2021  Jonas Heitmann, Davit Svandize
   - 
   - This program is free software: you can redistribute it and/or modify
   - it under the terms of the GNU Affero General Public License as published by
   - the Free Software Foundation, either version 3 of the License, or
   - (at your option) any later version.
   - 
   - This program is distributed in the hope that it will be useful,
   - but WITHOUT ANY WARRANTY; without even the implied warranty of
   - MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   - GNU Affero General Public License for more details.
   - 
   - You should have received a copy of the GNU Affero General Public License
   - along with this program.  If not, see <http://www.gnu.org/licenses/>.
-->
<script lang="ts">
import Vue from 'vue';
import { PropType } from 'vue/types/options';

import VeoCollapseButton from '~/components/layout/VeoCollapseButton.vue';

export default Vue.extend({
  components: {
    VeoCollapseButton
  },
  props: {
    title: {
      type: String,
      default: undefined
    },
    titleClass: {
      type: String,
      default: undefined
    },
    collapsableLeft: {
      type: Boolean,
      default: false
    },
    collapsableRight: {
      type: Boolean,
      default: false
    },
    pageWidth: {
      type: Array as PropType<(String | Number)[]>,
      default: () => []
    },
    pageWidthLg: {
      type: Array as PropType<(String | Number)[]>,
      default: () => []
    },
    pageWidthXl: {
      type: Array as PropType<(String | Number)[]>,
      default: () => []
    },
    pageTitles: {
      type: Array as PropType<String[]>,
      default: () => []
    }
  },
  data() {
    return {
      observer: undefined as MutationObserver | undefined,
      collapsablePages: [] as Boolean[],
      collapsedPages: [] as Boolean[],
      oldPagesCount: 0 as number
    };
  },
  watch: {
    // Reset pages if collapsable left or right change (to avoid having a collapsed page if it isn't allowed to collapse anymore)
    collapsableLeft() {
      this.onPageCountChange();
    },
    collapsableRight() {
      this.onPageCountChange();
    }
  },
  mounted() {
    this.observer = new MutationObserver(() => {
      this.onPageCountChange();
    });
    this.observer.observe(this.$refs.wrapper as Element, { childList: true });
    this.onPageCountChange();

    this.enableKeybinds();
  },
  destroyed() {
    if (this.observer) {
      this.observer.disconnect();
    }

    this.destroyKeybinds();
  },
  methods: {
    /**
     * Index of the page which should be toggled
     */
    togglePage(index: number): void {
      // We use Vue.set as vue won't pick up changes if we alter data via this.collapsedPages[index]
      Vue.set(this.collapsedPages, index, !this.collapsedPages[index]);
      this.$emit('page-collapsed', this.collapsedPages);
    },
    /**
     * Called initally and if the amount of pages change during runtime to update the arrays controlling
     * which pages can be collapsed and their state.
     */
    onPageCountChange() {
      if (this.$refs.wrapper) {
        const currentPagesCount = (this.$refs.wrapper as Element).children.length;

        // Only reinitialize arrays if the amount of children changed
        if (currentPagesCount !== this.oldPagesCount) {
          // Only make the page on the very left and very right collapsable if passed by prop, all other pages aren't collapsable
          this.collapsablePages = Array(currentPagesCount).fill(false);
          this.collapsablePages[0] = this.collapsableLeft;
          this.collapsablePages[this.collapsablePages.length - 1] = this.collapsableRight;

          // Expand all pages (resets the state even if previous pages have been collapsed)
          this.collapsedPages = Array(currentPagesCount).fill(false);
          this.oldPagesCount = currentPagesCount;

          this.destroyKeybinds();
          this.enableKeybinds();
        }
      }
    },
    /**
     * Helper function to find out whether the previous page is collapsed
     */
    previousPageIsCollapsed(index: number) {
      return index > 0 && this.collapsedPages[index - 1];
    },
    /**
     * Helper function to find out whether the next page is collapsed
     */
    nextPageIsCollapsed(index: number) {
      return index < this.collapsablePages.length - 1 && this.collapsedPages[index + 1];
    },
    enableKeybinds() {
      document.addEventListener('keydown', this.onKeyPress);
    },
    destroyKeybinds() {
      document.removeEventListener('keydown', this.onKeyPress);
    },
    /**
     * Called when the user presses any key. The function only does stuff if Alt+(0-9) is pressed.
     */
    onKeyPress(event: KeyboardEvent) {
      if (event.repeat) {
        return;
      }
      if (event.altKey && event.key >= '0' && event.key <= '9') {
        let index = Number(event.key);
        if (index === 0) {
          index = 10;
        }

        // If the page count is two, we have to behave a bit different to avoid not showing any page
        if (this.oldPagesCount === 2) {
          if (index === 1) {
            this.togglePage(0);
            if (this.nextPageIsCollapsed(0)) {
              this.togglePage(1);
            }
          } else {
            this.togglePage(1);
            if (this.previousPageIsCollapsed(1)) {
              this.togglePage(0);
            }
          }
        } else if (index <= this.oldPagesCount && this.collapsablePages[index - 1]) {
          this.togglePage(index - 1);
        }
      }
    },
    /**
     * Creates an array containing all classes that should be applied to a page. Contains a fallback if no props are passed.
     *
     * @param index The index of the page to look for values for
     */
    localPageWidth(index: number): string[] {
      const classes = [];

      if (this.pageWidth[index]) {
        classes.push(`col-${this.pageWidth[index]}`);
      }

      if (this.pageWidthLg[index]) {
        classes.push(`col-lg-${this.pageWidthLg[index]}`);
      }

      if (this.pageWidthXl[index]) {
        classes.push(`col-xl-${this.pageWidthXl[index]}`);
      }

      if (classes.length === 0) {
        classes.push(`col-${Math.floor(12 / (this.oldPagesCount - this.collapsedPages.filter((page) => page).length))}`);
      }

      return classes;
    }
  },
  render(h): any {
    return h(
      'div',
      {
        class: 'fill-width fill-height d-flex flex-column overflow-hidden'
      },
      [
        h(
          'div',
          {
            class: this.$props.titleClass
          },
          [
            ...(this.$props.title
              ? [
                  h('h1', {
                    domProps: {
                      innerText: this.$props.title
                    },
                    class: 'd-inline px-10 py-1 flex-grow-0'
                  })
                ]
              : [this.$slots.title ? this.$slots.title : []]),
            this.$slots.header ? this.$slots.header : []
          ]
        ),
        h(
          'div',
          {
            props: {
              noGutters: true
            },
            class: 'd-flex flex-nowrap overflow-hidden flex-grow-1',
            ref: 'wrapper'
          },
          (this.$slots.default ? this.$slots.default : [])
            .filter((slot) => slot.tag)
            .map((slotItem, index) => {
              if (slotItem.componentOptions?.propsData) {
                (slotItem.componentOptions.propsData as any).isPageWrapperChild = true;
                (slotItem.componentOptions.propsData as any).fullsize = true;
              }

              return [
                h(
                  'div',
                  {
                    style: {
                      position: 'relative',
                      display: this.collapsedPages[index] ? 'none' : 'flex'
                    },
                    class: ['flex-row', ...this.localPageWidth(index), 'pa-0']
                  },
                  [
                    ...(index > 0 && !this.previousPageIsCollapsed(index) && index < this.collapsedPages.length
                      ? [h('div', { style: { 'border-right': '1px solid #0000001F' } })]
                      : []),
                    ...((index === this.collapsablePages.length - 1 && this.collapsablePages[index]) || this.previousPageIsCollapsed(index)
                      ? [
                          h(VeoCollapseButton, {
                            props: {
                              value: this.previousPageIsCollapsed(index),
                              right: false,
                              pageTitle: this.previousPageIsCollapsed(index) ? this.pageTitles[index - 1] : this.pageTitles[index],
                              index: this.previousPageIsCollapsed(index) ? index - 1 : index
                            },
                            on: {
                              input: () => this.togglePage(this.previousPageIsCollapsed(index) ? index - 1 : index)
                            }
                          })
                        ]
                      : []),
                    slotItem,
                    ...((index === 0 && this.collapsablePages[index]) || this.nextPageIsCollapsed(index)
                      ? [
                          h(VeoCollapseButton, {
                            props: {
                              value: this.nextPageIsCollapsed(index),
                              right: true,
                              pageTitle: this.nextPageIsCollapsed(index) ? this.pageTitles[index + 1] : this.pageTitles[index],
                              index: this.nextPageIsCollapsed(index) ? index + 1 : index
                            },
                            on: {
                              input: () => this.togglePage(this.nextPageIsCollapsed(index) ? index + 1 : index)
                            }
                          })
                        ]
                      : [])
                  ]
                )
              ];
            })
        ),
        this.$slots.helpers ? this.$slots.helpers : []
      ]
    );
  }
});
</script>
