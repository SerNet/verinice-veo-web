<script lang="ts">
import { defineComponent } from '@nuxtjs/composition-api'

import VeoData from '~/pages/_unit/objects/index.vue'

interface IProps {}

export default defineComponent<IProps>({
  extends: VeoData
})
</script>
