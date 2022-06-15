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
import { ComputedRef, defineComponent, h, PropOptions, computed } from '@nuxtjs/composition-api';
import { VSkeletonLoader } from 'vuetify/lib';

export enum VeoPageHeaderAlignment {
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
      type: Number,
      default: VeoPageHeaderAlignment.LEFT
    } as PropOptions<VeoPageHeaderAlignment>,
    color: {
      type: String,
      default: undefined
    }
  },
  setup(props, { slots }) {
    const titlebarAlignment: ComputedRef<{ 'justify-content': string }> = computed(() => {
      return {
        'justify-content': props.titlebarAlignment === VeoPageHeaderAlignment.CENTER ? 'center' : props.titlebarAlignment === VeoPageHeaderAlignment.RIGHT ? 'end' : 'start'
      };
    });
    return () =>
      h('div', { style: { display: 'contents' } }, [
        ...(!!props.title || (!!slots.title && !!slots.title())
          ? [
              h('div', { class: 'd-flex flex-row flex-wrap veo-page__title pt-4', style: { ...titlebarAlignment.value, 'background-color': props.color } }, [
                ...(props.loading
                  ? [h(VSkeletonLoader, { props: { type: 'text' }, class: 'skeleton-title' })]
                  : [h(`h${props.headingLevel}`, { class: `d-inline flex-grow-0 text-h${props.headingLevel}` }, props.title), ...(slots.title ? [slots.title()] : [])])
              ])
            ]
          : []),
        ...(slots.header
          ? [h('div', { class: ['veo-page__header', ...(props.stickyHeader ? ['veo-page__header--sticky'] : [])], style: { 'background-color': props.color } }, [slots.header()])]
          : [])
      ]);
  }
});
</script>

<style lang="scss" scoped>
.veo-page__title {
  background: $background-primary;
  flex-grow: 0;
}

.veo-page__header {
  background: $background-primary;
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

  ::v-deep .v-skeleton-loader__text {
    height: 22.4px;
  }
}
</style>