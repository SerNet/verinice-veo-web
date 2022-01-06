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
import { defineComponent, ref, h, computed, watch } from '@nuxtjs/composition-api';
import { VTabs, VTabsItems } from 'vuetify/lib';

export default defineComponent({
  components: {
    VTabs,
    VTabsItems
  },
  props: {
    fullsize: {
      type: Boolean,
      default: false
    },
    startTab: {
      type: Number,
      default: 0
    },
    stickyTabs: {
      type: Boolean,
      default: false
    }
  },
  setup(props, { slots }) {
    const activeTabIndex = ref(props.startTab);

    return () => {
      const tabs = computed(() => (slots.tabs ? slots.tabs() : []));
      const activeTab = computed(() => tabs.value[activeTabIndex.value]);

      // Automatically switch tabs if the tab the user is currently in gets disabled
      watch(
        () => activeTab.value,
        (newValue) => {
          const activeTabIsDisabled: boolean = (newValue.componentOptions?.propsData as any)?.disabled;
          if (activeTabIsDisabled) {
            activeTabIndex.value = (activeTabIndex.value + 1) % tabs.value.length;
          }
        }
      );

      return h(
        'div',
        {
          class: {
            'fill-width': props.fullsize,
            'veo-tab--sticky': props.stickyTabs
          }
        },
        [
          h(
            VTabs,
            {
              props: {
                value: activeTabIndex.value
              },
              on: {
                change: (newValue: number) => (activeTabIndex.value = newValue)
              },
              class: {
                'veo-tabs-sticky': props.stickyTabs
              }
            },
            [tabs.value]
          ),
          h(
            VTabsItems,
            {
              props: {
                value: activeTabIndex.value
              }
            },
            [slots.items ? slots.items() : []]
          )
        ]
      );
    };
  }
});
</script>

<style lang="scss" scoped>
.veo-tab-sticky {
  bottom: 0;
  left: 0;
  position: absolute;
  right: 0;
  top: 0;
  z-index: 2;
}

.veo-tabs--sticky {
  top: 0;
  position: sticky;
  top: 0;
  z-index: 2;
}
</style>
