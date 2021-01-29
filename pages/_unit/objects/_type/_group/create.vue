<script lang="ts">
import { createUUIDUrlParam, separateUUIDParam } from '~/lib/utils'
import BaseObjectFormCreate from '~/pages/_unit/objects/_type/_group/_id.vue'

export default BaseObjectFormCreate.extend({
  name: 'veo-data-objectData-create',
  async fetch() {
    const objectSchema = await this.$api.schema.fetch(this.schemaType)
    const { lang } = await this.$api.translation.fetch(['de', 'en'])
    const objectData = {}
    this.form = {
      objectSchema,
      objectData,
      lang
    }
    this.alert.value = false
  },
  methods: {
    async action(objectType: string) {
      // objectType identical to schemaEndpoint (processes, assets, ...)
      const createdObjectUUID = await this.create(this.schemaEndpoint)
      if (createdObjectUUID && this.schemaType) {
        const createdObjectURL = `/${this.unitRoute}/objects/${this.schemaEndpoint}/${
          this.objectGroup
        }/${createUUIDUrlParam(this.schemaType, createdObjectUUID)}/links`
        this.$router.push(createdObjectURL)
      } else {
        throw new Error('UUID of the create object does not exist!')
      }
    },
    async create(schemaEndpoint: string | undefined): Promise<string | undefined> {
      const res = await this.$api.object.create(schemaEndpoint, {
        ...this.form.objectData,
        owner: {
          targetUri: `/units/${this.unitId}`
        }
      })
      return res.resourceId
    }
  }
})
</script>
