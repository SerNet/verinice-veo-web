<template>
  <div ref="viewerRef" />
</template>
<script setup lang="ts">
import Viewer from '@toast-ui/editor/dist/toastui-editor-viewer';
import '@toast-ui/editor/dist/toastui-editor.css';
import Prism from 'prismjs';
import codeSyntaxHighlightPlugin from '@toast-ui/editor-plugin-code-syntax-highlight';
import '@toast-ui/editor/dist/toastui-editor.css';

const props = withDefaults(
  defineProps<{
    modelValue?: string;
  }>(),
  { modelValue: '' }
);

let viewer = null;
const viewerRef = ref<HTMLDivElement | null>(null);
const viewerOptions = {
  el: null,
  initialValue: '',
  usageStatistics: false,
  plugins: [[codeSyntaxHighlightPlugin, { highlighter: Prism }]]
};

onMounted(() => {
  viewer = new Viewer({ ...viewerOptions, el: viewerRef.value });
  viewer.setMarkdown(props.modelValue);
});

watch(
  () => props.modelValue,
  () => {
    if (viewer && props.modelValue) {
      viewer.setMarkdown(props.modelValue);
    }
  },
  { immediate: true }
);

onBeforeUnmount(() => {
  viewer?.destroy();
});
</script>
<style lang="scss">
.vf-markdown-editor {
  position: relative;
  z-index: 0;
  @import '@toast-ui/editor/dist/toastui-editor';
  @import 'prismjs/themes/prism';
  @import '@toast-ui/editor-plugin-code-syntax-highlight/dist/toastui-editor-plugin-code-syntax-highlight';
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
