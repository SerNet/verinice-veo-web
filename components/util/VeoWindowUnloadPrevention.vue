<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  props: {
    value: {
      type: Boolean,
      required: true
    }
  },
  watch: {
    value: {
      handler(value) {
        if (!window) return

        window.onbeforeunload = value ? () => this.$t('unsavedChanges') : null
      },
      immediate: true
    }
  },
  beforeDestroy() {
    if (window) window.onbeforeunload = null
  }
})
</script>

<i18n>
{
  "en": {
    "unsavedChanges": "There are unsaved changes. Do you really want to leave this page?"
  },
  "de": {
    "unsavedChanges": "Es gibt ungespeicherte Änderungen. Wollen Sie die Seite wirklich verlassen?"
  }
}
</i18n>
