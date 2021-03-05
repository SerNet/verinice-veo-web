<script lang="ts">
import { separateUUIDParam } from '~/lib/utils'
import BaseObjectForm from '~/pages/_unit/forms/_form/_object.vue'
import { getSchemaEndpoint } from '~/plugins/api/schema'

export default BaseObjectForm.extend({
  name: 'veo-forms-objectData-create',
  computed: {
    unitId(): string {
      return separateUUIDParam(this.$route.params.unit).id
    },
    unitRoute() {
      return this.$route.params.unit
    },
    formId(): string {
      return separateUUIDParam(this.$route.params.form).id
    },
    formRoute() {
      return this.$route.params.form
    }
  },
  methods: {
    async action(objectType: string) {
      const createdObjectUUID = await this.create(objectType)
      if (createdObjectUUID) {
        this.$router.push(`/${this.unitRoute}/forms/${this.formRoute}`)
      } else {
        throw new Error('UUID of the create object does not exist!')
      }
    },
    async create(objectType: string): Promise<string | undefined> {
      const res = await this.$api.entity.create(getSchemaEndpoint(this.objectType || ''), {
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
