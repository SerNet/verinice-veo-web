<!--
   - verinice.veo web
   - Copyright (C) 2025 Aziz Khalledi, jae
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
import '@toast-ui/editor/dist/toastui-editor.css';
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

let editor = null;
const editorRef = ref<HTMLDivElement | null>(null);
const editorOptions = {
  el: null,
  initialValue: '',
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
      const markdownText = editor.getMarkdown();
      emit(
        'update:model-value',
        (typeof props.modelValue === 'undefined' || props.modelValue === null) && markdownText === '' ?
          props.modelValue
        : markdownText
      );
    }
  }
};

/** Dark mode support */
function handleTheme() {
  if (!editorRef.value) return;
  const isDark = vuetifyTheme.global.current.value.dark;
  editorRef.value.className = isDark ? 'toastui-editor-dark' : 'toastui-editor-default';
}

const vuetifyTheme = useTheme();
watch(() => vuetifyTheme.global.current.value.dark, handleTheme);

onMounted(() => {
  editor = new Editor({ ...editorOptions, el: editorRef.value });
  // `false` prevents the editor from getting focus when its content is updated
  editor.setMarkdown(props.modelValue || '', false);
  handleTheme();
});

onBeforeUnmount(() => {
  editor?.destroy();
});
</script>
<style scoped lang="scss"></style>
