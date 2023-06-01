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
    <v-list density="compact">
      <template
        v-for="item in items"
        :key="item.initialId + '0'"
      >
        <v-list-item
          density="compact"
          active-class="veo-active-list-item"
          :value="item.initialId"
          :active="selectedItem === item.initialId"
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

<script setup lang=ts">
import { UISchema } from '~/types/UISchema';

interface IItem {
  initialId: string;
  text: string;
  layout: UISchema;
}

const props = defineProps({
  formSchema: {
    type: Object,
    required: true
  },
  customTranslation: {
    type: Object,
    // eslint-disable-next-line @typescript-eslint/no-empty-function
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
});

const { t } = useI18n();

const items = ref<IItem[]>([]);
const selectedItem = ref<string | undefined>();

const nextNestingLevel = computed(() => props.nestingLevel + 1);

const currentLevelLeftMargin = computed(() => `ml-${props.nestingLevel * 4}`);

const itemsToObserve = computed(() => items.value.length ? document.querySelectorAll(items.value.map((item) => `[id="${item.initialId}"]`).join(', ')) : false);

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

const scrollWrapper = ref();
const observer = ref();

const activateObserver = () => {
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

onMounted(() => {
  scrollWrapper.value = document.getElementById(props.scrollWrapperId);

  // Activate Observer when the component is mounted
  const options = {
    root: document.getElementById(props.scrollWrapperId),
    rootMargin: '-200px 0px 0px 0px', // -72px because of sticky header
    threshold: 0
  };

  const _items = items.value.map((item) => ({ key: item.initialId, value: false }));

  observer.value = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const elId = entry.target.getAttribute('id') as string;
      const index = _items.findIndex((item) => item.key === elId);
      _items[index].value = entry.isIntersecting;
    });
    selectedItem.value = _items.filter((item) => item.value)[0]?.key;
  }, options);

  activateObserver();
});
onUnmounted(() => {
  deactivateObserver();
});

watch(() => props.formSchema, () => {
  items.value = props.formSchema?.elements
    ?.map((el: any, index: number) => {
      // Important to iterate on all elements to have correct indices of Layouts in FormSchema
      return el.type === 'Layout' && el.options && el.options.format === 'group'
        ? {
          initialId: `${props.initialId}${props.initialId ? '/' : ''}elements/${index}`,
          text: props.customTranslation[el.options?.label?.replace('#lang/', '')] || el.options?.label,
          layout: el
        }
        : {}; // This is generated for non LayoutGroup elements and filtered in the next step
    })
    .filter((el: any) => !!el.text);
}, { deep: true, immediate: true });
</script>

<script lang="ts">
export default { 
  name: 'FormNavigation'
};
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
