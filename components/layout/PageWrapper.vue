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
<template>
  <component :is="render" />
</template>

<script setup lang="ts">
import { isObject } from 'lodash';
import { useDisplay } from 'vuetify';
import { VSkeletonLoader } from 'vuetify/components';
import LayoutCollapseButton from '~/components/layout/CollapseButton.vue';

interface Props {
  title?: string;
  titleClass?: string;
  loading?: boolean;
  collapsableLeft?: boolean;
  collapsableRight?: boolean;
  headingLevel?: number;
  pageWidths?: (string | number)[];
  pageWidthsLg?: (string | number)[];
  pageWidthsXl?: (string | number)[];
  pageTitles?: string[];
  unresponsivePageWidths?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  title: undefined,
  titleClass: undefined,
  loading: false,
  collapsableLeft: false,
  collapsableRight: false,
  headingLevel: 1,
  pageWidths: () => [],
  pageWidthsLg: () => [],
  pageWidthsXl: () => [],
  pageTitles: () => [],
  unresponsivePageWidths: false
});

const emit = defineEmits<{ 'page-collapsed': [states: boolean[]] }>();

const attrs = useAttrs();
const slots = useSlots();
const { lgAndUp, xl } = useDisplay();

const observer = ref<MutationObserver | undefined>();
const wrapper = ref();
const collapsablePages = ref<boolean[]>([]);
const pagesCollapsedStates = ref<boolean[]>([]);
const currentPageCount = ref(0);

// Shortcut stuff
const enableKeybinds = () => {
  document.addEventListener('keydown', onKeyPress);
};
const destroyKeybinds = () => {
  document.removeEventListener('keydown', onKeyPress);
};

onMounted(() => {
  observer.value = new MutationObserver(() => {
    onPageCountChange();
  });
  observer.value.observe(wrapper.value, { childList: true });
  onPageCountChange();
  enableKeybinds();
});

onUnmounted(() => {
  if (observer.value) {
    observer.value.disconnect();
    destroyKeybinds();
  }
});

/**
 * Index of the page which should be toggled
 */
const togglePage = (index: number) => {
  pagesCollapsedStates.value[index] = !pagesCollapsedStates.value[index];
  emit('page-collapsed', pagesCollapsedStates.value);
};
/**
 * Called initally and if the amount of pages change during runtime to update the arrays controlling
 * which pages can be collapsed and their state.
 */
const onPageCountChange = () => {
  if (wrapper.value) {
    const _currentPagesCount = wrapper.value.children.length;

    // Only reinitialize arrays if the amount of children changed
    if (_currentPagesCount !== currentPageCount.value) {
      // Only make the page on the very left and very right collapsable if passed by prop, all other pages aren't collapsable
      collapsablePages.value = Array(_currentPagesCount).fill(false);
      collapsablePages.value[0] = props.collapsableLeft;
      collapsablePages.value[collapsablePages.value.length - 1] = props.collapsableRight;

      // Expand all pages (resets the state even if previous pages have been collapsed)
      pagesCollapsedStates.value = Array(_currentPagesCount).fill(false);
      currentPageCount.value = _currentPagesCount;

      destroyKeybinds();
      enableKeybinds();
    }
  }
};

watch(() => props.collapsableLeft, onPageCountChange);
watch(() => props.collapsableRight, onPageCountChange);
/**
 * Helper function to find out whether the previous page is collapsed
 */
const previousPageIsCollapsed = (index: number) => index > 0 && pagesCollapsedStates.value[index - 1];
/**
 * Helper function to find out whether the next page is collapsed
 */
const nextPageIsCollapsed = (index: number) =>
  index < collapsablePages.value.length - 1 && pagesCollapsedStates.value[index + 1];

/**
 * Called when the user presses any key. The function only does stuff if Alt+(0-9) is pressed.
 */
const onKeyPress = (event: KeyboardEvent) => {
  if (event.repeat) {
    return;
  }
  if ((event.altKey || event.ctrlKey) && event.key >= '0' && event.key <= '9') {
    let digit = Number(event.key);
    if (digit === 0) {
      digit = 10;
    }

    if (collapsablePages.value[digit - 1]) {
      // If the page count is two, we have to behave a bit different to avoid not showing any page
      if (currentPageCount.value === 2) {
        if (digit === 1) {
          togglePage(0);
          if (nextPageIsCollapsed(0)) {
            togglePage(1);
          }
        } else {
          togglePage(1);
          if (previousPageIsCollapsed(1)) {
            togglePage(0);
          }
        }
      } else if (digit <= currentPageCount.value && collapsablePages.value[digit - 1]) {
        togglePage(digit - 1);
      }
    }
  }
};
/**
 * Creates an array containing all classes that should be applied to a page. Contains a fallback if no props are passed.
 *
 * @param index The index of the page to look for values for
 */
const localPageWidth = (index: number): { classes: string[]; styles: Record<string, any> } => {
  const classes = [];
  let styles = {};

  if (props.pageWidths[index]) {
    classes.push(`v-col-${props.pageWidths[index]}`);

    if (props.unresponsivePageWidths) {
      if (isObject(props.pageWidths[index])) {
        styles = props.pageWidths[index];
      } else {
        styles = {
          width: props.pageWidths[index],
          minWidth: props.pageWidths[index]
        };
      }
    }
  }

  if (props.pageWidthsLg[index]) {
    classes.push(`v-col-lg-${props.pageWidthsLg[index]}`);
    if (props.unresponsivePageWidths && lgAndUp.value) {
      if (isObject(props.pageWidthsLg[index])) {
        styles = props.pageWidthsLg[index];
      } else {
        styles = {
          width: props.pageWidthsLg[index],
          minWidth: props.pageWidthsLg[index]
        };
      }
    }
  }

  if (props.pageWidthsXl[index]) {
    classes.push(`v-col-xl-${props.pageWidthsXl[index]}`);
    if (props.unresponsivePageWidths && xl.value) {
      if (isObject(props.pageWidthsXl[index])) {
        styles = props.pageWidthsXl[index];
      } else {
        styles = {
          width: props.pageWidthsXl[index],
          minWidth: props.pageWidthsXl[index]
        };
      }
    }
  }

  if (classes.length === 0) {
    classes.push(
      `v-col-${Math.floor(12 / (currentPageCount.value - pagesCollapsedStates.value.filter((page) => page).length))}`
    );
  }

  return {
    classes: props.unresponsivePageWidths ? [] : classes,
    styles: props.unresponsivePageWidths ? styles : {}
  };
};

const render = () =>
  h(
    'div',
    {
      ...attrs,
      class: 'fill-width fill-height d-flex flex-column overflow-hidden'
    },
    [
      h(
        'div',
        {
          class: props.titleClass
        },
        [
          ...(props.loading ?
            [
              h(VSkeletonLoader, {
                type: 'text',
                class: 'skeleton-title px-4 py-1'
              })
            ]
          : [
              ...(props.title ?
                [
                  h(`h${props.headingLevel}`, {
                    innerText: props.title,
                    class: `d-inline flex-grow-0 text-h${props.headingLevel}`
                  })
                ]
              : []),
              ...(slots.title ? [slots.title()] : [])
            ]),
          slots.header ? slots.header() : []
        ]
      ),
      h(
        'div',
        {
          class: 'd-flex flex-nowrap overflow-hidden flex-grow-1',
          ref: wrapper
        },
        (slots.default ? slots.default() : [])
          // @ts-ignore TODO #3066 __name does not exist?
          .filter((slot) => slot.type.__name === 'BasePage')
          .map((slotItem, index) => {
            if (slotItem.props) {
              slotItem.props.isPageWrapperChild = true;
            }

            const { classes, styles } = localPageWidth(index);

            return [
              h(
                'div',
                {
                  style: {
                    position: 'relative',
                    display: pagesCollapsedStates.value[index] ? 'none' : 'flex',
                    ...styles
                  },
                  class: ['flex-row', classes, 'pa-0']
                },
                [
                  ...((
                    (index === collapsablePages.value.length - 1 && collapsablePages.value[index]) ||
                    previousPageIsCollapsed(index)
                  ) ?
                    [
                      h(
                        'div',
                        {
                          style: 'width: 16px',
                          class: 'fill-height'
                        },
                        [
                          h(LayoutCollapseButton, {
                            modelValue: previousPageIsCollapsed(index),
                            right: false,
                            elementName:
                              previousPageIsCollapsed(index) ? props.pageTitles[index - 1] : props.pageTitles[index],
                            index: previousPageIsCollapsed(index) ? index - 1 : index,
                            'onUpdate:modelValue': () => togglePage(previousPageIsCollapsed(index) ? index - 1 : index)
                          })
                        ]
                      )
                    ]
                  : []),
                  h(slotItem),
                  ...((index === 0 && collapsablePages.value[index]) || nextPageIsCollapsed(index) ?
                    [
                      h('div', { style: 'width: 16px', class: 'fill-height' }, [
                        h(LayoutCollapseButton, {
                          modelValue: nextPageIsCollapsed(index),
                          right: true,
                          elementName:
                            nextPageIsCollapsed(index) ? props.pageTitles[index + 1] : props.pageTitles[index],
                          index: nextPageIsCollapsed(index) ? index + 1 : index,
                          'onUpdate:modelValue': () => togglePage(nextPageIsCollapsed(index) ? index + 1 : index)
                        })
                      ])
                    ]
                  : [])
                ]
              )
            ];
          })
      ),
      slots.helpers ? slots.helpers() : []
    ]
  );
</script>

<style lang="scss" scoped>
.skeleton-title {
  align-items: center;
  display: flex;
  height: 33.59px;
  width: 300px;

  :deep(.v-skeleton-loader__text) {
    height: 22.4px;
  }
}
</style>
