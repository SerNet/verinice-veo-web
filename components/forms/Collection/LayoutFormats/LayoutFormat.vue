<script lang="ts">
import Vue from 'vue';

import * as Group from './Group.vue';

const components = [Group];

export default Vue.extend({
  name: 'LayoutFormat',
  functional: true,
  props: {
    options: Object,
    formSchemaPointer: String,
    disabled: Boolean,
    visible: Boolean
  },
  render(h, context) {
    const props = context.props;

    function appropriateComponent() {
      return components.sort((a: any, b: any) => b.helpers.matchingScore({ ...props }) - a.helpers.matchingScore({ ...props }))[0].default;
    }

    return h(
      appropriateComponent(),
      {
        props: { ...props },
        on: {}
      },
      context.children
    );
  }
});
</script>

<style scoped></style>
