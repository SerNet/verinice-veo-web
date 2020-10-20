<template>
  <div class="json-highlighter">
    <pre class="language-json">
      <code class="language-json" v-html="textAsHighlighterHTML" />
    </pre>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Prism from 'prismjs'
import 'prismjs/components/prism-json'

export default Vue.extend({
  name: 'PrimsHighlighter',
  props: {
    text: String
  },
  computed: {
    textAsHighlighterHTML(): string {
      return Prism.highlight(this.text, Prism.languages.json, 'json')
    }
  }
})
</script>

<style lang="scss">
// Good resource how to include external .css as inline in scss
// https://github.com/sass/node-sass/issues/2362#issuecomment-388634848
.json-highlighter {
  @import '~prismjs/themes/prism-okaidia';
  code::before,
  code::after {
    content: none;
  }
  code {
    padding: 1em;
    box-shadow: none;
  }
  pre {
    padding: 0;
    display: flex;
  }
}
</style>
