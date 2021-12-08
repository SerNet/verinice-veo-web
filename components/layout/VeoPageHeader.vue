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
import Vue from 'vue';
import SkeletonLoader from 'vuetify/lib/components/VSkeletonLoader';

export default Vue.extend({
  components: {
    SkeletonLoader
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
    titlebarCenter: {
      type: Boolean,
      default: false
    },
    titlebarRight: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    titlebarAlignment(): { 'justify-content': string } {
      return { 'justify-content': this.titlebarCenter ? 'center' : this.titlebarRight ? 'end' : 'start' };
    }
  },
  render(h): any {
    return h('div', { style: { display: 'contents' } }, [
      ...(!!this.title || !!this.$slots.title
        ? [
            h('div', { class: 'd-flex flex-row flex-wrap veo-page__title', style: this.titlebarAlignment }, [
              ...(this.loading
                ? [h(SkeletonLoader, { props: { type: 'text' }, class: 'pb-1 skeleton-title' })]
                : [h(`h${this.headingLevel}`, { class: 'text-no-wrap d-inline pb-1 flex-grow-0' }, this.title), this.$slots.title])
            ])
          ]
        : []),
      ...(this.$slots.header ? [h('div', { class: ['veo-page__header', ...(this.stickyHeader ? ['veo-page__header--sticky'] : [])] }, [this.$slots.header])] : [])
    ]);
  }
});
</script>

<style lang="scss" scoped>
.veo-page__title {
  background: white;
  flex-grow: 0;
}

.veo-page__header {
  background: white;
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
  height: 56px;
  width: 300px;

  ::v-deep .v-skeleton-loader__text {
    height: 32px;
  }
}
</style>