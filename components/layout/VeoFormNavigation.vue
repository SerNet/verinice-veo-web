<!--
   - verinice.veo web
   - Copyright (C) 2021  Davit Svandize
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
  <div>
    <h2 class="text-h2 px-4 pt-1">
      {{ $t('tableOfContents').toString() }}
    </h2>
    <v-list
      flat
      dense
      class="py-0"
    >
      <v-list-item-group
        v-model="selectedItem"
        mandatory
        color="primary"
      >
        <template v-for="item in items">
          <v-list-item
            :key="item.initialId + '0'"
            style="min-height: 28px;"
            :value="item.initialId"
            @click="onClick(item.initialId)"
          >
            <v-list-item-content>
              <v-list-item-title :class="currentLevelLeftMargin">
                {{ item.text }}
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <VeoFormNavigation
            v-if="nestingLevel < 0"
            :key="item.initialId + '1'"
            :form-schema="item.layout"
            :custom-translation="customTranslation"
            :initial-id="item.initialId"
            :nesting-level="nextNestingLevel"
          />
        </template>
      </v-list-item-group>
    </v-list>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { UISchema } from '~/types/UISchema';

interface IItem {
  initialId: string;
  text: string;
  layout: UISchema;
}

interface IData {
  items: IItem[];
  scrollWrapper: HTMLElement | null;
  selectedItem: string | undefined;
  observer: IntersectionObserver | undefined;
}

export default Vue.extend({
  // Component is recursive and name is required!!!
  name: 'VeoFormNavigation',
  props: {
    formSchema: {
      type: Object,
      required: true
    },
    customTranslation: {
      type: Object,
      default: () => {}
    },
    initialId: {
      type: String,
      default: '#'
    },
    nestingLevel: {
      type: Number,
      default: 0
    },
    scrollWrapperId: {
      type: String,
      default: 'scroll-wrapper'
    }
  },
  data(): IData {
    return {
      items: [],
      scrollWrapper: null,
      selectedItem: undefined,
      observer: undefined
    };
  },
  computed: {
    nextNestingLevel(): number {
      return this.nestingLevel + 1;
    },
    currentLevelLeftMargin(): string {
      return `ml-${this.nestingLevel * 4}`;
    },
    // eslint-disable-next-line no-undef
    itemsToObserve(): NodeListOf<Element> | false {
      return this.items.length ? document.querySelectorAll(this.items.map((item) => `[id="${item.initialId}"]`).join(', ')) : false;
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
                  initialId: `${this.initialId}${this.initialId ? '/' : ''}elements/${index}`,
                  text: this.customTranslation[el.options?.label?.replace('#lang/', '')] || el.options?.label,
                  layout: el
                }
              : {}; // This is generated for non LayoutGroup elements and filtered in the next step
          })
          .filter((el: any) => !!el.text);
      }
    }
  },
  mounted() {
    // Cache scrollWrapper element
    this.scrollWrapper = document.getElementById(this.scrollWrapperId);

    // Activate Observer when the component is mounted
    const options = {
      root: document.getElementById(this.scrollWrapperId),
      rootMargin: '-200px 0px 0px 0px', // -72px because of sticky header
      threshold: 0
    };

    const items = this.items.map((item) => ({ key: item.initialId, value: false }));

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const elId = entry.target.getAttribute('id') as string;
        const index = items.findIndex((item) => item.key === elId);
        items[index].value = entry.isIntersecting;
      });
      this.selectedItem = items.filter((item) => item.value)[0]?.key;
    }, options);

    this.activateObserver();
  },
  methods: {
    onClick(groupId: string) {
      this.scroll(groupId);
    },
    scroll(groupId: string): void {
      // Scroll problems with sticky header solve with https://github.com/iamdustan/smoothscroll/issues/47#issuecomment-350810238
      // What we want to scroll to
      const item = document.getElementById(groupId);
      // The wrapper we will scroll inside
      const wrapper = this.scrollWrapper;
      const header = this.scrollWrapper?.getElementsByClassName('veo-page__header')[0] as HTMLElement | null;
      if (item && wrapper && header) {
        // header.offsetHeight =  extra distance from top (=sticky-header height)
        const count = item.offsetTop - wrapper.scrollTop - header.offsetHeight;
        wrapper.scrollBy({ top: count, left: 0, behavior: 'smooth' });
      }
    },
    activateObserver() {
      if (this.itemsToObserve) {
        this.itemsToObserve.forEach((section) => {
          this.observer?.observe(section);
        });
      }
    },
    deactivateObserver() {
      if (this.itemsToObserve) {
        this.itemsToObserve.forEach((section) => {
          this.observer?.unobserve(section);
        });
      }
    }
  }
});
</script>

<i18n>
{
  "en": {
    "tableOfContents": "Contents"
  },
  "de": {
    "tableOfContents": "Inhalt"
  }
}
</i18n>
