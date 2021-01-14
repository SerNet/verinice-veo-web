<script lang="ts">
import BaseObjectFormCreate from '~/pages/_unit/forms/_form/create.vue'
import { getSchemaName } from '~/plugins/api/schema'

export default BaseObjectFormCreate.extend({
  name: 'veo-data-objectData-create',
  async fetch() {
    this.objectType = getSchemaName(this.$route.params.type)
    const formSchema = undefined
    const objectSchema = await this.$api.schema.fetch(this.objectType)
    const objectData = {}
    const { lang } = await this.$api.translation.fetch(['de', 'en'])
    this.form = {
      objectSchema,
      formSchema,
      objectData,
      lang
    }
  },
  computed: {
    objectGroup(): string {
      return this.$route.params.group
    }
  },
  methods: {
    async action(objectType: string) {
      const createdObjectUUID = await this.create(objectType)
      if (createdObjectUUID) {
        const createdObjectURL = `/${this.unit}/objects/${this.objectType}/${this.objectGroup}/${createdObjectUUID}/links`
        this.$router.push(createdObjectURL)
      } else {
        throw new Error('UUID of the create object does not exist!')
      }
    }
  }
})
</script>
