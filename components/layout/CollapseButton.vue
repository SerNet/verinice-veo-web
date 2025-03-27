<!--
   - verinice.veo web
   - Copyright (C) 2021  Tino Groteloh, Davit Svandize, Jonas Heitmann
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
  <v-tooltip
    location="bottom"
    :aria-label="
      t(modelValue ? 'expand' : 'collapse', {
        elementName: elementName || t('page')
      })
    "
  >
    <template #activator="{ props }">
      <v-btn
        v-bind="props"
        class="collapse-button px-0 white mt-6"
        :class="{ 'collapse-button--right': right }"
        elevation="1"
        :icon="chevron"
        size="small"
        :aria-label="
          t(modelValue ? 'expand' : 'collapse', {
            elementName: elementName || t('page')
          })
        "
        @click="$emit('update:model-value', !modelValue)"
      />
    </template>
    <template #default>
      {{
        t(modelValue ? 'expand' : 'collapse', {
          elementName: elementName || t('page').toString()
        })
      }}
      <span v-if="index !== undefined"><br />(Alt/{{ t('control') }} + {{ index + 1 }})</span>
    </template>
  </v-tooltip>
</template>

<script lang="ts">
import { mdiChevronLeft, mdiChevronRight } from '@mdi/js';

export default defineComponent({
  props: {
    modelValue: {
      default: false, // true if collapsed
      type: Boolean
    },
    right: {
      type: Boolean,
      default: false
    },
    elementName: {
      type: String,
      default: undefined
    },
    index: {
      type: Number,
      default: undefined
    }
  },
  emits: ['update:model-value'],
  setup(props) {
    const { t } = useI18n();

    const chevron = computed(() => {
      if (props.right) {
        return mdiChevronLeft;
      } else {
        return mdiChevronRight;
      }
    });

    return { chevron, t };
  }
});
</script>

<i18n src="~/locales/base/components/layout-collapse-button.json"></i18n>

<style lang="scss" scoped>
.collapse-button {
  border-radius: 999px;
  height: 28px !important;
  width: 28px !important;
  min-width: 28px !important;
  position: absolute !important;
  top: 0;
  z-index: 1;

  &:not(.collapse-button--right) {
    left: 4px;
  }
}

.collapse-button--right {
  right: 4px;
}
</style>
