<script lang="ts">
import EditorPage from "~/pages/editor/_id/index.vue";
import Vue from "vue";
export default Vue.extend({
  extends: EditorPage,
  async asyncData({ params }) {
    return {
      diff: params.history
    };
  }
});
</script>
