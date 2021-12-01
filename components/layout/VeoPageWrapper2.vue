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
import { defineComponent, onUnmounted, Ref, ref, watch } from '@nuxtjs/composition-api';

import VeoCollapseButton from '~/components/layout/VeoCollapseButton.vue';

interface IProps {
  title: String;
  titleClass: String;
  collapsableLeft: Boolean;
  collapsableRight: Boolean;
}

export default defineComponent<IProps>({
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
  setup(props) {
    // Reference to the wrapper containing all pages
    const wrapper = ref<HTMLDivElement>();

    // MutationObserver handling updating the state of this component if the amount of pages changes during runtime
    const observer = new MutationObserver(() => {
      onPageCountChange();
    });

    watch(wrapper, (newValue, oldValue) => {
      if (!oldValue && newValue) {
        if (wrapper.value) {
          observer.observe(wrapper.value, { childList: true });
          onPageCountChange();
        }
      }
    });

    onUnmounted(() => {
      observer.disconnect();
    });

    // Reset pages if collapsable left or right change (to avoid having a collapsed page if it isn't allowed to collapse anymore)
    watch(
      () => props.collapsableLeft,
      () => {
        onPageCountChange();
      }
    );
    watch(
      () => props.collapsableRight,
      () => {
        onPageCountChange();
      }
    );

    // Handling of collapsable pages and their state
    const collapsedPages: Ref<Boolean[]> = ref([]);
    const collapsablePages: Ref<Boolean[]> = ref([]);

    /**
     * Index of the page which should be toggled
     */
    function togglePage(index: number): void {
      collapsedPages.value[index] = !collapsedPages.value[index];
    }

    /**
     * Called initally and if the amount of pages change during runtime to update the arrays controlling
     * which pages can be collapsed and their state.
     */
    function onPageCountChange() {
      if (wrapper.value) {
        // Only make the page on the very left and very right collapsable if passed by prop, all other pages aren't collapsable
        collapsablePages.value = Array(wrapper.value.children.length).fill(false);
        collapsablePages.value[0] = props.collapsableLeft;
        collapsablePages.value[collapsablePages.value.length - 1] = props.collapsableRight;

        // Expand all pages (resets the state even if previous pages have been collapsed)
        collapsedPages.value = Array(wrapper.value.children.length).fill(false);
      }
    }

    /**
     * Helper function to find out whether the previous page is collapsed
     */
    function previousPageIsCollapsed(index: number) {
      return index > 0 && collapsedPages.value[index - 1];
    }

    /**
     * Helper function to find out whether the next page is collapsed
     */
    function nextPageIsCollapsed(index: number) {
      return index < collapsablePages.value.length - 1 && collapsedPages.value[index + 1];
    }

    return {
      collapsablePages,
      collapsedPages,
      nextPageIsCollapsed,
      previousPageIsCollapsed,
      togglePage,
      wrapper
    };
  },
  render(h) {
    // As this is an options api method, it doesn't know what setup returns and thus everything is of type unknown, we remove those error messages by just casting it to any
    const vm = this as any;
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
                  display: vm.collapsedPages[index] ? 'none' : 'block'
                }
              },
              [
                ...((index === vm.collapsablePages.length - 1 && vm.collapsablePages[index]) || vm.previousPageIsCollapsed(index)
                  ? [
                      h(VeoCollapseButton, {
                        props: {
                          value: vm.previousPageIsCollapsed(index) ? vm.collapsedPages[index - 1] : vm.collapsedPages[index],
                          right: false
                        },
                        on: {
                          input: () => vm.togglePage(vm.previousPageIsCollapsed(index) ? index - 1 : index)
                        }
                      })
                    ]
                  : []),
                h('div', { class: 'text-center' }, vm.collapsedPages[index]),
                slotItem,
                ...((index === 0 && vm.collapsablePages[index]) || vm.nextPageIsCollapsed(index)
                  ? [
                      h(VeoCollapseButton, {
                        props: {
                          value: vm.nextPageIsCollapsed(index) ? vm.collapsedPages[index + 1] : vm.collapsedPages[index],
                          right: true
                        },
                        on: {
                          input: () => vm.togglePage(vm.nextPageIsCollapsed(index) ? index + 1 : index)
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
