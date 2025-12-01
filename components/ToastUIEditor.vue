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
  <div ref="editorRef"></div>
</template>
<script setup lang="ts">
import { Editor } from '@toast-ui/editor';
import Prism from 'prismjs';
import codeSyntaxHighlightPlugin from '@toast-ui/editor-plugin-code-syntax-highlight';
import { useTheme } from 'vuetify';

const props = withDefaults(
  defineProps<{
    modelValue?: string;
  }>(),
  { modelValue: '' }
);

const emit = defineEmits<{
  (e: 'update:model-value', value: string | null): void;
}>();

const vuetifyTheme = useTheme();

const editor = ref<Editor | null>(null);
const editorRef = ref<HTMLDivElement | null>(null);

const applyThemeClass = () => {
  if (!editorRef.value) return;

  const isDark = vuetifyTheme.global.current.value.dark;
  editorRef.value.className = isDark ? 'toastui-editor-dark' : 'toastui-editor-default';
};

onMounted(() => {
  applyThemeClass();

  editor.value = new Editor({
    el: editorRef.value!,
    initialValue: props.modelValue || '',
    autofocus: false,
    initialEditType: 'markdown',
    previewStyle: 'vertical',
    usageStatistics: false,
    plugins: [[codeSyntaxHighlightPlugin, { highlighter: Prism }]],
    toolbarItems: [
      ['heading', 'bold', 'italic', 'strike'],
      ['hr', 'quote'],
      ['ul', 'ol', 'task', 'indent', 'outdent'],
      ['table', 'image', 'link'],
      ['code', 'codeblock']
    ],
    events: {
      change: () => {
        const markdownText = editor!.getMarkdown();
        emit('update:model-value', markdownText);
      }
    }
  });
});

watch(
  () => vuetifyTheme.global.current.value.dark,
  () => applyThemeClass()
);

onBeforeUnmount(() => {
  editor.value?.destroy();
});
</script>
<style scoped lang="scss">
@use '@toast-ui/editor/dist/toastui-editor';
@use '@toast-ui/editor/dist/theme/toastui-editor-dark';
@use '@toast-ui/editor-plugin-code-syntax-highlight/dist/toastui-editor-plugin-code-syntax-highlight';
@use 'prismjs/themes/prism';
</style>
