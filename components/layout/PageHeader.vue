<!--
   - verinice.veo web
   - Copyright (C) 2021  Jonas Heitmann
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
import { ComputedRef, PropType } from 'vue';
import VSkeletonLoader from '~/components/VSkeletonLoader.vue'; // TODO: import { VSkeletonLoader } from 'vuetify/components'; as soon as vuetify adds it back

export enum PageHeaderAlignment {
  LEFT,
  CENTER,
  RIGHT
}

export default defineComponent({
  components: {
    VSkeletonLoader
  },
  props: {
    headingLevel: {
      type: [Number, String],
      default: 1
    },
    loading: {
      type: Boolean,
      default: false
    },
    stickyHeader: {
      type: Boolean,
      default: false
    },
    title: {
      type: [String],
      default: undefined
    },
    titlebarAlignment: {
      type: Number as PropType<PageHeaderAlignment>,
      default: PageHeaderAlignment.LEFT
    },
    color: {
      type: String,
      default: undefined
    }
  },
  setup(props, { slots }) {
    const titlebarAlignment: ComputedRef<{ 'justify-content': string }> = computed(() => {
      return {
        'justify-content':
          props.titlebarAlignment === PageHeaderAlignment.CENTER ? 'center'
          : props.titlebarAlignment === PageHeaderAlignment.RIGHT ? 'end'
          : 'start'
      };
    });
    return () => [
      ...(!!props.title || !!slots.title ?
        [
          h(
            'div',
            {
              class: 'd-flex flex-row flex-wrap veo-page__title mb-2',
              style: {
                ...titlebarAlignment.value,
                'background-color': props.color
              }
            },
            {
              default:
                props.loading ?
                  () =>
                    h(VSkeletonLoader, {
                      type: 'text',
                      class: 'skeleton-title'
                    })
                : () => [
                    h(`h${props.headingLevel}`, {
                      class: `d-inline flex-grow-0 text-h${props.headingLevel} page-title text-uppercase`,
                      innerText: props.title
                    }),
                    ...(slots.title ? [slots.title()] : [])
                  ]
            }
          )
        ]
      : []),
      ...(slots.header ?
        [
          h(
            'div',
            {
              class: ['veo-page__header', ...(props.stickyHeader ? ['veo-page__header--sticky'] : [])],
              style: { 'background-color': props.color }
            },
            {
              default: slots.header
            }
          )
        ]
      : [])
    ];
  }
});
</script>

<style lang="scss" scoped>
.veo-page__title {
  flex-grow: 0;
  background: rgb(var(--v-theme-background));
  padding: 2px 14px;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  color: rgb(var(--v-theme-color));
}

.veo-page__header {
  flex-grow: 0;
  position: relative;
  top: 0;
  z-index: 4;
}

.veo-page__header--sticky {
  position: sticky;
}

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
