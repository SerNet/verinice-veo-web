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
  },
  destroyed() {
    if (this.observer) {
      this.observer.disconnect();
    }
  },
  methods: {
    /**
     * Index of the page which should be toggled
     */
    togglePage(index: number): void {
      // We use Vue.set as vue won't pick up changes if we alter data via this.collapsedPages[index]
      Vue.set(this.collapsedPages, index, !this.collapsedPages[index]);
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
                    class: 'd-inline px-4 py-1 flex-grow-0'
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
            class: 'row flex-nowrap overflow-hidden',
            ref: 'wrapper'
          },
          (this.$slots.default ? this.$slots.default : []).map((slotItem, index) =>
            h(
              'div',
              {
                style: {
                  position: 'relative',
                  display: this.collapsedPages[index] ? 'none' : 'block'
                }
              },
              [
                ...((index === this.collapsablePages.length - 1 && this.collapsablePages[index]) || this.previousPageIsCollapsed(index)
                  ? [
                      h(VeoCollapseButton, {
                        props: {
                          value: false,
                          right: false
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
                          value: false,
                          right: true
                        },
                        on: {
                          input: () => this.togglePage(this.nextPageIsCollapsed(index) ? index + 1 : index)
                        }
                      })
                    ]
                  : [])
              ]
            )
          )
        ),
        this.$slots.helper ? this.$slots.helper : []
      ]
    );
  }
});
</script>
