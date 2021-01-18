<script lang="ts">
import BaseObjectForm from '~/pages/_unit/forms/_form/_object.vue'
import { getSchemaEndpoint } from '~/plugins/api/schema'

export default BaseObjectForm.extend({
  name: 'veo-forms-objectData-create',
  computed: {
    unit(): string {
      return this.$route.params.unit
    }
  },
  methods: {
    async action(objectType: string) {
      const createdObjectUUID = await this.create(objectType)
      if (createdObjectUUID) {
        const createdObjectURL = `/${this.unit}/forms/${this.$route.params.form}/${createdObjectUUID}`
        this.$router.push(createdObjectURL)
      } else {
        throw new Error('UUID of the create object does not exist!')
      }
    },
    async create(objectType: string): Promise<string | undefined> {
      const res = await this.$api.object.create(
        getSchemaEndpoint(this.objectType || ''),
        {
          ...this.form.objectData,
          owner: {
            targetUri: `/units/${this.unit}`
          }
        }
      )
      return res.resourceId
    }
  }
})
</script>
