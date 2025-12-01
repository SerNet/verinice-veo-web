<!--
   - verinice.veo web
   - Copyright (C) 2025 Aziz Khalledi
   -
   - This program is free software: you can redistribute it and/or modify it
   - under the terms of the GNU Affero General Public License
   - as published by the Free Software Foundation, either version 3 of the License,
   - or (at your option) any later version.
   -
   - This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
   - without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
   - See the GNU Affero General Public License for more details.
   -
   - You should have received a copy of the GNU Affero General Public License along with this program.
   - If not, see <http://www.gnu.org/licenses/>.
-->
<template>
  <div ref="viewerRef"></div>
</template>
<script setup lang="ts">
import Viewer from '@toast-ui/editor/dist/toastui-editor-viewer';
import Prism from 'prismjs';
import codeSyntaxHighlightPlugin from '@toast-ui/editor-plugin-code-syntax-highlight';
import { useTheme } from 'vuetify';

const props = withDefaults(
  defineProps<{
    modelValue?: string;
  }>(),
  { modelValue: '' }
);

const viewer = ref<Viewer | null>(null);
const viewerRef = ref<HTMLDivElement | null>(null);
const vuetifyTheme = useTheme();

const applyThemeClass = () => {
  if (!viewerRef.value) return;

  const isDark = vuetifyTheme.global.current.value.dark;
  viewerRef.value.className = isDark ? 'toastui-editor-dark' : 'toastui-editor-default';
};

onMounted(() => {
  applyThemeClass();

  viewer.value = new Viewer({
    el: viewerRef.value,
    initialValue: props.modelValue || '',
    usageStatistics: false,
    plugins: [[codeSyntaxHighlightPlugin, { highlighter: Prism }]]
  });
});

watch(
  () => props.modelValue,
  (newValue) => {
    if (viewer.value) {
      viewer.value.setMarkdown(newValue ?? '');
    }
  }
);

watch(
  () => vuetifyTheme.global.current.value.dark,
  () => applyThemeClass()
);

onBeforeUnmount(() => {
  viewer.value?.destroy();
});
</script>
<style lang="scss">
@use '@toast-ui/editor/dist/toastui-editor';
@use '@toast-ui/editor/dist/theme/toastui-editor-dark';
@use '@toast-ui/editor-plugin-code-syntax-highlight/dist/toastui-editor-plugin-code-syntax-highlight';
@use 'prismjs/themes/prism';

.vf-markdown-editor {
  position: relative;
  z-index: 0;
  .toastui-editor-contents h1,
  .toastui-editor-contents h2,
  .toastui-editor-contents h3,
  .toastui-editor-contents h4,
  .toastui-editor-contents h5,
  .toastui-editor-contents h6 {
    border: none;
  }
  .toastui-editor-toolbar-item-wrapper {
    margin: 0;
  }
  code::before,
  code::after {
    content: none;
  }
  code {
    box-shadow: none;
    background: none;
    font-weight: 400;
    font-size: 100%;
  }
  &.is-disabled {
    .toastui-editor-defaultUI::before {
      content: '';
      width: 100%;
      background: rgba(255, 255, 255, 0.7);
      height: 100%;
      position: absolute;
      z-index: 101;
    }
  }
}
</style>
