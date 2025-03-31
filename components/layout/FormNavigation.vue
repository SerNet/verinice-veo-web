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
      {{ t('tableOfContents').toString() }}
    </h2>
    <v-list density="compact"   role="listbox"  :aria-label="t('tableOfContents')">
      <template v-for="item in items" :key="item.initialId + '0'">
        <v-list-item
          density="compact"
          color="primary"
          :value="item.initialId"
          :active="selectedItem === item.initialId"
          role="option"
          @click="onClick(item.initialId)"
        >
          <v-list-item-title :class="currentLevelLeftMargin">
            {{ item.text }}
          </v-list-item-title>
        </v-list-item>
        <LayoutFormNavigation
          v-if="nestingLevel < 0"
          :key="item.initialId + '1'"
          :form-schema="item.layout"
          :custom-translation="customTranslation"
          :initial-id="item.initialId"
          :nesting-level="nextNestingLevel"
        />
      </template>
    </v-list>
  </div>
</template>

<script lang="ts">
export default {
  name: 'FormNavigation'
};
</script>

<script setup lang="ts">
import { IVeoFormSchemaItem } from '~/composables/api/queryDefinitions/forms';

interface IItem {
  initialId: string;
  text?: string;
  layout: any;
}

const props = withDefaults(
  defineProps<{
    formSchema: IVeoFormSchemaItem;
    customTranslation?: Record<string, string>;
    initialId?: string;
    nestingLevel?: number;
    scrollWrapperId?: string;
  }>(),
  {
    customTranslation: () => ({}),
    initialId: '#',
    nestingLevel: 0,
    scrollWrapperId: 'scroll-wrapper'
  }
);

const { t } = useI18n();

const selectedItem = ref<string | undefined>();

const nextNestingLevel = computed(() => props.nestingLevel + 1);

const currentLevelLeftMargin = computed(() => `ml-${props.nestingLevel * 4}`);

const itemsToObserve = computed(() =>
  items.value.length ?
    document.querySelectorAll(items.value.map((item) => `[id="${item.initialId}"]`).join(', '))
  : false
);

const onClick = (groupId: string) => {
  selectedItem.value = groupId;
  scroll(groupId);
};
const scroll = (groupId: string) => {
  // Scroll problems with sticky header solve with https://github.com/iamdustan/smoothscroll/issues/47#issuecomment-350810238
  // What we want to scroll to
  const item = document.getElementById(groupId);
  // The wrapper we will scroll inside
  const wrapper = scrollWrapper.value;
  const header = scrollWrapper.value?.getElementsByClassName('veo-page__header')[0] as HTMLElement | null;
  const headerOffset = header?.offsetHeight || 0;
  // extra distance from top (=sticky-header height)
  if (item && wrapper) {
    const count = item.offsetTop - wrapper.scrollTop - headerOffset;
    wrapper.scrollBy({ top: count, left: 0, behavior: 'smooth' });
  }
};

const scrollWrapper = ref<HTMLElement | undefined>();
const observer = ref<IntersectionObserver | undefined>();

const activateObserver = () => {
  if (observer.value) {
    observer.value?.disconnect();
  }

  scrollWrapper.value = document.getElementById(props.scrollWrapperId) || undefined;

  // Activate Observer when the component is mounted
  const options = {
    root: scrollWrapper.value,
    rootMargin: '-200px 0px 0px 0px', // -72px because of sticky header
    threshold: 0
  };

  observer.value = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        selectedItem.value = entry.target.getAttribute('id') as string; // The id is always set by the dynamic forms entrypoint
      }
    });
  }, options);

  if (itemsToObserve.value) {
    itemsToObserve.value.forEach((section) => {
      observer.value?.observe(section);
    });
  }
};

const deactivateObserver = () => {
  if (itemsToObserve.value) {
    itemsToObserve.value.forEach((section) => {
      observer.value?.unobserve(section);
    });
  }
};

onMounted(activateObserver);
onUnmounted(deactivateObserver);

defineExpose({
  activateObserver
});

const items = computed(
  () =>
    (props.formSchema?.elements || [])
      .map((el: any, index: number) => {
        if (!el.type || el.options?.format !== 'group') {
          return undefined;
        }
        // Important to iterate on all elements to have correct indices of Layouts in FormSchema
        return {
          initialId: `${props.initialId}${props.initialId ? '/' : ''}elements/${index}`,
          text: props.customTranslation[el.options?.label?.replace('#lang/', '')] || el.options?.label,
          layout: el
        };
      })
      .filter((element: IItem | undefined) => !!element) as IItem[]
);
</script>

<i18n src="~/locales/base/components/layout-form-navigation.json"></i18n>
