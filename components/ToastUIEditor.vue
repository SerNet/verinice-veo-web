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
  <div class="d-flex justify-end">
    <v-btn class="mt-2" size="small" variant="outlined" @click="changeMode">{{
      isMarkdownEditor ? 'WYSIWYG' : 'Markdown'
    }}</v-btn>
  </div>
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
const isMarkdownEditor = ref(true);

const editorOptions = {
  el: null,
  initialValue: '',
  autofocus: false,
  initialEditType: 'markdown',
  previewStyle: 'vertical',
  usageStatistics: false,
  hideModeSwitch: true,
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

function setMarkdown() {
  // Avoid unnecessary updates
  const markdownText = editor?.getMarkdown();
  if (markdownText === props.modelValue) return;

  // `false` prevents the editor from getting focus when its content is updated
  // only works in markdown mode
  editor?.setMarkdown(props.modelValue || '', false);
}

/** Handle content updates from outside the editor
(e.g. when loading markdown from an API or reseting dirty state) */
watch(() => props.modelValue, setMarkdown);

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
  setMarkdown();
  handleTheme();
});

onBeforeUnmount(() => {
  editor?.destroy();
});

function getScrollableParent(el: HTMLElement) {
  let parent = el?.parentElement;

  while (parent) {
    const style = getComputedStyle(parent);

    const overflowY = style.overflowY;

    const isScrollableY =
      ['auto', 'scroll', 'overlay'].includes(overflowY) && parent.scrollHeight > parent.clientHeight;

    if (isScrollableY) {
      return parent;
    }

    parent = parent.parentElement;
  }

  return document.scrollingElement || document.documentElement;
}

function getScrollPos(scrollParent: HTMLElement | Element) {
  return {
    scrollTop: scrollParent.scrollTop,
    scrollLeft: scrollParent.scrollLeft
  };
}

function updateScrollPos({ scrollParent, scrollTop, scrollLeft }) {
  scrollParent.scrollTop = scrollTop;
  scrollParent.scrollLeft = scrollLeft;
}

function changeMode() {
  const scrollParent = getScrollableParent(editorRef.value);
  const scrollPos = getScrollPos(scrollParent);
  if (editor.mode === 'markdown') {
    editor.changeMode('wysiwyg', true);
  } else {
    editor.changeMode('markdown', true);
  }
  updateScrollPos({ scrollParent, ...scrollPos });
  isMarkdownEditor.value = editor.mode === 'markdown';
}
</script>
