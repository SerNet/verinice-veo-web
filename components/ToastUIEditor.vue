<template>
  <div ref="editorRef"></div>
</template>
<script setup lang="ts">
import '@toast-ui/editor/dist/toastui-editor.css';
import { Editor } from '@toast-ui/editor';
import Prism from 'prismjs';
import codeSyntaxHighlightPlugin from '@toast-ui/editor-plugin-code-syntax-highlight';

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

onMounted(() => {
  editor = new Editor({ ...editorOptions, el: editorRef.value });
  // `false` prevents the editor from getting focus when its content is updated
  editor.setMarkdown(props.modelValue || '', false);
});

onBeforeUnmount(() => {
  editor?.destroy();
});
</script>
<style scoped lang="scss"></style>
